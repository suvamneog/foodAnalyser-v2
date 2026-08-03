import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { memories } from "../utils/progression";
import { loadTarget } from "../utils/dailyTracker";
import { computeHealthScore } from "../utils/healthScore";

/**
 * 7-day chart: calories, protein, health score per day.
 */
export default function WeeklyView({ days = 7 }) {
  const [metric, setMetric] = useState("calories");
  const target = loadTarget();
  const week = useMemo(() => {
    return memories(days).map((d) => {
      const score = computeHealthScore(d.iso);
      return {
        ...d,
        healthScore: score.total,
        proteinTarget: target?.proteinG || 90,
        calorieTarget: target?.calories || 2000,
      };
    });
  }, [days, target?.proteinG, target?.calories]);

  const maxVal = useMemo(() => {
    if (metric === "calories") {
      return Math.max(target?.calories || 2000, ...week.map((d) => d.calories), 1);
    }
    if (metric === "protein") {
      return Math.max(target?.proteinG || 90, ...week.map((d) => d.protein), 1);
    }
    return 100;
  }, [metric, week, target]);

  const avg = useMemo(() => {
    const logged = week.filter((d) => d.logged);
    if (!logged.length) return 0;
    if (metric === "calories") {
      return Math.round(logged.reduce((s, d) => s + d.calories, 0) / logged.length);
    }
    if (metric === "protein") {
      return Math.round(logged.reduce((s, d) => s + d.protein, 0) / logged.length);
    }
    return Math.round(logged.reduce((s, d) => s + d.healthScore, 0) / logged.length);
  }, [week, metric]);

  const daysLogged = week.filter((d) => d.logged).length;

  return (
    <section className="fa-sticker relative p-5">
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Weekly view
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-white">
            Last {days} days
          </h3>
        </div>
        <div className="flex gap-1 rounded-full border border-white/12 bg-black/40 p-0.5 text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {[
            { id: "calories", label: "kcal" },
            { id: "protein", label: "protein" },
            { id: "score", label: "score" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              className={`rounded-full px-2.5 py-1 font-semibold transition ${
                metric === m.id
                  ? "bg-saffron-500/30 text-saffron-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  : "text-white/45 hover:text-white/80"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex h-36 items-end gap-2">
        {week.map((d) => {
          const value =
            metric === "calories"
              ? d.calories
              : metric === "protein"
              ? d.protein
              : d.healthScore;
          const h = Math.max(4, Math.round((value / maxVal) * 100));
          const targetLine =
            metric === "calories"
              ? d.calorieTarget
              : metric === "protein"
              ? d.proteinTarget
              : 75;
          const hit =
            metric === "score"
              ? value >= 50
              : value >= targetLine * 0.9 && value > 0;

          return (
            <div key={d.iso} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] text-white/40">
                {value > 0 ? Math.round(value) : "—"}
              </span>
              <div className="relative flex h-24 w-full items-end justify-center">
                <div
                  className={`w-full max-w-[28px] rounded-t-lg border-x border-t transition ${
                    d.logged
                      ? hit
                        ? "border-saffron-300/30 bg-gradient-to-t from-saffron-600 to-saffron-300 shadow-[0_0_10px_rgba(232,168,74,0.35)]"
                        : "border-white/15 bg-gradient-to-t from-white/15 to-white/35"
                      : "border-white/5 bg-white/8"
                  }`}
                  style={{ height: `${h}%` }}
                  title={`${d.iso}: ${value}`}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-white/45">
                {d.dow}
              </span>
              <span className="text-[10px] font-semibold text-white/70">{d.dom}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/50">
        <span>
          {daysLogged}/{days} days logged · avg {avg}
          {metric === "calories" ? " kcal" : metric === "protein" ? " g protein" : " score"}
        </span>
        <Link to="/tracker" className="text-saffron-300 hover:underline">
          Log today →
        </Link>
      </div>
      <p className="mt-2 text-[10px] text-white/35">
        Health score bars are a habit metric (nutrition + water + activity + streak), not a
        medical rating.
      </p>
    </section>
  );
}
