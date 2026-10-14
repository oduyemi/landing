
import type { Metadata } from "next";
import {AdminClientsPage} from "@/components/admin/clients/index";

export const metadata: Metadata = {
  title: "Clients",
  description: "Manage client accounts, access, and project relationships.",
};

export default function AdminClientsRoute() {
  return <AdminClientsPage />;
}
