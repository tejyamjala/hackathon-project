import { useState, useCallback } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { DashboardOverview } from '@/components/DashboardOverview';
import { PatientDashboard } from '@/components/PatientDashboard';
import { KanbanBoard } from '@/components/KanbanBoard';
import { DepartmentWorkspace } from '@/components/DepartmentWorkspace';
import { DepartmentChat } from '@/components/DepartmentChat';
import { ReportsHub } from '@/components/ReportsHub';
import { NewTaskDialog } from '@/components/NewTaskDialog';
import { NewPatientDialog } from '@/components/NewPatientDialog';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { LoginPage } from '@/components/LoginPage';
import type { Patient } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';

function AppContent() {
  const { state, dispatch } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newPatientOpen, setNewPatientOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = useCallback((userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      dispatch({ type: 'SWITCH_USER', payload: { id: user.id, name: user.name, role: user.role, department: user.department } });
      setIsLoggedIn(true);
    }
  }, [dispatch]);

  const handleViewChange = useCallback((view: string) => {
    setActiveView(view);
    setSelectedPatient(null);
  }, []);

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setActiveView('patient-detail');
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div key="dashboard" className="page-enter">
            <DashboardOverview onViewChange={handleViewChange} onNewTask={() => setNewTaskOpen(true)} />
          </div>
        );
      case 'patients':
        return (
          <div key="patients" className="page-enter">
            <div className="h-full overflow-auto">
              <div className="flex items-center justify-between mb-5 animate-fade-in">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Patients</h1>
                  <p className="text-sm text-muted-foreground">{state.patients.length} currently admitted</p>
                </div>
                <Button onClick={() => setNewPatientOpen(true)} className="gap-1.5 h-9 gradient-primary hover:opacity-90 text-white rounded-xl shadow-md shadow-indigo-500/20">
                  <Plus className="h-4 w-4" />
                  Admit Patient
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {state.patients.map((patient, i) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 premium-card">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md ${patient.status === 'Critical' ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20' :
                            patient.status === 'Stable' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/20'
                            }`}>
                            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${patient.status === 'Critical' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                          patient.status === 'Stable' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400'
                          }`}>
                          {patient.status}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mb-1">{patient.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">{patient.age}y {patient.gender} &middot; {patient.department} &middot; Bed {patient.bedNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'patient-detail':
        if (selectedPatient) {
          return (
            <div key="patient-detail" className="page-enter">
              <button onClick={() => setActiveView('patients')} className="text-sm text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-1 font-medium">
                &larr; Back to Patients
              </button>
              <PatientDashboard patient={selectedPatient} onNewTask={() => setNewTaskOpen(true)} />
            </div>
          );
        }
        return null;
      case 'tasks':
        return <div key="tasks" className="page-enter"><KanbanBoard onNewTask={() => setNewTaskOpen(true)} /></div>;
      case 'lab':
        return <div key="lab" className="page-enter"><DepartmentWorkspace department="Laboratory" /></div>;
      case 'pharmacy':
        return <div key="pharmacy" className="page-enter"><DepartmentWorkspace department="Pharmacy" /></div>;
      case 'radiology':
        return <div key="radiology" className="page-enter"><DepartmentWorkspace department="Radiology" /></div>;
      case 'chat':
        return <div key="chat" className="page-enter"><DepartmentChat /></div>;
      case 'reports':
        return <div key="reports" className="page-enter"><ReportsHub /></div>;
      case 'analytics':
        return <div key="analytics" className="page-enter"><AnalyticsPage /></div>;
      case 'settings':
        return <div key="settings" className="page-enter"><SettingsPage /></div>;
      default:
        return <div key="default" className="page-enter"><DashboardOverview onViewChange={handleViewChange} onNewTask={() => setNewTaskOpen(true)} /></div>;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} onNewTask={() => setNewTaskOpen(true)} onNavigate={handleViewChange} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={activeView}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[220px]'} p-5 overflow-auto`}>
          {renderContent()}
        </main>
      </div>
      <NewTaskDialog open={newTaskOpen} onOpenChange={setNewTaskOpen} />
      <NewPatientDialog open={newPatientOpen} onOpenChange={setNewPatientOpen} />
      <Button
        onClick={() => setNewTaskOpen(true)}
        size="icon"
        className="fixed bottom-5 right-5 h-12 w-12 rounded-2xl shadow-xl z-30 gradient-primary hover:opacity-90 shadow-indigo-500/25"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
