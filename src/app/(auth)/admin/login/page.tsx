import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/admin/login-form";
import { ToastProvider } from "@/components/admin/toast";

export const metadata: Metadata = { title: "Console login — Loopwerk" };

export default function LoginPage() {
  return (
    <ToastProvider>
      <main className="grid min-h-screen place-items-center bg-coal px-4 py-10 text-bone">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2.5">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-bone" aria-hidden>
              <circle cx="5" cy="12" r="2.6" fill="#e4572e" />
              <circle cx="19" cy="6" r="2.2" fill="currentColor" />
              <circle cx="19" cy="18" r="2.2" fill="currentColor" />
              <path d="M7.4 11 16.8 6.6M7.4 13l9.4 4.4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-tight">LOOPWERK</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-fog">ops console</p>
            </div>
          </div>

          <div className="rounded-lg border border-edge bg-panel p-7">
            <h1 className="font-display text-xl font-bold tracking-tight">Console access</h1>
            <p className="mt-1 mb-6 text-sm text-fog">Sign in to manage workflows, leads and clients.</p>
            <LoginForm />
          </div>

          <p className="mt-6 text-center font-mono text-[11px] text-fog">
            Already an operator?{" "}
            <Link href="/admin/login" className="text-ember hover:text-bone">
              Log in →
            </Link>
          </p>
        </div>
      </main>
    </ToastProvider>
  );
}
