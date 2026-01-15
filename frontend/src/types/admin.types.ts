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
  newUsers7d?: number;
  learningActivity?: {
    testsCompleted: number;
    lessonsCompleted: number;
    assignmentsCreated: number;
    aiContentGenerated: number;
  };
  usageHistory?: Array<{
    date: string;
    day: string;
    users: number;
    activity: number;
  }>;
  databaseStats?: {
    sizeMB?: number | null;
    totalRecords: number;
    tableCounts: Record<string, number>;
    lastBackup?: string | null;
    connectionPool: {
      active: number;
      max: number;
    };
  } | null;
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
  announcement?: string | null;
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
