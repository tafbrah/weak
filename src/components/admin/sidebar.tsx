"use client";

import {
  Building2,
  ClipboardList,
  Cookie,
  CreditCard,
  Database,
  FileEdit,
  Languages as LanguagesIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Settings,
  Users,
  UsersRound,
  Video,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ADMIN_EMAIL } from "@/lib/constants";
import { LOCALE_COOKIE } from "@/lib/i18n-client";

const ITEMS = [
  { href: "/admin", labelKey: "console.nav.overview", fallback: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/workflows", labelKey: "console.nav.workflows", fallback: "Workflows", icon: Workflow, exact: false },
  {
    href: "/admin/subscriptions",
    labelKey: "console.nav.subscriptions",
    fallback: "Subscriptions",
    icon: CreditCard,
    exact: false,
  },
  {
    href: "/admin/customers",
    labelKey: "console.nav.customers",
    fallback: "Customers",
    icon: Building2,
    exact: false,
  },
  {
    href: "/admin/team",
    labelKey: "console.nav.team",
    fallback: "Team",
    icon: UsersRound,
    exact: false,
  },
  {
    href: "/admin/cookies",
    labelKey: "console.nav.cookies",
    fallback: "Cookies",
    icon: Cookie,
    exact: false,
  },
  {
    href: "/admin/audit-form",
    labelKey: "console.nav.auditForm",
    fallback: "Audit Form",
    icon: ClipboardList,
    exact: false,
  },
  {
    href: "/admin/cms",
    labelKey: "console.nav.cms",
    fallback: "CMS",
    icon: FileEdit,
    exact: false,
  },
  {
    href: "/admin/conferences",
    labelKey: "console.nav.conferences",
    fallback: "Conferences",
    icon: Video,
    exact: false,
  },
  {
    href: "/admin/messages",
    labelKey: "console.nav.messages",
    fallback: "Email / SMS",
    icon: Mail,
    exact: false,
  },
  {
    href: "/admin/cache",
    labelKey: "console.nav.cache",
    fallback: "Cache",
    icon: Database,
    exact: false,
  },
  {
    href: "/admin/payments",
    labelKey: "console.nav.payments",
    fallback: "Payments",
    icon: CreditCard,
    exact: false,
  },
  {
    href: "/admin/users",
    labelKey: "console.nav.users",
    fallback: "User management",
    icon: Users,
    exact: false,
  },
  {
    href: "/admin/languages",
    labelKey: "console.nav.languages",
    fallback: "Languages",
    icon: LanguagesIcon,
    exact: false,
  },
  { href: "/admin/settings", labelKey: "console.nav.settings", fallback: "Settings", icon: Settings, exact: false },
] as const;

function SidebarInner({
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

  // In cookie-less environments the console runs on a `lw_session` URL token;
  // keep propagating it across console navigation.
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
      // ignore — we still leave the console
    } finally {
      window.location.replace("/");
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-edge bg-panel lg:flex">
      <Link href="/" className="flex items-center gap-2.5 border-b border-edge px-5 py-5">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-bone" aria-hidden>
          <circle cx="5" cy="12" r="2.6" fill="#e4572e" />
          <circle cx="19" cy="6" r="2.2" fill="currentColor" />
          <circle cx="19" cy="18" r="2.2" fill="currentColor" />
          <path d="M7.4 11 16.8 6.6M7.4 13l9.4 4.4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div>
          <p className="font-display text-base font-bold leading-none tracking-tight text-bone">LOOPWERK</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-fog">
            {labels["console.opsConsole"] ?? "ops console"}
          </p>
        </div>
      </Link>

      {/* language switcher */}
      <div className="flex items-center gap-2 border-b border-edge px-5 py-3">
        <LanguagesIcon className="h-3.5 w-3.5 text-fog" aria-hidden />
        <span className="font-mono text-[9px] uppercase tracking-widest text-fog">
          {labels["console.language"] ?? "Language"}
        </span>
        <div className="ml-auto flex items-center rounded-full border border-edge bg-panel-2 p-0.5">
          {languagesList.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                type="button"
                title={l.name}
                onClick={() => switchLang(l.code)}
                className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  active ? "bg-ember text-shell" : "text-fog hover:text-bone"
                }`}
              >
                {l.code}
              </button>
            );
          })}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`${item.href}${suffix}`}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-panel-2 text-bone shadow-[inset_2px_0_0_0_#e4572e]"
                  : "text-fog hover:bg-panel-2/60 hover:text-bone"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {labels[item.labelKey] ?? item.fallback}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-edge px-3 py-4">
        <div className="mb-3 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember/20 font-mono text-xs font-bold text-ember">
            LW
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-bone">Operator</p>
            <p className="truncate font-mono text-[10px] text-fog">{ADMIN_EMAIL}</p>
          </div>
        </div>
        <Link
          href="/"
          className="mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-fog transition-colors hover:bg-panel-2/60 hover:text-bone"
        >
          <span className="text-xs">←</span> {labels["console.viewSite"] ?? "View site"}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-fog transition-colors hover:bg-rust/15 hover:text-[#f08c82] disabled:opacity-60"
        >
          {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          {labels["console.logout"] ?? "Logout"}
        </button>
      </div>
    </aside>
  );
}

export default function Sidebar(props: {
  labels: Record<string, string>;
  languagesList: { code: string; name: string }[];
  locale: string;
}) {
  return (
    <Suspense fallback={null}>
      <SidebarInner {...props} />
    </Suspense>
  );
}
