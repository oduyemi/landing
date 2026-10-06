"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  image?: string;
  imageAlt?: string;
}

export const AuthShell = ({
  children,
  image = "/images/workstation.jpg",
  imageAlt = "Workspace",
}: AuthShellProps) => {
  return (
    <main className="min-h-screen bg-[#f7f7f7] px-2 py-2 sm:px-3 sm:py-3">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1180px] overflow-hidden rounded-md border border-neutral-200 bg-white shadow-[0_7px_30px_rgba(0,0,0,0.025)] sm:min-h-[calc(100vh-1.5rem)]">
        <motion.div
          initial={{
            opacity: 0,
            scale: 1.03,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative hidden w-[31%] shrink-0 overflow-hidden bg-neutral-100 md:block"
        >
          <motion.img
            src={image}
            alt={imageAlt}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5" />
        </motion.div>

        <motion.section
          initial={{
            opacity: 0,
            x: 15,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex min-h-[calc(100vh-1rem)] flex-1 flex-col bg-white px-7 py-7 sm:px-10 sm:py-8 md:min-h-0 md:px-12 lg:px-16"
        >
          {children}
        </motion.section>
      </div>
    </main>
  );
};