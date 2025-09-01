import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth/authStore";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  withCredentials: true, // send cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// // Interceptor for 401 responses
// API.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

//     const { refreshAccessToken, user } = useAuthStore.getState();

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
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { 
      _retry?: boolean,
      _skipRetry?: boolean 
    };

    // Skip retry for certain endpoints or if already retried
    if (originalRequest._skipRetry || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshAccessToken, user } = useAuthStore.getState();

    console.log("error===========================================================",error)
    if (error.response?.status === 401 && user && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Attempting token refresh...');
        await refreshAccessToken();
        console.log('Token refreshed successfully, retrying request');
        
        // Ensure credentials are included in the retry
        return API({
          ...originalRequest,
          withCredentials: true
        });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Interceptor to handle 401
// API.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

//     const authStore = useAuthStore.getState();

//     if (error.response?.status === 401 && !originalRequest._retry && authStore.user) {
//       originalRequest._retry = true;
//       try {
//         await authStore.refreshAccessToken(); // Only refresh if user exists
//         return API(originalRequest); // Retry original request
//       } catch (err) {
//         authStore.clearAuth();
//         return Promise.reject(err);
//       }
//     }

//     return Promise.reject(error);
//   }
// );