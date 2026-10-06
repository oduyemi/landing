"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <section
      style={{
        minHeight: "82vh",
        background: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: 480 }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <Ghost size={64} strokeWidth={1.5} color="#111" />
        </div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            color: "#111",
            marginBottom: "1rem",
          }}
        >
          404 - You broke it 😬
        </h1>
        <p style={{ color: "#444", fontSize: "1rem", marginBottom: "2rem" }}>
          This page is either lost in the void... or you typed something funky. <br />
          Either way, let’s pretend it never happened.
        </p>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95, rotate: -1 }}
          onClick={() => router.push("/")}
          style={{
            backgroundColor: "#111",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: "999px",
            border: "none",
            fontSize: "0.95rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Get Me Outta Here 🏃‍♂️
        </motion.button>
      </motion.div>
    </section>
  );
};