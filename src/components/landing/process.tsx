import Reveal from "./reveal";

type TFn = (key: string, fallback: string) => string;

function buildSteps(t: TFn) {
  return [
    {
      n: "01",
      title: t("process.s1.title", "Audit"),
      time: t("process.s1.time", "Week 0–1"),
      copy: t(
        "process.s1.copy",
        "We map the repetitive work eating your week, score each loop by hours × pain, and pick the highest-leverage automations.",
      ),
    },
    {
      n: "02",
      title: t("process.s2.title", "Blueprint"),
      time: t("process.s2.time", "Week 1–2"),
      copy: t(
        "process.s2.copy",
        "Every workflow gets an n8n design doc: nodes, data contracts, failure modes, and where a human stays in the loop.",
      ),
    },
    {
      n: "03",
      title: t("process.s3.title", "Build"),
      time: t("process.s3.time", "Week 2–4"),
      copy: t(
        "process.s3.copy",
        "Two-week sprints. You watch the workflows go live one by one, with staging runs against real data before cutover.",
      ),
    },
    {
      n: "04",
      title: t("process.s4.title", "Run"),
      time: t("process.s4.time", "Ongoing"),
      copy: t(
        "process.s4.copy",
        "We monitor every execution, fix failures before you notice, and ship improvements on a monthly SLA.",
      ),
    },
  ];
}

export default function Process({ t }: { t: (key: string, fallback: string) => string }) {
  const STEPS = buildSteps(t);
  return (
    <section id="process" className="border-y border-line bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
          <Reveal>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ember">
                {t("process.kicker", "How we work")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t("process.title", "First workflow live in 14 days.")}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              {t(
                "process.intro",
                "A fixed, opinionated process. No six-month discovery phases — you see working automations in the first fortnight.",
              )}
            </p>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className="group relative bg-paper p-6 transition-all duration-300 hover:bg-cream hover:shadow-[inset_0_2px_0_0_#e4572e]"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-3xl font-bold text-line transition-colors group-hover:text-ember">
                    {s.n}
                  </span>
                  <span className="rounded-full border border-line bg-cream px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft">
                    {s.time}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.copy}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
