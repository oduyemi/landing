"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";


interface Project {
  _id: string;
  title: string;
  type: string;
  status: string;
  description?: string;
  progress?: number;
}


export default function ProjectSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    if (hasLoaded || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load projects.");
      }

      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setHasLoaded(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while searching."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return [];

    return projects
      .filter((project) => {
        const searchableText = [
          project.title,
          project.type,
          project.status,
          project.description ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(term);
      })
      .slice(0, 6);
  }, [projects, query]);

  function openProject(projectId: string) {
    setIsOpen(false);
    setQuery("");
    router.push(`/client/projects/${projectId}`);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }

    if (
      event.key === "Enter" &&
      filteredProjects.length > 0
    ) {
      event.preventDefault();
      openProject(filteredProjects[0]._id);
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            void loadProjects();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search your projects..."
          aria-label="Search projects"
          aria-expanded={isOpen}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(true);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          role="region"
          aria-label="Project search results"
        >
          {loading && (
            <div className="flex items-center gap-3 px-4 py-5 text-sm text-slate-500">
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
              Searching projects...
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-4">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setHasLoaded(false);
                  void loadProjects();
                }}
                className="mt-2 text-sm font-medium text-slate-800 underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && hasLoaded && (
            <>
              {filteredProjects.length > 0 ? (
                <div className="p-2">
                  <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Matching projects
                  </p>

                  {filteredProjects.map((project) => (
                    <button
                      key={project._id}
                      type="button"
                      onClick={() => openProject(project._id)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Search size={16} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {project.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-500">
                          {project.type} · {project.status}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No matching projects
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try another project name, type, or status.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}