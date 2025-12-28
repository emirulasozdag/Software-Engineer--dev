export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalTeachers: number;
  systemUptime: number;
  apiResponseTime: number;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface MaintenanceMode {
  isEnabled: boolean;
  message: string;
  scheduledStart?: string;
  scheduledEnd?: string;
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
