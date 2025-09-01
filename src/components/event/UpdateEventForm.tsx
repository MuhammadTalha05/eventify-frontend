"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useUserStore } from "@/store/user/userStore";
import { updateEventValidation } from "@/utils/validations";
import { toast } from "react-toastify";

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS = 3;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const CLOUDINARY_API_URL = process.env.NEXT_PUBLIC_CLOUDINARY_API_URL!;

// Types
interface Host { id: string; email: string; }
interface Attachment { id: string; fileUrl: string; fileType: "image" | "video"; }
interface AttachmentPreview { id: string; file?: File; preview: string; }
interface UpdateEventFormProps {
    eventId: string;
    initialData: any;
    onCancel: () => void;
    onSubmit: (eventId: string, payload: any) => void;
}

// Validation schema
const UpdateEventSchema = updateEventValidation;

// Helpers
const generateId = () => Math.random().toString(36).substring(2, 9);
const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await axios.post(CLOUDINARY_API_URL, formData);
    return res.data.secure_url;
};

export default function UpdateEventForm({ eventId, initialData, onCancel, onSubmit }: UpdateEventFormProps) {
    // if (!initialData) return null;

    const { deleteAttachment, deleteHost } = useUserStore();

    const [featuredPreview, setFeaturedPreview] = useState<string | null>(initialData?.featuredImage || null);
    const [featuredUrl, setFeaturedUrl] = useState<string | null>(initialData?.featuredImage || null);
    const [featuredLoading, setFeaturedLoading] = useState(false);

    const [attachmentsPreviews, setAttachmentsPreviews] = useState<AttachmentPreview[]>(
        (initialData?.attachments || []).map((a: any) => ({ id: a.id || generateId(), preview: a.fileUrl }))
    );
    const [attachmentsUrls, setAttachmentsUrls] = useState<Attachment[]>(initialData?.attachments || []);
    const [attachmentsLoading, setAttachmentsLoading] = useState<Record<string, boolean>>({});
    const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);

    // Host emails state
    const [newHostEmailInput, setNewHostEmailInput] = useState("");
    const [newHostEmails, setNewHostEmails] = useState<string[]>([]);
    const [emailError, setEmailError] = useState("");

    // ✅ Track existing hosts from DB (with ids)
    const [existingHosts, setExistingHosts] = useState<Host[]>(initialData?.hosts || []);

    // ✅ Track *all* emails (existing + new) for display
    const [allHostEmails, setAllHostEmails] = useState<string[]>([
        ...(initialData?.hosts || []).map((h: Host) => h.email),
    ]);

    if (!initialData) return null;

    const handleFeaturedChange = async (file: File, setFieldValue: (field: string, value: any) => void) => {
        if (file.type === "image/svg+xml") return toast.error("❌ SVG files not allowed");
        if (file.size > MAX_FILE_SIZE) return toast.error(`❌ File exceeds 10MB.`);
        setFieldValue("featuredImage", file);
        setFeaturedPreview(URL.createObjectURL(file));
        try {
            setFeaturedLoading(true);
            const url = await uploadToCloudinary(file);
            setFeaturedUrl(url);
        } finally { setFeaturedLoading(false); }
    };

    const handleAttachmentUpload = async (files: FileList) => {
        const validFiles = Array.from(files).slice(0, MAX_ATTACHMENTS - attachmentsPreviews.length);
        for (const file of validFiles) {
            if (!(file.type.startsWith("image/") || file.type.startsWith("video/")) || file.size > MAX_FILE_SIZE) continue;
            const id = generateId();
            const previewUrl = URL.createObjectURL(file);
            setAttachmentsPreviews((prev) => [...prev, { id, file, preview: previewUrl }]);
            setAttachmentsLoading((prev) => ({ ...prev, [id]: true }));

            uploadToCloudinary(file)
                .then((url) => {
                    const attachment: Attachment = { id, fileUrl: url, fileType: file.type.startsWith("image/") ? "image" : "video" };
                    setNewAttachments((prev) => [...prev, attachment]);
                    setAttachmentsUrls((prev) => [...prev, attachment]);
                })
                .finally(() => setAttachmentsLoading((prev) => { const p = { ...prev }; delete p[id]; return p; }));
        }
    };

    const removeAttachment = async (id: string) => {
        const attachmentToDelete = attachmentsUrls.find((a) => a.id === id);
        if (attachmentToDelete && attachmentToDelete.id && !newAttachments.some((a) => a.id === id)) {
            try { await deleteAttachment(attachmentToDelete.id, eventId); }
            catch (err) { console.error("Failed to delete attachment", err); }
        }
        setAttachmentsPreviews((prev) => prev.filter((p) => p.id !== id));
        setAttachmentsUrls((prev) => prev.filter((a) => a.id !== id));
        setNewAttachments((prev) => prev.filter((a) => a.id !== id));
    };

    const addHostEmail = () => {
        const email = newHostEmailInput.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return;
        if (!emailRegex.test(email)) {
            setEmailError("Invalid email format");
            return;
        }
        if (allHostEmails.includes(email)) {
            setEmailError("Email already added");
            return;
        }
        setNewHostEmails((prev) => [...prev, email]);
        setAllHostEmails((prev) => [...prev, email]);
        setNewHostEmailInput("");
        setEmailError("");
    };

    // Remove existing host (DB) → call API
    const removeExistingHost = async (host: Host) => {
        try {
            await deleteHost(eventId, host.id);
            setExistingHosts((prev) => prev.filter((h) => h.id !== host.id));
            setAllHostEmails((prev) => prev.filter((e) => e !== host.email));
        } catch (err) {
            console.error("Failed to delete host", err);
        }
    };

    // Remove new (unsaved) host
    const removeHostEmail = (email: string) => {
        setAllHostEmails(allHostEmails.filter((e) => e !== email));
        setNewHostEmails(newHostEmails.filter((e) => e !== email));
    };

    return (
        <Formik
            enableReinitialize
            initialValues={{
                title: initialData.title || "",
                description: initialData.description || "",
                type: initialData.type || "ONSITE",
                joinLink: initialData.joinLink || "",
                venue: initialData.venue || "",
                totalSeats: initialData.totalSeats || "",
                startTime: initialData.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : "",
                endTime: initialData.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : "",
                featuredImage: initialData.featuredImage || null,
                contactEmail: initialData.contactEmail || "",
                contactPhone: initialData.contactPhone || "",
            }}
            validationSchema={UpdateEventSchema}
            onSubmit={(values) => {
                const payload = {
                    title: values.title,
                    description: values.description,
                    type: values.type,
                    joinLink: values.joinLink || null,
                    venue: values.venue || null,
                    totalSeats: values.totalSeats ? Number(values.totalSeats) : null,
                    startTime: values.startTime ? new Date(values.startTime).toISOString() : "",
                    endTime: values.endTime ? new Date(values.endTime).toISOString() : "",
                    contactEmail: values.contactEmail,
                    contactPhone: values.contactPhone,
                    hostEmails: newHostEmails, // ✅ only new ones go to update API
                    featuredImage: featuredUrl || initialData.featuredImage || "",
                    attachments: newAttachments.length > 0 ? newAttachments : undefined,
                };
                onSubmit(eventId, payload);
            }}
        >
            {({ setFieldValue, values }) => (
                <Form className="space-y-4">
                    {/* Title + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Title <span className="text-red-500">*</span></label>
                            <Field name="title" className="w-full border rounded-lg px-3 py-2" />
                            <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div>
                            <label className="block font-medium">Type <span className="text-red-500">*</span></label>
                            <Field as="select" name="type" className="w-full border rounded-lg px-3 py-2">
                                <option value="ONSITE">ONSITE</option>
                                <option value="ONLINE">ONLINE</option>
                            </Field>
                            <ErrorMessage name="type" component="div" className="text-red-500 text-sm" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block font-medium">Description <span className="text-red-500">*</span></label>
                        <Field as="textarea" name="description" className="w-full border rounded-lg px-3 py-2" />
                        <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block font-medium mb-1">Featured Image</label>
                        <div className="flex items-center gap-3">
                            <label htmlFor="featuredImage" className="px-3 py-1.5 text-sm bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200">
                                Choose File
                            </label>
                            <input
                                id="featuredImage"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                className="hidden"
                                onChange={(e) => { const file = e.currentTarget.files?.[0]; if (file) handleFeaturedChange(file, setFieldValue); }}
                            />
                            {featuredPreview && <span className="text-sm text-gray-600">1 file selected</span>}
                        </div>
                        {featuredPreview && (
                            <div className="relative mt-2 h-28 rounded-md overflow-hidden border">
                                <img src={featuredPreview} alt="preview" className="h-full w-full object-cover" />
                                {featuredLoading && (
                                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-blue-500 text-sm">
                                        Uploading...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Venue/Join + Seats */}
                    <div className="grid grid-cols-2 gap-4">
                        {values.type === "ONLINE" && (
                            <div>
                                <label className="block font-medium">Join Link <span className="text-red-500">*</span></label>
                                <Field name="joinLink" className="w-full border rounded-lg px-3 py-2" />
                                <ErrorMessage name="joinLink" component="div" className="text-red-500 text-sm" />
                            </div>
                        )}
                        {values.type === "ONSITE" && (
                            <div>
                                <label className="block font-medium">Venue <span className="text-red-500">*</span></label>
                                <Field name="venue" className="w-full border rounded-lg px-3 py-2" />
                                <ErrorMessage name="venue" component="div" className="text-red-500 text-sm" />
                            </div>
                        )}
                        <div>
                            <label className="block font-medium">Total Seats</label>
                            <Field name="totalSeats" type="number" className="w-full border rounded-lg px-3 py-2" />
                            <ErrorMessage name="totalSeats" component="div" className="text-red-500 text-sm" />
                        </div>
                    </div>

                    {/* Start + End Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Start Time <span className="text-red-500">*</span></label>
                            <Field type="datetime-local" name="startTime" className="w-full border rounded-lg px-3 py-2" />
                            <ErrorMessage name="startTime" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div>
                            <label className="block font-medium">End Time <span className="text-red-500">*</span></label>
                            <Field type="datetime-local" name="endTime" className="w-full border rounded-lg px-3 py-2" />
                            <ErrorMessage name="endTime" component="div" className="text-red-500 text-sm" />
                        </div>
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block font-medium mb-1">Attachments</label>
                        <div className="flex items-center gap-3">
                            <label htmlFor="attachments" className="px-3 py-1.5 text-sm bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200">
                                Add Files
                            </label>
                            <input
                                id="attachments"
                                type="file"
                                multiple
                                accept="image/png,image/jpeg,image/jpg,image/webp,video/*"
                                className="hidden"
                                onChange={(e) => e.target.files && handleAttachmentUpload(e.target.files)}
                            />
                            {attachmentsPreviews.length > 0 && <span className="text-sm text-gray-600">{attachmentsPreviews.length} file(s) selected</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Max <b>3 files</b>. Images | Videos under <b>10MB</b>.</p>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            {attachmentsPreviews.map((item) => (
                                <div key={item.id} className="relative border rounded-lg overflow-hidden">
                                    {item.file?.type.startsWith("image/") || item.preview.endsWith(".jpg") || item.preview.endsWith(".png") ? (
                                        <img src={item.preview} className="h-24 w-full object-cover" />
                                    ) : (
                                        <video src={item.preview} className="h-24 w-full object-cover" controls />
                                    )}
                                    {attachmentsLoading[item.id] && (
                                        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-blue-500 text-sm">
                                            Uploading...
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(item.id)}
                                        className="absolute top-1 right-1 bg-red-500 cursor-pointer text-white rounded-full p-1"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Host Emails */}
                    <div>
                        <label className="block font-medium mb-1">Host Emails</label>
                        <div className="flex gap-2 mb-1">
                            <input
                                type="email"
                                placeholder="Enter email"
                                value={newHostEmailInput}
                                onChange={(e) => setNewHostEmailInput(e.target.value)}
                                className="border rounded-lg px-3 py-2 flex-1"
                            />
                            <button type="button" onClick={addHostEmail} className="px-3 py-2 bg-indigo-600 cursor-pointer text-white rounded-lg">
                                Add
                            </button>
                        </div>
                        {emailError && <div className="text-red-500 text-sm mb-1">{emailError}</div>}

                        <div className="flex flex-wrap gap-2">
                            {existingHosts.map((host, index) => (
                                <span key={host.id} className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 rounded-full text-sm">
                                    {host.email}
                                    {/* Don't show X for the first host (creator) */}
                                    {index !== 0 && (
                                        <button type="button" onClick={() => removeExistingHost(host)}>
                                            <XMarkIcon className="w-3 h-3 cursor-pointer text-red-500" />
                                        </button>
                                    )}
                                </span>
                            ))}

                            {/* ✅ New (unsaved) hosts */}
                            {newHostEmails.map((email) => (
                                <span key={email} className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 rounded-full text-sm">
                                    {email}
                                    <button type="button" onClick={() => removeHostEmail(email)}>
                                        <XMarkIcon className="w-3 h-3 cursor-pointer text-red-500" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>


                    {/* Contact Email + Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium">Contact Email <span className="text-red-500">*</span></label>
                            <Field name="contactEmail" type="email" className="w-full border rounded-lg px-3 py-2" />
                            <ErrorMessage name="contactEmail" component="div" className="text-red-500 text-sm" />
                        </div>
                        <div>
                            <label className="
                            block font-medium">Contact Phone <span className="text-red-500">*</span></label>
                            <Field name="contactPhone" className="w-full border rounded-lg px-3 py-2" />
                            <ErrorMessage name="contactPhone" component="div" className="text-red-500 text-sm" />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-lg cursor-pointer bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={featuredLoading || Object.keys(attachmentsLoading).length > 0}
                            className="px-4 py-2 rounded-lg cursor-pointer bg-indigo-600 text-white disabled:opacity-50"
                        >
                            {featuredLoading || Object.keys(attachmentsLoading).length > 0
                                ? "Uploading..."
                                : "Update Event"}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
