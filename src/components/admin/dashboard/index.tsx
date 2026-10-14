"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckSquare,
  CircleCheck,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import DashboardStatCard from "./StatsCard";
import ProjectsRequiringAttention from "./RequiringAttention";
import AdminRecentActivity from "./RecentActivity";

interface DashboardStats {
  clients: number;
  activeProjects: number;
  pendingTasks: number;
  unreadMessages: number;
}

type ApiRecord = Record<string, unknown>;

interface ApiResponse {
  success?: boolean;
  error?: string;
  clients?: ApiRecord[];
  users?: ApiRecord[];
  projects?: ApiRecord[];
  tasks?: ApiRecord[];
  messages?: ApiRecord[];
  unreadCount?: number;
  count?: number;
  total?: number;
  pagination?: {
    total?: number;
  };
  data?: unknown;
}

interface CurrentUser {
  fname?: string;
  lname?: string;
}

interface AuthResponse {
  user?: CurrentUser;
  fname?: string;
}

function getTimeBasedGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";

  return "Good night";
}
const initialStats: DashboardStats = {
  clients: 0,
  activeProjects: 0,
  pendingTasks: 0,
  unreadMessages: 0,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

function asRecord(value: unknown): ApiRecord | null {
  return value !== null && typeof value === "object"
    ? (value as ApiRecord)
    : null;
}

function readArray(
  result: ApiResponse | null,
  keys: string[]
): ApiRecord[] {
  if (!result) return [];

  for (const key of keys as (keyof ApiResponse)[]) {
    const value = result[key];

    if (Array.isArray(value)) {
      return value.filter(
        (item): item is ApiRecord => asRecord(item) !== null
      );
    }
  }

  const nested = asRecord(result.data);

  if (nested) {
    for (const key of keys) {
      const value = nested[key];

      if (Array.isArray(value)) {
        return value.filter(
          (item): item is ApiRecord => asRecord(item) !== null
        );
      }
    }
  }

  if (Array.isArray(result.data)) {
    return result.data.filter(
      (item): item is ApiRecord => asRecord(item) !== null
    );
  }

  return [];
}

async function fetchDashboardEndpoint(
  url: string,
  signal: AbortSignal
): Promise<ApiResponse | null> {
  try {
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      signal,
    });

    if (!response.ok) return null;

    return (await response.json()) as ApiResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    return null;
  }
}

function unreadMessageCount(result: ApiResponse | null): number {
  if (!result) return 0;

  if (typeof result.unreadCount === "number") {
    return Math.max(0, result.unreadCount);
  }

  const messages = readArray(result, ["messages"]);

  return messages.filter((message) => message.read === false).length;
}

function pendingTaskCount(result: ApiResponse | null): number {
  if (!result) return 0;

  if (typeof result.count === "number") {
    return Math.max(0, result.count);
  }

  if (typeof result.total === "number") {
    return Math.max(0, result.total);
  }

  if (typeof result.pagination?.total === "number") {
    return Math.max(0, result.pagination.total);
  }

  const tasks = readArray(result, ["tasks"]);

  return tasks.filter((task) => {
    const status = String(task.status ?? "").toLowerCase();

    return !["completed", "cancelled", "canceled"].includes(status);
  }).length;
}

function clientCount(result: ApiResponse | null): number {
  if (!result) return 0;

  if (typeof result.total === "number") {
    return Math.max(0, result.total);
  }

  if (typeof result.pagination?.total === "number") {
    return Math.max(0, result.pagination.total);
  }

  return readArray(result, ["clients", "users"]).length;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [partialFailure, setPartialFailure] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    let isMounted = true;
  
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
  
        if (!response.ok) return;
  
        const result = (await response.json()) as AuthResponse;
  
        if (!isMounted) return;
  
        const name = result.user?.fname ?? result.fname ?? "";
  
        setFirstName(name.trim());
      } catch {
      }
    }
  
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };
  
    updateGreeting();
    void loadCurrentUser();
    const interval = window.setInterval(updateGreeting, 60_000);  
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);

      const results = await Promise.all([
        fetchDashboardEndpoint(
          "/api/users?role=user",
          controller.signal
        ),
        fetchDashboardEndpoint(
          "/api/projects",
          controller.signal
        ),
        fetchDashboardEndpoint(
          "/api/tasks/action-required",
          controller.signal
        ),
        fetchDashboardEndpoint(
          "/api/messages?limit=100",
          controller.signal
        ),
      ]);

      if (controller.signal.aborted) return;

      const [
        clientsResult,
        projectsResult,
        tasksResult,
        messagesResult,
      ] = results;

      const projects = readArray(projectsResult, ["projects"]);

      const activeProjects = projects.filter((project) => {
        const status = String(project.status ?? "").toLowerCase();

        return !["completed", "cancelled", "canceled"].includes(status);
      }).length;

      setStats({
        clients: clientCount(clientsResult),
        activeProjects,
        pendingTasks: pendingTaskCount(tasksResult),
        unreadMessages: unreadMessageCount(messagesResult),
      });

      setPartialFailure(results.some((result) => result === null));
      setLoading(false);
    }

    void loadDashboard();

    return () => controller.abort();
  }, []);

  const attentionCount = stats.pendingTasks + stats.unreadMessages;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-[1800px] space-y-7 pb-8"
    >
      {/* Welcome panel */}
      <motion.section
        variants={itemVariants}
        className="relative isolate overflow-hidden rounded-2xl border border-[#e9e7e4] bg-white"
      >
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -right-16 -top-36 h-80 w-80 rounded-full bg-[#f5eee9] opacity-80 blur-3xl" />
          <div className="absolute right-48 top-10 h-36 w-36 rounded-full bg-[#faf5f0] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#ded3c8] to-transparent" />
        </div>

        <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.045em] text-[#191919] sm:text-[30px]">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#77736f]">
              Your workspace at a glance. Keep track of client
              relationships, project progress, and the tasks that need
              your attention.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start rounded-xl border border-[#ebe6e1] bg-white/90 px-4 py-3 shadow-sm lg:self-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6eee8] text-[#945b38]">
              <Activity size={19} aria-hidden="true" />
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#96908a]">
                Needs attention
              </p>
              <p className="mt-0.5 text-lg font-semibold tracking-tight text-[#25211e]">
                {loading ? (
                  <span className="inline-block h-5 w-10 animate-pulse rounded bg-[#eee9e4]" />
                ) : (
                  attentionCount.toLocaleString()
                )}
                <span className="ml-1.5 text-xs font-normal text-[#8a8179]">
                  items
                </span>
              </p>
            </div>

            {!loading && (
              <div
                className={`ml-1 flex h-8 w-8 items-center justify-center rounded-full ${
                  attentionCount > 0
                    ? "bg-[#f8eee6] text-[#a3633b]"
                    : "bg-[#eaf5ee] text-[#39805a]"
                }`}
              >
                {attentionCount > 0 ? (
                  <ArrowUpRight size={16} aria-hidden="true" />
                ) : (
                  <CircleCheck size={16} aria-hidden="true" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eeeb] bg-[#fdfcfb] px-5 py-3 sm:px-7 lg:px-8">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                partialFailure ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span className="text-[11px] text-[#77736f]">
              {loading
                ? "Loading workspace data..."
                : partialFailure
                  ? "Some information may be out of date"
                  : "Workspace overview"}
            </span>
          </div>

          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#aaa39c]">
            Admin workspace
          </span>
        </div>
      </motion.section>

      {/* Statistics heading */}
      <motion.section variants={itemVariants}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a18a78]">
              Performance snapshot
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-[-0.025em] text-[#252525]">
              Your workspace metrics
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#85817d]">
              A quick overview of your clients, projects, and workload.
            </p>
          </div>

          <div className="hidden items-center gap-1.5 rounded-lg border border-[#ece9e5] bg-white px-3 py-2 sm:flex">
            <Activity size={13} className="text-[#a18a78]" />
            <span className="text-[10px] font-medium text-[#77716b]">
              Key metrics
            </span>
          </div>
        </div>

        <div
          aria-label="Workspace statistics"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4"
        >
          <DashboardStatCard
            label="Total Clients"
            value={stats.clients}
            description="Registered client accounts"
            icon={Users}
            loading={loading}
            href="/admin/client"
          />

          <DashboardStatCard
            label="Active Projects"
            value={stats.activeProjects}
            description="Projects not yet completed"
            icon={BriefcaseBusiness}
            loading={loading}
            href="/admin/projects"
          />

          <DashboardStatCard
            label="Pending Tasks"
            value={stats.pendingTasks}
            description="Tasks requiring action"
            icon={CheckSquare}
            loading={loading}
            href="/admin/tasks"
          />

          <DashboardStatCard
            label="Unread Messages"
            value={stats.unreadMessages}
            description="Messages awaiting a response"
            icon={MessageSquare}
            loading={loading}
            href="/admin/messages"
          />
        </div>
      </motion.section>

      {/* Partial API failure */}
      {partialFailure && (
        <motion.div
          variants={itemVariants}
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3"
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Activity size={14} aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs font-semibold text-amber-900">
              Some figures could not be refreshed
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800/80">
              Available figures are still shown. Some statistics may
              be incomplete until the affected services respond.
            </p>
          </div>
        </motion.div>
      )}

      {/* Dashboard content */}
      <motion.section
        variants={itemVariants}
        className="min-w-0"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a18a78]">
              Daily operations
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-[-0.025em] text-[#252525]">
              What needs your attention
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#85817d]">
              Stay on top of project progress and recent workspace activity.
            </p>
          </div>

          {!loading && attentionCount === 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
              <CircleCheck
                size={13}
                className="text-emerald-600"
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium text-emerald-700">
                No outstanding items
              </span>
            </div>
          )}

          {!loading && attentionCount > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#eee5dc] bg-[#fbf7f2] px-3 py-1.5">
              <ArrowDownRight
                size={13}
                className="text-[#9c704d]"
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium text-[#876449]">
                {attentionCount} items to review
              </span>
            </div>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)] 2xl:gap-5">
          <div className="min-w-0 overflow-hidden rounded-2xl">
            <ProjectsRequiringAttention />
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl">
            <AdminRecentActivity />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}