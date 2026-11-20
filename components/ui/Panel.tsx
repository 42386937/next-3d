"use client";

import type { ReactNode } from "react";
import { IconSlot } from "./IconSlot";

function Corners() {
  const base = "pointer-events-none absolute h-2.5 w-2.5";
  const color = { borderColor: "var(--t-corner)" };
  return (
    <>
      <span
        className={`${base} -left-px -top-px border-l border-t`}
        style={color}
      />
      <span
        className={`${base} -right-px -top-px border-r border-t`}
        style={color}
      />
      <span
        className={`${base} -bottom-px -left-px border-b border-l`}
        style={color}
      />
      <span
        className={`${base} -bottom-px -right-px border-b border-r`}
        style={color}
      />
    </>
  );
}

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
      className={`pointer-events-auto relative rounded-[6px] border border-twin-line/90 bg-twin-panel/85 shadow-[var(--t-panel-shadow)] backdrop-blur-[2px] ${className}`}
    >
      <Corners />
      <header className="flex items-center gap-2 px-3.5 pt-2.5 pb-2">
        <IconSlot name={icon} size={14} />
        <h2 className="text-[15px] font-semibold tracking-[0.04em] text-twin-text">
          {title}
        </h2>
        {extra && <div className="ml-auto flex items-center gap-2">{extra}</div>}
      </header>
      <div className="mx-3.5 h-px bg-gradient-to-r from-twin-cyan/55 via-twin-edge/45 to-transparent" />
      <div className={`px-3.5 pb-3 pt-2.5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
