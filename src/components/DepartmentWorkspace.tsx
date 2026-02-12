import { useState } from 'react';
import {
  FlaskConical,
  Pill,
  Scan,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import type { ClinicalTask } from '@/types';
import {
  cn,
  calculateSLAStatus,
  formatDuration,
  formatDateTime,
  getPriorityColor,
  getStatusColor
} from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface DepartmentWorkspaceProps {
  department: 'Laboratory' | 'Pharmacy' | 'Radiology';
}

const departmentConfig = {
  Laboratory: {
    icon: FlaskConical,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    tasks: ['lab-test'],
  },
  Pharmacy: {
    icon: Pill,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    tasks: ['prescription'],
  },
  Radiology: {
    icon: Scan,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    tasks: ['imaging'],
  },
};

export function DepartmentWorkspace({ department }: DepartmentWorkspaceProps) {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const config = departmentConfig[department];
  const Icon = config.icon;

  // Get tasks for this department
  const deptTasks = state.tasks.filter(t =>
    t.department === department &&
    (searchQuery === '' ||
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === 'all' || t.status === filterStatus)
  );

  const pendingTasks = deptTasks.filter(t => t.status === 'todo' || t.status === 'in-progress');
  const completedTasks = deptTasks.filter(t => t.status === 'completed');
  const delayedTasks = deptTasks.filter(t => t.status === 'delayed');
  const statTasks = deptTasks.filter(t => t.priority === 'stat' && t.status !== 'completed');

  const handleUpdateTaskStatus = (taskId: string, status: ClinicalTask['status']) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } });
  };

  const handleMarkDelayed = (taskId: string) => {
    dispatch({ type: 'MARK_DELAYED', payload: taskId });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center", config.bgColor)}>
            <Icon className={cn("h-7 w-7", config.color)} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{department} Workspace</h2>
            <p className="text-slate-500">Manage and track all {department.toLowerCase()} tasks</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <Card className="p-3 text-center min-w-[100px]">
            <p className="text-2xl font-bold text-sky-600">{pendingTasks.length}</p>
            <p className="text-xs text-slate-500">Pending</p>
          </Card>
          <Card className="p-3 text-center min-w-[100px]">
            <p className="text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </Card>
          <Card className="p-3 text-center min-w-[100px]">
            <p className="text-2xl font-bold text-red-600">{delayedTasks.length}</p>
            <p className="text-xs text-slate-500">Delayed</p>
          </Card>
          {statTasks.length > 0 && (
            <Card className="p-3 text-center min-w-[100px] bg-red-50 border-red-200">
              <p className="text-2xl font-bold text-red-600">{statTasks.length}</p>
              <p className="text-xs text-red-500">Crit</p>
            </Card>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={`Search ${department.toLowerCase()} tasks...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {/* Task List */}
      <Tabs defaultValue="pending" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 mb-4">
          <TabsTrigger value="pending">
            Pending ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="delayed">
            Delayed ({delayedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Tasks ({deptTasks.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="pending" className="m-0 space-y-3">
            {pendingTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateTaskStatus}
                onMarkDelayed={handleMarkDelayed}
              />
            ))}
            {pendingTasks.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending tasks</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="m-0 space-y-3">
            {completedTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateTaskStatus}
                onMarkDelayed={handleMarkDelayed}
              />
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>No completed tasks yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delayed" className="m-0 space-y-3">
            {delayedTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateTaskStatus}
                onMarkDelayed={handleMarkDelayed}
              />
            ))}
            {delayedTasks.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>No delayed tasks</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="m-0 space-y-3">
            {deptTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateTaskStatus}
                onMarkDelayed={handleMarkDelayed}
              />
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

// Task Row Component
interface TaskRowProps {
  task: ClinicalTask;
  onUpdateStatus: (taskId: string, status: ClinicalTask['status']) => void;
  onMarkDelayed: (taskId: string) => void;
}

function TaskRow({ task, onUpdateStatus, onMarkDelayed }: TaskRowProps) {
  const sla = calculateSLAStatus(task.createdAt, task.slaMinutes);
  const priorityClass = getPriorityColor(task.priority);
  const statusClass = getStatusColor(task.status);

  return (
    <Card className={cn(
      "p-4",
      task.status === 'delayed' && "border-red-300 bg-red-50/30",
      task.priority === 'stat' && task.status !== 'completed' && "border-l-4 border-l-red-500"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          {/* Priority Indicator */}
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            task.priority === 'stat' ? "bg-red-100" :
              task.priority === 'urgent' ? "bg-amber-100" :
                "bg-emerald-100"
          )}>
            {task.priority === 'stat' ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : task.priority === 'urgent' ? (
              <Clock className="h-5 w-5 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{task.title}</h4>
              <Badge variant="outline" className={cn("text-[10px]", priorityClass)}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", statusClass)}>
                {task.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{task.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.patientName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(task.createdAt)}
              </span>
              <span>By: {task.requestedBy}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* SLA Timer */}
          {task.status !== 'completed' && (
            <div className="text-right">
              <div className={cn(
                "text-sm font-medium",
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
              <Progress
                value={sla.progressPercent}
                className="w-32 h-1.5 mt-1"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {task.status === 'todo' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(task.id, 'in-progress')}
              >
                Start
              </Button>
            )}
            {task.status === 'in-progress' && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(task.id, 'completed')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
            {task.status !== 'completed' && task.status !== 'delayed' && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onMarkDelayed(task.id)}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
