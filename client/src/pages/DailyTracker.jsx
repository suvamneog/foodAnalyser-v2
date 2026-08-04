import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Search as SearchIcon,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { Reveal, RevealMount } from "../components/PageTransition";
import {
  addEntry,
  addWater,
  insights,
  loadActivity,
  loadLog,
  loadTarget,
  loadWater,
  removeEntry,
  saveActivity,
  saveTarget,
  saveWater,
  todayISO,
  totals,
  WATER_TARGET_ML_DEFAULT,
} from "../utils/dailyTracker";
import { fetchFoodData } from "../utils/fetchFoodData";
import { recordMealLogged } from "../utils/progression";
import QuickLogBox from "../components/QuickLogBox";
import HealthScoreCard from "../components/HealthScoreCard";
import WeeklyView from "../components/WeeklyView";
import TrustBadge from "../components/TrustBadge";
import SearchAutocomplete from "../components/SearchAutocomplete";
import { GlassWater, Footprints } from "lucide-react";
import { isLoggedInForSync, lastSyncAt, pullFromCloud } from "../utils/cloudSync";

const MEAL_SLOTS = ["breakfast", "lunch", "snack", "dinner"];

export default function DailyTracker() {
  const reduce = useReducedMotion();
  const [target, setTarget] = useState(() => loadTarget());
  const [entries, setEntries] = useState(() => loadLog());
  const [water, setWater] = useState(() => loadWater());
  const [activity, setActivity] = useState(() => loadActivity());
  const [scoreTick, setScoreTick] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [hints, setHints] = useState([]);
  const [slot, setSlot] = useState("breakfast");
  const [portion, setPortion] = useState(100);
  const [manualOpen, setManualOpen] = useState(false);

  const summary = useMemo(() => totals(entries), [entries]);
  const tips = useMemo(
    () => (target ? insights({ target, actual: summary }) : []),
    [target, summary]
  );

  useEffect(() => {
    setTarget(loadTarget());
    setEntries(loadLog());
    setWater(loadWater());
    setActivity(loadActivity());
  }, []);

  const bumpScore = () => setScoreTick((t) => t + 1);

  const bumpWater = (deltaMl) => {
    setWater(addWater(deltaMl));
    bumpScore();
  };

  const zeroWater = () => {
    saveWater(0);
    setWater(0);
    bumpScore();
  };

  const patchActivity = (patch) => {
    const next = saveActivity({ ...activity, ...patch });
    setActivity(next);
    bumpScore();
  };

  const runSearch = async (termArg) => {
    const term = (typeof termArg === "string" ? termArg : query).trim();
    if (!term) return;
    if (term !== query) setQuery(term);
    setSearching(true);
    setError(null);
    setSuggestions([]);
    setHints([]);
    try {
      const items = await fetchFoodData(term);
      setResults(Array.isArray(items) ? items : items ? [items] : []);
    } catch (err) {
      const msg = err.message || "Search failed";
      const cold = /timeout|network|failed to fetch|503|502|504/i.test(msg);
      setError(
        cold
          ? `${msg}. The API may be waking up — retry in a few seconds.`
          : msg
      );
      setSuggestions(Array.isArray(err?.suggestions) ? err.suggestions : []);
      setHints(Array.isArray(err?.hints) ? err.hints : []);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const logFood = (food) => {
    const factor = (Number(portion) || 100) / (food.serving_size_g || 100);
    const next = addEntry({
      name: food.displayName || food.name,
      slot,
      grams: Number(portion) || 100,
      calories: Math.round((food.calories || 0) * factor),
      protein: Math.round((food.protein_g || 0) * factor),
      carbs: Math.round((food.carbohydrates_total_g || 0) * factor),
      fat: Math.round((food.fat_total_g || 0) * factor),
      source: food.source,
    });
    setEntries(next);
    recordMealLogged();
    bumpScore();
  };

  const logManual = (payload) => {
    const next = addEntry(payload);
    setEntries(next);
    setManualOpen(false);
    recordMealLogged();
    bumpScore();
  };

  const onQuickLogged = () => {
    setEntries(loadLog());
    recordMealLogged();
    bumpScore();
  };

  const removeLine = (id) => {
    setEntries(removeEntry(id));
    bumpScore();
  };

  const setManualTarget = (patch) => {
    const next = { ...(target || { calories: 2000, proteinG: 90, carbsG: 250, fatG: 60 }), ...patch };
    setTarget(next);
    saveTarget(next);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6">
        <RevealMount delay={0} y={10} duration={0.55}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </RevealMount>

        <RevealMount delay={0.08} className="mt-6 flex items-start gap-3">
          <div className="rounded-2xl border border-saffron-400/20 bg-saffron-500/10 p-3">
            <HeartPulse className="h-5 w-5 text-saffron-300" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron-300/90">
              Today · {todayISO()}
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Daily tracker
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">
              Log Indian foods for today and compare against your diet-plan target.
              Targets auto-save from Diet Plan.
            </p>
          </div>
          {target ? (
            <Link
              to="/plan"
              className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/[0.08]"
            >
              Edit plan →
            </Link>
          ) : (
            <Link
              to="/plan"
              className="rounded-full border border-saffron-400/30 bg-saffron-500/15 px-3 py-1.5 text-xs font-semibold text-saffron-100 hover:bg-saffron-500/25"
            >
              Set target →
            </Link>
          )}
        </RevealMount>

        {/* Today vs plan — always visible */}
        <Reveal className="mt-6">
          <TodayVsPlan summary={summary} target={target} />
        </Reveal>

        {/* Quick log */}
        <Reveal className="mt-6">
          <QuickLogBox onLogged={onQuickLogged} />
        </Reveal>

        {/* Health Score + Water + Activity */}
        <Reveal delay={0.06} className="mt-6 grid gap-4 lg:grid-cols-[1.3fr,1fr]">
          <div className="space-y-3">
            <HealthScoreCard key={scoreTick} />
            <TrustBadge kind="health-score" />
          </div>
          <div className="space-y-4">
            <WaterBox
              water={water}
              onAdd={bumpWater}
              onReset={zeroWater}
              onSet={(v) => {
                saveWater(v);
                setWater(v);
                bumpScore();
              }}
            />
            <ActivityBox activity={activity} onChange={patchActivity} />
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-6">
          <WeeklyView key={`week-${scoreTick}`} />
        </Reveal>

        <SyncStatusBanner
          onPull={async () => {
            await pullFromCloud();
            setEntries(loadLog());
            setWater(loadWater());
            setActivity(loadActivity());
            setTarget(loadTarget());
            bumpScore();
          }}
        />

        {/* Rings */}
        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          <Ring
            label="Calories"
            actual={summary.calories}
            target={target?.calories || 2000}
            unit="kcal"
            reduce={reduce}
          />
          <Ring
            label="Protein"
            actual={summary.protein}
            target={target?.proteinG || 90}
            unit="g"
            reduce={reduce}
          />
          <Ring
            label="Carbs"
            actual={summary.carbs}
            target={target?.carbsG || 250}
            unit="g"
            reduce={reduce}
          />
          <Ring
            label="Fat"
            actual={summary.fat}
            target={target?.fatG || 60}
            unit="g"
            reduce={reduce}
          />
        </section>

        {/* Manual target editor */}
        {target && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[11px] text-white/50">
            <span className="text-white/60">Target:</span>
            <MiniInput
              value={target.calories}
              onChange={(v) => setManualTarget({ calories: v })}
              suffix="kcal"
            />
            <MiniInput
              value={target.proteinG}
              onChange={(v) => setManualTarget({ proteinG: v })}
              suffix="g P"
            />
            <MiniInput
              value={target.carbsG}
              onChange={(v) => setManualTarget({ carbsG: v })}
              suffix="g C"
            />
            <MiniInput
              value={target.fatG}
              onChange={(v) => setManualTarget({ fatG: v })}
              suffix="g F"
            />
          </div>
        )}

        {/* Insights */}
        {tips.length > 0 && (
          <section className="mt-4 rounded-2xl border border-saffron-400/20 bg-saffron-500/10 p-4">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-200">
              <Sparkles className="h-3 w-3" /> Insights
            </p>
            <ul className="mt-2 space-y-1 text-sm text-white/75">
              {tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Add food */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Log a meal</h2>
          <p className="mt-1 text-sm text-white/45">
            Search IFCT/INDB, pick a slot + portion, tap Add. Or log manually.
          </p>

          <div className="mt-4 space-y-3">
            <div className="relative z-30">
              <SearchAutocomplete
                value={query}
                onChange={setQuery}
                onSubmit={(t) => runSearch(t)}
                placeholder="Search a dish — dal, dosa, chicken curry, roti…"
                inputId="tracker-search"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 text-[11px] text-white/50">
                Meal
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="fa-select"
                >
                  {MEAL_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex items-center gap-2 text-[11px] text-white/50">
                Portion
                <input
                  type="number"
                  min={10}
                  max={1500}
                  value={portion}
                  onChange={(e) => setPortion(Number(e.target.value))}
                  className="fa-input w-24"
                  aria-label="Portion grams"
                />
                <span className="text-xs text-white/40">g</span>
              </label>
              <button
                type="button"
                onClick={() => runSearch(query)}
                disabled={searching || !query.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-saffron-500 px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
              >
                <SearchIcon className="h-4 w-4" />
                {searching ? "Searching…" : "Search"}
              </button>
              <button
                type="button"
                onClick={() => setManualOpen((v) => !v)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:border-saffron-400/40 hover:text-white"
              >
                Manual entry
              </button>
            </div>
          </div>

          {manualOpen && (
            <ManualEntry onCancel={() => setManualOpen(false)} onAdd={logManual} slot={slot} />
          )}

          {error && (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => runSearch(query)}
                className="mt-2 rounded-full border border-red-300/30 bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-100 hover:bg-red-500/25"
              >
                Retry search
              </button>
              {suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-red-100/80">
                    Did you mean
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => runSearch(s.displayName || s.name)}
                        className="rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 text-[11px] font-medium text-white/90 hover:border-saffron-400/50 hover:bg-saffron-500/15"
                      >
                        {s.displayName || s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {hints.length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-[11px] text-red-100/80">
                  {hints.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {results.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {results.slice(0, 6).map((food) => (
                <li
                  key={food.name}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {food.displayName || food.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/40">
                      {Math.round(food.calories || 0)} kcal / {food.serving_size_g || 100} g
                      · {food.source || "unknown"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => logFood(food)}
                    className="rounded-full border border-saffron-400/30 bg-saffron-500/15 px-3 py-1.5 text-[11px] font-semibold text-saffron-100 hover:bg-saffron-500/25"
                  >
                    <Plus className="mr-1 inline h-3 w-3" />
                    Add {portion}g
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Today's log */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Today’s log</h2>
          {entries.length === 0 ? (
            <p className="mt-3 text-sm text-white/45">
              Nothing logged yet. Search a dish or add manually.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {MEAL_SLOTS.map((s) => {
                const rows = entries.filter((e) => e.slot === s);
                if (rows.length === 0) return null;
                return (
                  <div key={s}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      {s}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {rows.map((e) => (
                        <li
                          key={e.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm text-white">{e.name}</p>
                            <p className="mt-0.5 text-[11px] text-white/40">
                              {e.grams ? `${e.grams} g · ` : ""}
                              {Math.round(e.calories)} kcal · P {Math.round(e.protein)}g · C{" "}
                              {Math.round(e.carbs)}g · F {Math.round(e.fat)}g
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(e.id)}
                            className="rounded-full p-2 text-white/40 transition hover:bg-red-500/10 hover:text-red-300"
                            aria-label="Remove entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SyncStatusBanner({ onPull }) {
  const loggedIn = isLoggedInForSync();
  const at = lastSyncAt();
  const label = at
    ? `Last cloud sync ${new Date(at).toLocaleString()}`
    : "Not synced yet";

  if (!loggedIn) {
    return (
      <p className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[11px] text-white/45">
        Logs stay on this device.{" "}
        <Link to="/login" className="text-saffron-300 underline">
          Log in
        </Link>{" "}
        to sync streak, meals, water and progress to the cloud.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-[11px] text-emerald-100">
      <span>Cloud sync on · {label}</span>
      <button
        type="button"
        onClick={onPull}
        className="rounded-full border border-emerald-400/40 px-3 py-1 font-semibold hover:bg-emerald-500/20"
      >
        Sync now
      </button>
    </div>
  );
}

function WaterBox({ water, onAdd, onReset, onSet }) {
  const pct = Math.min(100, Math.round((water / WATER_TARGET_ML_DEFAULT) * 100));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GlassWater className="h-4 w-4 text-sky-300" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Water
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] text-white/40 hover:text-white/80"
        >
          reset
        </button>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <input
          type="number"
          value={water}
          onChange={(e) => onSet(Math.max(0, Number(e.target.value) || 0))}
          className="fa-input w-24 !py-1 text-lg font-bold"
          aria-label="Water in ml"
        />
        <span className="text-xs text-white/40">/ {WATER_TARGET_ML_DEFAULT} ml</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { l: "+ 1 glass", v: 250 },
          { l: "+ 500 ml", v: 500 },
          { l: "+ 1 L", v: 1000 },
        ].map((p) => (
          <button
            key={p.l}
            type="button"
            onClick={() => onAdd(p.v)}
            className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-100 hover:bg-sky-500/20"
          >
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActivityBox({ activity, onChange }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2">
        <Footprints className="h-4 w-4 text-emerald-300" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
          Activity
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <label className="block">
          <span className="text-white/45">Steps</span>
          <input
            type="number"
            min={0}
            value={activity.steps || ""}
            onChange={(e) => onChange({ steps: Number(e.target.value) })}
            placeholder="0"
            className="fa-input !py-1 mt-1"
          />
        </label>
        <label className="block">
          <span className="text-white/45">Workout kcal</span>
          <input
            type="number"
            min={0}
            value={activity.workoutKcal || ""}
            onChange={(e) => onChange({ workoutKcal: Number(e.target.value) })}
            placeholder="0"
            className="fa-input !py-1 mt-1"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { l: "🏃 30 min run", steps: 3500, kcal: 240 },
          { l: "🏋️ 45 min gym", steps: 800, kcal: 320 },
          { l: "🧘 30 min yoga", steps: 300, kcal: 120 },
          { l: "🚶 3 km walk", steps: 4200, kcal: 150 },
        ].map((p) => (
          <button
            key={p.l}
            type="button"
            onClick={() =>
              onChange({
                steps: (activity.steps || 0) + p.steps,
                workoutKcal: (activity.workoutKcal || 0) + p.kcal,
                workoutMinutes: (activity.workoutMinutes || 0) + 30,
              })
            }
            className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/20"
          >
            {p.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function TodayVsPlan({ summary, target }) {
  const rows = [
    { key: "calories", label: "Calories", actual: summary.calories, goal: target?.calories, unit: "kcal" },
    { key: "protein", label: "Protein", actual: summary.protein, goal: target?.proteinG, unit: "g" },
    { key: "carbs", label: "Carbs", actual: summary.carbs, goal: target?.carbsG, unit: "g" },
    { key: "fat", label: "Fat", actual: summary.fat, goal: target?.fatG, unit: "g" },
  ];

  if (!target) {
    return (
      <div className="rounded-2xl border border-dashed border-saffron-400/30 bg-saffron-500/[0.06] px-4 py-4 text-sm text-white/60">
        No diet-plan target yet.{" "}
        <Link to="/plan" className="font-semibold text-saffron-300 underline underline-offset-2">
          Set one on Diet Plan
        </Link>{" "}
        — it auto-saves here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-saffron-300/90">
            Today vs plan
          </p>
          <p className="mt-1 text-sm text-white/50">
            Live progress against your Diet Plan target
            {target.personaId ? ` · ${target.personaId.replace(/-/g, " ")}` : ""}.
          </p>
        </div>
        <Link to="/plan" className="text-[11px] font-semibold text-saffron-300 hover:underline">
          Adjust plan
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => {
          const goal = Math.max(1, Number(row.goal) || 1);
          const actual = Number(row.actual) || 0;
          const pct = Math.min(100, Math.round((actual / goal) * 100));
          const left = Math.max(0, Math.round(goal - actual));
          const over = actual > goal * 1.05;
          return (
            <div key={row.key}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium text-white/70">{row.label}</span>
                <span className="fa-num text-white/90">
                  {Math.round(actual)}
                  <span className="text-white/40"> / {Math.round(goal)} {row.unit}</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    over ? "bg-ember-400" : "bg-saffron-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-white/40">
                {over
                  ? `${Math.round(actual - goal)} ${row.unit} over plan`
                  : `${left} ${row.unit} left`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Ring({ label, actual, target, unit, reduce }) {
  const pct = Math.min(100, Math.round((actual / Math.max(1, target)) * 100));
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  const over = actual > target * 1.05;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={over ? "#ef4444" : "#e8a84a"}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontWeight="700"
          >
            {pct}%
          </text>
        </svg>
        <div className="min-w-0">
          <p className="font-display text-2xl font-extrabold text-white">
            {Math.round(actual)}
            <span className="ml-1 text-xs font-medium text-white/45">{unit}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/40">of {Math.round(target)} {unit}</p>
        </div>
      </div>
    </motion.div>
  );
}

function MiniInput({ value, onChange, suffix }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 bg-transparent text-center text-white outline-none"
      />
      <span className="text-white/40">{suffix}</span>
    </span>
  );
}

function ManualEntry({ onCancel, onAdd, slot }) {
  const [row, setRow] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    grams: 100,
    slot,
  });
  const submit = (e) => {
    e.preventDefault();
    if (!row.name) return;
    onAdd({ ...row, slot });
  };
  return (
    <form onSubmit={submit} className="mt-3 grid gap-2 rounded-xl border border-white/8 bg-black/30 p-3 sm:grid-cols-6">
      <input
        className="fa-input sm:col-span-2"
        placeholder="Food name"
        value={row.name}
        onChange={(e) => setRow({ ...row, name: e.target.value })}
      />
      <input
        type="number"
        className="fa-input"
        placeholder="kcal"
        value={row.calories}
        onChange={(e) => setRow({ ...row, calories: Number(e.target.value) })}
      />
      <input
        type="number"
        className="fa-input"
        placeholder="P g"
        value={row.protein}
        onChange={(e) => setRow({ ...row, protein: Number(e.target.value) })}
      />
      <input
        type="number"
        className="fa-input"
        placeholder="C g"
        value={row.carbs}
        onChange={(e) => setRow({ ...row, carbs: Number(e.target.value) })}
      />
      <input
        type="number"
        className="fa-input"
        placeholder="F g"
        value={row.fat}
        onChange={(e) => setRow({ ...row, fat: Number(e.target.value) })}
      />
      <div className="sm:col-span-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-saffron-500 px-4 py-1.5 text-xs font-semibold text-ink-950"
        >
          Add entry
        </button>
      </div>
    </form>
  );
}
