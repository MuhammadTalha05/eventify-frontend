import * as Yup from "yup";
import { UserRole } from "@/utils/types";

// Yup Validation Schema
export const signupValidation = Yup.object().shape({
    fullName: Yup.string().required("Full Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
        .matches(/^(\+92\d{10}|03\d{9})$/, "Phone must be +92XXXXXXXXXX or 03XXXXXXXXX")
        .required("Phone is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Password must contain letters and numbers")
        .required("Password is required"),
    role: Yup.mixed<UserRole>()
        .oneOf(["PARTICIPANT", "ORGANIZER"], "Invalid role")
        .required("Role is required"),
});

// Yup Validation Schema for Signin
export const signinValidation = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});


// Validation Schema for OTP
export const otpValidation = Yup.object().shape({
  otp: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

// Validation schema for forgot password
export const forgotPasswordValidation = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

// Validation schema for reset passowrd
export const resetValidation = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Password must contain letters and numbers")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

// Validation schema for Profile
export const profileValidation = Yup.object({
  fullName: Yup.string()
    .required("Full name is required")
    .min(3, "Full name must be at least 3 characters"),
   phone: Yup.string()
      .matches(/^(\+92\d{10}|03\d{9})$/, "Phone must be +92XXXXXXXXXX or 03XXXXXXXXX")
      .required("Phone is required"),
});


// Validation scheme for update password
export const updatePasswordValidation = Yup.object({
  oldPassword: Yup.string().required("Old password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Password must contain letters and numbers")
    .required("Password is required"),
});


// Validation schema for create evnt
export const createEventValidation = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  type: Yup.string().oneOf(["ONSITE", "ONLINE"]).required("Type is required"),
  joinLink: Yup.string().when("type", {
    is: "ONLINE",
    then: (schema) =>
      schema.url("Must be a valid URL").required("Join link required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  venue: Yup.string().when("type", {
    is: "ONSITE",
    then: (schema) => schema.required("Venue is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  featuredImage: Yup.string().required("Featured image is required"),
  totalSeats: Yup.number()
    .typeError("Must be a number")
    .positive("Must be greater than 0")
    .notRequired(),
  startTime: Yup.date()
    .required("Start time required")
    .min(new Date(), "Start time must be in the future"),
  endTime: Yup.date()
    .required("End time required")
    .test("after-start", "End time must be after start time", function (value) {
      const { startTime } = this.parent;
      return value && startTime ? new Date(value) > new Date(startTime) : true;
    }),
  hostEmails: Yup.string()
    .notRequired()
    .test("emails", "Invalid email format(s)", (value) => {
      if (!value || value.trim() === "") return true;
      const emails = value.split(",");
      return emails.every((email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      );
    }),
  contactEmail: Yup.string()
    .email("Invalid email")
    .required("Contact email required"),
  contactPhone: Yup.string().matches(/^(\+92\d{10}|03\d{9})$/, "Phone must be +92XXXXXXXXXX or 03XXXXXXXXX").required("Phone is required"),

});



// Validation Schema for Upate Event
export const updateEventValidation = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    type: Yup.string().oneOf(["ONSITE", "ONLINE"]).required("Type is required"),
    joinLink: Yup.string().when("type", {
        is: "ONLINE",
        then: (schema) => schema.url("Must be a valid URL").required("Join link required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    venue: Yup.string().when("type", {
        is: "ONSITE",
        then: (schema) => schema.required("Venue is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    totalSeats: Yup.number().typeError("Must be a number").positive("Must be greater than 0"),
    startTime: Yup.date()
        .required("Start time required")
        .min(new Date(), "Start time must be in the future"),
    endTime: Yup.date()
        .required("End time required")
        .test("after-start", "End time must be after start time", function (value) {
            const { startTime } = this.parent;
            return value && startTime ? new Date(value) > new Date(startTime) : true;
        }),
    contactEmail: Yup.string().email("Invalid email").required("Contact email required"),
    contactPhone: Yup.string().matches(/^(\+92\d{10}|03\d{9})$/, "Phone must be +92XXXXXXXXXX or 03XXXXXXXXX").required("Phone is required"),
});

// Validation Schema for Add User
export const validationAddUser = Yup.object().shape({
  fullName: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone:  Yup.string().matches(/^(\+92\d{10}|03\d{9})$/, "Phone must be +92XXXXXXXXXX or 03XXXXXXXXX").required("Phone is required"),
  role: Yup.string()
    .oneOf(["PARTICIPANT", "ORGANIZER", "SUPER_ADMIN"])
    .required("Role is required"),
});