import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API } from "@/lib/api";

type User = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
    role: "PARTICIPANT" | "ORGANIZER" | "SUPER_ADMIN";
};

type AuthState = {
    user: User | null;
    isLoading: boolean;
    refreshInProgress: boolean;
    fetchUser: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    clearAuth: () => void;
    redirectByRole: () => void;
    // New setter to update user locally
    setUser: (user: User) => void;
    addUser: (data: { fullName: string; email: string; phone?: string; role: "PARTICIPANT" | "ORGANIZER" | "SUPER_ADMIN" }) => Promise<User>;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            refreshInProgress: false,

            fetchUser: async () => {
                try {
                    set({ isLoading: true });
                    const res = await API.get("/api/user/profile/me");
                    set({ user: res.data.data, isLoading: false });
                } catch (error) {
                    set({ user: null, isLoading: false });
                }
            },

            refreshAccessToken: async () => {
                // if (get().refreshInProgress || !get().user) return;
                if (get().refreshInProgress) return;
                set({ refreshInProgress: true });
                try {
                  await API.get("/api/auth/token/refresh");
                  await get().fetchUser();
                } catch (error) {
                  console.error("Failed to refresh token", error);
                  get().clearAuth();
                } finally {
                  set({ refreshInProgress: false });
                }
            },

            clearAuth: async () => {
                try {
                    await API.post("/api/auth/logout");
                } catch (err) {
                    console.error("Logout API failed", err);
                } finally {
                    set({ user: null });
                }
            },

            redirectByRole: () => {
                const user = get().user;
                if (!user) return;
                if (user.role === "PARTICIPANT") window.location.href = "/participant/dashboard";
                else if (user.role === "ORGANIZER") window.location.href = "/organizer/dashboard";
                else if (user.role === "SUPER_ADMIN") window.location.href = "/super-admin/dashboard";
            },

            setUser: (user: User) => set({ user }),

             // Add Accoutn For Soneone Else
            addUser: async (data) => {
                try {
                    const res = await API.post("/api/auth/admin/create-account", data);
                    // Return the created user from API
                    return res.data.data as User;
                } catch (err) {
                    console.error("Failed to add user", err);
                    throw err;
                }
            },
        }),
        { name: "auth-storage" }
    )
);
