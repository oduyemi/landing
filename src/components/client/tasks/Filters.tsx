"use client";


export type TaskFilter =
  | "all"
  | "pending"
  | "completed";


  interface TaskFiltersProps {
  activeFilter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}



const filters: {
  id: TaskFilter;
  label: string;
}[] = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "pending",
    label: "Pending",
  },
  {
    id: "completed",
    label: "Completed",
  },
];

export const TaskFilters = ({
  activeFilter,
  onChange,
}: TaskFiltersProps) => {
  return (
    <div className="flex items-center gap-6 border-b border-neutral-200">
      {filters.map((filter) => {
        const active =
          filter.id === activeFilter;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={[
              "relative pb-3 pl-4 text-[7px] font-medium transition-colors",
              active
                ? "text-black"
                : "text-neutral-400 hover:text-neutral-700",
            ].join(" ")}
          >
            {filter.label}

            {active && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-black" />
            )}
          </button>
        );
      })}
    </div>
  );
};