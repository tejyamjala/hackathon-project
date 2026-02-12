import {
    TrendingUp,
    Users,
    Clock,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export function AnalyticsPage() {
    const { state } = useApp();

    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
    const delayedTasks = state.tasks.filter(t => t.status === 'delayed').length;
    const inProgressTasks = state.tasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = state.tasks.filter(t => t.status === 'todo').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const onTimeRate = totalTasks > 0 ? Math.round(((totalTasks - delayedTasks) / totalTasks) * 100) : 0;

    const departments = ['Laboratory', 'Pharmacy', 'Radiology', 'Nursing', 'Cardiology'];
    const deptStats = departments.map(dept => {
        const deptTasks = state.tasks.filter(t => t.department === dept);
        const completed = deptTasks.filter(t => t.status === 'completed').length;
        return {
            name: dept,
            total: deptTasks.length,
            completed,
            pending: deptTasks.filter(t => t.status !== 'completed').length,
            delayed: deptTasks.filter(t => t.status === 'delayed').length,
            rate: deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0,
        };
    }).filter(d => d.total > 0);

    const taskTypes = [
        { type: 'Lab Tests', count: state.tasks.filter(t => t.type === 'lab-test').length },
        { type: 'Prescriptions', count: state.tasks.filter(t => t.type === 'prescription').length },
        { type: 'Imaging', count: state.tasks.filter(t => t.type === 'imaging').length },
        { type: 'Procedures', count: state.tasks.filter(t => t.type === 'procedure').length },
        { type: 'Referrals', count: state.tasks.filter(t => t.type === 'referral').length },
        { type: 'Care Instructions', count: state.tasks.filter(t => t.type === 'care-instruction').length },
    ].filter(t => t.count > 0);

    return (
        <div className="h-full overflow-auto page-enter">
            <div className="mb-5 animate-fade-in">
                <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-400" />
                    Analytics
                </h1>
                <p className="text-xs text-slate-500 mt-0.5 ml-7">Performance metrics across departments</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                    { title: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { title: 'On-Time Rate', value: `${onTimeRate}%`, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' },
                    { title: 'Active Patients', value: `${state.patients.length}`, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { title: 'Delayed Tasks', value: `${delayedTasks}`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((kpi, i) => (
                    <Card key={i} className={cn("p-4 animate-fade-in", `stagger-${i + 1}`)}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{kpi.title}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                            </div>
                            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", kpi.bg)}>
                                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-5 mb-5">
                {/* Task Status */}
                <Card className="p-4 animate-fade-in stagger-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Task Distribution</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'To Do', count: todoTasks, color: 'bg-slate-400', pct: totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0 },
                            { label: 'In Progress', count: inProgressTasks, color: 'bg-sky-500', pct: totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0 },
                            { label: 'Completed', count: completedTasks, color: 'bg-emerald-500', pct: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0 },
                            { label: 'Delayed', count: delayedTasks, color: 'bg-red-500', pct: totalTasks > 0 ? (delayedTasks / totalTasks) * 100 : 0 },
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn("h-2 w-2 rounded-full", s.color)} />
                                        <span className="text-slate-600">{s.label}</span>
                                    </div>
                                    <span className="font-semibold text-slate-800">{s.count}</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%`, transition: 'width 0.8s ease-out' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Priority */}
                <Card className="p-4 animate-fade-in stagger-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">By Priority</h3>
                    <div className="space-y-2">
                        {[
                            { label: 'Crit', count: state.tasks.filter(t => t.priority === 'stat').length, bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' },
                            { label: 'Urgent', count: state.tasks.filter(t => t.priority === 'urgent').length, bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
                            { label: 'Routine', count: state.tasks.filter(t => t.priority === 'routine').length, bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
                        ].map((p, i) => (
                            <div key={i} className={cn("p-3 rounded-lg", p.bg)}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={cn("text-xs font-semibold", p.text)}>{p.label}</span>
                                    <span className={cn("text-lg font-bold", p.text)}>{p.count}</span>
                                </div>
                                <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full", p.bar)} style={{ width: `${totalTasks > 0 ? (p.count / totalTasks) * 100 : 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* By Type */}
                <Card className="p-4 animate-fade-in stagger-7">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">By Order Type</h3>
                    <div className="space-y-2">
                        {taskTypes.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                                <span className="text-xs text-slate-600">{t.type}</span>
                                <Badge variant="secondary" className="text-xs font-semibold">{t.count}</Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Department Performance */}
            <Card className="p-4 animate-fade-in stagger-8">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    Department Performance
                </h3>
                <div className="space-y-3">
                    {deptStats.map((dept, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                            <div className="w-28 shrink-0">
                                <p className="text-xs font-medium text-slate-800">{dept.name}</p>
                                <p className="text-[10px] text-slate-400">{dept.total} tasks</p>
                            </div>
                            <div className="flex-1">
                                <Progress value={dept.rate} className="h-1.5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">{dept.completed} done</Badge>
                                {dept.delayed > 0 && <Badge variant="destructive" className="text-[10px]">{dept.delayed} late</Badge>}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
