"use client";
import React from "react";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import styles from "./Contact.module.css";

export const ContactMe: React.FC = () => {
  return (
    <section className={styles.contactSection}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Get In Touch
      </motion.h2>

      <motion.p
        className={styles.subheading}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        viewport={{ once: true }}
      >
        If it&apos;s tech, teamwork, or transformation — I&apos;m here for it. Reach out.
      </motion.p>

      <div className={styles.infoGrid}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className={styles.icon}>
            <Mail size={22} />
          </div>
          <h3>Personal</h3>
          <p>
            <a href="mailto:hello@oduyemi.dev"
                style={{ textDecoration: "none" }}
            >hello@oduyemi.dev</a></p>
        </motion.div>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className={styles.icon}>
            {/* <MapPin size={22} /> */}
            <Mail size={22} />
          </div>
          <h3>Artisanery Tech</h3>
          <p><a href="mailto:info@artisanerytech.com"
                style={{ textDecoration: "none" }}
            >info@artisanerytech.com</a></p>
        </motion.div>
      </div>

      <motion.form
        className={styles.form}
        action="https://formspree.io/f/xpwlakjl"
        method="POST"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        viewport={{ once: true }}
      >
        <input type="text" name="name" placeholder="Your Name" required />
        <input type="email" name="email" placeholder="you@email.com" required />
        <textarea name="message" placeholder="What's on your mind?" rows={5} required />
        <button type="submit">Send Message</button>
      </motion.form>
    </section>
  );
};
