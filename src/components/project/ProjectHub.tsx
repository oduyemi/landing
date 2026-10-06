"use client";
import React from "react";
import { motion } from "framer-motion";
import { FolderKanban, HelpCircle } from "lucide-react";
import styles from "./ProjectAccess.module.css";

export const ProjectHub: React.FC = () => {
  return (
    <section className={styles.accessSection}>
      <motion.div
        className={styles.accessBox}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className={styles.heading}>
          Ready to Collaborate <span>Like a Pro</span>?
        </h2>
        <p className={styles.sub}>
          Clients get access to a secure project portal to share files, track progress,
          and stay in the loop. Got questions? I&apos;ve got answers too.
        </p>
        <div className={styles.buttons}>
          <motion.a
            href="/client"
            className={styles.cta}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FolderKanban size={18} />
            <span>Access Project Portal</span>
          </motion.a>

          <motion.a
            href="/faqs"
            className={styles.ctaAlt}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HelpCircle size={18} />
            <span>Visit FAQ</span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};
