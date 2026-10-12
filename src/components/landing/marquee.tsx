const STACK = [
  "OpenAI",
  "Anthropic",
  "Slack",
  "HubSpot",
  "Gmail",
  "Notion",
  "Airtable",
  "Stripe",
  "Shopify",
  "Google Sheets",
  "Telegram",
  "WhatsApp",
  "PostgreSQL",
  "Supabase",
  "Linear",
  "Pipedrive",
];

import Reveal from "./reveal";

export default function Marquee({ t }: { t: (key: string, fallback: string) => string }) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {STACK.map((name) => (
        <span key={`${key}-${name}`} className="flex items-center">
          <span className="px-6 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">{name}</span>
          <svg viewBox="0 0 8 8" className="h-2 w-2 text-ember" aria-hidden>
            <rect x="1" y="1" width="6" height="6" fill="currentColor" transform="rotate(45 4 4)" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <section className="border-y border-line bg-cream" aria-label="Integrations we ship">
      <Reveal from="none">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-mist md:block">
          {t("marquee.label", "400+ integrations")}
        </span>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {row("a")}
            {row("b")}
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
