import { useState } from 'react';
import {
    Settings,
    User,
    Bell,
    Palette,
    Database,
    Moon,
    Sun,
    Monitor,
    Volume2,
    VolumeX,
    RotateCcw,
    Save,
    AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System & Data', icon: Database },
];

export function SettingsPage() {
    const { state, dispatch, resetDB } = useApp();
    const [activeSection, setActiveSection] = useState('profile');
    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const [slaWarning, setSlaWarning] = useState('15');

    const handleSave = () => {
        toast.success('Settings saved');
    };

    return (
        <div className="h-full overflow-auto page-enter">
            <div className="mb-5 animate-fade-in">
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-400" />
                    Settings
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5 ml-7">Manage preferences and configuration</p>
            </div>

            <div className="grid grid-cols-4 gap-5">
                {/* Settings Nav */}
                <div className="col-span-1 animate-fade-in">
                    <Card className="p-1.5 premium-card">
                        <nav className="space-y-0.5">
                            {settingsSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all",
                                        activeSection === section.id
                                            ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200/50 dark:border-indigo-800/30"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                                    )}
                                >
                                    <section.icon className="h-4 w-4" />
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Settings Content */}
                <div className="col-span-3">
                    {activeSection === 'profile' && (
                        <Card className="p-5 animate-fade-in-scale premium-card">
                            <h2 className="text-sm font-bold text-foreground mb-4">Profile</h2>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 mb-5 border border-border/50">
                                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/20">
                                    {state.currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{state.currentUser.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{state.currentUser.role} &middot; {state.currentUser.department}</p>
                                </div>
                                <Badge variant="secondary" className="ml-auto text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-0">Active</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Full Name</Label>
                                    <Input defaultValue={state.currentUser.name} className="h-8 text-sm rounded-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Department</Label>
                                    <Input defaultValue={state.currentUser.department} className="h-8 text-sm rounded-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Role</Label>
                                    <Input defaultValue={state.currentUser.role} className="h-8 text-sm capitalize rounded-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Email</Label>
                                    <Input defaultValue={`${state.currentUser.name.toLowerCase().replace(' ', '.')}@aether.health`} className="h-8 text-sm rounded-lg" />
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeSection === 'notifications' && (
                        <Card className="p-5 animate-fade-in-scale">
                            <h2 className="text-sm font-bold text-foreground mb-4">Notifications</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Push Notifications', desc: 'Get alerts for task updates', value: notifications, onChange: setNotifications, icon: Bell },
                                    { label: 'Sound Effects', desc: 'Play sound on new notifications', value: soundEnabled, onChange: setSoundEnabled, icon: soundEnabled ? Volume2 : VolumeX },
                                    { label: 'Auto-Refresh', desc: 'Refresh dashboard in real-time', value: autoRefresh, onChange: setAutoRefresh, icon: Bell },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                                        <div className="flex items-center gap-2.5">
                                            <item.icon className="h-4 w-4 text-indigo-400" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                        <Switch checked={item.value} onCheckedChange={item.onChange} />
                                    </div>
                                ))}

                                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                                    <p className="text-sm font-medium text-foreground mb-1">SLA Warning Threshold</p>
                                    <p className="text-[10px] text-muted-foreground mb-2">Warn when SLA is within this many minutes</p>
                                    <Select value={slaWarning} onValueChange={setSlaWarning}>
                                        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 minutes</SelectItem>
                                            <SelectItem value="10">10 minutes</SelectItem>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeSection === 'appearance' && (
                        <Card className="p-5 animate-fade-in-scale">
                            <h2 className="text-sm font-bold text-foreground mb-4">Appearance</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs mb-2 block">Theme</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => {
                                                if (state.theme !== 'light') dispatch({ type: 'TOGGLE_THEME' });
                                            }}
                                            className={cn(
                                                "p-3 rounded-xl border text-left transition-all",
                                                state.theme === 'light' ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm" : "border-border hover:border-indigo-300 dark:hover:border-indigo-700"
                                            )}
                                        >
                                            <Sun className={cn("h-4 w-4 mb-1", state.theme === 'light' ? "text-indigo-600" : "text-muted-foreground")} />
                                            <p className="text-xs font-medium text-foreground">Light</p>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (state.theme !== 'dark') dispatch({ type: 'TOGGLE_THEME' });
                                            }}
                                            className={cn(
                                                "p-3 rounded-xl border text-left transition-all",
                                                state.theme === 'dark' ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm" : "border-border hover:border-indigo-300 dark:hover:border-indigo-700"
                                            )}
                                        >
                                            <Moon className={cn("h-4 w-4 mb-1", state.theme === 'dark' ? "text-indigo-600" : "text-muted-foreground")} />
                                            <p className="text-xs font-medium text-foreground">Dark</p>
                                        </button>
                                        <button
                                            disabled
                                            className="p-3 rounded-xl border text-left transition-all border-border opacity-50 cursor-not-allowed"
                                        >
                                            <Monitor className="h-4 w-4 mb-1 text-muted-foreground" />
                                            <p className="text-xs font-medium text-foreground">System</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeSection === 'system' && (
                        <Card className="p-5 animate-fade-in-scale premium-card">
                            <h2 className="text-sm font-bold text-foreground mb-4">System & Data</h2>
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                                    <p className="text-sm font-medium text-foreground mb-2">Database</p>
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Connected (localStorage)</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 rounded-lg bg-card text-center border border-border/50">
                                            <p className="text-sm font-bold text-foreground">{state.patients.length}</p>
                                            <p className="text-[10px] text-muted-foreground">Patients</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-card text-center border border-border/50">
                                            <p className="text-sm font-bold text-foreground">{state.tasks.length}</p>
                                            <p className="text-[10px] text-muted-foreground">Tasks</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-card text-center border border-border/50">
                                            <p className="text-sm font-bold text-foreground">{state.timelineEvents.length}</p>
                                            <p className="text-[10px] text-muted-foreground">Events</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={resetDB}>
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Reset Database
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground">Clears all data & reloads with defaults</p>
                                </div>
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                        Data is stored locally. Clearing browser data will reset everything.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="mt-4 flex justify-end">
                        <Button size="sm" onClick={handleSave} className="gap-1.5 h-8 text-xs gradient-primary hover:opacity-90 text-white rounded-xl shadow-md shadow-indigo-500/20">
                            <Save className="h-3.5 w-3.5" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
