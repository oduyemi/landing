
import { clampProgress } from "./types";



interface ProjectProgressProps {
  value?: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export const ProjectProgress = ({
  value = 0,
  showLabel = true,
  size = "sm",
}: ProjectProgressProps) => {
  const progress = clampProgress(value);

  return (
    <div className="flex min-w-[74px] items-center gap-2">
      <div
        className={`flex-1 overflow-hidden rounded-full bg-[#ededed] ${
          size === "md" ? "h-1.5" : "h-1"
        }`}
        role="progressbar"
        aria-label="Project progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-[#171717] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showLabel && (
        <span className="w-7 shrink-0 text-right text-[9px] tabular-nums text-[#777]">
          {progress}%
        </span>
      )}
    </div>
  );
}
