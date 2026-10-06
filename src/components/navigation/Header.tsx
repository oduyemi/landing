"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="relative z-50 flex h-16 w-full items-center border-b border-neutral-100 bg-white px-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Odüyémi home"
            className="flex shrink-0 items-center"
          >
            <Image
              src="/images/logo/logo_black.png"
              alt="Òduyémi"
              width={120}
              height={50}
              priority
              className="h-auto w-[105px] object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative py-2 text-[14px] font-medium text-neutral-500 transition-colors duration-200 hover:text-black"
              >
                {item.label}

                <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-black transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop Portal */}
          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:block"
          >
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center rounded-[5px] bg-black px-4 text-[12px] font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Login
            </Link>
          </motion.div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/portal"
              className="inline-flex h-8 items-center justify-center rounded-[5px] bg-black px-3.5 text-[9px] font-semibold text-white"
            >
              Client Portal
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={
                mobileMenuOpen ? "Close navigation" : "Open navigation"
              }
              aria-expanded={mobileMenuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-neutral-200 bg-white text-black"
            >
              {mobileMenuOpen ? (
                <X size={14} strokeWidth={1.8} />
              ) : (
                <Menu size={14} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-neutral-200 bg-white md:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto max-w-[1280px] px-5 pb-4 pt-2 sm:px-8"
            >
              <div className="space-y-0.5 rounded-lg border border-neutral-200 bg-neutral-50 p-1.5">
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-[10px] font-medium text-neutral-600 transition-colors hover:bg-white hover:text-black"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};