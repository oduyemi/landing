
import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/dashboard/index";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin workspace overview, project status, and recent activity.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
