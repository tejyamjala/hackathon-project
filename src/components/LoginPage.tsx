import { useState } from 'react';
import { Activity, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { mockUsers } from '@/data/mockData';

interface LoginPageProps {
    onLogin: (userId: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [selectedUser, setSelectedUser] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) {
            setError('Please select a user');
            return;
        }
        onLogin(selectedUser);
    };

    const handleQuickLogin = (userId: string) => {
        onLogin(userId);
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left side — branding */}
            <div className="hidden lg:flex lg:w-[500px] gradient-sidebar text-white flex-col justify-between p-10 relative overflow-hidden">
                {/* Decorative orbs */}
                <div className="absolute top-20 -right-16 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -left-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold">Aether</span>
                            <p className="text-[10px] text-indigo-300/50 uppercase tracking-[0.15em] font-bold">Clinical Intelligence</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 relative">
                    <h2 className="text-3xl font-extrabold leading-tight">
                        Next-gen clinical<br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">workflow intelligence</span>
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        Real-time task orchestration, predictive SLA analytics, and seamless
                        departmental coordination — powered by Aether.
                    </p>
                    <div className="grid grid-cols-3 gap-3 pt-4">
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                            <p className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">98%</p>
                            <p className="text-[10px] text-indigo-300/40 mt-1 font-medium">SLA Compliance</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                            <p className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">12s</p>
                            <p className="text-[10px] text-indigo-300/40 mt-1 font-medium">Avg. Response</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                            <p className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">5</p>
                            <p className="text-[10px] text-indigo-300/40 mt-1 font-medium">Departments</p>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] text-slate-700 relative">&copy; 2026 Aether Clinical Intelligence. Zenith Medical Centre.</p>
            </div>

            {/* Right side — login form */}
            <div className="flex-1 flex items-center justify-center p-6 gradient-mesh">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Activity className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Aether</span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-extrabold text-foreground">Sign in</h1>
                        <Sparkles className="h-5 w-5 text-indigo-400" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">Enter your credentials to access the clinical dashboard</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Email / Username</Label>
                            <Input
                                placeholder="doctor@aether.health"
                                className="h-10 rounded-xl bg-muted/50 border-border/50 focus-visible:ring-indigo-400/50"
                                value={selectedUser ? mockUsers.find(u => u.id === selectedUser)?.email || '' : ''}
                                readOnly
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    className="h-10 pr-10 rounded-xl bg-muted/50 border-border/50 focus-visible:ring-indigo-400/50"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" className="w-full h-10 gradient-primary hover:opacity-90 text-white rounded-xl gap-2 shadow-lg shadow-indigo-500/20 font-semibold" disabled={!selectedUser}>
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </form>

                    {/* Quick access for demo */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-px bg-border/50" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-bold">Quick Access</span>
                            <div className="flex-1 h-px bg-border/50" />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {mockUsers.map(user => (
                                <Card
                                    key={user.id}
                                    className={`p-3 cursor-pointer transition-all duration-200 border rounded-xl ${selectedUser === user.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10' : 'border-border/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                                        }`}
                                    onClick={() => {
                                        setSelectedUser(user.id);
                                        setError('');
                                    }}
                                    onDoubleClick={() => handleQuickLogin(user.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-indigo-500/20">
                                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{user.role} &middot; {user.department}</p>
                                        </div>
                                        {user.isOnline && <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />}
                                        {selectedUser === user.id && (
                                            <Button size="sm" className="h-7 text-xs gap-1 gradient-primary text-white rounded-lg shadow-sm" onClick={(e) => { e.stopPropagation(); handleQuickLogin(user.id); }}>
                                                Login <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">Select a user and click Login, or double-click to sign in instantly</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
