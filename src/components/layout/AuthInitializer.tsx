"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth/authStore";

export default function AuthInitializer() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return null; // nothing rendered, just runs logic
}