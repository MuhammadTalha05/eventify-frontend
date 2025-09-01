import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth/authStore";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  withCredentials: true, // send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// API.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

//     const { refreshAccessToken, user } = useAuthStore.getState();
//     console.log("",)

//     if (error.response?.status === 401 && !originalRequest._retry && user) {
//       originalRequest._retry = true;
//       try {
//         await refreshAccessToken(); // refresh token using cookies
//         return API(originalRequest); // retry original request
//       } catch (err) {
//         // if refresh fails, user will be logged out automatically
//         return Promise.reject(err);
//       }
//     }

//     return Promise.reject(error);
//   }
// );


// Add request interceptor to ensure fresh token
API.interceptors.request.use(
  async (config) => {
    const { refreshInProgress, user } = useAuthStore.getState();
    
    // If refresh is already in progress, delay this request
    if (refreshInProgress && user) {
      // Wait a bit for refresh to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const { refreshAccessToken, clearAuth, user } = useAuthStore.getState();

    // Check if it's a 401 error and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await refreshAccessToken();
        // Retry the original request with the new token
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth and reject the error
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    // For any other error, or if we already retried, reject it
    return Promise.reject(error);
  }
);