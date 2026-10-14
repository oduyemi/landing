
import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminLayoutShell from "@/components/admin/layout/Shell";

export const metadata: Metadata = {
  title: {
    default: "Admin Workspace",
    template: "%s | Admin Workspace",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
