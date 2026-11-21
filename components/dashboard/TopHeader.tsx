"use client";

import { useState } from "react";
import { Icon, IconChip } from "@/components/ui/Icon";
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
        <IconChip name={header.brandIcon} size={40} iconSize={22} />

        <div className="mr-7 flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-twin-cyan shadow-[0_0_8px_var(--t-cyan)]" />
          <div>
            <h1 className="twin-glow-text text-[22px] font-bold leading-tight tracking-[0.04em] text-twin-text">
              {header.title}
            </h1>
            <p className="text-[10px] leading-tight tracking-[0.26em] text-twin-dim">
              {header.subtitle}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const on = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={`flex h-9 items-center gap-2 rounded-[7px] border px-3.5 text-[14px] transition-colors ${
                  on
                    ? "border-twin-cyan/50 bg-twin-cyan/12 text-twin-cyan shadow-[var(--t-active-shadow)]"
                    : "border-transparent text-twin-muted hover:bg-twin-cyan/6 hover:text-twin-text"
                }`}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-5 pr-1">
          <div className="flex items-center gap-2.5">
            <Icon
              name={header.weatherIcon}
              size={26}
              strokeWidth={1.7}
              className="text-twin-amber"
            />
            <div className="leading-tight">
              <div className="twin-num text-[15px] text-twin-text">
                {header.temperature}
              </div>
              <div className="text-[11px] text-twin-muted">{header.weather}</div>
            </div>
          </div>

          <div className="twin-num text-[14px] tracking-[0.02em] text-twin-muted">
            {header.datetime}
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === "light"}
            className="h-8 rounded-[7px] border border-twin-edge/70 px-3.5 text-[12px] text-twin-muted transition-colors hover:border-twin-cyan/60 hover:text-twin-cyan"
          >
            {header.skinButton}
          </button>

          <button type="button" className="relative text-twin-muted transition-colors hover:text-twin-cyan">
            <Icon name={header.bellIcon} size={21} strokeWidth={1.7} />
            <span className="twin-num absolute -right-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-twin-red px-1 text-[9px] font-semibold text-white">
              {header.bellBadge}
            </span>
          </button>

          <button type="button" className="text-twin-muted transition-colors hover:text-twin-cyan">
            <Icon name={header.userIcon} size={23} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-twin-cyan/50 to-transparent" />
    </header>
  );
}
