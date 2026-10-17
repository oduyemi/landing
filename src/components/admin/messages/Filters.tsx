
"use client";
import { RotateCcw, SlidersHorizontal } from "lucide-react";


export interface MessageFilterOption {
  value: string;
  label: string;
}

interface MessageFiltersProps {
  projects: MessageFilterOption[];
  clients: MessageFilterOption[];
  selectedProject: string;
  selectedClient: string;
  unreadOnly: boolean;
  onProjectChange: (value: string) => void;
  onClientChange: (value: string) => void;
  onUnreadChange: (value: boolean) => void;
  onReset: () => void;
}

export const MessageFilters = ({
  projects,
  clients,
  selectedProject,
  selectedClient,
  unreadOnly,
  onProjectChange,
  onClientChange,
  onUnreadChange,
  onReset,
}: MessageFiltersProps) => {
  const hasActiveFilters =
    selectedProject !== "all" ||
    selectedClient !== "all" ||
    unreadOnly;

  const selectClassName =
    "h-9 w-full appearance-none rounded-md border border-neutral-200 bg-white px-3 pr-8 text-xs text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={14}
            className="text-neutral-500"
          />
          <h3 className="text-xs font-semibold text-neutral-800">
            Filters
          </h3>

          {hasActiveFilters && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[10px] font-medium text-white">
              {
                [
                  selectedProject !== "all",
                  selectedClient !== "all",
                  unreadOnly,
                ].filter(Boolean).length
              }
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="message-project-filter"
            className="text-[11px] font-medium text-neutral-500"
          >
            Project
          </label>

          <div className="relative">
            <select
              id="message-project-filter"
              value={selectedProject}
              onChange={(event) =>
                onProjectChange(event.target.value)
              }
              className={selectClassName}
            >
              <option value="all">All projects</option>

              {projects.map((project) => (
                <option
                  key={project.value}
                  value={project.value}
                >
                  {project.label}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
              ▼
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="message-client-filter"
            className="text-[11px] font-medium text-neutral-500"
          >
            Client
          </label>

          <div className="relative">
            <select
              id="message-client-filter"
              value={selectedClient}
              onChange={(event) =>
                onClientChange(event.target.value)
              }
              className={selectClassName}
            >
              <option value="all">All clients</option>

              {clients.map((client) => (
                <option
                  key={client.value}
                  value={client.value}
                >
                  {client.label}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
              ▼
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={unreadOnly}
        onClick={() => onUnreadChange(!unreadOnly)}
        className="flex w-full items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5 text-left transition hover:bg-neutral-50"
      >
        <span>
          <span className="block text-xs font-medium text-neutral-800">
            Unread messages only
          </span>
          <span className="mt-0.5 block text-[10px] text-neutral-500">
            Show conversations that need your attention
          </span>
        </span>

        <span
          className={`relative h-5 w-9 shrink-0 rounded-full transition ${
            unreadOnly ? "bg-neutral-900" : "bg-neutral-200"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
              unreadOnly ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
      </button>
    </section>
  );
}
