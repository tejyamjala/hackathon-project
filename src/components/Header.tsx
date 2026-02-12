import { useState } from 'react';
import { Bell, Search, Menu, Activity, ChevronDown, RotateCcw, Plus, X, Clock, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp, mockUsers } from '@/context/AppContext';
import { cn, formatRelativeTime } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  onNewTask: () => void;
  onNavigate?: (view: string) => void;
}

export function Header({ onMenuClick, onNewTask, onNavigate }: HeaderProps) {
  const { state, dispatch, resetDB } = useApp();
  const { currentUser } = state;
  const [notifOpen, setNotifOpen] = useState(false);

  const delayedTasksCount = state.tasks.filter(t => t.status === 'delayed').length;
  const critTasksCount = state.tasks.filter(t => t.priority === 'stat' && t.status !== 'completed').length;
  const totalAlerts = critTasksCount + delayedTasksCount;

  // Build notifications with bulletproof deduplication
  type Notif = { id: string; type: 'stat' | 'delayed' | 'info'; title: string; desc: string; time: string; navigateTo: string };
  const allNotifs: Notif[] = [];
  const usedKeys = new Set<string>();

  const deptToView = (d: string) =>
    d === 'Laboratory' ? 'lab' : d === 'Pharmacy' ? 'pharmacy' : d === 'Radiology' ? 'radiology' : 'tasks';

  // 1) Crit tasks
  state.tasks.filter(t => t.priority === 'stat' && t.status !== 'completed').slice(0, 3).forEach(t => {
    const key = `task-${t.id}`;
    if (usedKeys.has(key)) return;
    usedKeys.add(key);
    usedKeys.add(`patient-${t.patientId}-${t.title}`); // also mark patient+title as seen
    allNotifs.push({ id: t.id, type: 'stat', title: `Crit: ${t.title}`, desc: `${t.patientName} — ${t.department}`, time: t.createdAt, navigateTo: deptToView(t.department) });
  });

  // 2) Delayed tasks — skip if same task already shown
  state.tasks.filter(t => t.status === 'delayed').slice(0, 3).forEach(t => {
    const key = `task-${t.id}`;
    if (usedKeys.has(key)) return;
    usedKeys.add(key);
    usedKeys.add(`patient-${t.patientId}-${t.title}`);
    allNotifs.push({ id: t.id, type: 'delayed', title: `Delayed: ${t.title}`, desc: `${t.patientName} — SLA breached`, time: t.createdAt, navigateTo: deptToView(t.department) });
  });

  // 3) Timeline events — skip if about a patient+task combination already shown
  state.timelineEvents.slice(0, 6).forEach(e => {
    // Check if this event's description mentions any task title we already displayed
    const isDup = Array.from(usedKeys).some(k => {
      if (!k.startsWith('patient-')) return false;
      const taskTitle = k.split('-').slice(2).join('-');
      return e.description?.includes(taskTitle) || false;
    });
    if (isDup) return;
    const evtKey = `evt-${e.id}`;
    if (usedKeys.has(evtKey)) return;
    usedKeys.add(evtKey);
    allNotifs.push({ id: e.id, type: 'info', title: e.title, desc: `${e.performedBy} — ${e.department}`, time: e.timestamp, navigateTo: deptToView(e.department) });
  });

  const finalNotifications = allNotifs.slice(0, 8);

  const handleNotifClick = (navigateTo: string) => {
    setNotifOpen(false);
    onNavigate?.(navigateTo);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b border-border/50 glass flex items-center px-4">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-base font-extrabold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent leading-tight">Aether</h1>
            <p className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Clinical Intelligence</p>
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-lg mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search patients, tasks, reports..."
            className="pl-9 h-9 text-sm bg-muted/50 border-border/50 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-300 rounded-xl"
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
          />
        </div>
      </div>

      {/* Right section — always far right */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl"
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
        >
          {state.theme === 'dark' ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </Button>

        {/* New Task Button */}
        <Button onClick={onNewTask} size="sm" className="gap-1.5 h-8 gradient-primary hover:opacity-90 text-white rounded-xl shadow-md shadow-indigo-500/20">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline text-sm">New Order</span>
        </Button>

        {/* Status Badges */}
        <div className="hidden lg:flex items-center gap-1.5">
          {critTasksCount > 0 && (
            <Badge variant="destructive" className="text-xs h-6 gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate?.('tasks')}>
              {critTasksCount} Crit {critTasksCount === 1 ? 'Order' : 'Orders'}
            </Badge>
          )}
          {delayedTasksCount > 0 && (
            <Badge variant="outline" className="text-xs h-6 gap-1 border-amber-300 text-amber-600 bg-amber-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate?.('tasks')}>
              {delayedTasksCount} Delayed
            </Badge>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell className="h-4.5 w-4.5" />
            {totalAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full gradient-primary text-white text-[9px] font-bold flex items-center justify-center shadow-md shadow-indigo-500/30">
                {totalAlerts}
              </span>
            )}
          </Button>

          {/* Notification Panel */}
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 w-80 bg-card rounded-xl border border-border/50 shadow-xl shadow-indigo-500/5 z-50 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                  <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {finalNotifications.length > 0 ? finalNotifications.map(n => (
                    <div key={n.id} className={cn(
                      "px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                      n.type === 'stat' && "bg-red-50/50 dark:bg-red-950/10",
                      n.type === 'delayed' && "bg-amber-50/50 dark:bg-amber-950/10",
                    )} onClick={() => handleNotifClick(n.navigateTo)}>
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-1.5 shrink-0",
                          n.type === 'stat' ? "bg-red-500" : n.type === 'delayed' ? "bg-amber-500" : "bg-indigo-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{n.desc}</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(n.time)}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-1 shrink-0" />
                      </div>
                    </div>
                  )) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reset */}
        <Button variant="ghost" size="icon" onClick={resetDB} className="h-9 w-9" title="Reset Database">
          <RotateCcw className="h-4 w-4 text-slate-400" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-3 border-l border-slate-200 py-1 pr-1 hover:bg-slate-50 rounded-r-lg transition-colors">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold leading-tight">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 capitalize leading-tight">{currentUser.role} &middot; {currentUser.department}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-semibold bg-slate-900 text-white">
                  {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
              Switch Role (for demo)
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockUsers.map(user => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => dispatch({ type: 'SWITCH_USER', payload: { id: user.id, name: user.name, role: user.role, department: user.department } })}
                className={cn("gap-2.5 py-2.5", user.id === currentUser.id && "bg-slate-50")}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px] font-semibold bg-slate-800 text-white">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role} &middot; {user.department}</p>
                </div>
                {user.id === currentUser.id && (
                  <Badge variant="secondary" className="text-[10px] h-5">Active</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
