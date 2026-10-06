"use client";

import Image from "next/image";
import Link from "next/link";

export const AuthBrand = () => {
  return (
    <Link
      href="/"
      aria-label="Òduyémi home"
      className="inline-flex w-fit items-center"
    >
      <Image
        src="/images/logo/logo_black.png"
        alt="Òduyémi"
        width={105}
        height={32}
        priority
        className="h-auto w-[88px] object-contain"
      />
    </Link>
  );
};