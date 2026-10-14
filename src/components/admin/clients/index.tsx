"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  Sparkles,
  UserCheck,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { ClientsToolbar, type ClientFilter} from "./ClientsToolbar";
import { ClientsTable, type AdminClient } from "./ClientsTable";
import { ClientsPagination } from "./Pagination";
import { AddClientDialog } from "./AddClientDialog";

type ClientStatus = Exclude<ClientFilter, "All">;


interface ClientsApiResponse {
  success?: boolean;
  clients?: AdminClient[];
  users?: AdminClient[];
  data?:
    | AdminClient[]
    | {
        clients?: AdminClient[];
        users?: AdminClient[];
      };
  pagination?: {
    total?: number;
  };
  total?: number;
  error?: string;
  message?: string;
}

const PAGE_SIZE = 8;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

function extractClients(result: ClientsApiResponse): AdminClient[] {
  if (Array.isArray(result.clients)) return result.clients;
  if (Array.isArray(result.users)) return result.users;
  if (Array.isArray(result.data)) return result.data;

  if (result.data && !Array.isArray(result.data)) {
    if (Array.isArray(result.data.clients)) {
      return result.data.clients;
    }

    if (Array.isArray(result.data.users)) {
      return result.data.users;
    }
  }

  return [];
}

function normalizedStatus(client: AdminClient): ClientStatus {
  if (
    client.disabled ||
    client.status?.toLowerCase() === "disabled"
  ) {
    return "Disabled";
  }

  if (
    client.invited ||
    client.status?.toLowerCase() === "invited"
  ) {
    return "Invited";
  }

  return "Active";
}

function OverviewCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  loading,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Users;
  tone: "neutral" | "green" | "amber" | "rose";
  loading: boolean;
}) {
  const tones = {
    neutral: {
      icon: "bg-[#f2eee9] text-[#826b58]",
      accent: "bg-[#d9c6b4]",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-300",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      accent: "bg-amber-300",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700",
      accent: "bg-rose-300",
    },
  };

  const style = tones[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#eae7e3] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d8cabe] hover:shadow-[0_8px_24px_rgba(35,27,20,0.045)] sm:p-5">
      <div
        className={`absolute inset-x-0 top-0 h-[2px] ${style.accent} opacity-70 transition-opacity group-hover:opacity-100`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#77716b]">
            {label}
          </p>

          {loading ? (
            <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-[#f0eeeb]" />
          ) : (
            <p className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-[#201e1c] tabular-nums">
              {value.toLocaleString()}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-[#938c85]">
        {description}
      </p>
    </div>
  );
}

export const AdminClientsPage = () => {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ClientFilter>("All");
  const [page, setPage] = useState(1);
  const [totalFromApi, setTotalFromApi] = useState<number | null>(null);

  const [creationNotice, setCreationNotice] = useState<{
    message: string;
    emailSent: boolean;
  } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] =
    useState<AdminClient | null>(null);
  const [actionError, setActionError] = useState("");

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users?role=user", {
        credentials: "include",
        cache: "no-store",
      });

      const result = (await response
        .json()
        .catch(() => ({}))) as ClientsApiResponse;

      if (!response.ok || result.success === false) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to load clients."
        );
      }

      setClients(extractClients(result));

      const apiTotal =
        typeof result.pagination?.total === "number"
          ? result.pagination.total
          : typeof result.total === "number"
            ? result.total
            : null;

      setTotalFromApi(apiTotal);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load clients."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const name =
        `${client.fname ?? ""} ${client.lname ?? ""}`.toLowerCase();

      const email = String(client.email ?? "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query);

      const matchesFilter =
        filter === "All" ||
        normalizedStatus(client) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [clients, search, filter]);


const statusCounts = useMemo<Record<ClientStatus, number>>(() => {
  return clients.reduce(
    (counts, client) => {
      counts[normalizedStatus(client)] += 1;
      return counts;
    },
    {
      Active: 0,
      Invited: 0,
      Disabled: 0,
    }
  );
}, [clients]);
  const pageCount = Math.max(
    1,
    Math.ceil(filteredClients.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, pageCount);

  const visibleClients = filteredClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const openAddDialog = () => {
    setEditingClient(null);
    setActionError("");
    setCreationNotice(null);
    setDialogOpen(true);
  };

  const openEditDialog = (client: AdminClient) => {
    setEditingClient(client);
    setActionError("");
    setCreationNotice(null);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (client: AdminClient) => {
    setActionError(
      `Account status changes for ${client.fname} ${client.lname} require a status field and an authorized server endpoint.`
    );
  };

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-[1800px] space-y-6 pb-8"
    >
      {/* Page heading */}
      <motion.section
        variants={itemVariants}
        className="relative isolate overflow-hidden rounded-2xl border border-[#e9e4de] bg-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -right-16 -top-28 h-64 w-64 rounded-full bg-[#f4ece4] opacity-80 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#e6d8ca] to-transparent" />
        </div>

        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="flex min-w-0 items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e9dfd5] bg-white/90 text-[#89694f] shadow-sm sm:flex">
              <Users size={22} strokeWidth={1.6} />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#91877e]">
                <span>Workspace</span>
                <span className="text-[#c5b9ad]">/</span>
                <span className="text-[#6d5b4c]">Clients</span>
              </div>

              <h1 className="text-2xl font-semibold tracking-[-0.045em] text-[#211e1b] sm:text-[30px]">
                Client management
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#817a73]">
                Manage client accounts, review invitations, and keep
                your client relationships organized in one place.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddDialog}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#27231f] px-5 py-3 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#40372f] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a98a70] focus-visible:ring-offset-2"
          >
            <UserRoundPlus size={16} />
            Add new client
            <ArrowUpRight size={14} className="ml-1 text-white/65" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ece7] bg-[#fdfcfb] px-5 py-3 sm:px-7 lg:px-8">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                error
                  ? "bg-rose-500"
                  : loading
                    ? "animate-pulse bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />

            <span className="text-[11px] text-[#77716b]">
              {error
                ? "Unable to refresh client data"
                : loading
                  ? "Loading client directory..."
                  : "Client directory"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#a09890]">
            <Sparkles size={12} />
            Client workspace
          </div>
        </div>
      </motion.section>

      {/* Client statistics */}
      <motion.section variants={itemVariants}>
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a18a78]">
            Directory overview
          </p>

          <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-base font-semibold tracking-[-0.025em] text-[#292521]">
              Client accounts
            </h2>

            <p className="text-[11px] text-[#928b84]">
              {loading
                ? "Updating statistics..."
                : `${filteredClients.length.toLocaleString()} matching ${
                    filteredClients.length === 1
                      ? "account"
                      : "accounts"
                  }`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            label="Total clients"
            value={totalFromApi ?? clients.length}
            description="Client accounts in the directory"
            icon={Users}
            tone="neutral"
            loading={loading}
          />

          <OverviewCard
            label="Active accounts"
            value={statusCounts.Active}
            description="Accounts currently marked active"
            icon={UserCheck}
            tone="green"
            loading={loading}
          />

          <OverviewCard
            label="Pending invitations"
            value={statusCounts.Invited}
            description="Accounts awaiting acceptance"
            icon={ArrowDownRight}
            tone="amber"
            loading={loading}
          />

          <OverviewCard
            label="Disabled accounts"
            value={statusCounts.Disabled}
            description="Accounts marked as disabled"
            icon={Ban}
            tone="rose"
            loading={loading}
          />
        </div>
      </motion.section>

      {/* Feedback messages */}
      {creationNotice && (
        <motion.div
          variants={itemVariants}
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <CheckCircle2 size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-900">
              Client saved successfully
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-800">
              {creationNotice.message}
            </p>

            <p className="mt-1 text-[11px] text-emerald-700">
              {creationNotice.emailSent
                ? "The onboarding email was sent."
                : "The client was saved, but the onboarding email was not confirmed as sent."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreationNotice(null)}
            aria-label="Dismiss success message"
            className="rounded-lg p-1.5 text-emerald-700 transition hover:bg-emerald-100"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}

      {actionError && (
        <motion.div
          variants={itemVariants}
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4"
        >
          <CircleAlert
            size={17}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <p className="flex-1 text-xs leading-5 text-amber-900">
            {actionError}
          </p>

          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss message"
            className="shrink-0 rounded-lg p-1 text-amber-700 transition hover:bg-amber-100"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div
          variants={itemVariants}
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-700 shadow-sm">
            <CircleAlert size={17} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-rose-900">
              We couldn&apos;t load the client directory
            </p>
            <p className="mt-1 break-words text-xs leading-5 text-rose-800">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadClients()}
            disabled={loading}
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />
            Try again
          </button>
        </motion.div>
      )}

      {/* Directory toolbar and table */}
      <motion.section
        variants={itemVariants}
        className="min-w-0 overflow-hidden rounded-2xl border border-[#e9e6e2] bg-white shadow-[0_2px_12px_rgba(30,24,18,0.025)]"
      >
        <div className="border-b border-[#efedea] px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.02em] text-[#292521]">
                All clients
              </h2>

              <p className="mt-1 text-[11px] leading-5 text-[#89827b]">
                Search accounts, filter by status, or edit client details.
              </p>
            </div>

            <div className="rounded-lg border border-[#ece7e2] bg-[#faf8f6] px-3 py-2">
              <span className="text-[11px] font-medium tabular-nums text-[#766b60]">
                {loading
                  ? "Loading..."
                  : `${filteredClients.length.toLocaleString()} results`}
              </span>
            </div>
          </div>

          <ClientsToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            onAddClient={openAddDialog}
          />
        </div>

        <div className="min-w-0">
          <ClientsTable
            clients={visibleClients}
            loading={loading}
            onEdit={openEditDialog}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        <div className="border-t border-[#efedea] bg-[#fdfcfb] px-4 py-3 sm:px-5">
          <ClientsPagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={filteredClients.length}
            onPageChange={setPage}
          />
        </div>
      </motion.section>

      {/* Server pagination notice */}
      {totalFromApi !== null && totalFromApi > clients.length && (
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-3 rounded-xl border border-[#e9e4de] bg-[#faf8f5] p-4"
        >
          <CircleAlert
            size={16}
            className="mt-0.5 shrink-0 text-[#90745b]"
          />

          <p className="text-[11px] leading-5 text-[#766d64]">
            The API reports{" "}
            <strong className="font-semibold text-[#4d443c]">
              {totalFromApi.toLocaleString()} clients
            </strong>
            , but only {clients.length.toLocaleString()} were returned.
            If your endpoint paginates results, connect server-side
            pagination to browse the complete directory.
          </p>
        </motion.div>
      )}

      <AddClientDialog
        open={dialogOpen}
        client={editingClient}
        onClose={() => setDialogOpen(false)}
        onSaved={(message, emailSent) => {
          setCreationNotice({ message, emailSent });
          setDialogOpen(false);
          void loadClients();
        }}
      />
    </motion.main>
  );
};