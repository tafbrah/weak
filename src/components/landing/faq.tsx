"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Reveal from "./reveal";

export default function Faq({
  kicker,
  title,
  sideBefore,
  sideLink,
  sideAfter,
  items,
}: {
  kicker: string;
  title: string;
  sideBefore: string;
  sideLink: string;
  sideAfter: string;
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <p className="font-mono text-xs uppercase tracking-widest text-ember">{kicker}</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {sideBefore}{" "}
              <a href="/book-audit" className="font-semibold text-ember hover:text-ember-deep">
                {sideLink}
              </a>{" "}
              {sideAfter}
            </p>
          </div>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-8">
          <div>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-lg font-bold tracking-tight">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-mist transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-ember" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-ink-soft">{item.a}</p>
                </div>
              </div>
            );
          })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
