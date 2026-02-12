import { useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskCard } from './TaskCard';
import type { ClinicalTask } from '@/types';
import { cn, groupBy } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface KanbanColumn {
  id: ClinicalTask['status'];
  label: string;
  color: string;
  bgColor: string;
}

const columns: KanbanColumn[] = [
  { id: 'todo', label: 'To Do', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { id: 'in-progress', label: 'In Progress', color: 'text-sky-600', bgColor: 'bg-sky-50' },
  { id: 'completed', label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'delayed', label: 'Delayed', color: 'text-red-600', bgColor: 'bg-red-50' },
];

interface KanbanBoardProps {
  tasks?: ClinicalTask[];
  title?: string;
  showFilters?: boolean;
  onNewTask?: () => void;
}

export function KanbanBoard({ tasks: propTasks, title = 'Clinical Task Board', showFilters = true }: KanbanBoardProps) {
  const { state, dispatch } = useApp();
  const [draggedTask, setDraggedTask] = useState<ClinicalTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);

  const tasks = propTasks || state.tasks;

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    if (filterPriority && task.priority !== filterPriority) return false;
    if (filterDepartment && task.department !== filterDepartment) return false;
    return true;
  });

  const tasksByStatus = groupBy(filteredTasks, 'status');

  const handleDragStart = (task: ClinicalTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: ClinicalTask['status']) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnId) {
      dispatch({
        type: 'UPDATE_TASK_STATUS',
        payload: { taskId: draggedTask.id, status: columnId }
      });
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">
            {filteredTasks.length} tasks • {filteredTasks.filter(t => t.priority === 'stat').length} Crit
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showFilters && (
            <>
              <select
                value={filterPriority || ''}
                onChange={(e) => setFilterPriority(e.target.value || null)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="">All Priorities</option>
                <option value="stat">Crit</option>
                <option value="urgent">Urgent</option>
                <option value="routine">Routine</option>
              </select>
              <select
                value={filterDepartment || ''}
                onChange={(e) => setFilterDepartment(e.target.value || null)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="">All Departments</option>
                {state.departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </>
          )}
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {columns.map((column) => {
          const columnTasks = tasksByStatus[column.id] || [];
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={cn(
                "flex flex-col rounded-xl border-2 transition-colors",
                column.bgColor,
                isDragOver ? "border-sky-400 ring-2 ring-sky-200" : "border-transparent"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-semibold text-sm", column.color)}>
                      {column.label}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Column Content */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                    >
                      <TaskCard
                        task={task}
                        isDragging={draggedTask?.id === task.id}
                      />
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
