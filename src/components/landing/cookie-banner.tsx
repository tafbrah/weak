"use client";

import { Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";

type CookieCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  required: number;
  enabled: number;
};

const BANNER_KEY = "loopwerk_cookie_consent";
const BANNER_EXPIRY = 365 * 24 * 60 * 60 * 1000; // 1 year

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState<CookieCategory[]>([]);
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user already made a choice
    const saved = localStorage.getItem(BANNER_KEY);
    if (saved) {
      try {
        const { expires, choices } = JSON.parse(saved);
        if (Date.now() < expires) {
          // Consent already given, apply it
          applyConsent(choices);
          return;
        }
      } catch {
        localStorage.removeItem(BANNER_KEY);
      }
    }
    // Show banner and load categories
    setVisible(true);
    fetch("/api/cookies-public")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setCategories(data.categories.filter((c: CookieCategory) => c.enabled !== 0));
          // Default: accept required, reject others
          const initial: Record<string, boolean> = {};
          data.categories.forEach((c: CookieCategory) => {
            initial[c.slug] = c.required === 1;
          });
          setConsent(initial);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function applyConsent(choices: Record<string, boolean>) {
    // In a real implementation, this would initialize analytics/marketing scripts
    // based on the user's choices. For now, we just store the preference.
    console.log("Applying cookie consent:", choices);
  }

  function handleAccept() {
    const choices: Record<string, boolean> = {};
    categories.forEach((c) => {
      choices[c.slug] = true;
    });
    saveConsent(choices);
    setVisible(false);
  }

  function handleReject() {
    const choices: Record<string, boolean> = {};
    categories.forEach((c) => {
      choices[c.slug] = c.required === 1;
    });
    saveConsent(choices);
    setVisible(false);
  }

  function handleSave() {
    saveConsent(consent);
    setVisible(false);
  }

  function saveConsent(choices: Record<string, boolean>) {
    localStorage.setItem(
      BANNER_KEY,
      JSON.stringify({
        expires: Date.now() + BANNER_EXPIRY,
        choices,
        timestamp: new Date().toISOString(),
      }),
    );
    applyConsent(choices);
  }

  function toggle(slug: string) {
    setConsent((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  if (!visible || loading) return null;

  const canReject = categories.some((c) => c.required !== 1);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-ember" />
              <p className="font-display text-base font-bold text-ink">We value your privacy</p>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-ink-soft">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
              By clicking "Accept all", you consent to our use of cookies. You can customize your choices below or
              learn more in our{" "}
              <a href="/privacy" className="font-semibold text-ember underline underline-offset-2 hover:text-ember-deep">
                Privacy Policy
              </a>
              .
            </p>

            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 rounded-md border border-line bg-cream px-3 py-2.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{c.name}</p>
                      {c.required === 1 && (
                        <span className="rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#7fd4a5]">
                          required
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">{c.description}</p>
                  </div>
                  {c.required !== 1 && (
                    <label className="flex shrink-0 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!consent[c.slug]}
                        onChange={() => toggle(c.slug)}
                        className="h-4 w-4 accent-[#e4572e]"
                      />
                      <span className="text-xs text-ink-soft">Allow</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:w-48">
            <button
              onClick={handleAccept}
              className="w-full rounded-md bg-ember px-4 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-ember-deep"
            >
              Accept all
            </button>
            {canReject && (
              <button
                onClick={handleReject}
                className="w-full rounded-md border border-edge px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ember hover:text-ember"
              >
              Reject all
              </button>
            )}
            <button
              onClick={handleSave}
              className="w-full rounded-md border border-edge px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-fog hover:text-bone"
            >
              Save choices
            </button>
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 text-fog transition-colors hover:text-bone lg:right-6 lg:top-6"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
