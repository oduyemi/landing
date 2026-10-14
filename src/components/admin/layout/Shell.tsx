
"use client";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminSidebar from "./Sidebar";
import AdminHeader from "./Header";
import { useAuth } from "@/context/AuthContext";

interface AdminLayoutShellProps {
  children: ReactNode;
}

export default function AdminLayoutShell({
  children,
}: AdminLayoutShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/client");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <div className="flex items-center gap-2 text-[11px] text-[#777]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e4e4e4] border-t-[#222]" />
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-[#171717]">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="min-w-0 flex-1 bg-[#fcfcfc] px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7"
        >
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}
