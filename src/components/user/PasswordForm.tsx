"use client";

import { FC, useState } from "react";
import { AxiosError } from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/user/userStore";
import Loader from "../common/Loader";
import { updatePasswordValidation } from "@/utils/validations";


const passwordValidation = updatePasswordValidation;

const PasswordForm: FC = () => {
  const { user, updatePassword } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return <div className="text-center text-gray-600">{Loader()}</div>;

const handleSubmit = async (
  values: { oldPassword: string; newPassword: string },
  { resetForm }: { resetForm: () => void } // 👈 add resetForm from Formik
) => {
  setIsSaving(true);
  try {
    await updatePassword(user.id, {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
    toast.success("Password updated successfully!");
    resetForm(); // 👈 clear the fields
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      toast.error(
        (error.response?.data as { error?: string })?.error || "Failed to update password"
      );
    } else if (error instanceof Error) {
      toast.error(error.message || "Failed to update password");
    }
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-2xl">

      <Formik
        initialValues={{ oldPassword: "", newPassword: "" }}
        validationSchema={passwordValidation}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Old Password <span className="text-red-500">*</span>
              </label>
              <Field
                type="password"
                name="oldPassword"
                placeholder="Enter old password"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.oldPassword && touched.oldPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="oldPassword"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <Field
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.newPassword && touched.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="newPassword"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-indigo-600 text-white cursor-pointer font-semibold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PasswordForm;
