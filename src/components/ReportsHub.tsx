import { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Search,
  Download,
  Eye,
  Calendar,
  User,
  MoreHorizontal,
  Upload
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Attachment } from '@/types';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

const fileTypeIcons = {
  pdf: FileText,
  image: ImageIcon,
  document: FileSpreadsheet,
};

const categoryColors = {
  'lab-report': 'bg-blue-100 text-blue-700 border-blue-200',
  'imaging': 'bg-purple-100 text-purple-700 border-purple-200',
  'prescription': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'discharge': 'bg-amber-100 text-amber-700 border-amber-200',
  'other': 'bg-slate-100 text-slate-700 border-slate-200',
};

export function ReportsHub() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);

  // Combine all attachments from various sources
  const allAttachments: Attachment[] = [
    ...state.prescriptions.map(rx => ({
      id: `rx-${rx.id}`,
      name: `Prescription_${rx.medication}_${rx.patientId}.pdf`,
      type: 'pdf' as const,
      url: '#',
      uploadedAt: rx.prescribedAt,
      uploadedBy: rx.prescribedBy,
      category: 'prescription' as const,
    })),
    ...state.labTests.filter(lt => lt.reportUrl).map(lt => ({
      id: `lab-${lt.id}`,
      name: `${lt.testName}_Report_${lt.patientId}.pdf`,
      type: 'pdf' as const,
      url: lt.reportUrl || '#',
      uploadedAt: lt.completedAt || lt.requestedAt,
      uploadedBy: 'Lab System',
      category: 'lab-report' as const,
    })),
    ...mockAttachments,
  ];

  const filteredAttachments = allAttachments.filter(file => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filesByCategory = {
    'lab-report': filteredAttachments.filter(f => f.category === 'lab-report'),
    'imaging': filteredAttachments.filter(f => f.category === 'imaging'),
    'prescription': filteredAttachments.filter(f => f.category === 'prescription'),
    'discharge': filteredAttachments.filter(f => f.category === 'discharge'),
    'other': filteredAttachments.filter(f => f.category === 'other'),
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports & Documents Hub</h2>
          <p className="text-slate-500">Centralized storage for all patient reports and files</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{filesByCategory['lab-report'].length}</p>
          <p className="text-xs text-slate-500">Lab Reports</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{filesByCategory['imaging'].length}</p>
          <p className="text-xs text-slate-500">Imaging</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{filesByCategory['prescription'].length}</p>
          <p className="text-xs text-slate-500">Prescriptions</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{filesByCategory['discharge'].length}</p>
          <p className="text-xs text-slate-500">Discharge</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-slate-600">{filteredAttachments.length}</p>
          <p className="text-xs text-slate-500">Total Files</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search files by name or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="lab-report">Lab Reports</option>
          <option value="imaging">Imaging</option>
          <option value="prescription">Prescriptions</option>
          <option value="discharge">Discharge Notes</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* File List */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-6 bg-slate-100 p-1 mb-4">
          <TabsTrigger value="all">All ({filteredAttachments.length})</TabsTrigger>
          <TabsTrigger value="lab-report">Lab ({filesByCategory['lab-report'].length})</TabsTrigger>
          <TabsTrigger value="imaging">Imaging ({filesByCategory['imaging'].length})</TabsTrigger>
          <TabsTrigger value="prescription">Rx ({filesByCategory['prescription'].length})</TabsTrigger>
          <TabsTrigger value="discharge">Discharge ({filesByCategory['discharge'].length})</TabsTrigger>
          <TabsTrigger value="other">Other ({filesByCategory['other'].length})</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {(['all', 'lab-report', 'imaging', 'prescription', 'discharge', 'other'] as const).map(tab => (
            <TabsContent key={tab} value={tab} className="m-0">
              <div className="grid grid-cols-2 gap-3">
                {(tab === 'all' ? filteredAttachments : filesByCategory[tab]).map(file => {
                  const Icon = fileTypeIcons[file.type];
                  const categoryClass = categoryColors[file.category];

                  return (
                    <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-sm truncate cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline" onClick={() => setSelectedFile(file)}>{file.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn("text-[10px]", categoryClass)}>
                                  {file.category}
                                </Badge>
                                <span className="text-xs text-slate-400 uppercase">{file.type}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 -mt-1">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedFile(file)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {file.uploadedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(file.uploadedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {(tab === 'all' ? filteredAttachments : filesByCategory[tab]).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No files found</p>
                </div>
              )}
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFile && (
                <>
                  {(() => {
                    const PreviewIcon = selectedFile.type === 'pdf' ? FileText :
                      selectedFile.type === 'image' ? ImageIcon : FileSpreadsheet;
                    return <PreviewIcon className="h-5 w-5" />;
                  })()}
                  {selectedFile.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-slate-400">
              {selectedFile?.type === 'image' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 mb-2" />
                  <p>Image preview would appear here</p>
                </div>
              ) : (
                <>
                  <FileText className="h-16 w-16 mx-auto mb-2" />
                  <p>PDF preview would appear here</p>
                  <p className="text-sm">In production, this would embed the actual document</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              <p>Uploaded by {selectedFile?.uploadedBy}</p>
              <p>{selectedFile && formatDateTime(selectedFile.uploadedAt)}</p>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mock attachments for demo
const mockAttachments: Attachment[] = [
  {
    id: 'a1',
    name: 'ECG_Report_RajeshKumar.pdf',
    type: 'pdf',
    url: '/reports/ecg_report.pdf',
    uploadedAt: '2024-01-15T09:30:00',
    uploadedBy: 'Dr. Anil Mehta',
    category: 'lab-report',
  },
  {
    id: 'a2',
    name: 'Chest_Xray_AmitPatel.jpg',
    type: 'image',
    url: '/images/chest_xray.jpg',
    uploadedAt: '2024-01-15T12:00:00',
    uploadedBy: 'Dr. Rahul Khanna',
    category: 'imaging',
  },
  {
    id: 'a3',
    name: 'CBC_Report_AmitPatel.pdf',
    type: 'pdf',
    url: '/reports/cbc_report.pdf',
    uploadedAt: '2024-01-15T12:00:00',
    uploadedBy: 'Lab Tech Ravi Kumar',
    category: 'lab-report',
  },
  {
    id: 'a4',
    name: 'MRI_Brain_VikramSingh.pdf',
    type: 'pdf',
    url: '/reports/mri_report.pdf',
    uploadedAt: '2024-01-15T08:00:00',
    uploadedBy: 'Dr. Rahul Khanna',
    category: 'imaging',
  },
  {
    id: 'a5',
    name: 'Discharge_Summary_PriyaSharma.pdf',
    type: 'pdf',
    url: '/reports/discharge_summary.pdf',
    uploadedAt: '2024-01-14T16:00:00',
    uploadedBy: 'Dr. Sunita Rao',
    category: 'discharge',
  },
];
