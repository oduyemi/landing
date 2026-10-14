"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthBrand } from "./Brand";
import { AuthFooter } from "./Footer";
import { AuthInput } from "./Input";
import { PasswordInput } from "./PasswordInput";

type LoginStatus = "idle" | "loading" | "success";

export const LoginForm = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isBusy = isLoading || isSuccess;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isBusy) return;

    setError("");
    setStatus("loading");

    try {
      const result = await login(email.trim(), password);

      if (!result.success) {
        setError(result.error || "Invalid email or password.");
        setStatus("idle");
        return;
      }

      if (!result.user) {
        setError(
          "Login succeeded, but your account could not be loaded."
        );
        setStatus("idle");
        return;
      }

      let destination: string;

      if (result.user.role === "admin") {
        destination = "/admin";
      } else if (result.user.role === "user") {
        destination = "/client";
      } else {
        setError(
          "Your account has an invalid role. Please contact support."
        );
        setStatus("idle");
        return;
      }

      setStatus("success");

      // Keep the success feedback visible before navigating.
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 2000);
      });

      router.replace(destination);
    } catch {
      setError(
        "Something went wrong while signing in. Please try again."
      );
      setStatus("idle");
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <AuthBrand />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.12,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto mt-9 w-full max-w-[380px] px-1 sm:mt-12"
      >
        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-[-0.045em] text-neutral-950">
            Welcome back
          </h1>

          <p className="mt-2 max-w-[300px] text-[13px] leading-6 text-neutral-500">
            Sign in to manage your account, projects, and updates.
          </p>
        </div>

        {/* Status feedback */}
        <AnimatePresence mode="wait">
          {isSuccess && (
            <motion.div
              key="success"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
            >
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Login successful
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  You’re signed in. Taking you to your dashboard…
                </p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              role="alert"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <AuthInput
              id="email"
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isBusy}
            />

            <PasswordInput
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isBusy}
            />
          </div>

          <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={isBusy}
            whileHover={!isBusy ? { y: -1 } : undefined}
            whileTap={!isBusy ? { scale: 0.99 } : undefined}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                <span>Signing you in…</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={17} />
                <span>Login successful</span>
              </>
            ) : (
              <>
                <span>Sign in to your account</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </>
            )}
          </motion.button>

          <p className="text-center text-[11px] leading-5 text-neutral-400">
            Your account access is protected. Sign in using your registered
            credentials.
          </p>
        </form>
      </motion.div>

      <div className="mt-auto pt-10">
        <AuthFooter />
      </div>
    </div>
  );
};
