"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

import { AuthBrand } from "./Brand";
import { AuthFooter } from "./Footer";
import { AuthInput } from "./Input";
import { PasswordInput } from "./PasswordInput";

export const LoginForm = () => {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await login(
        email,
        password
      );

      if (!result.success) {
        setError(
          result.error ||
            "Invalid email or password."
        );

        return;
      }

      if (!result.user) {
        setError(
          "Login succeeded, but your account could not be loaded."
        );

        return;
      }

      /**
       * Role-based destination.
       */
      if (result.user.role === "admin") {
        router.replace("/admin");
        return;
      }

      if (result.user.role === "user") {
        router.replace("/client");
        return;
      }

      setError(
        "Your account has an invalid role. Please contact support."
      );
    } finally {
      setIsLoading(false);
    }
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
          Welcome back
        </h1>

        <p className="mt-1.5 text-[8px] leading-[1.5] text-neutral-400">
          Log in to access your client portal.
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
            disabled={isLoading}
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            disabled={isLoading}
          />

          <div className="-mt-1 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[7px] text-neutral-500 transition-colors hover:text-black"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -4,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-[3px] border border-red-100 bg-red-50 px-3 py-2 text-[7px] leading-[1.5] text-red-600"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={
              !isLoading
                ? {
                    y: -1,
                  }
                : undefined
            }
            whileTap={
              !isLoading
                ? {
                    scale: 0.985,
                  }
                : undefined
            }
            className="flex h-9 w-full items-center justify-center rounded-[3px] bg-[#080b0d] text-[8px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Log in"}
          </motion.button>
        </form>
      </motion.div>

      <AuthFooter />
    </div>
  );
};