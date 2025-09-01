"use client";

import { FC, useState, ChangeEvent } from "react";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { useUserStore, User } from "@/store/user/userStore";
import { useAuthStore } from "@/store/auth/authStore";
import { profileValidation } from "@/utils/validations";
import Loader from "../common/Loader";

interface ProfileValues {
  fullName: string;
  email: string;
  phone: string;
  role: User["role"];
}

const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const ProfileForm: FC = () => {
  const { user, updateUser, fetchUser } = useUserStore();
  const authStore = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return <div className="text-center text-gray-600">{Loader()}</div>;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!allowedImageTypes.includes(file.type)) {
        setFileError("Unsupported file format. Only PNG, JPG, JPEG, WEBP allowed.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (values: ProfileValues) => {
    if (fileError) {
      toast.error(fileError);
      return;
    }

    setIsSaving(true);
    try {
      // 1️⃣ Update backend via userStore
      await updateUser(user.id, {
        fullName: values.fullName,
        phone: values.phone,
        avatarFile: selectedFile,
      });

      // 2️⃣ Fetch latest user data from backend
      await fetchUser(user.id);

      // 3️⃣ Update authStore so Navbar reflects change immediately
      authStore.setUser({
        ...user,
        fullName: values.fullName,
        phone: values.phone,
        avatarUrl: selectedFile ? URL.createObjectURL(selectedFile) : user.avatarUrl,
      });

      toast.success("Profile updated successfully!");
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-2xl">
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          {selectedFile ? (
            <Image
              src={URL.createObjectURL(selectedFile)}
              alt="Profile"
              fill
              className="rounded-full border-4 border-indigo-600 shadow-md object-cover"
            />
          ) : user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt="Profile"
              fill
              className="rounded-full border-4 border-indigo-600 shadow-md object-cover"
            />
          ) : (
            <div className="w-28 h-28 flex items-center justify-center rounded-full border-4 border-indigo-600 shadow-md bg-gray-200 text-gray-800 text-3xl font-bold">
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <input
            onChange={handleFileChange}
            accept="image/*"
            type="file"
            id="profilePicInput"
            className="hidden"
          />

          <label
            htmlFor="profilePicInput"
            className="absolute bottom-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow hover:bg-indigo-700 cursor-pointer"
          >
            <Pencil size={16} />
          </label>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Only PNG, JPG, JPEG, WEBP files allowed
        </p>
        {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}

        <h2 className="mt-4 text-xl font-semibold">{user.fullName}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
        <span className="mt-2 px-3 py-1 rounded-full text-sm bg-indigo-600 text-white">
          {user.role}
        </span>
      </div>

      <Formik
        initialValues={{
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        }}
        validationSchema={profileValidation}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="mt-6 space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Field
                name="fullName"
                type="text"
                placeholder="Your full name"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.fullName && touched.fullName ? "border-red-500" : "border-gray-300"
                }`}
              />
              <ErrorMessage name="fullName" component="p" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <Field
                name="phone"
                type="text"
                placeholder="Your phone number"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.phone && touched.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              <ErrorMessage name="phone" component="p" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Field
                name="email"
                type="email"
                disabled
                className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Role</label>
              <Field
                name="role"
                type="text"
                disabled
                className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer shadow hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileForm;
