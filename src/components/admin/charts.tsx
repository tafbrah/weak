export type ChartRow = { key: string; label: string; total: number; failed: number };

export function RunsChart({ rows }: { rows: ChartRow[] }) {
  const W = 560;
  const H = 150;
  const baseline = H - 18;
  const max = Math.max(1, ...rows.map((r) => r.total));
  const bw = W / rows.length;

  return (
    <div className="px-5 pb-4 pt-2">
      <div className="mb-3 flex items-center gap-5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-fog">
          <span className="h-2 w-2 rounded-[2px] bg-[#3fbf7f]" /> success
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-fog">
          <span className="h-2 w-2 rounded-[2px] bg-[#e05e53]" /> failed
        </span>
        <span className="ml-auto font-mono text-[10px] text-fog">last 14 days</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Workflow runs per day, last 14 days">
        {rows.map((r, i) => {
          const ok = Math.max(0, r.total - r.failed);
          const hOk = (ok / max) * (baseline - 8);
          const hFailed = (r.failed / max) * (baseline - 8);
          const x = i * bw + 4;
          const w = bw - 8;
          return (
            <g key={r.key}>
              <rect x={x} y={0} width={w} height={baseline} fill="transparent">
                <title>{`${r.label}: ${r.total} runs · ${r.failed} failed`}</title>
              </rect>
              {r.total === 0 ? (
                <rect x={x} y={baseline - 1.5} width={w} height={1.5} fill="#272d38" />
              ) : (
                <>
                  <rect x={x} y={baseline - hOk} width={w} height={Math.max(hOk, 2)} rx="2.5" fill="#2e7d53" opacity="0.92">
                    <title>{`${r.label}: ${ok} successful runs`}</title>
                  </rect>
                  {r.failed > 0 && (
                    <rect
                      x={x}
                      y={baseline - hOk - hFailed - 1.5}
                      width={w}
                      height={Math.max(hFailed, 2)}
                      rx="2.5"
                      fill="#e05e53"
                    >
                      <title>{`${r.label}: ${r.failed} failed runs`}</title>
                    </rect>
                  )}
                </>
              )}
              {i % 2 === 0 && (
                <text x={x + w / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="#98a0ac" fontFamily="JetBrains Mono, monospace">
                  {r.label}
                </text>
              )}
            </g>
          );
        })}
        <line x1="0" y1={baseline} x2={W} y2={baseline} stroke="#272d38" strokeWidth="1" />
      </svg>
    </div>
  );
}

export type DonutSegment = { label: string; value: number; color: string };

export function PipelineDonut({ segments, total }: { segments: DonutSegment[]; total: number }) {
  const R = 38;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex items-center gap-6 px-5 py-5">
      <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#1a1e26" strokeWidth="13" />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => {
              const frac = s.value / total;
              const dash = frac * C;
              const offset = -acc * C;
              acc += frac;
              return (
                <circle
                  key={s.label}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="13"
                  strokeDasharray={`${Math.max(dash - 1.5, 0.5)} ${C}`}
                  strokeDashoffset={offset}
                >
                  <title>{`${s.label}: ${s.value}`}</title>
                </circle>
              );
            })}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="20"
          fontWeight="700"
          fill="#e9ebe4"
          className="rotate-90"
          style={{ transformOrigin: "50px 50px" }}
        >
          {total}
        </text>
      </svg>

      <ul className="min-w-0 flex-1 space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: s.color }} />
            <span className="flex-1 text-fog">{s.label}</span>
            <span className="font-mono text-xs text-bone">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
