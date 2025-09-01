// src/components/auth/SigninForm.tsx
"use client";

import { FC } from "react";
import { useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { API } from "@/lib/api";
import { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { signinValidation } from "@/utils/validations";

interface SigninFormProps {
  onSuccess?: () => void;
}

interface SigninValues {
  email: string;
  password: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const SigninSchema = signinValidation;

const SigninForm: FC<SigninFormProps> = ({ onSuccess }) => {
  const router = useRouter();

  const mutation = useMutation<AxiosResponse, ApiError, SigninValues>({
    mutationFn: (values) => API.post("/api/auth/signin", values),
    onSuccess: (_, variables) => {
      // Save email in localStorage for OTP step
      localStorage.setItem("otp_email", variables.email);

      toast.success("OTP sent to your email. Please verify to complete login.");

      if (onSuccess) onSuccess();

      // Redirect to OTP page
      router.push("/auth?mode=otp");
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Something Went Wrong";
      toast.error(message);
    },
  });

  return (
    <div className="w-full pt-5 pb-5">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Welcome Back
      </h2>

      <Formik<SigninValues>
        initialValues={{ email: "", password: "" }}
        validationSchema={SigninSchema}
        onSubmit={(values) => mutation.mutate(values)}
      >
        {({ errors, touched }) => (
          <Form className="space-y-2">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Field
                name="email"
                type="email"
                placeholder="email@example.com"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.email && touched.email ? "border-red-500" : "border-gray-300"
                  }`}
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <Field
                name="password"
                type="password"
                placeholder="********"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.password && touched.password ? "border-red-500" : "border-gray-300"
                  }`}
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => router.push("/auth?mode=forgot")}
                className="text-indigo-600 hover:underline cursor-pointer text-sm font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 bg-indigo-600 text-white cursor-pointer font-semibold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {mutation.isPending ? "Signing In..." : "Sign In"}
              </button>
            </div>

            {/* Signup Link */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => router.push("/auth?mode=signup")}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SigninForm;
