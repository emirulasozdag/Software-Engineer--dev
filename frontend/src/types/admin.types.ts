export interface SystemPerformanceSnapshot {
  cpuUsage: number;
  memoryUsage: number;
  activeUsers: number;
  recordedAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  verifiedUsers: number;
  maintenanceEnabled: boolean;
  maintenanceReason?: string | null;
  lastPerformance?: SystemPerformanceSnapshot | null;
}

export interface UserAccount {
  userId: number;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string | null;
}

export interface MaintenanceMode {
  enabled: boolean;
  reason?: string | null;
  startedAt?: string | null;
}

export interface SystemFeedback {
  id: string;
  userId: string;
  userName: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
}
