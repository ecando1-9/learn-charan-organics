import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enroll in Courses – Charan Organics Academy",
  description: "Select herbal cosmetic making courses and enroll via UPI payment.",
};

export default function EnrollLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
