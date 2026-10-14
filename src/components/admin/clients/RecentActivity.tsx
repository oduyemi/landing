"use client";
import Link from "next/link";
import {ArrowRight, Bell, CheckCircle2, FileUp, MessageCircle, Plus, RefreshCw} from "lucide-react";
import type { ClientActivity, ClientProject } from "./ClientDetailTypes";
import { formatRelativeTime } from "./ClientDetailTypes";


interface ClientRecentActivityProps {
  activities: ClientActivity[];
  loading?: boolean;
  onViewAll?: () => void;
  compact?: boolean;
}



function ActivityIcon({ activity }: { activity: ClientActivity }) {
  const action = activity.action?.toLowerCase() ?? "";

  if (activity.type === "file" || activity.type === "deliverable") {
    return <FileUp size={12} />;
  }

  if (activity.type === "message") {
    return <MessageCircle size={12} />;
  }

  if (action.includes("completed")) {
    return <CheckCircle2 size={12} />;
  }

  if (action.includes("created")) {
    return <Plus size={12} />;
  }

  if (activity.type === "task") {
    return <CheckCircle2 size={12} />;
  }

  return <Bell size={12} />;
}

export const ClientRecentActivity = ({
  activities,
  loading = false,
  onViewAll,
  compact = false,
}: ClientRecentActivityProps) => {
  const visibleActivities = compact ? activities.slice(0, 4) : activities;

  return (
    <section className="rounded-[6px] border border-[#e8e8e8] bg-white">
      <div className="flex items-center justify-between border-b border-[#eeeeee] px-4 py-3">
        <h2 className="text-[10px] font-semibold text-[#292929]">
          Recent Activity
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-[9px] text-[#777] hover:text-[#111]"
        >
          View all <ArrowRight size={10} />
        </button>
      </div>

      <div className="divide-y divide-[#f1f1f1] px-4">
        {loading &&
          Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
            <div key={index} className="flex gap-2.5 py-3">
              <div className="h-6 w-6 animate-pulse rounded-[4px] bg-[#f0f0f0]" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-2.5 w-3/4 animate-pulse rounded bg-[#f0f0f0]" />
                <div className="h-2 w-1/3 animate-pulse rounded bg-[#f5f5f5]" />
              </div>
            </div>
          ))}

        {!loading && visibleActivities.length === 0 && (
          <div className="py-8 text-center">
            <RefreshCw size={16} className="mx-auto text-[#bbb]" />
            <p className="mt-2 text-[10px] text-[#777]">
              No recent activity
            </p>
            <p className="mt-1 text-[9px] text-[#aaa]">
              Activity will appear here as work progresses.
            </p>
          </div>
        )}

        {!loading &&
          visibleActivities.map((activity) => {
            const content = (
              <div className="flex min-w-0 items-start gap-2.5 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border border-[#ededed] bg-[#fafafa] text-[#666]">
                  <ActivityIcon activity={activity} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] leading-4 text-[#444]">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="mt-0.5 truncate text-[9px] text-[#999]">
                      {activity.description}
                    </p>
                  )}
                </div>

                <time
                  dateTime={activity.createdAt}
                  className="shrink-0 pt-0.5 text-[8px] text-[#999]"
                >
                  {formatRelativeTime(activity.createdAt)}
                </time>
              </div>
            );

            return activity.href ? (
              <Link
                key={activity.id}
                href={activity.href}
                className="block transition-colors hover:bg-[#fdfdfd]"
              >
                {content}
              </Link>
            ) : (
              <div key={activity.id}>{content}</div>
            );
          })}
      </div>
    </section>
  );
}

export type { ClientProject };
