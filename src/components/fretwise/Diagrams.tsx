import type { Dot } from "@/lib/fretwise-data";

/** Vertical chord-box diagram. shape[0] = low E, -1 = muted, 0 = open. */
export function ChordDiagram({ shape, baseFret = 1 }: { shape: number[]; baseFret?: number }) {
  const sx = (i: number) => 24 + i * 22;
  const fy = (j: number) => 40 + j * 28;
  const played = shape.filter((f) => f > 0);
  const min = played.length ? Math.min(...played) : baseFret;
  const start = min > 4 ? min : baseFret;

  return (
    <svg viewBox="0 0 168 200" className="h-48 w-40 max-w-full shrink-0" role="img" aria-label="Chord diagram">
      <rect x="20" y="36" width="116" height="8" rx="2" fill="var(--wood)" />
      {[0, 1, 2, 3, 4, 5].map((j) => (
        <line key={j} x1="24" y1={fy(j)} x2="134" y2={fy(j)} stroke="var(--border)" strokeWidth="1.5" />
      ))}
      {shape.map((_, i) => (
        <line key={i} x1={sx(i)} y1="40" x2={sx(i)} y2={fy(5)} stroke="var(--muted-foreground)" strokeWidth={1 + (5 - i) * 0.22} />
      ))}
      {shape.map((f, i) => {
        if (f === -1)
          return (
            <g key={i} stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round">
              <line x1={sx(i) - 5} y1="20" x2={sx(i) + 5} y2="30" />
              <line x1={sx(i) + 5} y1="20" x2={sx(i) - 5} y2="30" />
            </g>
          );
        if (f === 0)
          return <circle key={i} cx={sx(i)} cy="25" r="5.5" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" />;
        const rel = f - start + 1;
        return (
          <circle key={i} cx={sx(i)} cy={fy(rel) - 14} r="9" fill="var(--primary)" stroke="var(--background)" strokeWidth="1.5" />
        );
      })}
      {start > 1 && (
        <text x="146" y={fy(1) - 10} fill="var(--muted-foreground)" fontSize="13" fontFamily="var(--font-display)">
          {start}
        </text>
      )}
    </svg>
  );
}

/** Horizontal 5-fret neck diagram for scale shapes. string 0 = low E (bottom). */
export function ScaleDiagram({ dots, baseFret }: { dots: Dot[]; baseFret: number }) {
  const left = 40;
  const fw = 58;
  const top = 22;
  const sh = 22;
  const y = (s: number) => top + (5 - s) * sh;
  const x = (f: number) => left + (f - baseFret + 0.5) * fw;

  return (
    <svg viewBox="0 0 350 160" className="w-full min-w-0 max-w-md" role="img" aria-label="Scale shape diagram">
      <rect x={left} y={top - 4} width={fw * 5} height={sh * 5 + 8} rx="4" fill="var(--wood)" opacity="0.25" />
      {[0, 1, 2, 3, 4, 5].map((f) => (
        <line
          key={f}
          x1={left + f * fw}
          y1={top - 4}
          x2={left + f * fw}
          y2={top + sh * 5 + 4}
          stroke="var(--border)"
          strokeWidth={f === 0 ? 3 : 1.5}
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((s) => (
        <line key={s} x1={left} y1={y(s)} x2={left + fw * 5} y2={y(s)} stroke="var(--muted-foreground)" strokeWidth={1 + s * 0.2} />
      ))}
      {dots.map((d, i) => (
        <g key={i}>
          <circle
            cx={x(d.fret)}
            cy={y(d.string)}
            r="10"
            fill={d.root ? "var(--primary)" : "var(--surface-raised)"}
            stroke={d.root ? "var(--primary)" : "var(--muted-foreground)"}
            strokeWidth="1.5"
          />
          {d.root && (
            <text x={x(d.fret)} y={y(d.string) + 4} textAnchor="middle" fontSize="10" fill="var(--primary-foreground)" fontFamily="var(--font-display)">
              R
            </text>
          )}
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((f) => (
        <text
          key={f}
          x={left + (f + 0.5) * fw}
          y={top + sh * 5 + 24}
          textAnchor="middle"
          fontSize="11"
          fill="var(--muted-foreground)"
        >
          {baseFret + f}
        </text>
      ))}
    </svg>
  );
}

export function StreakRing({
  value,
  max,
  size = 132,
  label,
  sub,
}: {
  value: number;
  max: number;
  size?: number;
  label: string;
  sub: string;
}) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--secondary)" strokeWidth="9" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.2,0.8,0.2,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold leading-none">{label}</div>
        <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
