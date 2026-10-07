"use client";
import { Camera } from "lucide-react";


interface ProfileAvatarProps {
  fname: string;
  lname: string;
  image?: string | null;
}

export const ProfileAvatar = ({
  fname,
  lname,
  image,
}: ProfileAvatarProps) => {
  const initials =
    `${fname?.charAt(0) ?? ""}${lname?.charAt(0) ?? ""}`
      .toUpperCase();

  return (
    <div className="flex w-[82px] shrink-0 flex-col items-center">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-[10px] font-semibold text-white">
        {image ? (
          <img
            src={image}
            alt={`${fname} ${lname}`}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      <button
        type="button"
        disabled
        className="mt-2 flex cursor-not-allowed items-center gap-1 text-[7px] font-medium text-[#aaa]"
        title="Profile photo upload will be available soon"
      >
        <Camera
          className="h-[9px] w-[9px]"
          strokeWidth={1.7}
        />

        Change photo
      </button>
    </div>
  );
};