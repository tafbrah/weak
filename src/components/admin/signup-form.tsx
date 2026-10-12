"use client";

import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3.5 py-2.5 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

export default function SignupForm() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function submitDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; email?: string; otp?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not create the account.");
        return;
      }
      setEmail(data.email ?? email);
      setDemoOtp(data.otp ?? "");
      setStep("otp");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, purpose: "signup" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; token?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Invalid or expired code.");
        return;
      }
      window.location.href = `/admin?lw_session=${data.token}`;
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {step === "details" ? (
        <form onSubmit={submitDetails} className="space-y-4">
          <div>
            <label htmlFor="name" className={label}>
              Full name
            </label>
            <input
              id="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="email" className={label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="password" className={label}>
              Password <span className="normal-case tracking-normal">(min. 8 characters)</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${field} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fog hover:text-bone"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3]">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ember px-4 py-2.5 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create account — send my code
          </button>

          <p className="text-center text-xs text-fog">
            Already have an account?{" "}
            <Link href="/admin/login" className="font-semibold text-ember hover:text-bone">
              Log in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setOtpCode("");
              setError(null);
            }}
            className="flex items-center gap-1 font-mono text-[11px] text-fog transition-colors hover:text-bone"
          >
            <ArrowLeft className="h-3 w-3" /> back
          </button>

          <div className="flex items-start gap-3 rounded-md border border-edge bg-panel-2 px-3.5 py-3">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
            <p className="text-xs leading-relaxed text-fog">
              We sent a verification code to <span className="font-semibold text-bone">{email}</span>. In this demo the
              code is shown below — in production it is delivered by email.
            </p>
          </div>

          {demoOtp && (
            <div className="rounded-md border border-ember/40 bg-ember/10 px-3.5 py-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-fog">Demo one-time code</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-[0.3em] text-bone">{demoOtp}</p>
            </div>
          )}

          <div>
            <label htmlFor="otp" className={label}>
              One-time code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${field} text-center font-mono text-lg tracking-[0.4em]`}
            />
          </div>

          {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3]">{error}</p>}

          <button
            type="submit"
            disabled={busy || otpCode.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ember px-4 py-2.5 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Verify &amp; enter console
          </button>
        </form>
      )}
    </div>
  );
}
