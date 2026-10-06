"use client";
import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Clock, Users, MessageSquareText } from "lucide-react";
import styles from "./Why.module.css";

export const WhyWorkWithMe: React.FC = () => {
  const traits = [
    {
      icon: <Lightbulb size={24} />,
      title: "Creative & Analytical",
      description:
        "I merge imagination with logic to solve problems cleanly and effectively.",
      delay: 0.2,
    },
    {
      icon: <Clock size={24} />,
      title: "Reliable & Timely",
      description:
        "Deadlines are sacred. You’ll get clean, tested code when I say you will.",
      delay: 0.35,
    },
    {
      icon: <MessageSquareText size={24} />,
      title: "Clear Communicator",
      description:
        "I keep everyone in the loop — no tech jargon barrier, just clarity.",
      delay: 0.5,
    },
    {
      icon: <Users size={24} />,
      title: "Team Player",
      description:
        "I play well with others. Collaboration, encouragement, and results are my defaults.",
      delay: 0.65,
    },
  ];

  return (
    <section className={styles.reasonSection}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Why Work With Me
      </motion.h2>

      <motion.p
        className={styles.subheading}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        viewport={{ once: true }}
      >
        Not just code. Culture.
      </motion.p>

      <div className={styles.grid}>
        {traits.map((trait, idx) => (
          <motion.div
            className={styles.card}
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: trait.delay, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className={styles.icon}>{trait.icon}</div>
            <h3>{trait.title}</h3>
            <p>{trait.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        className={styles.quote}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        viewport={{ once: true }}
      >
        “Code is easy. People are hard — but worth it.”
      </motion.p>
    </section>
  );
};
