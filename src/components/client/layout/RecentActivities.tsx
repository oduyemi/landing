"use client";
import { motion } from "framer-motion";
import { FileText, MessageSquare, Upload } from "lucide-react";

interface Activity {
  text: string;
  time: string;
  icon: typeof Upload;
}

const activities: Activity[] = [
  {
    text: "Yemi uploaded homepage-v2.png",
    time: "2 hours ago",
    icon: Upload,
  },
  {
    text: "You commented on Homepage",
    time: "5 hours ago",
    icon: MessageSquare,
  },
  {
    text: "Project moved to Client Review",
    time: "1 day ago",
    icon: FileText,
  },
];


export const RecentActivity = () => {
  return (
    <section className="rounded-[6px] border border-[#e7e7e7] bg-white">
      <div className="border-b border-[#eeeeee] px-4 py-3">
        <h2 className="text-[11px] font-semibold text-[#222]">
          Recent Activity
        </h2>
      </div>

      <div className="divide-y divide-[#f0f0f0]">
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <motion.div
              key={activity.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: index * 0.05,
              }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#e4e4e4]">
                <Icon
                  className="h-[10px] w-[10px] text-[#555]"
                  strokeWidth={1.8}
                />
              </div>

              <p className="min-w-0 flex-1 truncate text-[10px] text-[#555]">
                {activity.text}
              </p>

              <span className="whitespace-nowrap text-[10px] text-[#999]">
                {activity.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}