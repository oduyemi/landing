"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
CheckCircle2,
Loader2,
Mail,
Send,
AlertCircle,
} from "lucide-react";

type ContactTopic =
| "General"
| "Software Development"
| "Technical SEO"
| "Training & Mentorship"
| "Others";

interface ContactFormData {
fullname: string;
email: string;
topic: ContactTopic;
subject: string;
message: string;
}

const initialForm: ContactFormData = {
fullname: "",
email: "",
topic: "General",
subject: "",
message: "",
};

export const ContactMe: React.FC = () => {
const [form, setForm] =
useState<ContactFormData>(initialForm);

const [isSubmitting, setIsSubmitting] =
useState(false);

const [success, setSuccess] = useState(false);

const [error, setError] = useState("");

const handleChange = (
event:
| React.ChangeEvent<HTMLInputElement>
| React.ChangeEvent<HTMLTextAreaElement>
| React.ChangeEvent<HTMLSelectElement>
) => {
const { name, value } = event.target;
setForm((current) => ({
  ...current,
  [name]: value,
}));

if (error) {
  setError("");
}

if (success) {
  setSuccess(false);
}

};

const handleSubmit = async (
event: React.FormEvent<HTMLFormElement>
) => {
event.preventDefault();

if (isSubmitting) return;

setIsSubmitting(true);
setError("");
setSuccess(false);

try {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullname: form.fullname.trim(),
      email: form.email.trim().toLowerCase(),
      topic: form.topic,
      subject: form.subject.trim(),
      message: form.message.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Unable to submit your message. Please try again."
    );
  }

  setSuccess(true);
  setForm(initialForm);
} catch (submitError) {
  console.error(
    "CONTACT FORM SUBMISSION ERROR:",
    submitError
  );

  setError(
    submitError instanceof Error
      ? submitError.message
      : "Something went wrong while sending your message."
  );
} finally {
  setIsSubmitting(false);
}

};

return ( <section
   id="contact"
   className="bg-white px-5 py-16 text-neutral-900 sm:px-8 lg:px-12 lg:py-18"
 > <div className="mx-auto max-w-6xl">
{/* Header */}
<motion.div
className="mx-auto max-w-2xl text-center"
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
viewport={{ once: true }}
> <span className="mb-4 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500">
Let's talk </span>

      <h2 className="text-4xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
        Get In Touch
      </h2>

      <p className="mt-4 text-base leading-7 text-neutral-500 sm:text-lg">
        If it&apos;s tech, teamwork, or transformation.
        I&apos;m here for it. Reach out.
      </p>
    </motion.div>

    {/* Contact information */}
    <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
      <motion.a
        href="mailto:hello@oduyemi.dev"
        className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-lg hover:shadow-black/[0.04]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
        }}
        viewport={{ once: true }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-neutral-900 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
          <Mail size={20} />
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight text-neutral-950">
          Personal
        </h3>

        <p className="mt-1 text-sm text-neutral-500">
          hello@oduyemi.dev
        </p>
      </motion.a>

      <motion.a
        href="mailto:info@artisanerytech.com"
        className="group rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-lg hover:shadow-black/[0.04]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.35,
          duration: 0.5,
        }}
        viewport={{ once: true }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-neutral-900 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
          <Mail size={20} />
        </div>

        <h3 className="mt-5 text-lg font-semibold tracking-tight text-neutral-950">
          Artisanery Tech
        </h3>

        <p className="mt-1 text-sm text-neutral-500">
          info@artisanerytech.com
        </p>
      </motion.a>
    </div>

    {/* Form */}
    <motion.div
      className="mx-auto mt-12 max-w-3xl"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{
        delay: 0.5,
        duration: 0.6,
      }}
      viewport={{ once: true }}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_70px_rgba(0,0,0,0.05)] sm:p-8 lg:p-10"
      >
        <div className="mb-8">
          <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
            Send a message
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            Tell me a little about what you&apos;d like
            to discuss.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Full name */}
          <div>
            <label
              htmlFor="fullname"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Full name
            </label>

            <input
              id="fullname"
              name="fullname"
              type="text"
              value={form.fullname}
              onChange={handleChange}
              placeholder="Your full name"
              required
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              required
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Topic */}
          <div>
            <label
              htmlFor="topic"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              What can I help with?
            </label>

            <select
              id="topic"
              name="topic"
              value={form.topic}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="General">
                General
              </option>

              <option value="Software Development">
                Software Development
              </option>

              <option value="Technical SEO">
                Technical SEO
              </option>

              <option value="Training & Mentorship">
                Training & Mentorship
              </option>

              <option value="Others">
                Others
              </option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Subject
            </label>

            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              placeholder="How can I help?"
              required
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Message */}
          <div className="sm:col-span-2">
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Message
            </label>

            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="What's on your mind?"
              rows={7}
              required
              disabled={isSubmitting}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </motion.div>
        )}

        {/* Success */}
        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-medium">
                Message sent successfully.
              </p>

              <p className="mt-0.5 text-emerald-600">
                Thanks for reaching out. I&apos;ll get
                back to you as soon as possible.
              </p>
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={
              !isSubmitting
                ? { y: -1 }
                : undefined
            }
            whileTap={
              !isSubmitting
                ? { scale: 0.985 }
                : undefined
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Sending...
              </>
            ) : (
              <>
                Send Message
                <Send size={16} />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  </div>
</section>
);
};
