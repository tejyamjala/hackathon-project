// Patient Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string; // Medical Record Number
  admissionDate: string;
  department: string;
  bedNumber: string;
  diagnosis: string;
  allergies: string[];
  contactNumber: string;
  emergencyContact: string;
  insurance: string;
  status: 'Active' | 'Discharged' | 'Critical' | 'Stable';
  avatar?: string;
}

// Task/Prescription Types
export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'delayed';
export type TaskPriority = 'stat' | 'urgent' | 'routine';
export type TaskType = 'prescription' | 'lab-test' | 'imaging' | 'procedure' | 'referral' | 'care-instruction';

export interface ClinicalTask {
  id: string;
  patientId: string;
  patientName: string;
  type: TaskType;
  title: string;
  description: string;
  requestedBy: string;
  requestedByRole: string;
  department: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  dueTime: string;
  completedAt?: string;
  slaMinutes: number;
  attachments?: Attachment[];
  notes?: string;
  escalated?: boolean;
}

// Attachment/Report Types
export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  category: 'lab-report' | 'imaging' | 'prescription' | 'discharge' | 'other';
}

// Timeline/Event Types
export interface TimelineEvent {
  id: string;
  patientId: string;
  timestamp: string;
  type: 'task-created' | 'task-updated' | 'task-completed' | 'report-uploaded' | 'note-added' | 'status-changed';
  title: string;
  description: string;
  performedBy: string;
  department: string;
  metadata?: Record<string, any>;
}

// Chat/Message Types
export interface ChatMessage {
  id: string;
  patientId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  department: string;
  message: string;
  timestamp: string;
  attachments?: Attachment[];
}

// Department Types
export interface Department {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  activeTasks: number;
  delayedTasks: number;
}

// Prescription Types
export interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  prescribedAt: string;
  status: 'pending' | 'dispensed' | 'administered';
  pharmacyNotes?: string;
}

// Lab Test Types
export interface LabTest {
  id: string;
  patientId: string;
  testName: string;
  testCode: string;
  category: 'blood' | 'urine' | 'imaging' | 'pathology' | 'other';
  requestedBy: string;
  requestedAt: string;
  status: 'ordered' | 'sample-collected' | 'in-progress' | 'completed';
  result?: string;
  reportUrl?: string;
  sampleCollectedAt?: string;
  completedAt?: string;
}

// Care Instruction Types
export interface CareInstruction {
  id: string;
  patientId: string;
  instruction: string;
  category: 'diet' | 'activity' | 'medication' | 'monitoring' | 'other';
  priority: 'high' | 'medium' | 'low';
  givenBy: string;
  givenAt: string;
  acknowledgedBy?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'lab-tech' | 'pharmacist' | 'admin';
  department: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalPatients: number;
  activeTasks: number;
  delayedTasks: number;
  completedToday: number;
  statTasks: number;
  departmentBreakdown: {
    department: string;
    tasks: number;
    delayed: number;
  }[];
}
