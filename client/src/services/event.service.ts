import apiClient from "../api/apiClient";

export interface EventDto {
  eventId: number;
  eventName: string;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  location: string | null;
  budget: number | null;
  maxAttendees: number | null;
  attendeeCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEventPayload {
  eventName: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  budget?: number;
  maxAttendees?: number;
}

export interface UpdateEventPayload {
  eventName?: string;
  description?: string;
  eventDate?: string;
  endDate?: string;
  location?: string;
  budget?: number;
  maxAttendees?: number;
  isActive?: boolean;
}

export interface MemberSearchHit {
  memberId: number;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
}

const eventService = {
  getAll: (includeInactive = false) =>
    apiClient.get<EventDto[]>("/api/events", { params: { includeInactive } }),

  getUpcoming: (count = 10) =>
    apiClient.get<EventDto[]>("/api/events/upcoming", { params: { count } }),

  getById: (id: number) =>
    apiClient.get<EventDto>(`/api/events/${id}`),

  create: (data: CreateEventPayload) =>
    apiClient.post<EventDto>("/api/events", data),

  update: (id: number, data: UpdateEventPayload) =>
    apiClient.put<EventDto>(`/api/events/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/api/events/${id}`),

  registerAttendee: (eventId: number, memberId: number) =>
    apiClient.post(`/api/events/${eventId}/attendees/${memberId}`),

  unregisterAttendee: (eventId: number, memberId: number) =>
    apiClient.delete(`/api/events/${eventId}/attendees/${memberId}`),

  markAttendance: (eventId: number, memberId: number, attended: boolean) =>
    apiClient.put(`/api/events/${eventId}/attendees/${memberId}/attendance?attended=${attended}`),

  getAttendees: (eventId: number) =>
    apiClient.get<MemberSearchHit[]>(`/api/events/${eventId}/attendees`),
};

export default eventService;
