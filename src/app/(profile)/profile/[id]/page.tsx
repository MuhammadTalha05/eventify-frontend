// app/profile/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUserStore, User } from "@/store/user/userStore";
import ProfileForm from "@/components/user/ProfileForm";
import Loader from "@/components/common/Loader";

export default function ProfilePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { user, fetchUser } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUser(id)
        .catch(() => setError("Failed to load profile"))
        .finally(() => setInitialLoading(false));
    }
  }, [id, fetchUser]);

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-3xl p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>

        {/* Show skeleton/fallback during initial load, but keep form mounted */}
        {initialLoading && !user ? Loader(): (
          <ProfileForm />
        )}
      </div>
    </div>
  );
}
