"use client";
import { motion } from "framer-motion";
import { FileCheck2 } from "lucide-react";

interface Action {
  title: string;
  project: string;
  deadline: string;
}

const actions: Action[] = [
  {
    title: "Approve homepage design",
    project: "Global Crossfire Church",
    deadline: "Due Sep 30",
  },
  {
    title: "Provide church email",
    project: "Global Crossfire Church",
    deadline: "Due Sep 30",
  },
];

export const ActionRequired = () => {
    return (
        <section className="rounded-[6px] border border-[#e7e7e7] bg-white">
        <div className="border-b border-[#eeeeee] px-4 py-3">
            <h2 className="text-[11px] font-semibold text-[#222]">
            Action Required
            </h2>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
            {actions.map((action, index) => (
            <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                duration: 0.25,
                delay: index * 0.05,
                }}
                className="flex items-center gap-3 px-4 py-3"
            >
                <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#e4e4e4]">
                <FileCheck2
                    className="h-[11px] w-[11px] text-[#444]"
                    strokeWidth={1.8}
                />
                </div>

                <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-[#333]">
                    {action.title}
                </p>

                <p className="mt-0.5 text-[10px] text-[#999]">
                    {action.project}
                </p>
                </div>

                <span className="whitespace-nowrap text-[10px] font-medium text-[#444]">
                {action.deadline}
                </span>
            </motion.div>
            ))}
        </div>
        </section>
    );
}