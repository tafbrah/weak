"use client";

import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LOCALE_COOKIE } from "@/lib/i18n-client";

export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`text-ink ${className}`} aria-hidden>
      <circle cx="5" cy="12" r="2.6" fill="#e4572e" />
      <circle cx="19" cy="6" r="2.2" fill="currentColor" />
      <circle cx="19" cy="18" r="2.2" fill="currentColor" />
      <path d="M7.4 11 16.8 6.6M7.4 13l9.4 4.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export type NavLabels = {
  services: string;
  process: string;
  work: string;
  pricing: string;
  faq: string;
  login: string;
  cta: string;
};

export default function Nav({
  labels,
  languagesList,
  locale,
}: {
  labels: NavLabels;
  languagesList: { code: string; name: string }[];
  locale: string;
}) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#services", label: labels.services },
    { href: "#process", label: labels.process },
    { href: "#work", label: labels.work },
    { href: "#pricing", label: labels.pricing },
    { href: "#faq", label: labels.faq },
  ];

  function switchLang(code: string) {
    // Best-effort cookie + authoritative ?lang= param (works even when the
    // browser blocks cookies, e.g. embedded previews).
    try {
      document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=31536000;samesite=lax`;
    } catch {
      // ignore
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", code);
    window.location.assign(url.toString());
  }

  const switcher = (
    <div className="flex items-center rounded-full border border-line bg-cream p-0.5">
      {languagesList.map((l) => {
        const active = l.code === locale;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => switchLang(l.code)}
            title={l.name}
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
              active ? "bg-ink text-bone" : "text-mist hover:text-ember"
            }`}
          >
            {l.code}
          </button>
        );
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2">
          <LogoMark />
          <span className="font-display text-base font-bold tracking-tight sm:text-lg">LOOPWERK</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ember"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">{switcher}</div>
          <Link
            href="/admin/login"
            className="hidden items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ember md:flex"
          >
            <LogIn className="h-4 w-4" />
            {labels.login}
          </Link>
          <Link
            href="/book-audit"
            className="hidden rounded-md bg-ink px-3 py-2 text-xs font-semibold text-bone transition-colors hover:bg-ember sm:block sm:px-4 sm:text-sm"
          >
            {labels.cta}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-md border border-line p-2 text-ink transition-colors hover:border-ember hover:text-ember md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper px-4 pb-5 pt-2 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/60 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ember"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 border-b border-line/60 py-3 text-sm font-semibold text-ink transition-colors hover:text-ember"
          >
            <LogIn className="h-4 w-4" />
            {labels.login}
          </Link>
          <div className="flex justify-center py-3 sm:hidden">{switcher}</div>
          <Link
            href="/book-audit"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-md bg-ember px-4 py-2.5 text-center text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
          >
            {labels.cta}
          </Link>
        </nav>
      )}
    </header>
  );
}
