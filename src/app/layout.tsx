import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/layout/QueryProvider"; // Client wrapper
import { ReactNode } from "react";
import { ToastContainer, toast } from 'react-toastify';
import AuthInitializer from "@/components/layout/AuthInitializer";

export const metadata: Metadata = {
  title: "Eventify - Event Management Platform",
  description: "Plan, organize, and manage events effortlessly with Eventify.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <QueryProvider>
          <AuthInitializer />
          <Navbar />
          <main className="flex-1">{children}</main>
          <ToastContainer position="top-right" autoClose={3000} />
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
