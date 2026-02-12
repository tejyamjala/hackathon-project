// Task Card Component - Premium Design
import {
  Clock,
  User,
  Building2,
  AlertTriangle,
  Paperclip,
  MoreHorizontal,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ClinicalTask } from '@/types';
import {
  cn,
  formatRelativeTime,
  calculateSLAStatus,
  formatDuration,
  getPriorityColor,
  getTaskTypeIcon,
  getDepartmentColor
} from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface TaskCardProps {
  task: ClinicalTask;
  onClick?: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { dispatch } = useApp();
  const sla = calculateSLAStatus(task.createdAt, task.slaMinutes);
  const priorityClass = getPriorityColor(task.priority);
  const deptColor = getDepartmentColor(task.department);

  const handleStatusChange = (newStatus: ClinicalTask['status']) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId: task.id, status: newStatus } });
  };

  const handleEscalate = () => {
    dispatch({ type: 'ESCALATE_TASK', payload: task.id });
  };

  const priorityLabel = task.priority === 'stat' ? 'Crit' : task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        "border border-slate-200/80 dark:border-slate-700",
        isDragging && "shadow-xl ring-2 ring-sky-500/50 rotate-1 scale-105",
        task.status === 'delayed' && "border-l-4 border-l-red-400 bg-red-50/30 dark:bg-red-950/10",
        task.escalated && "border-l-4 border-l-red-500",
        task.status === 'completed' && "opacity-75",
        !task.status.includes('delay') && !task.escalated && "border-l-4",
        task.priority === 'stat' && !task.status.includes('delay') && !task.escalated && "border-l-red-500",
        task.priority === 'urgent' && !task.status.includes('delay') && !task.escalated && "border-l-amber-400",
        task.priority === 'routine' && !task.status.includes('delay') && !task.escalated && "border-l-emerald-400",
      )}
    >
      {/* Subtle shimmer on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTaskTypeIcon(task.type)}</span>
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 h-5 font-semibold uppercase tracking-wide", priorityClass)}>
              {priorityLabel}
            </Badge>
            {task.status === 'completed' && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => handleStatusChange('todo')} className="gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-400" />
                Mark as To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('in-progress')} className="gap-2">
                <div className="h-2 w-2 rounded-full bg-sky-500" />
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('completed')} className="gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Mark Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEscalate} className="text-red-600 gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                Escalate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm mt-2.5 text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        {/* Patient & Department — pill style */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <User className="h-3 w-3 text-slate-400" />
            <span className="truncate max-w-[90px]">{task.patientName}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: deptColor + '15', color: deptColor }}>
            <Building2 className="h-3 w-3" />
            <span className="truncate max-w-[90px] font-medium">{task.department}</span>
          </div>
        </div>

        {/* SLA Timer — modern progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className={cn(
              "flex items-center gap-1.5 font-medium",
              sla.status === 'overdue' ? "text-red-600 dark:text-red-400" :
                sla.status === 'warning' ? "text-amber-600 dark:text-amber-400" :
                  "text-emerald-600 dark:text-emerald-400"
            )}>
              <Clock className="h-3.5 w-3.5" />
              <span>
                {sla.status === 'overdue'
                  ? `Overdue by ${formatDuration(sla.remainingMinutes)}`
                  : `${formatDuration(sla.remainingMinutes)} left`
                }
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">{formatRelativeTime(task.createdAt)}</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                sla.status === 'overdue' ? "bg-gradient-to-r from-red-500 to-red-400" :
                  sla.status === 'warning' ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                    "bg-gradient-to-r from-emerald-500 to-emerald-400"
              )}
              style={{ width: `${Math.min(sla.progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {task.requestedBy}
          </span>
          <div className="flex items-center gap-2">
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-slate-400">
                <Paperclip className="h-3 w-3" />
                <span className="text-[11px]">{task.attachments.length}</span>
              </div>
            )}
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Escalation Warning — premium alert */}
        {task.escalated && (
          <div className="mt-2.5 p-2.5 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-transparent border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold">Escalated — Needs Immediate Attention</span>
          </div>
        )}
      </div>
    </Card>
  );
}
