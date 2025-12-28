import apiClient from './client';
import {
  Message,
  Announcement,
  ChatMessage,
  Notification,
} from '@/types/communication.types';

export const communicationService = {
  /**
   * Get all messages for current user
   */
  getMessages: async (): Promise<Message[]> => {
    const response = await apiClient.get('/api/messaging');
    return response.data;
  },

  /**
   * Send a message
   */
  sendMessage: async (
    receiverId: string,
    subject: string,
    content: string
  ): Promise<Message> => {
    const response = await apiClient.post('/api/messaging/send', {
      receiverId,
      subject,
      content,
    });
    return response.data;
  },

  /**
   * Mark message as read
   */
  markMessageAsRead: async (messageId: string): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/messaging/${messageId}/read`);
    return response.data;
  },

  /**
   * Delete message
   */
  deleteMessage: async (messageId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/messaging/${messageId}`);
    return response.data;
  },

  /**
   * Get all announcements
   */
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get('/api/announcements');
    return response.data;
  },

  /**
   * Create announcement (teacher/admin only)
   */
  createAnnouncement: async (
    title: string,
    content: string,
    targetAudience: 'all' | 'students' | 'teachers'
  ): Promise<Announcement> => {
    const response = await apiClient.post('/api/announcements', {
      title,
      content,
      targetAudience,
    });
    return response.data;
  },

  /**
   * Send message to chatbot
   */
  sendChatbotMessage: async (message: string): Promise<ChatMessage> => {
    const response = await apiClient.post('/api/chatbot', { message });
    return response.data;
  },

  /**
   * Get chat history
   */
  getChatHistory: async (): Promise<ChatMessage[]> => {
    const response = await apiClient.get('/api/chatbot/history');
    return response.data;
  },

  /**
   * Get notifications
   */
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/api/rewards/notifications');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/rewards/notifications/${notificationId}/read`);
    return response.data;
  },
};
