import { useState } from "react";
import { resolveTrust } from "../utils/trustBadge";

const TONE = {
  green:
    "border-emerald-400/45 bg-emerald-500/[0.08] text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  blue: "border-sky-400/45 bg-sky-500/[0.08] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  amber:
    "border-amber-400/45 bg-amber-500/[0.08] text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  muted: "border-white/15 bg-white/[0.04] text-white/60",
};

/**
 * Honest trust chip. Never shows "verified" unless resolveTrust says so.
 */
export default function TrustBadge({
  source,
  giStatus,
  giCitation,
  giNote,
  nutritionBasis,
  kind = "macros",
  portionAdjusted = false,
  detail,
  compact = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const trust = resolveTrust({
    source,
    giStatus,
    giCitation,
    giNote,
    nutritionBasis,
    kind,
    portionAdjusted,
    detail,
  });

  const tone = TONE[trust.tone] || TONE.muted;

  return (
    <span className={`relative inline-flex flex-col items-start ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide transition hover:brightness-110 ${tone}`}
        title={trust.detail}
        aria-expanded={open}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ring-2 ring-current/20 ${
            trust.level === "verified"
              ? "bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.7)]"
              : trust.level === "reference" || trust.level === "third-party"
              ? "bg-sky-300 shadow-[0_0_6px_rgba(125,211,252,0.55)]"
              : trust.level === "unavailable"
              ? "bg-white/40"
              : "bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.55)]"
          }`}
        />
        {compact ? trust.short : `${trust.short} · ${trust.label}`}
      </button>
      {trust.portionNote && !compact && (
        <span className="mt-1 text-[9px] text-amber-200/70">{trust.portionNote}</span>
      )}
      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-white/10 bg-ink-950 p-2 text-[10px] leading-relaxed text-white/70 shadow-xl">
          <strong className="text-white/90">{trust.label}</strong>
          <br />
          {trust.detail}
          <button
            type="button"
            className="mt-1 block text-[10px] text-saffron-300"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}
