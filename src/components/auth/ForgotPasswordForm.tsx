// src/components/auth/ForgotPasswordForm.tsx
"use client";

import { FC } from "react";
import { useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { API } from "@/lib/api";
import { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { forgotPasswordValidation } from "@/utils/validations";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

interface ForgotPasswordValues {
  email: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

// Validation schema
const ForgotPasswordSchema = forgotPasswordValidation; 

const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({ onSuccess }) => {
  const router = useRouter();

  const mutation = useMutation<AxiosResponse, ApiError, ForgotPasswordValues>({
    mutationFn: (values) => API.post("/api/auth/password/reset", values),
    onSuccess: (_, variables) => {
      toast.success("Password reset instructions sent to your email.");
      localStorage.setItem("reset_email", variables.email);

      if (onSuccess) onSuccess();
      // Optionally redirect user back to signin
      router.push("/auth?mode=login");
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Something went wrong";
      toast.error(message);
    },
  });

  return (
    <div className="w-full pt-5 pb-5">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Forgot Password
      </h2>

      <Formik<ForgotPasswordValues>
        initialValues={{ email: "" }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={(values) => mutation.mutate(values)}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Field
                name="email"
                type="email"
                placeholder="email@example.com"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.email && touched.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 bg-indigo-600 text-white cursor-pointer font-semibold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {mutation.isPending ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            {/* Back to Sign In */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Remembered your password?{" "}
                <button
                  type="button"
                  className="text-indigo-600 cursor-pointer font-semibold hover:underline"
                  onClick={() => router.push("/auth?mode=login")}
                >
                  Back to Login
                </button>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPasswordForm;
