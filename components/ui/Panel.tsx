"use client";

import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function Panel({
  title,
  icon,
  extra,
  className = "",
  bodyClassName = "",
  children,
}: {
  title: string;
  icon: string;
  extra?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`pointer-events-auto relative flex flex-col overflow-hidden rounded-[10px] border border-twin-line/80 bg-twin-panel/80 shadow-[var(--t-panel-shadow)] backdrop-blur-md ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-twin-cyan/30 to-transparent" />

      <header className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-3">
        <Icon name={icon} size={15} className="text-twin-cyan" />
        <h2 className="text-[15px] font-semibold tracking-[0.03em] text-twin-text">
          {title}
        </h2>
        {extra && <div className="ml-auto flex items-center gap-2">{extra}</div>}
      </header>

      <div className="mx-4 h-px shrink-0 bg-gradient-to-r from-twin-cyan/45 via-twin-edge/40 to-transparent" />

      <div
        className={`flex min-h-0 flex-1 flex-col justify-center px-4 pb-4 pt-3 ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
