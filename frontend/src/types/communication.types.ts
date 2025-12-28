export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'teachers';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'reminder' | 'assignment' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
