import { http } from "./http";

export interface Notification {
  notificationId: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  officerName?: string;
  complaintId?: number;
  complaintTitle?: string;
  grievanceId?: number;
}

export async function getNotificationsByOfficer(officerId: string): Promise<Notification[]> {
  const payload = { officerId };
  const { data } = await http.post<Notification[]>('/Notification/officer', payload);
  return data;
}

export async function getUnreadNotificationsByOfficer(officerId: string): Promise<Notification[]> {
  const { data } = await http.get<Notification[]>(`/Notification/officer/${officerId}/unread`);
  return data;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const payload = { notificationId };
  await http.put('/Notification/read', payload);
}

export async function markAllNotificationsAsRead(officerId: string): Promise<void> {
  await http.put(`/Notification/officer/${officerId}/read-all`, {});
}

export async function getNotificationsByCitizen(citizenId: string): Promise<Notification[]> {
  const payload = { citizenId };
  const { data } = await http.post<Notification[]>('/Notification/citizen', payload);
  return data;
}

export async function getUnreadNotificationsByCitizen(citizenId: string): Promise<Notification[]> {
  const { data } = await http.get<Notification[]>(`/Notification/citizen/${citizenId}/unread`);
  return data;
}

export async function markAllNotificationsAsReadByCitizen(citizenId: string): Promise<void> {
  await http.put(`/Notification/citizen/${citizenId}/read-all`, {});
}