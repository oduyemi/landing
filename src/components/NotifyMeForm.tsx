"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";


export const NotifyMeForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div
      className="ctaSection"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      viewport={{ once: true }}
    >
      <p className="notifyText">
        Want to be the first to try it?
      </p>

      {!submitted ? (
        <form
          action="https://formspree.io/f/xgvzwkpy" 
          method="POST"
          onSubmit={() => setSubmitted(true)}
          className="notifyForm"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            className="inputField"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="inputField"
          />
          <button type="submit" className="notifyButton">
            <Inbox size={18} />
            Notify Me
          </button>
        </form>
      ) : (
        <p className="confirmation">
          Thanks! We&apos;ll let you know when it&apos;s ready.
        </p>
      )}
    </motion.div>
  );
};
