"use client";

import { Languages as LanguagesIcon, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LOCALE_COOKIE } from "@/lib/i18n-client";
import { ThemeToggle } from "./topbar";

const ITEMS = [
  { href: "/admin", labelKey: "console.nav.overview", fallback: "Overview", exact: true },
  { href: "/admin/workflows", labelKey: "console.nav.workflows", fallback: "Workflows", exact: false },
  { href: "/admin/subscriptions", labelKey: "console.nav.subscriptions", fallback: "Subscriptions", exact: false },
  { href: "/admin/customers", labelKey: "console.nav.customers", fallback: "Customers", exact: false },
  { href: "/admin/team", labelKey: "console.nav.team", fallback: "Team", exact: false },
  { href: "/admin/cookies", labelKey: "console.nav.cookies", fallback: "Cookies", exact: false },
  { href: "/admin/audit-form", labelKey: "console.nav.auditForm", fallback: "Audit Form", exact: false },
  { href: "/admin/cms", labelKey: "console.nav.cms", fallback: "CMS", exact: false },
  { href: "/admin/conferences", labelKey: "console.nav.conferences", fallback: "Conferences", exact: false },
  { href: "/admin/messages", labelKey: "console.nav.messages", fallback: "Email / SMS", exact: false },
  { href: "/admin/cache", labelKey: "console.nav.cache", fallback: "Cache", exact: false },
  { href: "/admin/payments", labelKey: "console.nav.payments", fallback: "Payments", exact: false },
  { href: "/admin/users", labelKey: "console.nav.users", fallback: "User management", exact: false },
  { href: "/admin/languages", labelKey: "console.nav.languages", fallback: "Languages", exact: false },
  { href: "/admin/settings", labelKey: "console.nav.settings", fallback: "Settings", exact: false },
] as const;

function MobileBarInner({
  labels,
  languagesList,
  locale,
}: {
  labels: Record<string, string>;
  languagesList: { code: string; name: string }[];
  locale: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [signingOut, setSigningOut] = useState(false);

  const lwSession = searchParams.get("lw_session");
  const suffix = lwSession ? `?lw_session=${encodeURIComponent(lwSession)}` : "";

  function switchLang(code: string) {
    try {
      document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=31536000;samesite=lax`;
    } catch {
      // ignore
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", code);
    window.location.assign(url.toString());
  }

  async function handleLogout() {
    setSigningOut(true);
    try {
      await fetch(lwSession ? `/api/auth/logout?lw_session=${encodeURIComponent(lwSession)}` : "/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // ignore
    } finally {
      window.location.replace("/");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-coal/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-bone" aria-hidden>
            <circle cx="5" cy="12" r="2.6" fill="#e4572e" />
            <circle cx="19" cy="6" r="2.2" fill="currentColor" />
            <circle cx="19" cy="18" r="2.2" fill="currentColor" />
            <path d="M7.4 11 16.8 6.6M7.4 13l9.4 4.4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="font-display text-sm font-bold tracking-tight text-bone">LOOPWERK</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <LanguagesIcon className="h-3.5 w-3.5 text-fog" aria-hidden />
            {languagesList.map((l) => {
              const active = l.code === locale;
              return (
                <button
                  key={l.code}
                  type="button"
                  title={l.name}
                  onClick={() => switchLang(l.code)}
                  className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors ${
                    active ? "bg-ember text-shell" : "border border-edge text-fog"
                  }`}
                >
                  {l.code}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              title={labels["console.logout"] ?? "Logout"}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-ember px-3 py-1.5 text-xs font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
            >
              {signingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              {labels["console.logout"] ?? "Logout"}
            </button>
          </div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={`${item.href}${suffix}`}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              (item.exact ? pathname === item.href : pathname.startsWith(item.href))
                ? "bg-panel-2 text-bone"
                : "text-fog hover:bg-panel-2 hover:text-bone"
            }`}
          >
            {labels[item.labelKey] ?? item.fallback}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export default function MobileBar(props: {
  labels: Record<string, string>;
  languagesList: { code: string; name: string }[];
  locale: string;
}) {
  return (
    <Suspense fallback={null}>
      <MobileBarInner {...props} />
    </Suspense>
  );
}
