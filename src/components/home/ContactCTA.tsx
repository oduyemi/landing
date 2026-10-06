"use client";
import React from "react";
import { motion } from "framer-motion";
import { SendHorizonal, Coffee } from "lucide-react";
import styles from "./Contact.module.css";

export const ContactCTA: React.FC = () => {
  return (
    <section className={styles.ctaSection}>
      <motion.div
        className={styles.ctaBox}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className={styles.heading}>
          Let&apos;s Build Something <span>Ridiculously Cool</span>
        </h2>
        <p className={styles.sub}>
          Got a wild idea, startup brief, or simply want to say hi?
          <br />
          I&apos;m all ears — just maybe not the caffeine kind{" "}
          <Coffee size={16} className={styles.iconInline} />.
        </p>

        <motion.a
          href="mailto:hello@oduyemi.dev"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={styles.button}
        >
          <SendHorizonal size={18} />
          <span>Get in Touch</span>
        </motion.a>
      </motion.div>
    </section>
  );
};
