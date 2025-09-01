// src/app/(auth)/auth/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import SigninForm from "@/components/auth/SigninForm";
import OtpForm from "@/components/auth/OtpForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import eventImage from "@/assets/eventImage.webp";
import Image from "next/image";
import { useAuthStore } from "@/store/auth/authStore";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "login"; // default is signin

  const { user, refreshAccessToken } = useAuthStore();

  useEffect(() => {
    const protectRoute = async () => {
      // Refresh token if user exists in store (optional)
      if (user) {
        await refreshAccessToken();
        router.push("/"); // redirect logged-in user to home
      }
    };
    protectRoute();
  }, [user, refreshAccessToken, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 w-full max-w-6xl">
        {/* Left Column: Image (only on xl and above) */}
        <div className="hidden xl:block relative w-full min-h-[500px]">
          <Image
            src={eventImage}
            alt="Event Background"
            className="object-cover"
            fill
          />
        </div>

        {/* Right Column: Form */}
        <div className="flex items-center justify-center bg-white p-5">
          <div className="w-full max-w-md">
            {mode === "signup" ? (
              <SignupForm />
            ) : mode === "otp" ? (
              <OtpForm />
            ) : mode === "forgot" ? (
              <ForgotPasswordForm />  
            ) : (
              <SigninForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
