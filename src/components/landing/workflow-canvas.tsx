type NodeSpec = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  dot: string;
};

const NODES: NodeSpec[] = [
  { x: 18, y: 182, w: 150, h: 64, title: "Webhook", sub: "inbound lead", dot: "#e4572e" },
  { x: 228, y: 182, w: 154, h: 64, title: "AI Agent · GPT", sub: "score + classify", dot: "#d9a520" },
  { x: 440, y: 182, w: 118, h: 64, title: "IF", sub: "score ≥ 80", dot: "#2e7d53" },
  { x: 470, y: 44, w: 158, h: 58, title: "Slack", sub: "#sales · handoff", dot: "#c03a31" },
  { x: 470, y: 328, w: 158, h: 58, title: "Postgres", sub: "store lead", dot: "#7a8aa0" },
];

const EDGES = [
  "M168 214 C 198 214, 198 214, 228 214",
  "M382 214 C 411 214, 411 214, 440 214",
  "M499 182 C 499 122, 438 73, 470 73",
  "M499 246 C 499 306, 438 357, 470 357",
];

export default function WorkflowCanvas() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-edge bg-[#0e1116] shadow-[0_24px_60px_-24px_rgb(22_24_29/0.55)]">
      <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2c3340]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2c3340]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2c3340]" />
        </div>
        <p className="hidden font-mono text-[11px] text-fog sm:block">inbound-lead-triage.json · n8n v1.94</p>
        <div className="flex items-center gap-1.5 rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-moss" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-moss">live</span>
        </div>
      </div>

      <div className="dotgrid relative">
        <svg viewBox="0 0 660 430" className="block w-full" role="img" aria-label="Animated n8n automation workflow">
          {EDGES.map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke="#333b49" strokeWidth="1.5" />
              <path
                d={d}
                fill="none"
                stroke="#e4572e"
                strokeWidth="1.5"
                strokeDasharray="4 12"
                className="animate-flow"
              />
            </g>
          ))}

          {NODES.map((n) => (
            <g key={n.title}>
              <rect
                x={n.x}
                y={n.y}
                width={n.w}
                height={n.h}
                rx="10"
                fill="#161a21"
                stroke="#2c3340"
                strokeWidth="1.2"
              />
              <circle cx={n.x + 18} cy={n.y + n.h / 2} r="4" fill={n.dot} />
              <text
                x={n.x + 30}
                y={n.y + n.h / 2 - 3}
                fill="#e9ebe4"
                fontSize="11.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {n.title}
              </text>
              <text
                x={n.x + 30}
                y={n.y + n.h / 2 + 13}
                fill="#98a0ac"
                fontSize="9.5"
                fontFamily="JetBrains Mono, monospace"
              >
                {n.sub}
              </text>
            </g>
          ))}

          {/* connection ports */}
          {[
            [168, 214],
            [228, 214],
            [382, 214],
            [440, 214],
            [499, 182],
            [499, 246],
            [470, 73],
            [470, 357],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="#0e1116" stroke="#566072" strokeWidth="1.2" />
          ))}
        </svg>

        <div className="pointer-events-none absolute bottom-3 left-3 hidden animate-float items-center gap-2 rounded-md border border-edge bg-coal/80 px-2.5 py-1.5 sm:flex">
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <path d="M2 6.5 5 9l5-6" fill="none" stroke="#2e7d53" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-[10px] text-fog">
            run #4,213 · success · 1.2s
          </span>
        </div>
        <div className="pointer-events-none absolute right-3 top-3 hidden animate-float-slow rounded-md border border-edge bg-coal/80 px-2.5 py-1.5 sm:block">
          <span className="font-mono text-[10px] text-fog">avg 1.4s · 99.4% ok · 30d</span>
        </div>
      </div>
    </div>
  );
}
