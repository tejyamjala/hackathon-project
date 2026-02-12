import {
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Clock,
  FlaskConical,
  Pill,
  Scan,
  MessageSquare,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/context/AppContext';
import { cn, formatRelativeTime, calculateSLAStatus, formatDuration, getPriorityColor } from '@/lib/utils';

interface DashboardOverviewProps {
  onViewChange: (view: string) => void;
  onNewTask?: () => void;
}

export function DashboardOverview({ onViewChange, onNewTask }: DashboardOverviewProps) {
  const { state } = useApp();
  const { searchQuery } = state;

  // Filter data based on search query
  const filteredTasks = state.tasks.filter(t =>
    !searchQuery ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = state.patients.filter(p =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalPatients: filteredPatients.length,
    activeTasks: filteredTasks.filter(t => t.status !== 'completed').length,
    delayedTasks: filteredTasks.filter(t => t.status === 'delayed').length,
    completedToday: filteredTasks.filter(t => t.status === 'completed').length,
  };

  const recentTasks = filteredTasks.filter(t => t.status !== 'completed').slice(0, 5);
  const criticalPatients = filteredPatients.filter(p => p.status === 'Critical');
  const recentPatients = filteredPatients.slice(0, 4);

  const statCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, sub: 'Currently admitted', gradient: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/20' },
    { title: 'Active Tasks', value: stats.activeTasks, icon: ClipboardList, sub: 'Across departments', gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
    { title: 'Delayed', value: stats.delayedTasks, icon: AlertTriangle, sub: 'SLA breached', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
    { title: 'Completed', value: stats.completedToday, icon: CheckCircle2, sub: 'Tasks finished', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
  ];

  return (
    <div className="h-full overflow-auto gradient-mesh">
      {/* Welcome */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{state.currentUser.name.split(' ').slice(-1)[0]}</span>
          </h1>
          <Sparkles className="h-5 w-5 text-indigo-400 animate-float" />
        </div>
        <p className="text-sm text-muted-foreground">Here's your clinical intelligence overview — Zenith Medical Centre</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <Card key={s.title} className={cn("p-5 animate-fade-in premium-card card-hover", `stagger-${i + 1}`)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.title}</p>
                <p className="text-3xl font-extrabold text-foreground mt-1">{s.value}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {s.sub}
                </p>
              </div>
              <div className={cn(`h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg`, s.gradient, s.shadow)}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Critical Patients */}
          {criticalPatients.length > 0 && (
            <Card className="p-5 border-red-200/50 dark:border-red-900/30 animate-fade-in stagger-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-400" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  Critical Patients ({criticalPatients.length})
                </h3>
                <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400 text-xs h-8 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onViewChange('patients')}>
                  View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {criticalPatients.map((p) => (
                  <div key={p.id} className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 cursor-pointer hover:shadow-md hover:shadow-red-500/5 transition-all duration-200" onClick={() => onViewChange('patients')}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-red-500/20">
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.mrn} &middot; Bed {p.bedNumber}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{p.diagnosis}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Patients */}
          <Card className="p-5 animate-fade-in stagger-6 premium-card card-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Recent Patients</h3>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" onClick={() => onViewChange('patients')}>
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recentPatients.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-border/50 hover:bg-muted/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer" onClick={() => onViewChange('patients')}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md",
                      p.status === 'Critical' ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20' :
                        p.status === 'Stable' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' :
                          'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/20'
                    )}>
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.department} &middot; {p.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Department Activity */}
          <Card className="p-5 animate-fade-in stagger-7 premium-card card-hover">
            <h3 className="text-sm font-bold text-foreground mb-4">Department Activity</h3>
            <div className="space-y-4">
              {state.departments.map(dept => {
                const deptTasks = state.tasks.filter(t => t.department === dept.name);
                const pendingTasks = deptTasks.filter(t => t.status !== 'completed');
                const delayedTasks = deptTasks.filter(t => t.status === 'delayed');
                const progress = deptTasks.length > 0 ? ((deptTasks.length - pendingTasks.length) / deptTasks.length) * 100 : 0;
                const DeptIcon = dept.icon === 'FlaskConical' ? FlaskConical :
                  dept.icon === 'Pill' ? Pill : dept.icon === 'Scan' ? Scan :
                    dept.icon === 'Heart' ? Activity : dept.icon === 'UserRound' ? Users : Activity;

                return (
                  <div key={dept.id} className="flex items-center gap-4 group">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105" style={{ backgroundColor: `${dept.color}12` }}>
                      <DeptIcon className="h-4.5 w-4.5" style={{ color: dept.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-foreground">{dept.name}</span>
                        <div className="flex items-center gap-2">
                          {delayedTasks.length > 0 && <Badge variant="destructive" className="text-[10px] h-5">{delayedTasks.length} delayed</Badge>}
                          <span className="text-xs text-muted-foreground">{pendingTasks.length} pending</span>
                        </div>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Action */}
          {onNewTask && (
            <Card className="p-5 gradient-primary text-white border-0 animate-fade-in stagger-3 relative overflow-hidden shadow-xl shadow-indigo-500/20">
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              <div className="relative">
                <h3 className="text-sm font-bold mb-1">Quick Action</h3>
                <p className="text-xs text-white/60 mb-4">Create a new clinical order</p>
                <Button onClick={onNewTask} variant="secondary" className="w-full h-9 bg-white/20 hover:bg-white/30 border-0 text-white font-semibold backdrop-blur-sm rounded-xl">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  New Clinical Order
                </Button>
              </div>
            </Card>
          )}

          {/* Priority Tasks */}
          <Card className="p-5 animate-fade-in stagger-4 premium-card card-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Priority Tasks</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 text-indigo-600 dark:text-indigo-400" onClick={() => onViewChange('tasks')}>All Tasks</Button>
            </div>
            <div className="space-y-2.5">
              {recentTasks.map(task => {
                const sla = calculateSLAStatus(task.createdAt, task.slaMinutes);
                return (
                  <div key={task.id} className={cn("p-3 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer",
                    task.priority === 'stat' ? "border-red-200/50 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 hover:shadow-red-500/5" :
                      task.priority === 'urgent' ? "border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 hover:shadow-amber-500/5" : "border-border/50 hover:shadow-indigo-500/5"
                  )}>
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className={cn("text-[10px] h-5 rounded-md font-semibold", getPriorityColor(task.priority))}>{task.priority}</Badge>
                      <span className="text-[11px] text-muted-foreground">{formatRelativeTime(task.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold truncate text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.patientName}</p>
                    {task.status !== 'completed' && (
                      <div className={cn("mt-2 text-xs flex items-center gap-1 font-medium",
                        sla.status === 'overdue' ? "text-red-600 dark:text-red-400" : sla.status === 'warning' ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        <Clock className="h-3 w-3" />
                        {sla.status === 'overdue' ? `Overdue ${formatDuration(sla.remainingMinutes)}` : `${formatDuration(sla.remainingMinutes)} left`}
                      </div>
                    )}
                  </div>
                );
              })}
              {recentTasks.length === 0 && <p className="text-center text-muted-foreground py-6 text-sm">No active tasks</p>}
            </div>
          </Card>

          {/* Activity */}
          <Card className="p-5 animate-fade-in stagger-5 premium-card card-hover">
            <h3 className="text-sm font-bold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {state.timelineEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex gap-2.5 group">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {event.performedBy.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] h-4 rounded-md">{event.department}</Badge>
                      <span className="text-[11px] text-muted-foreground/60">{formatRelativeTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Links */}
          <Card className="p-5 animate-fade-in stagger-6 premium-card card-hover">
            <h3 className="text-sm font-bold text-foreground mb-3">Quick Links</h3>
            <div className="space-y-1">
              {[
                { label: 'Task Board', icon: ClipboardList, view: 'tasks' },
                { label: 'Laboratory', icon: FlaskConical, view: 'lab' },
                { label: 'Pharmacy', icon: Pill, view: 'pharmacy' },
                { label: 'Messages', icon: MessageSquare, view: 'chat' },
              ].map((link) => (
                <Button key={link.view} variant="ghost" className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl" onClick={() => onViewChange(link.view)}>
                  <link.icon className="h-4 w-4 mr-2 text-indigo-400" />
                  {link.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
