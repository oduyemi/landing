"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, MoveDownRight, Plus } from "lucide-react";


const ease = [0.22, 1, 0.36, 1] as const;
const headingContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.09,
    },
  },
};

const headingLine = {
  hidden: {
    y: "105%",
    opacity: 0,
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.8,
      ease,
    },
  },
};

export const Hero = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-5 pb-12 pt-5 sm:px-7 sm:pb-14 sm:pt-6 lg:px-10 lg:pb-16 lg:pt-7"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.08fr] lg:gap-12 xl:grid-cols-[0.98fr_1.02fr] xl:gap-16">
            {/* LEFT */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="relative z-10 max-w-[570px]"
        >
          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: 10,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease,
                },
              },
            }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="absolute h-2 w-2 rounded-full bg-black/20 animate-ping" />

              <span className="relative h-1.5 w-1.5 rounded-full bg-black" />
            </span>

            <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Artisanery Tech
            </span>
          </motion.div>

          <motion.h1
            variants={headingContainer}
            initial="hidden"
            animate="visible"
            className="overflow-hidden text-[62px] font-medium leading-[0.88] tracking-[-0.07em] text-black sm:text-[72px] lg:text-[74px] xl:text-[82px]"
          >
            <span className="block overflow-hidden">
              <motion.span
                variants={headingLine}
                className="block"
              >
                Ideas.
              </motion.span>
            </span>

            <span className="block overflow-hidden">
              <motion.span
                variants={headingLine}
                className="block"
              >
                Design.
              </motion.span>
            </span>

            <span className="block overflow-hidden">
              <motion.span
                variants={headingLine}
                className="block text-neutral-400"
              >
                Development.
              </motion.span>
            </span>
          </motion.h1>

          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: 15,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.7,
                  delay: 0.18,
                  ease,
                },
              },
            }}
            className="mt-7 flex max-w-[475px] gap-4"
          >
            <div className="mt-1 hidden h-8 w-px bg-neutral-200 sm:block" />

            <p className="max-w-[420px] text-[11px] leading-[1.75] text-neutral-500 sm:text-[12px]">
              Thoughtful digital experiences built at the intersection
              of strategy, design and technology — for ambitious brands
              ready to move forward.
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: 15,
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.65,
                  delay: 0.25,
                  ease,
                },
              },
            }}
            className="mt-8 flex flex-wrap items-center gap-2.5"
          >
            <Link
              href="/client"
              className="group inline-flex h-10 items-center gap-2 rounded-[5px] bg-black px-4 text-[9px] font-semibold text-white shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
            >
              <span>Access Your Portal</span>

              <ArrowUpRight
                size={12}
                strokeWidth={1.7}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/contact"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-neutral-200 bg-white px-4 text-[9px] font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50"
            >
              Get in Touch

              <span className="h-px w-0 bg-black transition-all duration-300 group-hover:w-3" />
            </Link>
          </motion.div>
        </motion.div>

            {/* RIGHT  */}
        <motion.div
          initial={{
            opacity: 0,
            clipPath: "inset(0 0 100% 0)",
          }}
          animate={{
            opacity: 1,
            clipPath: "inset(0 0 0% 0)",
          }}
          transition={{
            duration: 1.1,
            delay: 0.25,
            ease,
          }}
          className="relative"
        >
          <div className="group relative overflow-hidden bg-neutral-100">
            <div className="aspect-[1.35/1] w-full overflow-hidden sm:aspect-[1.45/1]">
              <motion.img
                src="/images/hero.jpeg"
                alt="Website design displayed on a laptop"
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 1.4,
                  delay: 0.2,
                  ease,
                }}
                className="h-full w-full object-cover grayscale transition-[transform,filter] duration-1000 ease-out group-hover:scale-[1.025] group-hover:grayscale-[0.9]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
              <motion.div
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.9,
                  ease,
                }}
                className="absolute left-4 top-4 flex items-center gap-2 text-white"
              >
                <span className="text-[8px] font-medium tracking-[0.15em]">
                  01
                </span>

                <span className="h-px w-5 bg-white/60" />

                <span className="text-[7px] uppercase tracking-[0.15em] text-white/70">
                  Selected Work
                </span>
              </motion.div>

              <motion.div
                whileHover={{
                  scale: 1.08,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/10 text-white backdrop-blur-[3px] transition-colors duration-300 group-hover:bg-black/25"
              >
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.5}
                />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.85,
              ease,
            }}
            className="flex items-center justify-between border-b border-neutral-200 py-3"
          >
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-black">
                Digital Experience
              </p>

              <p className="mt-1 text-[8px] text-neutral-400">
                Strategy · Design · Development
              </p>
            </div>

            <motion.div
              animate={{
                x: [0, 3, 0],
                y: [0, 3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <MoveDownRight
                size={12}
                strokeWidth={1.4}
                className="text-neutral-400"
              />
            </motion.div>
          </motion.div>

          <div className="absolute -bottom-3 -right-3 hidden lg:block">
            <Plus
              size={14}
              strokeWidth={1}
              className="text-neutral-300"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};