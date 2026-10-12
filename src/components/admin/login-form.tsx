"use client";

import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/admin/toast";

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3.5 py-2.5 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

export default function LoginForm() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  async function submitCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; email?: string; otp?: string };
      if (!res.ok || !data.ok) {
        const errorMsg = data.error ?? "Invalid email or password.";
        toast.showError(errorMsg);
        return;
      }
      setEmail(data.email ?? email);
      setDemoOtp(data.otp ?? "");
      setStep("otp");
      toast.showSuccess("Code sent! Check the demo code below.");
    } catch {
      toast.showError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, purpose: "login" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string; token?: string };
      if (!res.ok || !data.ok) {
        toast.showError(data.error ?? "Invalid or expired code.");
        return;
      }
      toast.showSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = `/admin?lw_session=${data.token}`;
      }, 500);
    } catch {
      toast.showError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {step === "credentials" ? (
        <form onSubmit={submitCredentials} className="space-y-4">
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
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
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

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ember px-4 py-2.5 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Continue — send my code
          </button>

          <p className="text-center text-xs text-fog">
            No account yet?{" "}
            <Link href="/admin/signup" className="font-semibold text-ember hover:text-bone">
              Sign up
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setOtpCode("");
            }}
            className="flex items-center gap-1 font-mono text-[11px] text-fog transition-colors hover:text-bone"
          >
            <ArrowLeft className="h-3 w-3" /> back
          </button>

          <div className="flex items-start gap-3 rounded-md border border-edge bg-panel-2 px-3.5 py-3">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
            <p className="text-xs leading-relaxed text-fog">
              A one-time code was sent to <span className="font-semibold text-bone">{email}</span>. In this demo the
              code is shown below — in production it is delivered by email / SMS.
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

          <button
            type="submit"
            disabled={busy || otpCode.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ember px-4 py-2.5 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Verify & enter console
          </button>
        </form>
      )}
    </div>
  );
}
