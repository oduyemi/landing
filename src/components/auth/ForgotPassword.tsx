"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { AuthBrand } from "./Brand";
import { AuthFooter } from "./Footer";
import { AuthInput } from "./Input";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

  };

  return (
    <div className="flex h-full flex-col">
      <AuthBrand />

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          delay: 0.18,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto mt-8 w-full max-w-[360px] md:mt-10"
      >
        <h1 className="text-[17px] font-semibold tracking-[-0.035em] text-black">
          Reset your password
        </h1>

        <p className="mt-1.5 max-w-[270px] text-[8px] leading-[1.55] text-neutral-400">
          Enter your email and we&apos;ll send you a link to reset
          your password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4"
        >
          <AuthInput
            id="email"
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <motion.button
            type="submit"
            whileHover={{
              y: -1,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="h-9 w-full rounded-[3px] bg-[#080b0d] text-[8px] font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Send reset link
          </motion.button>
        </form>

        <Link
          href="/login"
          className="mt-4 block text-center text-[7px] font-medium text-black transition-opacity hover:opacity-60"
        >
          Back to login
        </Link>
      </motion.div>

      <AuthFooter />
    </div>
  );
};