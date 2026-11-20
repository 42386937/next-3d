"use client";

import { useState } from "react";
import { IconSlot } from "@/components/ui/IconSlot";
import { header, navItems } from "@/lib/dashboard-data";

export function TopHeader({
  theme,
  onToggleTheme,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [active, setActive] = useState("overview");

  return (
    <header className="pointer-events-auto relative h-16 shrink-0">
      <div className="flex h-full items-center gap-3 px-1">
        <IconSlot name={header.brandIcon} size={38} round />
        <div className="mr-6">
          <h1 className="twin-glow-text text-[22px] font-bold leading-tight tracking-[0.05em] text-twin-text">
            {header.title}
          </h1>
          <p className="text-[10px] leading-tight tracking-[0.28em] text-twin-dim">
            {header.subtitle}
          </p>
        </div>

        <nav className="flex items-center gap-1.5">
          {navItems.map((item) => {
            const on = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={`flex h-8 items-center gap-1.5 rounded-[4px] border px-3 text-[14px] transition-colors ${
                  on
                    ? "border-twin-cyan/55 bg-twin-cyan/10 text-twin-cyan shadow-[var(--t-active-shadow)]"
                    : "border-transparent text-twin-muted hover:text-twin-text"
                }`}
              >
                <IconSlot name={item.icon} size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4 pr-1">
          <div className="flex items-center gap-2">
            <IconSlot name={header.weatherIcon} size={22} />
            <div className="leading-tight">
              <div className="twin-num text-[15px] text-twin-text">
                {header.temperature}
              </div>
              <div className="text-[11px] text-twin-muted">{header.weather}</div>
            </div>
          </div>

          <div className="twin-num text-[14px] text-twin-muted">{header.datetime}</div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === "light"}
            className="h-7 rounded-[4px] border border-twin-edge/70 px-3 text-[12px] text-twin-muted transition-colors hover:border-twin-cyan/60 hover:text-twin-cyan"
          >
            {header.skinButton}
          </button>

          <button type="button" className="relative">
            <IconSlot name={header.bellIcon} size={20} />
            <span className="twin-num absolute -right-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-twin-red px-1 text-[9px] font-semibold text-white">
              {header.bellBadge}
            </span>
          </button>

          <IconSlot name={header.userIcon} size={26} round />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-twin-cyan/55 to-transparent" />
    </header>
  );
}
