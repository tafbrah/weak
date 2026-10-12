import { Clock } from "lucide-react";
import Reveal from "./reveal";

type Vertical = { id: string };

const VERTICALS: Vertical[] = [
  { id: "lawyer" },
  { id: "restaurant" },
  { id: "boutique" },
  { id: "clinic" },
  { id: "realestate" },
  { id: "airbnb" },
  { id: "hotel" },
  { id: "garage" },
  { id: "salon" },
  { id: "construction" },
  { id: "accounting" },
  { id: "fitness" },
];

export default function Verticals({ t }: { t: (key: string, fallback: string) => string }) {
  return (
    <section id="verticals" className="border-b border-line bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <Reveal>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ember">
                {t("verticals.kicker", "Industries")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("verticals.title", "Made for your business, too.")}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-2 lg:pt-8">
            <p className="max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {t(
                "verticals.sub",
                "From law firms to restaurants, every trade has its repetitive tasks. Here is what we automate for each — and the hours it gives back.",
              )}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VERTICALS.map(({ id }, i) => (
            <Reveal key={id} delay={i * 50}>
            <article
              className="group flex h-full flex-col rounded-lg border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/50 hover:shadow-[0_18px_40px_-24px_rgb(22_24_29/0.35)]"
            >
              <div className="flex items-center justify-end">
                <span className="flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-2.5 py-0.5 font-mono text-[10px] text-ember-deep">
                  <Clock className="h-3 w-3" />
                  {t(`verticals.${id}.time`, "")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{t(`verticals.${id}.title`, "")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`verticals.${id}.desc`, "")}</p>
            </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-widest text-mist">
          {t("verticals.footnote", "Every trade is different — your audit prices your exact gains.")}
        </p>
      </div>
    </section>
  );
}
