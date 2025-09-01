export type UserRole = "ORGANIZER" | "PARTICIPANT";
export type EventType = "ONSITE" | "ONLINE";
export type EventStatus = "ACTIVE" | "ENDED" | "CANCELLED";
export type ParticipantStatus = "PENDING" | "APPROVED" | "REJECTED";

/* ---------------- User ---------------- */
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/* ---------------- Event Nested Types ---------------- */
export interface Host {
  id: string;
  eventId: string;
  email: string;
  addedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    avatarUrl: string | null;
  };
}

export interface Attachment {
  id: string;
  eventId: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  status: ParticipantStatus;
}

export interface CreatedBy {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}

/* ---------------- Event ---------------- */
export interface Event {
  id: string;
  title: string;
  description: string;
  totalSeats: number;
  confirmedParticipants: number;
  type: EventType;
  venue: string | null;
  joinLink: string | null;
  startTime: string;
  endTime: string;
  featuredImage: string;
  contactEmail: string;
  contactPhone: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  createdById: string;

  hosts: Host[];
  attachments: Attachment[];
  participants: Participant[];
  createdBy: CreatedBy;
}

/* ---------------- Paginated Event Response ---------------- */

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  currentCount: number;
}

export interface EventResponse {
  success: boolean;
  pagination: Pagination;
  data: Event[];
}


export interface EventDetailResponse {
  success: boolean;
  data: Event;
}

/* ---------------- Auth ---------------- */
export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}


