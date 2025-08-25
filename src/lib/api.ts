import axios from "axios";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://eventify-backend-ebon.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
});