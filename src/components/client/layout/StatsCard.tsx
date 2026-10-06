import { ReactNode } from "react";


interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
}


export const StatCard = ({value, label, icon}: StatCardProps) => {
    return (
        <div className="flex h-[76px] flex-1 flex-col items-center justify-center rounded-[6px] border border-[#e9e9e9] bg-white">
        {icon && (
            <div className="mb-1 text-[#777]">
            {icon}
            </div>
        )}

        <span className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-[#181818]">
            {value}
        </span>

        <span className="mt-1 text-[9px] text-[#777]">
            {label}
        </span>
        </div>
    );
}