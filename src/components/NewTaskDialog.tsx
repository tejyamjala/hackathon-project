import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FlaskConical, Pill, Scan, Stethoscope, ArrowUpRight, ClipboardList, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { generateId } from '@/lib/utils';
import type { TaskType, TaskPriority, ClinicalTask } from '@/types';

interface NewTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preselectedPatientId?: string;
}

const taskTypes: { value: TaskType; label: string; icon: React.ReactNode; dept: string }[] = [
    { value: 'prescription', label: 'Prescription', icon: <Pill className="h-4 w-4" />, dept: 'Pharmacy' },
    { value: 'lab-test', label: 'Lab Test', icon: <FlaskConical className="h-4 w-4" />, dept: 'Laboratory' },
    { value: 'imaging', label: 'Imaging / Radiology', icon: <Scan className="h-4 w-4" />, dept: 'Radiology' },
    { value: 'procedure', label: 'Procedure', icon: <Stethoscope className="h-4 w-4" />, dept: '' },
    { value: 'referral', label: 'Referral', icon: <ArrowUpRight className="h-4 w-4" />, dept: '' },
    { value: 'care-instruction', label: 'Care Instruction', icon: <ClipboardList className="h-4 w-4" />, dept: 'Nursing' },
];

const priorities: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'stat', label: 'Crit', color: 'bg-red-500 text-white' },
    { value: 'urgent', label: 'Urgent', color: 'bg-amber-500 text-white' },
    { value: 'routine', label: 'Routine', color: 'bg-emerald-500 text-white' },
];

export function NewTaskDialog({ open, onOpenChange, preselectedPatientId }: NewTaskDialogProps) {
    const { state, dispatch } = useApp();
    const [patientId, setPatientId] = useState(preselectedPatientId || '');
    const [taskType, setTaskType] = useState<TaskType>('prescription');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('routine');
    const [department, setDepartment] = useState('');
    const [slaMinutes, setSlaMinutes] = useState(60);

    const selectedType = taskTypes.find(t => t.value === taskType);
    const patient = state.patients.find(p => p.id === patientId);

    const handleTypeChange = (val: TaskType) => {
        setTaskType(val);
        const tt = taskTypes.find(t => t.value === val);
        if (tt?.dept) setDepartment(tt.dept);
    };

    const handleSubmit = () => {
        if (!patientId || !title.trim()) return;

        const newTask: ClinicalTask = {
            id: generateId('t'),
            patientId,
            patientName: patient?.name || '',
            type: taskType,
            title: title.trim(),
            description: description.trim(),
            requestedBy: state.currentUser.name,
            requestedByRole: state.currentUser.role,
            department: department || selectedType?.dept || 'General',
            status: 'todo',
            priority,
            createdAt: new Date().toISOString(),
            dueTime: new Date(Date.now() + slaMinutes * 60000).toISOString(),
            slaMinutes,
        };

        dispatch({ type: 'CREATE_TASK', payload: newTask });

        // Reset
        setTitle('');
        setDescription('');
        setPriority('routine');
        setSlaMinutes(60);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        New Clinical Order
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Patient *</Label>
                        <Select value={patientId} onValueChange={setPatientId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                                {state.patients.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        <span className="flex items-center gap-2">
                                            {p.name}
                                            <span className="text-xs text-muted-foreground">{p.mrn} • {p.department}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Task Type */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Order Type *</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {taskTypes.map(tt => (
                                <button
                                    key={tt.value}
                                    onClick={() => handleTypeChange(tt.value)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left text-sm font-medium ${taskType === tt.value
                                        ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                                        }`}
                                >
                                    {tt.icon}
                                    {tt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Title *</Label>
                        <Input
                            placeholder="e.g. CBC, Chest X-Ray, Paracetamol 500mg..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Clinical Notes</Label>
                        <Textarea
                            placeholder="Additional instructions or clinical context..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                            className="text-sm resize-none"
                        />
                    </div>

                    {/* Priority & SLA */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Priority *</Label>
                            <div className="flex gap-2">
                                {priorities.map(p => (
                                    <button
                                        key={p.value}
                                        onClick={() => {
                                            setPriority(p.value);
                                            if (p.value === 'stat') setSlaMinutes(30);
                                            else if (p.value === 'urgent') setSlaMinutes(60);
                                            else setSlaMinutes(120);
                                        }}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${priority === p.value
                                            ? p.color + ' shadow-md scale-105'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">SLA (minutes)</Label>
                            <Input
                                type="number"
                                value={slaMinutes}
                                onChange={e => setSlaMinutes(Number(e.target.value))}
                                min={5}
                                max={1440}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Target Department</Label>
                        <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Auto-assigned based on type" />
                            </SelectTrigger>
                            <SelectContent>
                                {state.departments.map(d => (
                                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Summary */}
                    {patientId && title && (
                        <div className="p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl border border-sky-200">
                            <p className="text-xs font-semibold text-sky-600 mb-1">ORDER SUMMARY</p>
                            <p className="font-medium text-slate-800">{title}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge className="text-xs">{patient?.name}</Badge>
                                <Badge variant="outline" className="text-xs">{selectedType?.label}</Badge>
                                <Badge variant="outline" className={`text-xs ${priority === 'stat' ? 'bg-red-50 border-red-200 text-red-600' :
                                    priority === 'urgent' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                        'bg-emerald-50 border-emerald-200 text-emerald-600'
                                    }`}>
                                    {priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{department || 'Auto'}</Badge>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!patientId || !title.trim()}
                        className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white gap-2"
                    >
                        <Zap className="h-4 w-4" />
                        Create Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
