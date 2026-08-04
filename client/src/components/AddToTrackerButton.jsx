import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { addEntry, todayISO } from "../utils/dailyTracker";
import { recordMealLogged } from "../utils/progression";
import { scheduleSyncPush } from "../utils/cloudSync";

const SLOTS = ["breakfast", "lunch", "snack", "dinner"];

function slotByTime() {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 19) return "snack";
  return "dinner";
}

/**
 * One-tap add plate macros to today's tracker.
 * Expects already-computed plate values (after portion/oil customise).
 */
export default function AddToTrackerButton({
  name,
  calories,
  protein,
  carbs,
  fat,
  grams,
  source,
  className = "",
}) {
  const [slot, setSlot] = useState(slotByTime());
  const [done, setDone] = useState(false);

  const canAdd =
    name &&
    Number.isFinite(Number(calories)) &&
    Number(calories) > 0;

  const onAdd = () => {
    if (!canAdd || done) return;
    addEntry(
      {
        name: String(name),
        slot,
        grams: Math.round(Number(grams) || 0) || undefined,
        calories: Math.round(Number(calories) || 0),
        protein: Math.round(Number(protein) || 0),
        carbs: Math.round(Number(carbs) || 0),
        fat: Math.round(Number(fat) || 0),
        source: source || "manual",
      },
      todayISO()
    );
    recordMealLogged();
    scheduleSyncPush();
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <select
        value={slot}
        onChange={(e) => setSlot(e.target.value)}
        className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[11px] text-white/80"
        aria-label="Meal slot"
      >
        {SLOTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!canAdd || done}
        onClick={onAdd}
        className={`fa-btn-chunky ${done ? "!bg-emerald-500 !bg-none !text-emerald-950" : ""} text-[11px] !py-1.5 !px-3.5`}
        style={done ? { background: "linear-gradient(180deg, #6ee7b7 0%, #34d399 55%, #10b981 100%)" } : undefined}
      >
        {done ? (
          <>
            <Check className="h-3.5 w-3.5" /> Logged
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" /> Log to tracker
          </>
        )}
      </button>
      {done && (
        <Link to="/tracker" className="text-[11px] text-saffron-300 underline">
          Open tracker
        </Link>
      )}
    </div>
  );
}
