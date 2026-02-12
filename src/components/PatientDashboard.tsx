import {
  User,
  Calendar,
  Bed,
  AlertCircle,
  Phone,
  Shield,
  Stethoscope,
  Pill,
  FlaskConical,
  ClipboardList,
  Activity,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Patient } from '@/types';
import {
  cn,
  formatDate,
  formatDateTime,
  getPatientStatusColor,
  getPriorityColor,
  getStatusColor,
  calculateSLAStatus,
  formatDuration,
  getTaskTypeIcon
} from '@/lib/utils';
import { useApp, usePatientTasks, usePatientTimeline } from '@/context/AppContext';

interface PatientDashboardProps {
  patient: Patient;
  onNewTask?: () => void;
}

export function PatientDashboard({ patient, onNewTask: _onNewTask }: PatientDashboardProps) {
  const { state, dispatch } = useApp();
  const tasks = usePatientTasks(state, patient.id);
  const timeline = usePatientTimeline(state, patient.id);

  const prescriptions = state.prescriptions.filter(p => p.patientId === patient.id);
  const labTests = state.labTests.filter(l => l.patientId === patient.id);
  const careInstructions = state.careInstructions.filter(c => c.patientId === patient.id);

  // Use live patient data from state (so status changes are reflected)
  const livePatient = state.patients.find(p => p.id === patient.id) || patient;
  const statusColor = getPatientStatusColor(livePatient.status);
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const delayedTasks = tasks.filter(t => t.status === 'delayed');

  const statusOptions: Patient['status'][] = ['Active', 'Stable', 'Critical', 'Discharged'];

  const handleStatusChange = (newStatus: Patient['status']) => {
    dispatch({ type: 'UPDATE_PATIENT_STATUS', payload: { patientId: patient.id, status: newStatus } });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Patient Header */}
      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className={cn(
                "text-xl font-bold",
                livePatient.status === 'Critical' ? "bg-red-100 text-red-700" :
                  livePatient.status === 'Stable' ? "bg-emerald-100 text-emerald-700" :
                    "bg-sky-100 text-sky-700"
              )}>
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{patient.name}</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("gap-1.5 h-7", statusColor)}>
                      {livePatient.status}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {statusOptions.map(s => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={cn("gap-2", s === livePatient.status && "bg-slate-50 font-medium")}
                      >
                        <div className={cn("h-2 w-2 rounded-full",
                          s === 'Critical' ? "bg-red-500" :
                            s === 'Stable' ? "bg-emerald-500" :
                              s === 'Active' ? "bg-sky-500" : "bg-slate-400"
                        )} />
                        {s}
                        {s === livePatient.status && <span className="text-xs text-slate-400 ml-auto">Current</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-slate-500">{patient.mrn} • {patient.department}</p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{patient.age} years • {patient.gender}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Bed className="h-4 w-4 text-slate-400" />
                  <span>{patient.bedNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Admitted {formatDate(patient.admissionDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{patient.contactNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span>{patient.insurance}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-sky-600">{activeTasks.length}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
                <p className="text-xs text-slate-500">Done</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{delayedTasks.length}</p>
                <p className="text-xs text-slate-500">Delayed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis & Allergies */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-1">Primary Diagnosis</p>
              <p className="font-medium text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-sky-500" />
                {patient.diagnosis}
              </p>
            </div>
            {patient.allergies.length > 0 && (
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">Allergies</p>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <div className="flex gap-1">
                    {patient.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-6 bg-slate-100 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="lab">Lab Tests ({labTests.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="care">Care Instructions</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-4">
          {/* Overview Tab */}
          <TabsContent value="overview" className="m-0">
            <div className="grid grid-cols-3 gap-4">
              {/* Pending Tasks */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-sky-500" />
                  Pending Tasks
                </h3>
                <div className="space-y-2">
                  {activeTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <span>{getTaskTypeIcon(task.type)}</span>
                        <span className="text-sm truncate max-w-[150px]">{task.title}</span>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px]", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                  {activeTasks.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No pending tasks</p>
                  )}
                </div>
              </Card>

              {/* Recent Prescriptions */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-emerald-500" />
                  Active Prescriptions
                </h3>
                <div className="space-y-2">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="p-2 bg-slate-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{rx.medication}</span>
                        <Badge variant={rx.status === 'dispensed' ? 'default' : 'secondary'} className="text-[10px]">
                          {rx.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{rx.dosage} • {rx.frequency}</p>
                    </div>
                  ))}
                  {prescriptions.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No prescriptions</p>
                  )}
                </div>
              </Card>

              {/* Recent Lab Results */}
              <Card className="p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-purple-500" />
                  Lab Tests
                </h3>
                <div className="space-y-2">
                  {labTests.map(test => (
                    <div key={test.id} className="p-2 bg-slate-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{test.testName}</span>
                        <Badge
                          variant={test.status === 'completed' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {test.status}
                        </Badge>
                      </div>
                      {test.result && (
                        <p className="text-xs text-slate-600 mt-1">{test.result}</p>
                      )}
                    </div>
                  ))}
                  {labTests.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">No lab tests</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="m-0">
            <div className="space-y-3">
              {tasks.map(task => {
                const sla = calculateSLAStatus(task.createdAt, task.slaMinutes);
                return (
                  <Card key={task.id} className={cn(
                    "p-4",
                    task.status === 'delayed' && "border-red-300 bg-red-50/30"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getTaskTypeIcon(task.type)}</span>
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-slate-500">{task.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>By: {task.requestedBy}</span>
                            <span>Dept: {task.department}</span>
                            <span>Created: {formatDateTime(task.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={cn("mb-2", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        {task.status !== 'completed' && (
                          <div className={cn(
                            "mt-2 text-xs",
                            sla.status === 'overdue' ? "text-red-600" :
                              sla.status === 'warning' ? "text-amber-600" :
                                "text-emerald-600"
                          )}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {sla.status === 'overdue'
                              ? `Overdue by ${formatDuration(sla.remainingMinutes)}`
                              : `${formatDuration(sla.remainingMinutes)} left`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="m-0">
            <div className="grid grid-cols-2 gap-4">
              {prescriptions.map(rx => (
                <Card key={rx.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{rx.medication}</h4>
                        <p className="text-sm text-slate-500">{rx.dosage}</p>
                        <p className="text-sm text-slate-500">{rx.frequency} • {rx.duration}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          Prescribed by {rx.prescribedBy} on {formatDate(rx.prescribedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={rx.status === 'dispensed' ? 'default' : 'secondary'}>
                      {rx.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lab Tests Tab */}
          <TabsContent value="lab" className="m-0">
            <div className="space-y-3">
              {labTests.map(test => (
                <Card key={test.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FlaskConical className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{test.testName}</h4>
                        <p className="text-sm text-slate-500">Code: {test.testCode} • Category: {test.category}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Requested by {test.requestedBy} on {formatDate(test.requestedAt)}
                        </p>
                        {test.result && (
                          <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                            <span className="text-slate-500">Result:</span> {test.result}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={test.status === 'completed' ? 'default' : 'secondary'}
                        className="mb-2"
                      >
                        {test.status}
                      </Badge>
                      {test.sampleCollectedAt && (
                        <p className="text-xs text-slate-500">
                          Sample: {formatDateTime(test.sampleCollectedAt)}
                        </p>
                      )}
                      {test.completedAt && (
                        <p className="text-xs text-slate-500">
                          Completed: {formatDateTime(test.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="m-0">
            <div className="space-y-0">
              {timeline.map((event, index) => (
                <div key={event.id} className="relative pl-8 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-slate-200" />
                  )}
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center",
                    event.type === 'task-completed' ? "bg-emerald-100" :
                      event.type === 'task-updated' ? "bg-sky-100" :
                        event.type === 'report-uploaded' ? "bg-purple-100" :
                          "bg-slate-100"
                  )}>
                    <Activity className={cn(
                      "h-3 w-3",
                      event.type === 'task-completed' ? "text-emerald-600" :
                        event.type === 'task-updated' ? "text-sky-600" :
                          event.type === 'report-uploaded' ? "text-purple-600" :
                            "text-slate-600"
                    )} />
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-sm text-slate-500">{event.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>By: {event.performedBy}</span>
                          <span>Dept: {event.department}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Care Instructions Tab */}
          <TabsContent value="care" className="m-0">
            <div className="grid grid-cols-2 gap-4">
              {careInstructions.map(instruction => (
                <Card key={instruction.id} className={cn(
                  "p-4",
                  instruction.priority === 'high' && "border-l-4 border-l-red-400"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      instruction.category === 'diet' ? "bg-orange-100" :
                        instruction.category === 'activity' ? "bg-blue-100" :
                          instruction.category === 'medication' ? "bg-emerald-100" :
                            "bg-slate-100"
                    )}>
                      <ClipboardList className={cn(
                        "h-5 w-5",
                        instruction.category === 'diet' ? "text-orange-600" :
                          instruction.category === 'activity' ? "text-blue-600" :
                            instruction.category === 'medication' ? "text-emerald-600" :
                              "text-slate-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {instruction.category}
                        </Badge>
                        <Badge
                          variant={instruction.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {instruction.priority} priority
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm">{instruction.instruction}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Given by {instruction.givenBy} on {formatDate(instruction.givenAt)}
                      </p>
                      {instruction.acknowledgedBy && (
                        <p className="mt-1 text-xs text-emerald-600">
                          Acknowledged by {instruction.acknowledgedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {careInstructions.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400">
                  No care instructions
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
