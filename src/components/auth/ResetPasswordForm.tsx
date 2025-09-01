"use client";

import { useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { API } from "@/lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { resetValidation } from "@/utils/validations";


interface ResetPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  token: string;
}

const ResetSchema = resetValidation

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      API.post("/api/auth/password/verify?token=" + token, {
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: () => {
      toast.success("Password reset successful. Please login.");
      router.push("/auth?mode=signin");
    },
    onError: () => {
      toast.error("Failed to reset password. Try again.");
    },
  });

  return (
    <Formik<ResetPasswordValues>
      initialValues={{ newPassword: "", confirmPassword: "" }}
      validationSchema={ResetSchema}
      onSubmit={(values) => mutation.mutate(values)}
    >
      {({ errors, touched }) => (
        <Form className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <Field
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.newPassword && touched.newPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="newPassword"
              component="p"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <Field
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="confirmPassword"
              component="p"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-indigo-600 text-white cursor-pointer font-semibold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {mutation.isPending ? "Resetting..." : "Reset Password"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
