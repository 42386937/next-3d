"use client";

import type { ReactNode } from "react";

/**
 * Every icon in the dashboard renders through here. Add your local assets to
 * `ICONS`, keyed by the names used in `lib/dashboard-data.ts`; anything you
 * have not mapped yet stays an empty dashed placeholder of the right size.
 */
const ICONS: Record<string, ReactNode> = {
  // brand: <img src="/icons/brand.svg" alt="" className="h-full w-full" />,
  // "nav-energy": <EnergyIcon />,
};

export function IconSlot({
  name,
  size = 16,
  round = false,
  className = "",
}: {
  name: string;
  size?: number;
  round?: boolean;
  className?: string;
}) {
  const icon = ICONS[name];
  const placeholder = icon
    ? ""
    : `rounded-[3px] border border-dashed border-twin-edge/60 ${
        round ? "rounded-full" : ""
      }`;

  return (
    <span
      data-icon={name}
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ${placeholder} ${className}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </span>
  );
}
