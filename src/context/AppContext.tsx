import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Patient, ClinicalTask, TimelineEvent, ChatMessage, Department, Prescription, LabTest, CareInstruction, DashboardStats } from '@/types';
import {
  mockPatients,
  mockClinicalTasks,
  mockTimelineEvents,
  mockChatMessages,
  mockDepartments,
  mockPrescriptions,
  mockLabTests,
  mockCareInstructions,
  mockDashboardStats,
  mockUsers,
} from '@/data/mockData';
import { toast } from 'sonner';

// ─── State ─────────────────────────────────────────────────
export interface AppState {
  patients: Patient[];
  tasks: ClinicalTask[];
  timelineEvents: TimelineEvent[];
  chatMessages: ChatMessage[];
  departments: Department[];
  prescriptions: Prescription[];
  labTests: LabTest[];
  careInstructions: CareInstruction[];
  dashboardStats: DashboardStats;
  selectedPatientId: string | null;
  selectedDepartment: string | null;
  currentUser: { id: string; name: string; role: string; department: string };
  theme: 'light' | 'dark';
  searchQuery: string;
}

// ─── Actions ───────────────────────────────────────────────
type Action =
  | { type: 'SELECT_PATIENT'; payload: string | null }
  | { type: 'SELECT_DEPARTMENT'; payload: string | null }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: ClinicalTask['status'] } }
  | { type: 'CREATE_TASK'; payload: ClinicalTask }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_TIMELINE_EVENT'; payload: TimelineEvent }
  | { type: 'UPDATE_LAB_TEST'; payload: { testId: string; updates: Partial<LabTest> } }
  | { type: 'UPDATE_PRESCRIPTION'; payload: { rxId: string; updates: Partial<Prescription> } }
  | { type: 'ESCALATE_TASK'; payload: string }
  | { type: 'MARK_DELAYED'; payload: string }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'SWITCH_USER'; payload: { id: string; name: string; role: string; department: string } }
  | { type: 'UPDATE_PATIENT_STATUS'; payload: { patientId: string; status: Patient['status'] } }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

// ─── localStorage helpers (database support) ──────────────
const DB_KEY = 'aether_db';

function loadFromDB(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fallback to defaults */ }
  return null;
}

function saveToDB(state: AppState) {
  try {
    const toSave: Partial<AppState> = {
      patients: state.patients,
      tasks: state.tasks,
      timelineEvents: state.timelineEvents,
      chatMessages: state.chatMessages,
      prescriptions: state.prescriptions,
      labTests: state.labTests,
      careInstructions: state.careInstructions,
      selectedPatientId: state.selectedPatientId,
      currentUser: state.currentUser,
      theme: state.theme,
    };
    localStorage.setItem(DB_KEY, JSON.stringify(toSave));
  } catch { /* quota errors etc. */ }
}

// ─── Initial State ─────────────────────────────────────────
function buildInitialState(): AppState {
  const saved = loadFromDB();
  return {
    patients: saved?.patients ?? mockPatients,
    tasks: saved?.tasks ?? mockClinicalTasks,
    timelineEvents: saved?.timelineEvents ?? mockTimelineEvents,
    chatMessages: saved?.chatMessages ?? mockChatMessages,
    departments: mockDepartments,
    prescriptions: saved?.prescriptions ?? mockPrescriptions,
    labTests: saved?.labTests ?? mockLabTests,
    careInstructions: saved?.careInstructions ?? mockCareInstructions,
    dashboardStats: mockDashboardStats,
    selectedPatientId: saved?.selectedPatientId ?? 'p1',
    selectedDepartment: null,
    currentUser: saved?.currentUser ?? { id: 'u1', name: 'Dr. Anil Mehta', role: 'doctor', department: 'Cardiology' },
    theme: saved?.theme ?? 'light',
    searchQuery: '',
  };
}

// ─── Reducer ───────────────────────────────────────────────
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_PATIENT':
      return { ...state, selectedPatientId: action.payload };

    case 'SELECT_DEPARTMENT':
      return { ...state, selectedDepartment: action.payload };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'UPDATE_PATIENT_STATUS': {
      const updatedPatients = state.patients.map(p =>
        p.id === action.payload.patientId
          ? { ...p, status: action.payload.status }
          : p
      );
      const updatedPatient = updatedPatients.find(p => p.id === action.payload.patientId);
      const statusEvent: TimelineEvent = {
        id: `e${Date.now()}`,
        patientId: action.payload.patientId,
        timestamp: new Date().toISOString(),
        type: 'task-updated',
        title: `Patient Status Changed`,
        description: `${updatedPatient?.name || 'Patient'} status changed to ${action.payload.status}`,
        performedBy: state.currentUser.name,
        department: state.currentUser.department,
      };
      toast.info(`Patient status updated to ${action.payload.status}`);
      return {
        ...state,
        patients: updatedPatients,
        timelineEvents: [statusEvent, ...state.timelineEvents],
      };
    }

    case 'UPDATE_TASK_STATUS': {
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? {
            ...task,
            status: action.payload.status,
            completedAt: action.payload.status === 'completed' ? new Date().toISOString() : task.completedAt
          }
          : task
      );

      const task = updatedTasks.find(t => t.id === action.payload.taskId);
      let newTimelineEvent: TimelineEvent | null = null;

      if (task) {
        newTimelineEvent = {
          id: `e${Date.now()}`,
          patientId: task.patientId,
          timestamp: new Date().toISOString(),
          type: action.payload.status === 'completed' ? 'task-completed' : 'task-updated',
          title: action.payload.status === 'completed' ? '✅ Task Completed' : '🔄 Task Updated',
          description: `${task.title} marked as ${action.payload.status}`,
          performedBy: state.currentUser.name,
          department: state.currentUser.department,
        };

        // toasts
        if (action.payload.status === 'completed') {
          toast.success(`Task Completed: ${task.title}`, {
            description: `Completed by ${state.currentUser.name}`,
          });
        } else if (action.payload.status === 'in-progress') {
          toast.info(`Task Started: ${task.title}`, {
            description: `Picked up by ${state.currentUser.name}`,
          });
        }
      }

      return {
        ...state,
        tasks: updatedTasks,
        timelineEvents: newTimelineEvent
          ? [newTimelineEvent, ...state.timelineEvents]
          : state.timelineEvents,
      };
    }

    case 'CREATE_TASK': {
      toast.success(`New Order Created: ${action.payload.title}`, {
        description: `Priority: ${action.payload.priority.toUpperCase()} • Dept: ${action.payload.department}`,
      });

      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        timelineEvents: [
          {
            id: `e${Date.now()}`,
            patientId: action.payload.patientId,
            timestamp: new Date().toISOString(),
            type: 'task-created',
            title: '📋 New Clinical Order',
            description: `${action.payload.title} — ${action.payload.priority.toUpperCase()}`,
            performedBy: state.currentUser.name,
            department: state.currentUser.department,
          },
          ...state.timelineEvents,
        ],
      };
    }

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case 'ADD_TIMELINE_EVENT':
      return {
        ...state,
        timelineEvents: [action.payload, ...state.timelineEvents],
      };

    case 'UPDATE_LAB_TEST': {
      toast.info('Lab Test Updated', { description: `Test status updated` });
      return {
        ...state,
        labTests: state.labTests.map(test =>
          test.id === action.payload.testId
            ? { ...test, ...action.payload.updates }
            : test
        ),
      };
    }

    case 'UPDATE_PRESCRIPTION': {
      toast.info('Prescription Updated', { description: `Prescription status changed` });
      return {
        ...state,
        prescriptions: state.prescriptions.map(rx =>
          rx.id === action.payload.rxId
            ? { ...rx, ...action.payload.updates }
            : rx
        ),
      };
    }

    case 'ESCALATE_TASK': {
      const escalatedTask = state.tasks.find(t => t.id === action.payload);
      toast.warning(`⚠️ Task Escalated!`, {
        description: escalatedTask?.title || 'Task escalated to STAT priority',
      });
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, escalated: true, priority: 'stat' }
            : task
        ),
      };
    }

    case 'MARK_DELAYED': {
      toast.error(`Task Delayed`, {
        description: state.tasks.find(t => t.id === action.payload)?.title,
      });
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, status: 'delayed' as const }
            : task
        ),
      };
    }

    case 'ADD_PATIENT': {
      toast.success(`Patient Admitted: ${action.payload.name}`, {
        description: `${action.payload.department} • Bed ${action.payload.bedNumber}`,
      });
      return {
        ...state,
        patients: [action.payload, ...state.patients],
        timelineEvents: [
          {
            id: `e${Date.now()}`,
            patientId: action.payload.id,
            timestamp: new Date().toISOString(),
            type: 'status-changed',
            title: '🏥 Patient Admitted',
            description: `${action.payload.name} admitted to ${action.payload.department}`,
            performedBy: state.currentUser.name,
            department: state.currentUser.department,
          },
          ...state.timelineEvents,
        ],
      };
    }

    case 'SWITCH_USER': {
      toast(`Switched to ${action.payload.name}`, {
        description: `Role: ${action.payload.role} • ${action.payload.department}`,
      });
      return {
        ...state,
        currentUser: action.payload,
      };
    }

    case 'LOAD_STATE': {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  resetDB: () => void;
} | null>(null);

// ─── Provider ──────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, buildInitialState);

  // persist to localStorage on every state change
  useEffect(() => {
    saveToDB(state);
  }, [state]);

  // sync theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const resetDB = () => {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{ state, dispatch, resetDB }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hooks ─────────────────────────────────────────────────
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// ─── Selectors ─────────────────────────────────────────────
export function useSelectedPatient(state: AppState) {
  return state.patients.find(p => p.id === state.selectedPatientId) || null;
}

export function usePatientTasks(state: AppState, patientId: string) {
  return state.tasks.filter(t => t.patientId === patientId);
}

export function usePatientTimeline(state: AppState, patientId: string) {
  return state.timelineEvents.filter(e => e.patientId === patientId);
}

export function usePatientChat(state: AppState, patientId: string) {
  return state.chatMessages.filter(c => c.patientId === patientId);
}

export function useDepartmentTasks(state: AppState, department: string) {
  return state.tasks.filter(t => t.department === department);
}

export function useTasksByStatus(state: AppState, status: ClinicalTask['status']) {
  return state.tasks.filter(t => t.status === status);
}

export { mockUsers };
