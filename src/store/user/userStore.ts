import { create } from "zustand";
import { API } from "@/lib/api";



export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  role: "PARTICIPANT" | "ORGANIZER" | "SUPER_ADMIN";
  createdAt?: string;
};

export type ParticipantEvent = {
  id: string;
  eventId: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  joinedAt: string;
  event: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    type: string;
    joinLink?: string;
    featuredImage: string;
    confirmedParticipants: number;
    totalSeats: number | null;
    status: string;
    venue?: string;
  };
};

// Type for Organizer events
export type OrganizerEvent = {
  id: string;
  title: string;
  description: string;
  totalSeats: number | null;
  confirmedParticipants: number;
  type: string;
  venue: string | null;
  joinLink: string | null;
  startTime: string;
  endTime: string;
  featuredImage: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  hosts: { id: string; eventId: string; email: string; addedAt: string }[];
  attachments: { id: string; fileUrl: string; fileType: string }[];
  participants: {
    id: string;
    eventId: string;
    userId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    joinedAt: string;
  }[];
};

type UpdateUserPayload = Partial<User> & { avatarFile?: File | null };
type UpdatePasswordPayload = { oldPassword: string; newPassword: string };


type UserState = {
  user: User | null;
  fetchUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<void>;
  updatePassword: (id: string, data: UpdatePasswordPayload) => Promise<void>;
  joinEvent: (eventId: string, user?: User) => Promise<void>;

  // Participant events
  participantEvents: ParticipantEvent[];
  totalRequestedEvents: number;
  totalPendingEvents: number;
  pagination: { currentPage: number; totalPages: number; perPage: number };
  fetchParticipantEvents: (page: number, search: string) => Promise<void>;

  // ✅ Organizer events
  organizerEvents: OrganizerEvent[];
  totalOrganizerEvents: number;
  organizerPagination: { currentPage: number; totalPages: number; perPage: number };
  fetchOrganizerEvents: (page: number, search: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateEventStatus: (eventId: string, status: "ACTIVE" | "CANCELLED" | "ENDED") => Promise<void>;
  getEventById: (eventId: string) => Promise<OrganizerEvent | null>;
  updateParticipantStatus: (
    eventId: string,
    participantId: string,
    status: "PENDING" | "APPROVED" | "REJECTED"
  ) => Promise<void>;

  deleteAttachment: ( attachmentId: string, eventId: string) => Promise<void>

  deleteHost: (eventId: string, hostId: string) => Promise<void>;

  deleteUser: (id: string) => Promise<void>;

  // Create Event
  createEvent: (data: {
    title: string;
    description: string;
    type: "ONLINE" | "ONSITE";
    joinLink?: string | null;
    venue?: string | null;
    startTime: string;
    endTime: string;
    contactEmail: string;
    contactPhone: string;
    totalSeats: number | null;
    hostEmails: string[];
    featuredImage: string; // Cloudinary URL
    attachments: { fileUrl: string; fileType: "image" | "video" }[];
  }) => Promise<OrganizerEvent>;


  updateEvent: (
    id: string,
    data: {
      title: string;
      description: string;
      type: "ONLINE" | "ONSITE";
      joinLink?: string | null;
      venue?: string | null;
      startTime: string;
      endTime: string;
      contactEmail: string;
      contactPhone: string;
      totalSeats: number | null;
      hostEmails: string[];
      featuredImage: string;
      attachments: { fileUrl: string; fileType: "image" | "video" }[];
    }
  ) => Promise<OrganizerEvent>;


  // Admin users
  users: User[];
  totalUsers: number;
  totalParticipants: number;
  totalOrganizers: number;
  userPagination: { currentPage: number; totalPages: number; perPage: number };
  fetchUsers: (page: number, search: string) => Promise<void>;

  // NEW: update user role
  updateUserRole: (id: string, role: "PARTICIPANT" | "ORGANIZER" | "SUPER_ADMIN") => Promise<void>;

};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,

  fetchUser: async (id: string) => {
    try {
      const res = await API.get(`/api/user/profile/${id}`);
      set({ user: res.data });
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      set({ user: null });
    }
  },

  updateUser: async (id, data) => {
    try {
      const currentUser = get().user;
      if (!currentUser) return;

      const optimisticUser: User = {
        ...currentUser,
        ...data,
        avatarUrl: data.avatarFile
          ? URL.createObjectURL(data.avatarFile)
          : currentUser.avatarUrl,
      };
      set({ user: optimisticUser });

      const formData = new FormData();
      if (data.fullName) formData.append("fullName", data.fullName);
      if (data.phone) formData.append("phone", data.phone);
      if (data.avatarFile) formData.append("avatarUrl", data.avatarFile);

      const res = await API.put(`/api/user/profile/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Accept: "application/json" },
      });

      set({ user: res.data.data });
    } catch (err) {
      console.error("Failed to update user profile", err);
    }
  },

  updatePassword: async (id: string, data: { oldPassword: string; newPassword: string }) => {
    try {
      await API.put(`/api/user/profile/${id}/password`, data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      throw err;
    }
  },

  joinEvent: async (eventId: string, user?: User) => {
    const currentUser = user;
    if (!currentUser) throw new Error("User not logged in");

    try {
      await API.post(`/api/participant/join/event/${eventId}`);
      console.log("Successfully joined the event");
    } catch (err) {
      console.error("Failed to join event", err);
      throw err;
    }
  },

  // Participant events
  participantEvents: [],
  totalRequestedEvents: 0,
  totalPendingEvents: 0,
  pagination: { currentPage: 1, totalPages: 1, perPage: 6 },

  fetchParticipantEvents: async (page: number, search: string) => {
    try {
      const res = await API.get(`/api/participant/events/all?page=${page}&search=${search}`);
      const data = res.data;

      set({
        participantEvents: data.data,
        totalRequestedEvents: data.pagination.totalItems,
        totalPendingEvents: data.data.filter((e: ParticipantEvent) => e.status === "PENDING").length,
        pagination: {
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          perPage: data.pagination.perPage,
        },
      });
    } catch (err) {
      console.error("Failed to fetch participant events", err);
      set({
        participantEvents: [],
        totalRequestedEvents: 0,
        totalPendingEvents: 0,
        pagination: { currentPage: 1, totalPages: 1, perPage: 6 },
      });
    }
  },


  // ✅ Organizer events
  organizerEvents: [],
  totalOrganizerEvents: 0,
  organizerPagination: { currentPage: 1, totalPages: 1, perPage: 6 },

  fetchOrganizerEvents: async (page: number, search: string) => {
    try {
      const res = await API.get(`/api/event/all/me?page=${page}&search=${search}`);
      const data = res.data;

      set({
        organizerEvents: data.data,
        totalOrganizerEvents: data.pagination.totalItems,
        organizerPagination: {
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          perPage: data.pagination.perPage,
        },
      });
    } catch (err) {
      console.error("Failed to fetch organizer events", err);
      set({
        organizerEvents: [],
        totalOrganizerEvents: 0,
        organizerPagination: { currentPage: 1, totalPages: 1, perPage: 6 },
      });
    }
  },

  // Delete event
  deleteEvent: async (eventId: string) => {
    try {
      const res = await API.delete(`/api/event/delete/${eventId}`);
      if (res.data.success) {
        set((state) => ({
          organizerEvents: state.organizerEvents.filter((e) => e.id !== eventId),
          totalOrganizerEvents: state.totalOrganizerEvents - 1,
        }));
        console.log("Event deleted successfully");
      } else {
        console.error("Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event", err);
      throw err;
    }
  },

  // ✅ Delete attachment
  deleteAttachment: async (attachmentId: string, eventId: string) => {
    try {
      const res = await API.delete(`/api/event/delete/attachment/${attachmentId}`);
      if (res.data.success) {
        // Update the organizerEvents state to remove the attachment from the correct event
        set((state) => ({
          organizerEvents: state.organizerEvents.map((event) =>
            event.id === eventId
              ? {
                ...event,
                attachments: event.attachments.filter((att) => att.id !== attachmentId),
              }
              : event
          ),
        }));
        console.log("Attachment deleted successfully");
      } else {
        console.error("Failed to delete attachment");
      }
    } catch (err) {
      console.error("Error deleting attachment", err);
      throw err;
    }
  },

   // ✅ Delete host
  deleteHost: async (eventId: string, hostId: string) => {
    try {
      const res = await API.delete(`/api/host/delete/event/${eventId}/host/${hostId}`);
      if (res.data.success) {
        set((state) => ({
          organizerEvents: state.organizerEvents.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  hosts: event.hosts.filter((h) => h.id !== hostId),
                }
              : event
          ),
        }));
        console.log("Host deleted successfully");
      } else {
        console.error("Failed to delete host");
      }
    } catch (err) {
      console.error("Error deleting host", err);
      throw err;
    }
  },

  // Delete user
deleteUser: async (id: string) => {
  try {
    const res = await API.delete(`/api/user/delete/${id}`);
    if (res.data.success) {
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        totalUsers: state.totalUsers - 1,
        totalParticipants: state.users.filter((u) => u.role === "PARTICIPANT" && u.id !== id).length,
        totalOrganizers: state.users.filter((u) => u.role === "ORGANIZER" && u.id !== id).length,
      }));
      console.log("User deleted successfully");
    } else {
      console.error("Failed to delete user");
      throw new Error("Delete failed");
    }
  } catch (err) {
    console.error("Error deleting user", err);
    throw err;
  }
},

  // Update Event Status
  updateEventStatus: async (eventId: string, status: "ACTIVE" | "CANCELLED" | "ENDED") => {
    try {
      const res = await API.put(`/api/event/status/${eventId}`, { status }, {
        headers: { "Content-Type": "application/json" },
      });

      const updatedEvent = res.data.data; // API returns updated event

      set((state) => ({
        organizerEvents: state.organizerEvents.map((e) =>
          e.id === eventId ? { ...e, status: updatedEvent.status } : e
        ),
      }));

      console.log("Event status updated successfully");
    } catch (err) {
      console.error("Failed to update event status", err);
      throw err;
    }
  },

  getEventById: async (eventId) => {
    try {
      const res = await API.get(`/api/event/${eventId}`);
      return res.data.data as OrganizerEvent;
    } catch (err) {
      console.error("Failed to fetch event by ID", err);
      return null;
    }
  },

  // Update participant status
  updateParticipantStatus: async (eventId, participantId, status) => {
    try {
      const res = await API.patch(
        `/api/participant/event/${eventId}/participant/${participantId}/status`,
        { status },
        { headers: { "Content-Type": "application/json" } }
      );

      const updatedParticipant = res.data.data;
      set((state) => ({
        organizerEvents: state.organizerEvents.map((event) =>
          event.id === eventId
            ? {
              ...event,
              participants: event.participants.map((p) =>
                p.id === participantId
                  ? { ...p, status: updatedParticipant.status }
                  : p
              ),
            }
            : event
        ),
      }));

      console.log("Participant status updated successfully");
    } catch (err) {
      console.error("Failed to update participant status", err);
      throw err;
    }
  },

  // Create New Event
  createEvent: async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        totalSeats: data.totalSeats,
        hostEmails: data.hostEmails,
        featuredImage: data.featuredImage,
        attachments: data.attachments,
        joinLink: data.joinLink ?? null,
        venue: data.venue ?? null,
      };

      const res = await API.post("/api/event/create", payload, {
        headers: { "Content-Type": "application/json" },
      });

      const newEvent = res.data.data as OrganizerEvent;

      set((state) => ({
        organizerEvents: [newEvent, ...state.organizerEvents],
        totalOrganizerEvents: state.totalOrganizerEvents + 1,
      }));

      console.log("Event created successfully");
      return newEvent;
    } catch (err) {
      console.error("Failed to create event", err);
      throw err;
    }
  },

  // Update Event
  updateEvent: async (
    id: string,
    data: {
      title: string;
      description: string;
      type: "ONLINE" | "ONSITE";
      joinLink?: string | null;
      venue?: string | null;
      startTime: string;
      endTime: string;
      contactEmail: string;
      contactPhone: string;
      totalSeats: number | null;
      hostEmails: string | string[]; // explicitly allow string or array
      featuredImage: string;
      attachments: { fileUrl: string; fileType: "image" | "video" }[];
    }
  ) => {
    try {
      // convert hostEmails to array
      let hostEmailsArray: string[] = [];
      if (Array.isArray(data.hostEmails)) {
        hostEmailsArray = data.hostEmails;
      } else if (typeof data.hostEmails === "string") {
        hostEmailsArray = data.hostEmails.split(",").map((email: string) => email.trim());
      }

      const payload = {
        title: data.title || "Untitled Event",
        description: data.description || "No description",
        type: data.type || "ONSITE",
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        contactEmail: data.contactEmail || "example@mail.com",
        contactPhone: data.contactPhone || "0000000000",
        totalSeats: data.totalSeats ?? null,
        joinLink: data.type === "ONLINE" ? data.joinLink ?? "" : null,
        venue: data.type === "ONSITE" ? data.venue ?? "" : null,
        hostEmails: hostEmailsArray,
        featuredImage: data.featuredImage || "",
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
      };

      const res = await API.put(`/api/event/update/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const updatedEvent = res.data.data as OrganizerEvent;

      set((state) => ({
        organizerEvents: state.organizerEvents.map((e) =>
          e.id === id ? updatedEvent : e
        ),
      }));

      console.log("Event updated successfully");
      return updatedEvent;
    } catch (err) {
      console.error("Failed to update event", err);
      throw err;
    }
  },

  // Admin users
  users: [],
  totalUsers: 0,
  totalParticipants: 0,
  totalOrganizers: 0,
  userPagination: { currentPage: 1, totalPages: 1, perPage: 9 },

  // Feth Users
  fetchUsers: async (page: number, search: string) => {
    try {
      const res = await API.get(`/api/user/all?page=${page}&search=${search}`);
      const data = res.data;

      const participants = data.data.filter((u: User) => u.role === "PARTICIPANT").length;
      const organizers = data.data.filter((u: User) => u.role === "ORGANIZER").length;

      set({
        users: data.data,
        totalUsers: data.pagination.totalItems,
        totalParticipants: participants,
        totalOrganizers: organizers,
        userPagination: {
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          perPage: data.pagination.perPage,
        },
      });
    } catch (err) {
      console.error("Failed to fetch users", err);
      set({
        users: [],
        totalUsers: 0,
        totalParticipants: 0,
        totalOrganizers: 0,
        userPagination: { currentPage: 1, totalPages: 1, perPage: 9 },
      });
    }
  },

  // ✅ Update user role
  updateUserRole: async (id, role) => {
    try {
      const res = await API.patch(`/api/user/profile/role`, { id, role }, {
        headers: { "Content-Type": "application/json" },
      });

      const updatedUser = res.data.user;

      // Update users array if exists
      set((state) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, role: updatedUser.role } : u
        ),
      }));

      console.log("Role updated successfully");
    } catch (err) {
      console.error("Failed to update user role", err);
      throw err;
    }
  },
}));
