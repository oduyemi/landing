"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/navigation/Header";

const AUTH_PAGES = [
  "/login",
  "/reset-password",
  "/forgot-password",
];

interface SiteLayoutProps {
  children: React.ReactNode;
}


export default function SiteLayout({children}: SiteLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname);
  return (
    <>
      {!isAuthPage && <Header />}

      <main>
        {children}
      </main>

      {/* Footer */}
      {/* {!isAuthPage && <Footer />} */}
    </>
  );
}