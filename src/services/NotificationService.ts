import api from "../lib/api";

export interface NotificationDto {
  id: number;
  userId: number;
  relatedUserId: number;
  relatedUsername: string;
  parentId: number;
  parentTitle: string;
  notificationType: 'ANSWER_QUESTION' | 'COMMENT_QUESTION' | 'COMMENT_ANSWER' | 'VOTE_UP' | 'VOTE_DOWN' | 'ANSWER_ACCEPTED' | 'BADGE_AWARDED';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

/**
 * Get user notifications with optional limit
 */
export async function getNotifications(limit: number = 5): Promise<NotificationDto[]> {
  const response = await api.get(`/api/notifications?limit=${limit}`);
  return response.data;
}

/**
 * Get only unread notifications
 */
export async function getUnreadNotifications(): Promise<NotificationDto[]> {
  const response = await api.get('/api/notifications/unread');
  return response.data;
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get<UnreadCountResponse>('/api/notifications/unread-count');
  return response.data.count;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await api.put(`/api/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read (if backend implements this endpoint)
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  await api.put('/api/notifications/mark-all-read');
}