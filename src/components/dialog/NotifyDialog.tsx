"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
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

        // Auto-hide toast after 3s
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
        <button className="notifyButton">
          <Inbox size={18} />
          Notify Me
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className="dialogContent">
          <Dialog.Close className="closeBtn" aria-label="Close">
            <X size={18} />
          </Dialog.Close>

          <h2 className="dialogHeading">Stay in the Loop 🚀</h2>
          <p className="dialogSub">
            Drop your details and we’ll buzz you when it’s live.
          </p>

          <form onSubmit={handleSubmit} className="dialogForm">
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="submitBtn"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                pointerEvents: isSubmitting ? "none" : "auto",
              }}
            >
              {isSubmitting ? "Submitting..." : "Notify Me"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Toast */}
      {showToast && (
        <motion.div
          className="toastSuccess"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          🎉 You’ll be notified when it launches!
        </motion.div>
      )}
    </Dialog.Root>
  );
};
