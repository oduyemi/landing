/* eslint-disable */
"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, X } from "lucide-react";

export const NotifyDialog: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("https://formspree.io/f/xgvzwkpy", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(e.target as HTMLFormElement),
      });

      if (res.ok) {
        setShowToast(true);
        setName("");
        setEmail("");
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="notifyButton flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:scale-105 transition-transform duration-300">
          <Inbox size={18} />
          Notify Me
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            className="dialogContent fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Dialog.Close className="closeBtn absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white">
              <X size={20} />
            </Dialog.Close>

            <Dialog.Title asChild>
              <h2 className="dialogHeading text-xl font-semibold text-gray-900 dark:text-white">
                Stay in the Loop 🚀
              </h2>
            </Dialog.Title>

            <p className="dialogSub text-sm text-gray-600 dark:text-gray-400 mb-4">
              Drop your details and we’ll buzz you when it’s live.
            </p>

            <form onSubmit={handleSubmit} className="dialogForm flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-800 dark:text-white dark:border-gray-700"
              />
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:bg-neutral-800 dark:text-white dark:border-gray-700"
              />
              <button
                type="submit"
                className="submitBtn mt-2 w-full bg-black text-white py-2 rounded-full font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Notify Me"}
              </button>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="toastSuccess fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            🎉 You’ll be notified when it launches!
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
