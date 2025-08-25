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