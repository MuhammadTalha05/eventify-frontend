"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { createEventValidation } from "@/utils/validations";
import { toast } from "react-toastify";


const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS = 3;

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const CLOUDINARY_API_URL = process.env.NEXT_PUBLIC_CLOUDINARY_API_URL!;

// Validation Schema
const CreateEventSchema = createEventValidation;

// helper for IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function CreateEventForm({ onCancel, onSubmit }:any) {
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [featuredUrl, setFeaturedUrl] = useState<string | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const [attachmentsPreviews, setAttachmentsPreviews] = useState<
    { id: string; file: File; preview: string }[]
  >([]);
  const [attachmentsUrls, setAttachmentsUrls] = useState<
    { id: string; fileUrl: string; fileType: string }[]
  >([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState<
    Record<string, boolean>
  >({});

  // Upload to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(CLOUDINARY_API_URL, formData);
    return res.data.secure_url as string;
  };

  // Handle Featured Image
  const handleFeaturedChange = async (file: File, setFieldValue: any) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File "${file.name}" exceeds 10MB.`);
      setFieldValue("featuredImage", null);
      return;
    }
    setFieldValue("featuredImage", file);
    setFeaturedPreview(URL.createObjectURL(file));

    try {
      setFeaturedLoading(true);
      const url = await uploadToCloudinary(file);
      setFeaturedUrl(url);
    } catch (err) {
      console.error("Failed to upload featured image", err);
      toast.error("Failed to upload featured image.")
      setFeaturedPreview(null);
      setFeaturedUrl(null);
    } finally {
      setFeaturedLoading(false);
    }
  };

 // Handle attachments upload
const handleAttachmentUpload = async (files: FileList) => {
  const validFiles = Array.from(files).slice(0, MAX_ATTACHMENTS - attachmentsPreviews.length);

  const newPreviews: { id: string; file: File; preview: string }[] = [];

  for (const file of validFiles) {
    if (!(file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      toast.error(`File type not allowed: ${file.name}`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File "${file.name}" exceeds 10MB.`)
      continue;
    }

    const id = generateId();
    const previewUrl = URL.createObjectURL(file);

    newPreviews.push({ id, file, preview: previewUrl });
    setAttachmentsLoading((prev) => ({ ...prev, [id]: true }));

    // upload
    uploadToCloudinary(file)
      .then((url) => {
        setAttachmentsUrls((prevUrls) => {
          // replace if exists instead of duplicating
          const filtered = prevUrls.filter((u) => u.id !== id);
          return [
            ...filtered,
            {
              id,
              fileUrl: url,
              fileType: file.type.startsWith("image/") ? "image" : "video",
            },
          ];
        });
      })
      .catch((err) => {
        console.error(`Failed to upload ${file.name}`, err);
        toast.error(`Failed to upload ${file.name}`);
      })
      .finally(() => {
        setAttachmentsLoading((prev) => ({ ...prev, [id]: false }));
      });
  }

  // append previews, max 3
  setAttachmentsPreviews((prev) => [...prev, ...newPreviews].slice(0, MAX_ATTACHMENTS));
};

  const removeAttachment = (id: string) => {
    setAttachmentsPreviews((prev) => prev.filter((p) => p.id !== id));
    setAttachmentsUrls((prev) => prev.filter((a) => a.id !== id));
    setAttachmentsLoading((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        type: "ONSITE",
        joinLink: "",
        venue: "",
        totalSeats: "",
        startTime: "",
        endTime: "",
        featuredImage: null,
        hostEmails: "",
        contactEmail: "",
        contactPhone: "",
      }}
      validationSchema={CreateEventSchema}
      onSubmit={(values, { resetForm }) => {
        const payload = {
          ...values,
          hostEmails: values.hostEmails
            ? values.hostEmails.split(",").map((email) => email.trim())
            : [],
          featuredImage: featuredUrl,
          attachments: attachmentsUrls.filter((a) =>
    attachmentsPreviews.some((p) => p.id === a.id)
  ), 
        };
        onSubmit(payload);
        resetForm();
        setFeaturedPreview(null);
        setFeaturedUrl(null);
        setAttachmentsPreviews([]);
        setAttachmentsUrls([]);
        setAttachmentsLoading({});
      }}
    >
      {({ setFieldValue, values }) => (
        <Form className="space-y-4">
          {/* Title + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Field
                name="title"
                className="w-full border rounded-lg px-3 py-2"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block font-medium">
                Type <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="type"
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="ONSITE">ONSITE</option>
                <option value="ONLINE">ONLINE</option>
              </Field>
              <ErrorMessage
                name="type"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Field
              as="textarea"
              name="description"
              className="w-full border rounded-lg px-3 py-2"
            />
            <ErrorMessage
              name="description"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block font-medium mb-1">
              Featured Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="featuredImage"
                className="px-3 py-1.5 text-sm bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200"
              >
                Choose File
              </label>
              <input
                id="featuredImage"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) handleFeaturedChange(file, setFieldValue);
                }}
              />
              {featuredPreview && (
                <span className="text-sm text-gray-600">1 file selected</span>
              )}
            </div>
            {featuredPreview && (
              <div className="relative mt-2 h-28 rounded-md overflow-hidden border">
                <img
                  src={featuredPreview}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
                {featuredLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-blue-500 text-sm">
                    Uploading...
                  </div>
                )}
              </div>
            )}
            <ErrorMessage
              name="featuredImage"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>

          {/* Join Link / Venue + Seats */}
          <div className="grid grid-cols-2 gap-4">
            {values.type === "ONLINE" && (
              <div>
                <label className="block font-medium">
                  Join Link <span className="text-red-500">*</span>
                </label>
                <Field
                  name="joinLink"
                  className="w-full border rounded-lg px-3 py-2"
                />
                <ErrorMessage
                  name="joinLink"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            )}
            {values.type === "ONSITE" && (
              <div>
                <label className="block font-medium">
                  Venue <span className="text-red-500">*</span>
                </label>
                <Field
                  name="venue"
                  className="w-full border rounded-lg px-3 py-2"
                />
                <ErrorMessage
                  name="venue"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            )}
            <div>
              <label className="block font-medium">Total Seats</label>
              <Field
                name="totalSeats"
                className="w-full border rounded-lg px-3 py-2"
              />
              <ErrorMessage
                name="totalSeats"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
          </div>

          {/* Start + End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">
                Start Time <span className="text-red-500">*</span>
              </label>
              <Field
                type="datetime-local"
                name="startTime"
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border rounded-lg px-3 py-2"
              />
              <ErrorMessage
                name="startTime"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block font-medium">
                End Time <span className="text-red-500">*</span>
              </label>
              <Field
                type="datetime-local"
                name="endTime"
                min={
                  values.startTime
                    ? new Date(values.startTime).toISOString().slice(0, 16)
                    : new Date().toISOString().slice(0, 16)
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <ErrorMessage
                name="endTime"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block font-medium mb-1">Attachments</label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="attachments"
                className="px-3 py-1.5 text-sm bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200"
              >
                Add Files
              </label>
              <input
                id="attachments"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp,video/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleAttachmentUpload(e.target.files)
                }
              />
              {attachmentsPreviews.length > 0 && (
                <span className="text-sm text-gray-600">
                  {attachmentsPreviews.length} file(s) selected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max <b>3 files</b>. Images | Videos under <b>10MB</b>.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {attachmentsPreviews.map((item) => (
                <div
                  key={item.id}
                  className="relative border rounded-lg overflow-hidden"
                >
                  {item.file.type.startsWith("image/") ? (
                    <img
                      src={item.preview}
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.preview}
                      className="h-24 w-full object-cover"
                      controls
                    />
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
            <label className="block font-medium">Host Emails</label>
            <Field
              name="hostEmails"
              placeholder="example@mail.com,example1@mail.com"
              className="w-full border rounded-lg px-3 py-2"
            />
            <ErrorMessage
              name="hostEmails"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>

          {/* Contact Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <Field
                name="contactEmail"
                type="email"
                className="w-full border rounded-lg px-3 py-2"
              />
              <ErrorMessage
                name="contactEmail"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div>
              <label className="block font-medium">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <Field
                name="contactPhone"
                className="w-full border rounded-lg px-3 py-2"
              />
              <ErrorMessage
                name="contactPhone"
                component="div"
                className="text-red-500 text-sm"
              />
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
              className="px-4 py-2 rounded-lg bg-indigo-600 cursor-pointer text-white disabled:opacity-50"
              disabled={
                featuredLoading ||
                Object.values(attachmentsLoading).some((l) => l)
              }
            >
              Create
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
