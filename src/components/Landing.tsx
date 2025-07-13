"use client";
import React from "react";
import { motion } from "framer-motion";
import { Inbox, Settings, CheckCircle2 } from "lucide-react";
import { NotifyDialog } from "./dialog/NotifyDialog";

const features = [
  {
    icon: <Inbox size={28} className="featureIcon" />,
    title: "Central Communication",
    description:
      "Securely send project files, updates, and messages — all in one place.",
  },
  {
    icon: <Settings size={28} className="featureIcon" />,
    title: "Project Tracking",
    description:
      "Monitor timelines, milestones, and deliverables as your project evolves.",
  },
  {
    icon: <CheckCircle2 size={28} className="featureIcon" />,
    title: "Client Collaboration",
    description:
      "Engage, review, and approve project assets in a dedicated space built just for you.",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export const Landing: React.FC = () => {
  return (
    <section className="landingpage">
      {/* Hero Section */}
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1 className="heading">
          Coming Soon: Project Portal 🚧
        </motion.h1>
        <motion.p
          className="subheading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          A personalized dashboard where clients can share files,
          track project milestones, and collaborate — all in real-time.
        </motion.p>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="featureGrid"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feat, index) => (
          <motion.div
            key={index}
            className="featureCard"
            variants={itemVariants}
          >
            {feat.icon}
            <h3>{feat.title}</h3>
            <p>{feat.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section with Notify Dialog */}
      <motion.div
        className="ctaSection"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="notifyText">Want to be the first to try it?</p>
        <NotifyDialog />
      </motion.div>
    </section>
  );
};
