import { ArrowUpRight } from "lucide-react";
import Reveal from "./reveal";

type TFn = (key: string, fallback: string) => string;

function buildCases(t: TFn) {
  return [
    {
      client: "Nordwind Logistics",
      sector: t("work.c1.sector", "Freight · 240 FTE"),
      metric: "6h → 9min",
      metricLabel: t("work.c1.metricLabel", "quote turnaround"),
      copy: t(
        "work.c1.copy",
        "An AI quoting agent prices freight requests from rate cards and history, then hands a draft to sales for a one-click send.",
      ),
      tags: [t("work.c1.tag1", "AI agent"), t("work.c1.tag2", "ERP sync")],
    },
    {
      client: "Klarheit Health",
      sector: t("work.c2.sector", "Clinics · 12 locations"),
      metric: "−82%",
      metricLabel: t("work.c2.metricLabel", "manual data entry"),
      copy: t(
        "work.c2.copy",
        "Intake forms and referrals are OCR'd, validated against the HIS schema and synced — with nurses approving only the 4% edge cases.",
      ),
      tags: [t("work.c2.tag1", "Document AI"), t("work.c2.tag2", "Human-in-loop")],
    },
    {
      client: "Fjord & Co",
      sector: t("work.c3.sector", "Agency · 38 FTE"),
      metric: "3.1×",
      metricLabel: t("work.c3.metricLabel", "reporting throughput"),
      copy: t(
        "work.c3.copy",
        "Weekly client reports assemble themselves from HubSpot, GA4 and time tracking, land in Notion, and email out Monday 07:00.",
      ),
      tags: [t("work.c3.tag1", "RevOps"), t("work.c3.tag2", "Reporting")],
    },
  ];
}

export default function Casework({ t }: { t: (key: string, fallback: string) => string }) {
  const CASES = buildCases(t);
  return (
    <section id="work" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
        <Reveal>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ember">
              {t("work.kicker", "Selected work")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t("work.title", "Hours returned, measured.")}
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            {t(
              "work.intro",
              "Every engagement ships with a before/after metric. These are the three we're proudest of.",
            )}
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3">
        {CASES.map((c, i) => (
          <Reveal key={c.client} delay={i * 120}>
          <article
            className="group flex h-full flex-col rounded-lg bg-ink p-6 text-bone transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgb(22_24_29/0.6)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">{c.client}</h3>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-fog">{c.sector}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-fog transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ember" />
            </div>

            <p className="mt-6 font-display text-4xl font-bold tracking-tight text-ember sm:mt-8 sm:text-5xl">
              {c.metric}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-fog">{c.metricLabel}</p>

            <p className="mt-6 flex-1 text-sm leading-relaxed text-fog">{c.copy}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-fog"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
