import type { Metadata } from "next";
import SignupForm from "@/components/admin/signup-form";
import { getConsoleI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "Sign up — Loopwerk console" };

export default async function SignupPage() {
  const { t } = await getConsoleI18n();

  return (
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
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-fog">
              {t("console.opsConsole", "ops console")}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-edge bg-panel p-7">
          <h1 className="font-display text-xl font-bold tracking-tight">
            {t("console.signup.title", "Create your account")}
          </h1>
          <p className="mt-1 mb-6 text-sm text-fog">
            {t("console.signup.sub", "Sign up to get access to the console. You'll verify with a one-time code.")}
          </p>
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
