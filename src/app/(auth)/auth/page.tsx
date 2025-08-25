// src/app/(auth)/auth/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import SigninForm from "@/components/auth/SigninForm"; // you already created this
import eventImage from "@/assets/eventImage.webp";
import Image from "next/image";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "signin"; // default is signin

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="grid grid-cols-1 xl:grid-cols-2 w-full max-w-6xl">
        {/* Left Column: Image (only on xl and above) */}
        <div className="hidden xl:block relative w-full h-64 md:h-auto">
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
            {mode === "signup" ? <SignupForm /> : <SigninForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
