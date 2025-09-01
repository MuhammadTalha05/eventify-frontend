"use client";

import { FC, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { API } from "@/lib/api";
import { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { otpValidation } from "@/utils/validations";
import { useAuthStore } from "@/store/auth/authStore";

interface OtpValues {
  otp: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const OtpSchema = otpValidation;

const OtpForm: FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const { fetchUser, redirectByRole } = useAuthStore();

  // Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("otp_email");
    setEmail(storedEmail);
  }, []);

  const mutation = useMutation<AxiosResponse, ApiError, OtpValues>({
    mutationFn: (values) =>
      API.post("/api/auth/login/verify", {
        email,
        otp: values.otp,
      }),
    onSuccess: async () => {
      // Fetch user details after OTP verified
      await fetchUser();

      // Cleanup
      localStorage.removeItem("otp_email");
      toast.success("OTP verified successfully!");

      // Redirect based on role
      redirectByRole();
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Invalid or expired OTP";
      toast.error(message);
    },
  });

  if (!email) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500 font-medium">
          No email found. Please sign in again.
        </p>
        <button
          onClick={() => router.push("/auth?mode=signin")}
          className="px-4 py-2 bg-indigo-600 cursor-pointer text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Go back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full pt-5 pb-5">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Verify OTP
      </h2>

      <Formik<OtpValues>
        initialValues={{ otp: "" }}
        validationSchema={OtpSchema}
        onSubmit={(values) => mutation.mutate(values)}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter OTP <span className="text-red-500">*</span>
              </label>
              <Field
                name="otp"
                type="text"
                placeholder="123456"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.otp && touched.otp
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="otp"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 bg-indigo-600 text-white cursor-pointer font-semibold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {mutation.isPending ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <p className="mt-6 text-center text-gray-600">
        <button
          onClick={() => router.push("/auth?mode=signin")}
          className="text-indigo-600 cursor-pointer hover:underline font-medium"
        >
          Back to Login
        </button>
      </p>
    </div>
  );
};

export default OtpForm;
