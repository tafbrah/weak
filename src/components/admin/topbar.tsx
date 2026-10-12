"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  Hourglass,
  Monitor,
  Moon,
  PauseCircle,
  Sun,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ------------------------------- theme toggle ------------------------------- */

const THEME_KEY = "loopwerk-theme";
type ThemeMode = "light" | "system" | "dark";

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore storage-blocked environments
  }
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") setMode(stored);
    } catch {
      // ignore
    }
  }, []);

  const options: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light theme" },
    { value: "system", icon: Monitor, label: "System theme" },
    { value: "dark", icon: Moon, label: "Dark theme" },
  ];

  return (
    <div className={`flex items-center rounded-full border border-edge bg-panel-2 ${compact ? "p-0.5" : "p-1"}`}>
      {options.map(({ value, icon: Icon, label }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => {
              setMode(value);
              applyTheme(value);
            }}
            className={`flex items-center justify-center rounded-full transition-colors ${
              compact ? "h-6 w-6" : "h-7 w-7"
            } ${active ? "bg-ember text-shell" : "text-fog hover:text-bone"}`}
          >
            <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------- notifications ------------------------------ */

export type NotificationItem = {
  kind: "lead" | "pending" | "failed" | "paused";
  text: string;
  at: string;
};

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const KIND_ICON = {
  lead: UserPlus,
  pending: Hourglass,
  failed: AlertTriangle,
  paused: PauseCircle,
} as const;

const KIND_COLOR: Record<NotificationItem["kind"], string> = {
  lead: "text-ember",
  pending: "text-[#e3b04b]",
  failed: "text-[#f08c82]",
  paused: "text-fog",
};

export function NotificationsBell({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = read ? 0 : items.length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-panel-2 text-fog transition-colors hover:text-bone"
      >
        <Bell className="h-3.5 w-3.5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 font-mono text-[9px] font-bold text-shell">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-lg border border-edge bg-panel shadow-[0_24px_60px_-24px_rgb(0_0_0/0.6)]">
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <p className="font-display text-sm font-bold text-bone">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => setRead(true)}
                className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-fog transition-colors hover:text-bone"
              >
                <Check className="h-3 w-3" /> mark all read
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="text-fog hover:text-bone"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-fog">All clear — nothing needs your attention.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-edge/60 overflow-y-auto">
              {items.map((n, i) => {
                const Icon = KIND_ICON[n.kind];
                return (
                  <li key={i} className="flex items-start gap-3 px-4 py-3">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${KIND_COLOR[n.kind]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug text-bone">{n.text}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-fog">{timeAgo(n.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------- topbar --------------------------------- */

export default function Topbar({ notifications }: { notifications: NotificationItem[] }) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-edge bg-coal/95 px-6 backdrop-blur-sm lg:flex">
      <p className="font-mono text-xs text-fog">{today}</p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationsBell items={notifications} />
      </div>
    </div>
  );
}
