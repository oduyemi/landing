"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "./Skills.module.css";

const skills = [
  "JavaScript / TypeScript",
  "React / Next.js",
  "Node.js / Express",
  "MongoDB / PostgreSQL",
  "Docker / CI",
  "Git & GitHub",
];

export const AboutSkills: React.FC = () => {
  return (
    <section className={styles.skillsSection}>
      <motion.h2
        className={styles.heading}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Tools I Build With
      </motion.h2>

      <motion.ul
        className={styles.skillsList}
        initial="hidden"
        whileInView="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.1, delayChildren: 0.3 },
          },
        }}
        viewport={{ once: true }}
      >
        {skills.map((skill, idx) => (
          <motion.li
            key={idx}
            className={styles.skillItem}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {skill}
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
};
