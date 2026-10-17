"use client";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  FolderOpen,
  ListTodo,
  LoaderCircle,
  MessageSquare,
  Milestone,
  Upload,
  ArrowUpRight,
  Clock3,
  Layers3,
} from "lucide-react";

export interface ActivityItem {
  _id: string;
  type: string;
  action: string;
  title: string;
  description?: string;
  href?: string | null;
  createdAt: string;
  actor?: {
    _id: string;
    fname: string;
    lname: string;
    image?: string | null;
    role?: string;
  } | null;
  project?: {
    _id: string;
    title: string;
  } | null;
  task?: {
    _id: string;
    title: string;
  } | null;
}

function getActivityStyle(activity: ActivityItem) {
  if (activity.type === "message") {
    return {
      Icon: MessageSquare,
      icon: "bg-blue-50 text-blue-700 ring-blue-100",
      dot: "bg-blue-500",
      label: "Message",
    };
  }

  if (activity.type === "task") {
    return activity.action === "completed"
      ? {
          Icon: CheckCircle2,
          icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
          dot: "bg-emerald-500",
          label: "Task completed",
        }
      : {
          Icon: ListTodo,
          icon: "bg-amber-50 text-amber-700 ring-amber-100",
          dot: "bg-amber-500",
          label: "Task",
        };
  }

  if (activity.type === "file") {
    return {
      Icon: Upload,
      icon: "bg-violet-50 text-violet-700 ring-violet-100",
      dot: "bg-violet-500",
      label: "File",
    };
  }

  if (activity.type === "deliverable") {
    return {
      Icon: FileText,
      icon: "bg-indigo-50 text-indigo-700 ring-indigo-100",
      dot: "bg-indigo-500",
      label: "Deliverable",
    };
  }

  if (activity.type === "project") {
    return {
      Icon: BriefcaseBusiness,
      icon: "bg-sky-50 text-sky-700 ring-sky-100",
      dot: "bg-sky-500",
      label: "Project",
    };
  }

  if (activity.type === "milestone") {
    return {
      Icon: Milestone,
      icon: "bg-orange-50 text-orange-700 ring-orange-100",
      dot: "bg-orange-500",
      label: "Milestone",
    };
  }

  if (activity.type === "system") {
    return {
      Icon: Bell,
      icon: "bg-neutral-100 text-neutral-700 ring-neutral-200",
      dot: "bg-neutral-500",
      label: "System",
    };
  }

  return {
    Icon: FolderOpen,
    icon: "bg-neutral-100 text-neutral-700 ring-neutral-200",
    dot: "bg-neutral-500",
    label: "Workspace",
  };
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Earlier";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const eventDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (eventDay.getTime() === today.getTime()) return "Today";
  if (eventDay.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

function getActorName(activity: ActivityItem) {
  if (!activity.actor) return "Workspace";

  const name = [activity.actor.fname, activity.actor.lname]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Workspace member";
}

function getInitials(activity: ActivityItem) {
  const actor = activity.actor;

  if (!actor) return "WS";

  const first = actor.fname?.trim().charAt(0) ?? "";
  const last = actor.lname?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "WS";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export const ActivityTimeline = ({
  activities,
  loading,
}: {
  activities: ActivityItem[];
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-neutral-50/60 px-5 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-700 shadow-sm">
          <LoaderCircle size={21} className="animate-spin" />
        </div>

        <p className="mt-4 text-sm font-semibold text-neutral-800">
          Loading activity
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Gathering the latest workspace updates...
        </p>

        <div className="mt-6 w-full max-w-md space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3"
            >
              <div className="h-9 w-9 shrink-0 rounded-xl bg-neutral-100" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-3/5 rounded-full bg-neutral-100" />
                <div className="h-2 w-2/5 rounded-full bg-neutral-100" />
              </div>
              <div className="h-2 w-10 rounded-full bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-5 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 shadow-sm">
          <Activity size={24} strokeWidth={1.6} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-neutral-900">
          No activity yet
        </h3>

        <p className="mt-2 max-w-xs text-xs leading-6 text-neutral-500">
          Workspace updates will appear here as tasks progress, files are
          shared, and projects move forward.
        </p>
      </div>
    );
  }

  const groups = activities.reduce<Record<string, ActivityItem[]>>(
    (result, activity) => {
      const label = getDateLabel(activity.createdAt);
      (result[label] ??= []).push(activity);
      return result;
    },
    {}
  );

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([dateLabel, items]) => (
        <section key={dateLabel} aria-label={`${dateLabel} activity`}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 shadow-sm">
              <Clock3 size={14} />
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-neutral-900">
                {dateLabel}
              </h2>
              <p className="mt-0.5 text-[10px] text-neutral-400">
                {items.length} {items.length === 1 ? "event" : "events"}
              </p>
            </div>

            <div className="h-px flex-1 bg-neutral-100" />
          </div>

          <div className="relative ml-4 border-l border-neutral-200">
            <div className="space-y-2">
              {items.map((item, index) => {
                const style = getActivityStyle(item);
                const Icon = style.Icon;
                const actorName = getActorName(item);
                const isLinked = Boolean(item.href);

                const content = (
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    <div
                      className={`relative z-10 -ml-[17px] mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-4 ring-white transition duration-200 sm:h-9 sm:w-9 sm:-ml-[18px] ${style.icon}`}
                    >
                      <Icon size={15} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1 pb-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="break-words text-[13px] font-semibold leading-5 text-neutral-900">
                          {item.title}
                        </p>

                        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100/80 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                          {style.label}
                        </span>
                      </div>

                      {item.description && (
                        <p className="mt-1 max-w-3xl break-words text-xs leading-5 text-neutral-500">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div className="inline-flex min-w-0 items-center gap-2">
                          {item.actor?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.actor.image}
                              alt=""
                              loading="lazy"
                              className="h-6 w-6 shrink-0 rounded-full border border-neutral-200 object-cover"
                            />
                          ) : (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-[9px] font-semibold text-neutral-600">
                              {getInitials(item)}
                            </span>
                          )}

                          <span className="max-w-40 truncate text-[10px] font-medium text-neutral-600">
                            {actorName}
                          </span>
                        </div>

                        {item.project?.title && (
                          <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-neutral-100 bg-neutral-50 px-2 py-1 text-[10px] text-neutral-500">
                            <BriefcaseBusiness
                              size={11}
                              className="shrink-0 text-neutral-400"
                            />
                            <span className="max-w-44 truncate">
                              {item.project.title}
                            </span>
                          </span>
                        )}

                        {item.task?.title && (
                          <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-neutral-100 bg-neutral-50 px-2 py-1 text-[10px] text-neutral-500">
                            <ListTodo
                              size={11}
                              className="shrink-0 text-neutral-400"
                            />
                            <span className="max-w-44 truncate">
                              {item.task.title}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1 pt-1">
                      <time
                        dateTime={item.createdAt}
                        className="text-[10px] font-medium tabular-nums text-neutral-500"
                      >
                        {formatTime(item.createdAt)}
                      </time>

                      <span className="hidden text-[10px] text-neutral-400 sm:block">
                        {formatDate(item.createdAt)}
                      </span>

                      {isLinked && (
                        <ArrowUpRight
                          size={14}
                          aria-hidden="true"
                          className="mt-1 text-neutral-300 transition group-hover:text-neutral-700"
                        />
                      )}
                    </div>
                  </div>
                );

                return (
                  <article key={item._id} className="relative">
                    {item.href ? (
                      <a
                        href={item.href}
                        aria-label={`${item.title} — view details`}
                        className="group block rounded-2xl border border-transparent py-3 pl-0 pr-2 transition duration-200 hover:border-neutral-200 hover:bg-neutral-50/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 sm:py-4 sm:pl-1 sm:pr-4"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="rounded-2xl border border-transparent py-3 pl-0 pr-2 sm:py-4 sm:pl-1 sm:pr-4">
                        {content}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      <div className="flex items-center justify-center gap-2 border-t border-neutral-100 pt-5 text-[10px] text-neutral-400">
        <Layers3 size={13} />
        <span>
          Showing {activities.length} {activities.length === 1 ? "event" : "events"} in this view
        </span>
      </div>
    </div>
  );
};
