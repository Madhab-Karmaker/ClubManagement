import apiClient from "../api/apiClient";

export interface NotificationDto {
  notificationId: number;
  title: string;
  message: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  sentAt: string | null;
}

export interface CreateNotificationPayload {
  memberId?: number;
  userId?: string;
  title: string;
  message?: string;
  type?: string;
}

const notificationService = {
  getAll: (unreadOnly = false) =>
    apiClient.get<NotificationDto[]>("/api/notifications", { params: { unreadOnly } }),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/api/notifications/unread-count"),

  create: (data: CreateNotificationPayload) =>
    apiClient.post<NotificationDto>("/api/notifications", data),

  markAsRead: (id: number) =>
    apiClient.put(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put("/api/notifications/read-all"),

  delete: (id: number) =>
    apiClient.delete(`/api/notifications/${id}`),
};

export default notificationService;
