"use client";
import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, BookText, Bot, Coffee } from "lucide-react";
import styles from "./About.module.css";

export const AboutMe: React.FC = () => {
  return (
    <section className={styles.aboutSection}>
      <motion.div
        className={styles.aboutContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.imageWrapper}>
          <motion.div
            className={styles.imageFrame}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <motion.img
              src="/images/dp.jpg"
              alt="Yemi smiling like they just fixed a production bug"
              className={styles.fullProfileImage}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </motion.div>
        </div>

        <div className={styles.textContent}>
          <motion.div
            className={styles.textBlock}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p>
              Hello! I&apos;m <span className={styles.highlight}>Yẹmí</span> — a full-stack developer,
              creative technologist, and part-time button clicker. I specialize in
              building sleek, functional web experiences that behave like they
              drank two cups of espresso.
            </p>
          </motion.div>

          <motion.div
            className={styles.textBlock}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p>
              Whether it&apos;s crafting a client dashboard, architecting a startup&apos;s first MVP, or breathing life into a quirky app idea — I bring ideas to life using industry-standard tools like <span className={styles.techHighlight}>React</span>, <span className={styles.techHighlight}>Next.js</span>, <span className={styles.techHighlight}>Vue</span>, <span className={styles.techHighlight}>Python</span>, <span className={styles.techHighlight}>Node.js</span>, <span className={styles.techHighlight}>TypeScript</span>, and <span className={styles.techHighlight}>Java</span>. 
              My experience spans modern frameworks and libraries such as <span className={styles.techHighlight}>Tailwind</span>, <span className={styles.techHighlight}>MUI</span>, <span className={styles.techHighlight}>Chakra</span>, and <span className={styles.techHighlight}>Shadcn</span>, with backend expertise in <span className={styles.techHighlight}>Express</span>, <span className={styles.techHighlight}>Tailwind</span>, <span className={styles.techHighlight}>MUI</span>, <span className={styles.techHighlight}>Chakra</span>, and <span className={styles.techHighlight}>Shadcn</span>, with backend expertise in <span className={styles.techHighlight}>Spring</span>, <span className={styles.techHighlight}>Flask</span>, <span className={styles.techHighlight}>FastAPI</span>, and databases like <span className={styles.techHighlight}>MySQL</span>, <span className={styles.techHighlight}>Postgres</span>, and <span className={styles.techHighlight}>MongoDB</span>.
            </p>
          </motion.div>

          <motion.div
            className={styles.textBlock}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p>
              My approach to problem-solving is rooted in a research-driven process where I dig deep into challenges to uncover the best solutions.
              From building new products from scratch to improving existing systems, I&apos;m committed to transforming innovative ideas into real-world applications.
              If you&apos;ve got a dream, I&apos;ve got the dev skills to make it click.
            </p>
          </motion.div>

          <motion.div
            className={styles.hobbiesSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <p className={styles.listIntro}>
              When I&apos;m not coding, I&apos;m usually found:
            </p>

            <ul className={styles.iconList}>
              <motion.li 
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Bot size={20} className={styles.icon} /> Arguing with AI (for fun)
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BookText size={20} className={styles.icon} /> Learning a new tool just to forget it in two weeks
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BrainCircuit size={20} className={styles.icon} /> Dreaming up yet another side project
              </motion.li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.ctaBlock}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p>
              Wanna build something awesome together? Just don&apos;t offer me coffee &#8209; it knocks me out faster than a power nap on a Monday <Coffee size={18} className={styles.icon} />.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};