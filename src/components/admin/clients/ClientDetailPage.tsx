"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Clock3,
  FolderKanban,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { ClientProfileHeader } from "./ClientProfileHeader";
import { ClientDetailTabs, type ClientDetailTab } from "./ClientDetailTabs";
import { ClientInformationCard } from "./InformationCard";
import { ClientProjectsCard } from "./ProjectsCard";
import { ClientRecentActivity } from "./RecentActivity";
import type { ClientActivity, ClientDetail, ClientProject } from "./ClientDetailTypes";
import { getClientFullName, getClientStatus } from "./ClientDetailTypes";


interface ApiEnvelope {
  success?: boolean;
  message?: string;
  error?: string;
  user?: unknown;
  client?: unknown;
  project?: unknown;
  projects?: unknown[];
  tasks?: unknown[];
  messages?: unknown[];
  files?: unknown[];
  data?: unknown;
  pagination?: { total?: number };
}

type AnyRecord = Record<string, unknown>;

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.065 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 9 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

function asRecord(value: unknown): AnyRecord | null {
  return value !== null && typeof value === "object"
    ? (value as AnyRecord)
    : null;
}

function idOf(value: unknown): string {
  if (typeof value === "string") return value;

  const record = asRecord(value);
  if (!record) return "";

  const id = record._id ?? record.id;

  return typeof id === "string"
    ? id
    : id == null
      ? ""
      : String(id);
}

function stringOf(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function dateOf(record: AnyRecord): string {
  return stringOf(record.createdAt) || stringOf(record.updatedAt);
}

function unwrapList(
  result: ApiEnvelope,
  key: "projects" | "tasks" | "messages" | "files"
): AnyRecord[] {
  const candidates = result[key];

  if (Array.isArray(candidates)) {
    return candidates
      .map(asRecord)
      .filter((item): item is AnyRecord => Boolean(item));
  }

  if (Array.isArray(result.data)) {
    return result.data
      .map(asRecord)
      .filter((item): item is AnyRecord => Boolean(item));
  }

  const nested = asRecord(result.data);
  const nestedItems = nested?.[key];

  if (Array.isArray(nestedItems)) {
    return nestedItems
      .map(asRecord)
      .filter((item): item is AnyRecord => Boolean(item));
  }

  return [];
}

function unwrapClient(result: ApiEnvelope): ClientDetail | null {
  const raw = result.client ?? result.user ?? result.data;
  const record = asRecord(raw);

  if (!record || !idOf(record)) return null;

  return {
    _id: idOf(record),
    fname: stringOf(record.fname),
    lname: stringOf(record.lname),
    email: stringOf(record.email),
    image: stringOf(record.image) || undefined,
    role: record.role === "admin" ? "admin" : "user",
    firstLogin:
      typeof record.firstLogin === "boolean"
        ? record.firstLogin
        : undefined,
    lastLogin: stringOf(record.lastLogin) || null,
    createdAt: stringOf(record.createdAt) || undefined,
    updatedAt: stringOf(record.updatedAt) || undefined,
    phone: stringOf(record.phone) || undefined,
    company: stringOf(record.company) || undefined,
    status: stringOf(record.status) || undefined,
    disabled:
      typeof record.disabled === "boolean"
        ? record.disabled
        : undefined,
    invited:
      typeof record.invited === "boolean"
        ? record.invited
        : undefined,
  };
}

function toProject(record: AnyRecord): ClientProject | null {
  const id = idOf(record);
  if (!id) return null;

  return {
    _id: id,
    title: stringOf(record.title, "Untitled project"),
    type: stringOf(record.type) || undefined,
    status: stringOf(record.status, "Planning"),
    progress:
      typeof record.progress === "number" ? record.progress : 0,
    startDate: stringOf(record.startDate) || undefined,
    deadline: stringOf(record.deadline) || undefined,
    createdAt: stringOf(record.createdAt) || undefined,
    updatedAt: stringOf(record.updatedAt) || undefined,
    client: record.client as ClientProject["client"],
  };
}

function projectBelongsToClient(
  record: AnyRecord,
  clientId: string
): boolean {
  return idOf(record.client) === clientId;
}

function activityFrom(
  record: AnyRecord,
  type: ClientActivity["type"],
  _clientId: string
): ClientActivity | null {
  const id = idOf(record);
  const createdAt = dateOf(record);

  if (!id || !createdAt) return null;

  const project = asRecord(record.project);
  const projectTitle = stringOf(project?.title);
  const sender = asRecord(record.sender);
  const actor = asRecord(record.uploadedBy) ?? sender;

  const taskTitle = stringOf(record.title);
  const fileName =
    stringOf(record.originalName) || stringOf(record.name);
  const messageContent = stringOf(record.content);

  const title =
    type === "file" || type === "deliverable"
      ? `Uploaded ${fileName || "a file"}`
      : type === "message"
        ? "Sent a message"
        : type === "task"
          ? `${
              stringOf(record.status) === "Completed"
                ? "Completed"
                : "Updated"
            } task: ${taskTitle || "Task"}`
          : type === "project"
            ? `${
                stringOf(record.status) === "Completed"
                  ? "Completed"
                  : "Updated"
              } project: ${stringOf(record.title, "Project")}`
            : stringOf(record.title, "Activity");

  const actorName = [
    stringOf(actor?.fname),
    stringOf(actor?.lname),
  ]
    .filter(Boolean)
    .join(" ");

  const description =
    type === "message"
      ? messageContent.slice(0, 100)
      : projectTitle || actorName || undefined;

  let href: string | undefined;

  if (type === "project") href = `/admin/projects/${id}`;
  else if (type === "task") href = "/admin/tasks";
  else if (type === "message") href = "/admin/messages";
  else if (type === "file" || type === "deliverable") {
    href = "/admin/files";
  }

  return {
    id: `${type}-${id}`,
    title,
    description,
    type,
    action: stringOf(record.action) || stringOf(record.status),
    createdAt,
    href,
    actorName: actorName || undefined,
  };
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof UserRound;
  loading?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e9e5e0] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d9cabc] hover:shadow-[0_8px_24px_rgba(40,30,20,0.04)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#827a72]">
            {label}
          </p>

          {loading ? (
            <div className="mt-3 h-7 w-20 animate-pulse rounded-md bg-[#f0eeeb]" />
          ) : (
            <p className="mt-2 truncate text-xl font-semibold tracking-[-0.04em] text-[#24211e]">
              {value}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#eee6dd] bg-[#f8f4ef] text-[#8b6b4f] transition-colors group-hover:bg-[#f0e6dc]">
          <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-[#999189]">
        {description}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading client profile"
      className="space-y-6"
    >
      <div className="h-4 w-36 animate-pulse rounded bg-[#ece9e5]" />

      <div className="rounded-2xl border border-[#eae6e1] bg-white p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-[#eeeae5]" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-5 w-44 max-w-full animate-pulse rounded bg-[#eeeae5]" />
            <div className="h-3 w-56 max-w-full animate-pulse rounded bg-[#f3f0ed]" />
            <div className="h-3 w-28 animate-pulse rounded bg-[#f3f0ed]" />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          <div className="h-9 w-28 animate-pulse rounded-xl bg-[#f0eeeb]" />
          <div className="h-9 w-28 animate-pulse rounded-xl bg-[#f0eeeb]" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-[#eae6e1] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-[#eae6e1] bg-white" />
        <div className="h-72 animate-pulse rounded-2xl border border-[#eae6e1] bg-white" />
      </div>

      <p className="text-xs text-[#938a80]">
        Loading client information and workspace activity...
      </p>
    </div>
  );
}

export const ClientDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [activeTab, setActiveTab] =
    useState<ClientDetailTab>("overview");
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [error, setError] = useState("");
  const [busy] = useState(false);
  const [notice, setNotice] = useState("");

  const loadClient = useCallback(async () => {
    if (!clientId) return;

    setLoadingClient(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${clientId}`, {
        credentials: "include",
        cache: "no-store",
      });

      const result = (await response
        .json()
        .catch(() => ({}))) as ApiEnvelope;

      if (!response.ok || result.success === false) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to load this client."
        );
      }

      const nextClient = unwrapClient(result);

      if (!nextClient) {
        throw new Error(
          "The client record was not found in the API response."
        );
      }

      setClient(nextClient);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this client."
      );
    } finally {
      setLoadingClient(false);
    }
  }, [clientId]);

  const loadRelated = useCallback(async () => {
    if (!clientId) return;

    setLoadingRelated(true);

    try {
      const endpoints = [
        fetch("/api/projects", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/tasks", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/messages", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/files", {
          credentials: "include",
          cache: "no-store",
        }),
      ];

      const responses = await Promise.allSettled(endpoints);

      const parsed = await Promise.all(
        responses.map(async (item) => {
          if (item.status !== "fulfilled" || !item.value.ok) {
            return null;
          }

          try {
            return (await item.value.json()) as ApiEnvelope;
          } catch {
            return null;
          }
        })
      );

      const projectRecords = parsed[0]
        ? unwrapList(parsed[0], "projects")
        : [];

      const clientProjects = projectRecords
        .filter((record) =>
          projectBelongsToClient(record, clientId)
        )
        .map(toProject)
        .filter(
          (project): project is ClientProject => Boolean(project)
        );

      setProjects(clientProjects);

      const taskRecords = parsed[1]
        ? unwrapList(parsed[1], "tasks")
        : [];

      const messageRecords = parsed[2]
        ? unwrapList(parsed[2], "messages")
        : [];

      const fileRecords = parsed[3]
        ? unwrapList(parsed[3], "files")
        : [];

      const projectIds = new Set(
        clientProjects.map((project) => project._id)
      );

      const belongsToClientProject = (record: AnyRecord) => {
        const projectId = idOf(record.project);
        return projectId !== "" && projectIds.has(projectId);
      };

      const nextActivities = [
        ...projectRecords
          .filter((record) =>
            projectBelongsToClient(record, clientId)
          )
          .map((record) =>
            activityFrom(record, "project", clientId)
          ),

        ...taskRecords
          .filter(belongsToClientProject)
          .map((record) => activityFrom(record, "task", clientId)),

        ...messageRecords
          .filter((record) => {
            const projectId = idOf(record.project);
            const senderId = idOf(record.sender);
            const recipientId = idOf(record.recipient);

            return (
              (projectId !== "" && projectIds.has(projectId)) ||
              senderId === clientId ||
              recipientId === clientId
            );
          })
          .map((record) =>
            activityFrom(record, "message", clientId)
          ),

        ...fileRecords
          .filter(belongsToClientProject)
          .map((record) =>
            activityFrom(
              record,
              stringOf(record.category) === "deliverable"
                ? "deliverable"
                : "file",
              clientId
            )
          ),
      ]
        .filter(
          (activity): activity is ClientActivity => Boolean(activity)
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      setActivities(nextActivities);
    } catch {
      setNotice(
        "Some related information could not be refreshed. The client profile may still be available."
      );
    } finally {
      setLoadingRelated(false);
    }
  }, [clientId]);

  useEffect(() => {
    void loadClient();
    void loadRelated();
  }, [loadClient, loadRelated]);

  const pageTitle = useMemo(
    () => (client ? getClientFullName(client) : "Client profile"),
    [client]
  );

  const clientStatus = client ? getClientStatus(client) : "";

  const handleSendInvitation = async () => {
    setNotice(
      "Invitation resend is not connected yet. Add a secure invitation endpoint before enabling this action."
    );
  };

  const handleToggleAccess = async () => {
    setNotice(
      "Access control is not connected yet. Add a persisted account status and an authorized admin endpoint before enabling this action."
    );
  };

  const handleEdit = () => {
    setNotice(
      "Account editing can be connected when your admin user-update endpoint is available."
    );
  };

  if (loadingClient) {
    return <LoadingSkeleton />;
  }

  if (error || !client) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[#e9e4de] bg-white px-5 py-14 text-center sm:py-16"
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#f4eee7] blur-3xl"
        />

        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#eee3d9] bg-[#faf6f1] text-[#96775c]">
          <UserRound size={24} strokeWidth={1.5} />
        </div>

        <h1 className="relative mt-5 text-xl font-semibold tracking-[-0.035em] text-[#24211e]">
          Unable to open client
        </h1>

        <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-[#817a73]">
          {error || "This client could not be found."}
        </p>

        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void loadClient()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e8e2dc] bg-white px-4 text-xs font-medium text-[#514940] transition hover:bg-[#faf7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a98a70]"
          >
            <RefreshCw size={14} />
            Try again
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/clients")}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#27231f] px-4 text-xs font-semibold text-white transition hover:bg-[#40372f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a98a70] focus-visible:ring-offset-2"
          >
            <ArrowLeft size={14} />
            Back to clients
          </button>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-[1800px] space-y-6 pb-8"
    >
      {/* Breadcrumb and page actions */}
      <motion.div
        variants={sectionVariants}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <button
          type="button"
          onClick={() => router.push("/admin/clients")}
          className="group inline-flex items-center gap-2 rounded-lg py-1.5 pr-2 text-xs font-medium text-[#81796f] transition hover:text-[#29231e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a98a70]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e9e4de] bg-white transition group-hover:border-[#d8c9bb] group-hover:bg-[#faf6f2]">
            <ArrowLeft size={14} />
          </span>

          <span>Client directory</span>

          <span className="text-[#c5bbb0]">/</span>

          <span className="max-w-[180px] truncate text-[#40372f]">
            {pageTitle}
          </span>
        </button>

        <button
          type="button"
          disabled={loadingRelated}
          onClick={() => void loadRelated()}
          className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#e8e3dd] bg-white px-3.5 text-[11px] font-medium text-[#665d54] transition hover:border-[#d7c7b8] hover:bg-[#faf7f4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={loadingRelated ? "animate-spin" : ""}
          />
          Refresh workspace
        </button>
      </motion.div>

      {/* Client profile */}
      <motion.section
        variants={sectionVariants}
        className="relative isolate overflow-hidden rounded-2xl border border-[#e9e4de] bg-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -right-16 -top-32 h-72 w-72 rounded-full bg-[#f4ece4] opacity-80 blur-3xl" />
          <div className="absolute right-64 top-16 h-32 w-32 rounded-full bg-[#fbf7f2] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#e5d6c8] to-transparent" />
        </div>

        <div className="p-3 sm:p-5 lg:p-6">
          <ClientProfileHeader
            client={client}
            busy={busy}
            onSendInvitation={handleSendInvitation}
            onToggleAccess={handleToggleAccess}
            onEdit={handleEdit}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece7] bg-[#fdfcfb] px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                client.disabled ||
                client.status?.toLowerCase() === "disabled"
                  ? "bg-rose-500"
                  : client.invited ||
                      client.status?.toLowerCase() === "invited"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />

            <span className="truncate text-[11px] text-[#756d64]">
              Account status:{" "}
              <span className="font-semibold text-[#40372f]">
                {clientStatus}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#968d83]">
            <ShieldCheck size={13} />
            Client account
          </div>
        </div>
      </motion.section>

      {/* Feedback notice */}
      {notice && (
        <motion.div
          variants={sectionVariants}
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-[#e8dfd5] bg-[#fbf8f4] p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#947557] shadow-sm">
            <CircleAlert size={17} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#4d3d2f]">
              Account update
            </p>
            <p className="mt-1 text-xs leading-5 text-[#796b5d]">
              {notice}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss account update"
            className="rounded-lg p-1.5 text-[#9a8b7d] transition hover:bg-white hover:text-[#554538]"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}

      {/* Summary cards */}
      <motion.section variants={sectionVariants}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a18a78]">
              Client snapshot
            </p>

            <h2 className="mt-1 text-base font-semibold tracking-[-0.025em] text-[#292521]">
              Account overview
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#ebe6e0] bg-white px-3 py-2">
            <Sparkles size={12} className="text-[#a18a78]" />
            <span className="text-[10px] font-medium text-[#81766b]">
              Profile insights
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Client projects"
            value={projects.length}
            description="Projects associated with this client"
            icon={FolderKanban}
            loading={loadingRelated}
          />

          <SummaryCard
            label="Recorded activities"
            value={activities.length}
            description="Project and workspace activity records"
            icon={Activity}
            loading={loadingRelated}
          />

          <SummaryCard
            label="Client since"
            value={formatDate(client.createdAt)}
            description="Account creation date"
            icon={CalendarDays}
          />

          <SummaryCard
            label="Last login"
            value={formatDate(client.lastLogin)}
            description="Most recently recorded sign-in"
            icon={Clock3}
          />
        </div>
      </motion.section>

      {/* Navigation tabs */}
      <motion.section
        variants={sectionVariants}
        className="min-w-0"
      >
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a18a78]">
            Client workspace
          </p>
          <p className="mt-1 text-xs text-[#8b837b]">
            Explore account details, related projects, and recent activity.
          </p>
        </div>

        <div className="min-w-0 overflow-x-auto rounded-xl border border-[#e9e5e0] bg-white px-2 py-1.5">
          <ClientDetailTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </motion.section>

      {/* Active tab content */}
      <motion.section
        key={activeTab}
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-w-0"
      >
        {activeTab === "overview" && (
          <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-5">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e5e0] bg-white">
              <div className="border-b border-[#f0ede9] px-4 py-4 sm:px-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a18a78]">
                  Account details
                </p>
                <h3 className="mt-1 text-sm font-semibold text-[#292521]">
                  Client information
                </h3>
              </div>

              <div className="min-w-0 p-3 sm:p-4">
                <ClientInformationCard client={client} />
              </div>
            </div>

            <div className="min-w-0 space-y-4">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e5e0] bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-[#f0ede9] px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a18a78]">
                      Delivery
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-[#292521]">
                      Client projects
                    </h3>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f2ed] text-[#927355]">
                    <FolderKanban size={15} />
                  </div>
                </div>

                <div className="min-w-0 p-3 sm:p-4">
                  <ClientProjectsCard
                    projects={projects}
                    loading={loadingRelated}
                    compact
                    onViewAll={() => setActiveTab("projects")}
                  />
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e5e0] bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-[#f0ede9] px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#a18a78]">
                      Timeline
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-[#292521]">
                      Recent activity
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("activity")}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-[#8a6c50] transition hover:bg-[#f8f3ee]"
                  >
                    View all
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="min-w-0 p-3 sm:p-4">
                  <ClientRecentActivity
                    activities={activities}
                    loading={loadingRelated}
                    compact
                    onViewAll={() => setActiveTab("activity")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e5e0] bg-white p-3 sm:p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f2ed] text-[#927355]">
                <FolderKanban size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#292521]">
                  Client projects
                </h3>
                <p className="mt-1 text-[11px] text-[#8b837b]">
                  {loadingRelated
                    ? "Loading related projects..."
                    : `${projects.length} ${
                        projects.length === 1 ? "project" : "projects"
                      } associated with this client`}
                </p>
              </div>
            </div>

            <ClientProjectsCard
              projects={projects}
              loading={loadingRelated}
              onViewAll={() => void loadRelated()}
            />
          </div>
        )}

        {activeTab === "activity" && (
          <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e5e0] bg-white p-3 sm:p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f2ed] text-[#927355]">
                <Activity size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#292521]">
                  Activity timeline
                </h3>
                <p className="mt-1 text-[11px] text-[#8b837b]">
                  {loadingRelated
                    ? "Loading workspace activity..."
                    : `${activities.length} recorded ${
                        activities.length === 1 ? "event" : "events"
                      }`}
                </p>
              </div>
            </div>

            <ClientRecentActivity
              activities={activities}
              loading={loadingRelated}
              onViewAll={() => void loadRelated()}
            />
          </div>
        )}
      </motion.section>

      {/* Footer */}
      <motion.footer
        variants={sectionVariants}
        className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ebe7e2] pt-4"
      >
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-[#756c63]">
            {pageTitle}
          </p>
          <p className="mt-1 text-[10px] text-[#a0978d]">
            Client account · {clientStatus}
          </p>
        </div>

        <button
          type="button"
          disabled={loadingRelated}
          onClick={() => void loadRelated()}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-[10px] font-medium text-[#81766b] transition hover:bg-[#f5f1ec] hover:text-[#40372f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={12}
            className={loadingRelated ? "animate-spin" : ""}
          />
          Refresh related data
        </button>
      </motion.footer>
    </motion.main>
  );
};