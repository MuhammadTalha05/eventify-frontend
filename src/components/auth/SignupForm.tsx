// src/components/auth/SignupForm.tsx
"use client";

import { FC } from "react";
import { useMutation } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { API } from "@/lib/api";
import { AxiosError, AxiosResponse } from "axios";
import { SignupData, UserRole } from "@/utils/types";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { signupValidation } from "@/utils/validations";

const SignupSchema = signupValidation;

interface SignupFormProps {
  onSuccess?: () => void;
}

interface ApiError {
  error?: string;
}

const SignupForm: FC<SignupFormProps> = ({ onSuccess }) => {
  const router = useRouter();

  const mutation = useMutation<AxiosResponse, AxiosError<ApiError>, SignupData>({
    mutationFn: (values) => API.post("/api/auth/signup", values),
    onError: (error) => {
      const message =
        error.response?.data?.error || "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  return (
    <div className="w-full pt-5 pb-5">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Create Your Account
      </h2>

      <Formik
        initialValues={{
          fullName: "",
          email: "",
          phone: "",
          password: "",
          role: "PARTICIPANT" as UserRole,
        }}
        validationSchema={SignupSchema}
        onSubmit={(values, { resetForm }) =>
          mutation.mutate(values, {
            onSuccess: () => {
              toast.success("Signed up successfully!");
              resetForm();
              if (onSuccess) onSuccess();
              setTimeout(() => {
                router.push("/auth?mode=login");
              }, 1200);
            },
          })
        }
      >
        {({ errors, touched }) => (
          <Form className="space-y-2">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Field
                name="fullName"
                placeholder="John Doe"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.fullName && touched.fullName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="fullName"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

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

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <Field
                name="phone"
                placeholder="+923001234567 or 03001234567"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.phone && touched.phone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="phone"
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
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.password && touched.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="role"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                  errors.role && touched.role
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="PARTICIPANT">Participant</option>
                <option value="ORGANIZER">Organizer</option>
              </Field>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow cursor-pointer hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {mutation.isPending ? "Signing Up..." : "Sign Up"}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                If you have an account,{" "}
                <button
                  type="button"
                  className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => router.push("/auth?mode=login")}
                >
                  Login
                </button>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignupForm;
