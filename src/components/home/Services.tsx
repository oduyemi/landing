"use client";
import { motion } from "framer-motion";
import { Palette, Code2, BarChart3, GraduationCap } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Web Design",
    description: "UI/UX, WordPress & Webflow",
  },
  {
    icon: Code2,
    title: "Software Development",
    description: "Frontend, backend, fullstack & mobile",
  },
  {
    icon: BarChart3,
    title: "Technical SEO & Analysis",
    description: "SEO, analytics & performance",
  },
  {
    icon: GraduationCap,
    title: "Training & Mentorship",
    description: "Corporate & private training",
  },
];

export const Services = () => {
  return (
    <section
      id="services"
      className="border-t border-neutral-200 px-5 py-6 sm:px-7"
    >
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <motion.div
              key={service.title}
              initial={{
                opacity: 0,
                y: 8,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group flex items-start gap-3"
            >
              <motion.div
                whileHover={{
                  scale: 1.08,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-black"
              >
                <Icon
                  size={13}
                  strokeWidth={1.6}
                />
              </motion.div>

              <div>
                <h2 className="text-[9px] font-semibold tracking-[-0.01em] text-black">
                  {service.title}
                </h2>

                <p className="mt-1 text-[8px] leading-[1.5] text-neutral-400 transition-colors duration-300 group-hover:text-neutral-600">
                  {service.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};