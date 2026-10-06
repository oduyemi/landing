"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { AuthBrand } from "./Brand";
import { AuthFooter } from "./Footer";
import { PasswordInput } from "./PasswordInput";




export const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    // Add reset-password logic here.
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
          Set a new password
        </h1>

        <p className="mt-1.5 max-w-[280px] text-[8px] leading-[1.55] text-neutral-400">
          Your new password must be different from your
          previous one.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4"
        >
          <PasswordInput
            id="password"
            label="New password"
            placeholder="Create a new password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <PasswordInput
            id="confirm-password"
            label="Confirm password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
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
            Reset password
          </motion.button>
        </form>
      </motion.div>

      <AuthFooter />
    </div>
  );
};