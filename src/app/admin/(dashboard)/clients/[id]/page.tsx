
import type { Metadata } from "next";
import {ClientDetailPage} from "@/components/admin/clients/ClientDetailPage";

export const metadata: Metadata = {
  title: "Client Profile",
  description: "View client information, projects, and recent activity.",
};

export default function AdminClientDetailRoute() {
  return <ClientDetailPage />;
}
