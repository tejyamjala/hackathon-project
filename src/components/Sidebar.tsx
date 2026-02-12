import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FlaskConical,
  Pill,
  Scan,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApp } from '@/context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const mainNav = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'tasks', label: 'Clinical Tasks', icon: ClipboardList },
];

const departmentNav = [
  { id: 'lab', label: 'Laboratory', icon: FlaskConical },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'radiology', label: 'Radiology', icon: Scan },
];

const toolsNav = [
  { id: 'chat', label: 'Messages', icon: MessageSquare },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({ isOpen, onClose, activeView, onViewChange, collapsed, setCollapsed }: SidebarProps) {
  const { state, resetDB } = useApp();
  const [userStatus, setUserStatus] = useState<'online' | 'busy' | 'away'>('online');

  const statusColors: Record<string, string> = {
    online: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    busy: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]',
    away: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  };

  const getBadgeCount = (id: string) => {
    switch (id) {
      case 'tasks':
        return state.tasks.filter(t => t.status !== 'completed').length;
      case 'lab':
        return state.tasks.filter(t => t.department === 'Laboratory' && t.status !== 'completed').length;
      case 'pharmacy':
        return state.tasks.filter(t => t.department === 'Pharmacy' && t.status !== 'completed').length;
      case 'radiology':
        return state.tasks.filter(t => t.department === 'Radiology' && t.status !== 'completed').length;
      case 'chat':
        return state.chatMessages.filter(c =>
          new Date(c.timestamp).getTime() > Date.now() - 3600000
        ).length;
      default:
        return null;
    }
  };

  const handleNavClick = (id: string) => {
    onViewChange(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderNavItem = (item: { id: string; label: string; icon: typeof LayoutDashboard }) => {
    const Icon = item.icon;
    const badgeCount = getBadgeCount(item.id);
    const isActive = activeView === item.id;

    const content = (
      <button
        onClick={() => handleNavClick(item.id)}
        className={cn(
          "group w-full flex items-center gap-3 rounded-lg text-left transition-all duration-200 relative",
          collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
          isActive
            ? "bg-white/[0.08] text-white"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
        )}
      >
        {/* Active indicator bar */}
        {isActive && !collapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-400" />
        )}

        <div className={cn(
          "rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 relative",
          collapsed ? "h-9 w-9" : "h-8 w-8",
          isActive && !collapsed
            ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 shadow-sm shadow-indigo-500/10"
            : !collapsed ? "bg-transparent group-hover:bg-white/[0.04]" : ""
        )}>
          <Icon className={cn(
            "transition-colors duration-200",
            collapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
            isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
          )} />

          {/* Collapsed Badge Dot */}
          {collapsed && badgeCount !== null && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-[#0d1117]" />
          )}
        </div>

        {!collapsed && (
          <>
            <span className={cn(
              "flex-1 text-[13px] transition-colors duration-200 truncate",
              isActive ? "font-semibold" : "font-medium"
            )}>
              {item.label}
            </span>

            {badgeCount !== null && badgeCount > 0 && (
              <span className={cn(
                "min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-bold flex items-center justify-center tabular-nums",
                isActive
                  ? "bg-indigo-500/30 text-indigo-300"
                  : "bg-white/[0.06] text-slate-500"
              )}>
                {badgeCount}
              </span>
            )}

            {isActive && (
              <ChevronRight className="h-3.5 w-3.5 text-indigo-400/60 shrink-0" />
            )}
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.id} delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#1a1f2e] text-slate-200 border-white/10">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.id}>{content}</div>;
  };

  const renderNavGroup = (items: typeof mainNav, label: string) => (
    <div className="mb-1">
      {!collapsed && (
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.12em] mb-1 px-3 select-none animate-fade-in">
          {label}
        </p>
      )}
      <div className="space-y-[2px]">
        {items.map(renderNavItem)}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] flex flex-col",
        "bg-[#0d1117] border-r border-white/[0.06]",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "w-20" : "w-[220px]"
      )}>

        {/* Scrollable navigation */}
        <ScrollArea className="flex-1">
          <div className={cn("pt-4 pb-2", collapsed ? "px-2" : "px-2")}>

            {/* Quick Stats — compact pill row */}
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-1 mb-4 animate-fade-in">
                <div className="flex-1 py-1.5 rounded-md bg-white/[0.03] text-center">
                  <p className="text-sm font-bold text-white leading-none">{state.patients.length}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5 font-medium">Patients</p>
                </div>
                <div className="flex-1 py-1.5 rounded-md bg-white/[0.03] text-center">
                  <p className="text-sm font-bold text-white leading-none">{state.tasks.filter(t => t.status !== 'completed').length}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5 font-medium">Active</p>
                </div>
                <div className="flex-1 py-1.5 rounded-md bg-white/[0.03] text-center">
                  <p className={cn(
                    "text-sm font-bold leading-none",
                    state.tasks.filter(t => t.status === 'delayed').length > 0 ? "text-amber-400" : "text-white"
                  )}>
                    {state.tasks.filter(t => t.status === 'delayed').length}
                  </p>
                  <p className="text-[9px] text-slate-600 mt-0.5 font-medium">Delayed</p>
                </div>
              </div>
            )}

            {!collapsed && <div className="h-px bg-white/[0.04] mx-1 mb-3" />}

            {renderNavGroup(mainNav, 'Overview')}
            <div className="h-px bg-white/[0.04] mx-1 my-2" />
            {renderNavGroup(departmentNav, 'Departments')}
            <div className="h-px bg-white/[0.04] mx-1 my-2" />
            {renderNavGroup(toolsNav, 'Tools')}
          </div>
        </ScrollArea>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-white/[0.06] bg-[#0a0e14] px-2 py-2 space-y-[2px]">
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex w-full items-center justify-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-200 mb-1"
            )}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {!collapsed && (
            <button
              onClick={() => handleNavClick('settings')}
              className={cn(
                "group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200",
                activeView === 'settings'
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              )}
            >
              <Settings className={cn("h-4 w-4 shrink-0", activeView === 'settings' ? "text-indigo-400" : "")} />
              <span className="text-[13px] font-medium">Settings</span>
            </button>
          )}

          {!collapsed && <div className="h-px bg-white/[0.04] mx-1 my-1" />}

          {/* User profile card */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2.5 rounded-lg hover:bg-white/[0.04] transition-all duration-200 group",
                collapsed ? "justify-center p-2" : "px-2.5 py-2"
              )}>
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[11px] font-bold bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                      {state.currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0e14]",
                    statusColors[userStatus]
                  )} />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[12px] font-semibold text-slate-200 truncate leading-tight">{state.currentUser.name}</p>
                    <p className="text-[10px] text-slate-600 capitalize truncate leading-tight mt-0.5">{state.currentUser.role}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-56 ml-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewChange('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Set Status</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={userStatus} onValueChange={(v) => setUserStatus(v as 'online' | 'busy' | 'away')}>
                    <DropdownMenuRadioItem value="online" className="text-emerald-600">Available</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="busy" className="text-red-600">Busy / Sub-I</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="away" className="text-amber-600">Away</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30" onClick={resetDB}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  );
}
