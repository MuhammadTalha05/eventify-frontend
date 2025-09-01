"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import { validationAddUser } from "@/utils/validations";

// Validation Schema
const UserSchema = validationAddUser;

interface UserFormProps {
    onCancel: () => void;
    onSubmit: (values: { fullName: string; email: string; phone: string; role: string }) => Promise<any>;
}

export default function UserForm({ onCancel, onSubmit }: UserFormProps) {
    const [submitting, setSubmitting] = useState(false);

    return (
        <Formik
            initialValues={{
                fullName: "",
                email: "",
                phone: "",
                role: "PARTICIPANT",
            }}
            validationSchema={UserSchema}
            onSubmit={async (values, { resetForm }) => {
                try {
                    setSubmitting(true);
                    const response = await onSubmit(values);

                    // Check if API returned success
                    if (response?.success === false) {
                        toast.error(response.message || "Failed to add user");
                        return;
                    }

                    resetForm();
                    toast.success("User added successfully!");
                } catch (err: any) {
                    console.error(err);

                    // Check if axios error with response
                    if (err?.response?.data?.message) {
                        toast.error(err.response.data.message);
                    } else if (err?.message) {
                        toast.error(err.message);
                    } else {
                        toast.error("Failed to add user");
                    }
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {() => (
                <Form className="space-y-4">
                    <div>
                        <label className="block font-medium">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <Field name="fullName" className="w-full border rounded-lg px-3 py-2" />
                        <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label className="block font-medium">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <Field type="email" name="email" className="w-full border rounded-lg px-3 py-2" />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label className="block font-medium">Phone</label>
                        <Field name="phone" className="w-full border rounded-lg px-3 py-2" />
                        <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div>
                        <label className="block font-medium">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <Field as="select" name="role" className="w-full border rounded-lg px-3 py-2">
                            <option value="PARTICIPANT">PARTICIPANT</option>
                            <option value="ORGANIZER">ORGANIZER</option>
                        </Field>
                        <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg bg-gray-200 cursor-pointer disabled:cursor-not-allowed"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            disabled={submitting}
                        >
                            {submitting ? "Adding..." : "Add New User"}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
