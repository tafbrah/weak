import { Clock } from "lucide-react";
import Reveal from "./reveal";

type Domain = { id: string };

const DOMAINS: Domain[] = [
  { id: "support" },
  { id: "sales" },
  { id: "finance" },
  { id: "documents" },
  { id: "logistics" },
  { id: "marketing" },
  { id: "sync" },
  { id: "reporting" },
  { id: "hr" },
  { id: "legal" },
  { id: "ecommerce" },
  { id: "itops" },
];

export default function Domains({ t }: { t: (key: string, fallback: string) => string }) {
  return (
    <section id="domains" className="border-y border-edge bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <Reveal>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ember">
                {t("domains.kicker", "Application domains")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-bone sm:text-4xl">
                {t("domains.title", "One automation for every department.")}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-2 lg:pt-8">
            <p className="max-w-xl text-base leading-relaxed text-fog sm:text-lg">
              {t(
                "domains.sub",
                "Whatever your business, AI automation recovers hours every single week. These are the domains we automate most — and the time they typically give back.",
              )}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map(({ id }, i) => (
            <Reveal key={id} delay={i * 60}>
            <article
              className="group flex h-full flex-col rounded-lg border border-edge bg-panel p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/50 hover:shadow-[0_18px_40px_-24px_rgb(228_87_46/0.4)]"
            >
              <div className="flex items-center justify-end">
                <span className="flex items-center gap-1.5 rounded-full border border-moss/30 bg-moss/10 px-2.5 py-0.5 font-mono text-[10px] text-[#7fd4a5]">
                  <Clock className="h-3 w-3" />
                  {t(`domains.${id}.time`, "")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-bone">
                {t(`domains.${id}.title`, "")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">
                {t(`domains.${id}.desc`, "")}
              </p>
            </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-widest text-fog">
          {t(
            "domains.footnote",
            "Estimates from live client deployments — your audit gives you exact numbers.",
          )}
        </p>
      </div>
    </section>
  );
}
