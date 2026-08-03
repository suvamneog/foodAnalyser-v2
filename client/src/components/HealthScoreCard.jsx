import { motion, useReducedMotion } from "framer-motion";
import { computeHealthScore } from "../utils/healthScore";

const COLORS = {
  emerald: "#34d399",
  saffron: "#e8a84a",
  amber: "#f59e0b",
  gray: "#6b7280",
};

/**
 * Big radial Health Score with pillar breakdown.
 * Compact mode omits the pillar rows (for embedding in narrow spaces).
 */
export default function HealthScoreCard({ compact = false, dateISO }) {
  const reduce = useReducedMotion();
  const score = computeHealthScore(dateISO);
  const color = COLORS[score.band.color] || COLORS.saffron;

  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score.total / 100) * circ;

  const bandTone =
    score.band.color === "emerald"
      ? "fa-sticker-leaf"
      : score.band.color === "saffron"
      ? "fa-sticker-saffron"
      : score.band.color === "amber"
      ? "fa-sticker-ember"
      : "";

  return (
    <div className={`fa-sticker ${bandTone} p-5`}>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Daily health score
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-white">Today</h3>
        </div>
        <span
          className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
          style={{ background: `${color}22`, color, borderColor: `${color}55` }}
        >
          {score.band.label}
        </span>
      </div>

      <div className="relative mt-4 flex items-center gap-5">
        <div className="relative">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <defs>
              <linearGradient id="hs-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              stroke="url(#hs-grad)"
              strokeWidth="12"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              transform="rotate(-90 64 64)"
              style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
            />
            <text
              x="64"
              y="64"
              textAnchor="middle"
              fill="white"
              fontSize="32"
              fontWeight="800"
              fontFamily="Bricolage Grotesque, system-ui, sans-serif"
              letterSpacing="-1"
            >
              {score.total}
            </text>
            <text
              x="64"
              y="84"
              textAnchor="middle"
              fill="rgba(255,255,255,0.55)"
              fontSize="10"
              fontWeight="600"
              letterSpacing="2"
            >
              OF 100
            </text>
          </svg>
        </div>

        {!compact && (
          <div className="flex-1 space-y-2 text-[12px]">
            {Object.entries(score.parts).map(([, p]) => (
              <PillarRow key={p.label} pillar={p} accent={color} />
            ))}
          </div>
        )}
      </div>

      {!compact && score.parts.nutrition.status === "no-target" && (
        <p className="relative mt-3 rounded-lg border border-yellow-400/25 bg-yellow-500/10 px-3 py-2 text-[11px] text-yellow-100">
          Set a target on the diet plan page to unlock the 40-point nutrition pillar.
        </p>
      )}
    </div>
  );
}

function PillarRow({ pillar, accent }) {
  const pct = pillar.max === 0 ? 0 : Math.min(100, (pillar.pts / pillar.max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-white/75">
        <span className="font-medium">{pillar.label}</span>
        <span className="font-semibold text-white/55">
          {Math.round(pillar.pts)}/{pillar.max}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full border border-black/40 bg-black/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(180deg, ${accent}, ${accent}bb)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 0 6px ${accent}66`,
          }}
        />
      </div>
      {pillar.detail && (
        <p className="mt-0.5 text-[10px] text-white/45">{pillar.detail}</p>
      )}
    </div>
  );
}
