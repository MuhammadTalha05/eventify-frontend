import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth/authStore";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  withCredentials: true, // send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    const { refreshAccessToken, user } = useAuthStore.getState();
    console.log("",)

    if (error.response?.status === 401 && !originalRequest._retry && user) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken(); // refresh token using cookies
        return API(originalRequest); // retry original request
      } catch (err) {
        // if refresh fails, user will be logged out automatically
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
