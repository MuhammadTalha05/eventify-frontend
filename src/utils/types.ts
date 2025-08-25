export type UserRole = "ORGANIZER" | "PARTICIPANT";
export type EventType = "ONSITE" | "ONLINE";
export type EventStatus = "ACTIVE" | "ENDED" | "CANCELLED";
export type ParticipantStatus = "PENDING" | "APPROVED" | "REJECTED";

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

export interface Event {
  id: string;
  title: string;
  description: string;
  totalSeats?: number;
  confirmedParticipants: number;
  type: EventType;
  venue?: string;
  joinLink?: string;
  startTime: string;
  endTime: string;
  featuredImage: string;
  contactEmail: string;
  contactPhone: string;
  status: EventStatus;
  hosts: User[];
  createdAt: string;
  updatedAt: string;
}


export interface EventDetailResponse {
  success: boolean;
  data: Event & {
    attachments: { id: string; fileUrl: string; fileType: string }[];
    participants: {
      id: string;
      userId: string;
      status: ParticipantStatus;
    }[];
  };
}


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

