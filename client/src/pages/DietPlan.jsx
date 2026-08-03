import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Target as TargetIcon,
  Dumbbell,
  HeartPulse,
} from "lucide-react";
import { Reveal, RevealMount } from "../components/PageTransition";
import {
  ACTIVITY_LEVELS,
  DIET_TYPES,
  PERSONAS,
  calcBMR,
  calcTDEE,
  personaTargets,
  generateDailyPlan,
} from "../utils/dietPlan";
import { MEAL_TEMPLATES } from "../data/mealTemplates";
import { REGION_OPTIONS } from "../data/regionalVariants";
import { saveTarget } from "../utils/dailyTracker";
import { recordPlanSaved } from "../utils/progression";

const DEFAULT_FORM = {
  sex: "male",
  age: 28,
  heightCm: 172,
  weightKg: 70,
  activityId: "moderate",
  personaId: "maintain",
  dietType: "veg",
  regionId: "all",
};

const EASE = [0.22, 1, 0.36, 1];

export default function DietPlan() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saved, setSaved] = useState(false);

  const derived = useMemo(() => {
    const bmr = calcBMR(form);
    const tdee = calcTDEE({ bmr, activityId: form.activityId });
    const target = personaTargets({
      weightKg: form.weightKg,
      tdee,
      personaId: form.personaId,
    });
    return { bmr, tdee, target };
  }, [form]);

  const plan = useMemo(() => {
    return generateDailyPlan(MEAL_TEMPLATES, {
      personaId: form.personaId,
      dietType: form.dietType,
      regionId: form.regionId,
      targetCalories: derived.target.targetCalories,
      macros: derived.target.macros,
    });
    // refreshKey deliberately triggers new randomised pick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.personaId,
    form.dietType,
    form.regionId,
    derived.target.targetCalories,
    derived.target.macros.proteinG,
    derived.target.macros.carbsG,
    derived.target.macros.fatG,
    refreshKey,
  ]);

  const persona = derived.target.persona;

  const activateTarget = () => {
    saveTarget({
      calories: derived.target.targetCalories,
      proteinG: derived.target.macros.proteinG,
      carbsG: derived.target.macros.carbsG,
      fatG: derived.target.macros.fatG,
      personaId: form.personaId,
      dietType: form.dietType,
      setAt: Date.now(),
    });
    recordPlanSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            <Sparkles className="h-5 w-5 text-saffron-300" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron-300/90">
              Diet plan · Indian foods
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your daily calorie & meal plan
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">
              Mifflin-St Jeor BMR + activity factor + persona goal, matched to IFCT/INDB meal
              templates. All numbers are ranges — refine each plate with the customiser.
            </p>
          </div>
        </RevealMount>

        {/* Form */}
        <Reveal className="mt-8 rounded-3xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Sex">
              <select
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
                className="fa-select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="Age">
              <input
                type="number"
                min={12}
                max={100}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                className="fa-input"
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number"
                min={100}
                max={230}
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
                className="fa-input"
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                min={30}
                max={200}
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                className="fa-input"
              />
            </Field>
            <Field label="Activity">
              <select
                value={form.activityId}
                onChange={(e) => setForm({ ...form, activityId: e.target.value })}
                className="fa-select"
              >
                {ACTIVITY_LEVELS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Goal">
              <select
                value={form.personaId}
                onChange={(e) => setForm({ ...form, personaId: e.target.value })}
                className="fa-select"
              >
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Diet type">
              <select
                value={form.dietType}
                onChange={(e) => setForm({ ...form, dietType: e.target.value })}
                className="fa-select"
              >
                {DIET_TYPES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Regional preference">
              <select
                value={form.regionId}
                onChange={(e) => setForm({ ...form, regionId: e.target.value })}
                className="fa-select"
              >
                <option value="all">All India</option>
                {REGION_OPTIONS.filter((r) => r.id !== "all").map((r) => (
                  <option key={r.id} value={r.cuisineSlug}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Reveal>

        {/* Target card */}
        <Reveal delay={0.06} className="mt-8 grid gap-4 sm:grid-cols-4">
          <TargetCard label="BMR" value={`${Math.round(derived.bmr)}`} unit="kcal" />
          <TargetCard label="Maintenance (TDEE)" value={`${Math.round(derived.tdee)}`} unit="kcal" />
          <TargetCard
            label="Target"
            value={`${derived.target.targetCalories}`}
            unit="kcal"
            accent
          />
          <TargetCard
            label="Protein target"
            value={`${derived.target.macros.proteinG}`}
            unit="g"
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
          <TargetIcon className="h-4 w-4 text-saffron-300" />
          <span>
            <strong className="text-white">{persona.label}</strong> · protein{" "}
            {derived.target.macros.proteinG} g · carbs {derived.target.macros.carbsG} g ·
            fat {derived.target.macros.fatG} g
          </span>
          <button
            type="button"
            onClick={activateTarget}
            className="ml-auto rounded-full border border-saffron-400/30 bg-saffron-500/15 px-3 py-1.5 text-xs font-semibold text-saffron-100 hover:bg-saffron-500/25"
          >
            {saved ? "Saved for tracker ✓" : "Use as tracker target"}
          </button>
        </Reveal>

        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          {persona.note} — estimates; not medical advice. See a registered dietitian for
          clinical conditions.
        </p>

        {/* Meal plan */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Today’s plan</h2>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-saffron-400/40 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {["breakfast", "lunch", "snack", "dinner"].map((slot, i) => {
              const meal = plan.picks[slot];
              if (!meal) return null;
              return (
                <motion.article
                  key={slot}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.25), ease: EASE }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-300/80">
                    {slot}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-white">
                    {meal.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    {meal.description}
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
                    <Cell label="kcal" value={meal.calories} />
                    <Cell label="P" value={`${meal.protein}g`} />
                    <Cell label="C" value={`${meal.carbs}g`} />
                    <Cell label="F" value={`${meal.fat}g`} />
                  </div>
                  <Link
                    to={{ pathname: "/" }}
                    state={{ cuisineSearch: { query: meal.searchQuery, results: [] } }}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-saffron-400/30 hover:text-white"
                  >
                    Analyse this plate →
                  </Link>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-[11px] leading-relaxed text-white/50">
            Plan totals: {Math.round(plan.totals.calories)} kcal · P {plan.totals.protein} g
            · C {plan.totals.carbs} g · F {plan.totals.fat} g. Adjust portions on each result
            card to match your target.
          </div>
        </section>

        {/* Guidance */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Tips for this goal</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/60">
            {derived.target.guidance.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-400" />
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <Link
            to="/tracker"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-saffron-400/40"
          >
            <HeartPulse className="h-5 w-5 text-saffron-300" />
            <p className="mt-2 font-semibold text-white">Open daily tracker</p>
            <p className="mt-1 text-[11px] text-white/45">Log meals against this target.</p>
          </Link>
          <Link
            to="/recipe"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-saffron-400/40"
          >
            <Dumbbell className="h-5 w-5 text-saffron-300" />
            <p className="mt-2 font-semibold text-white">Recipe → nutrition</p>
            <p className="mt-1 text-[11px] text-white/45">
              Paste ingredients, get plate macros.
            </p>
          </Link>
          <Link
            to="/compare/roti"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-saffron-400/40"
          >
            <TargetIcon className="h-5 w-5 text-saffron-300" />
            <p className="mt-2 font-semibold text-white">Regional compare</p>
            <p className="mt-1 text-[11px] text-white/45">
              Roti / rice / dal across kitchens.
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function TargetCard({ label, value, unit, accent }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-saffron-400/30 bg-saffron-500/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold text-white">
        {value}
        <span className="ml-1 text-sm font-medium text-white/45">{unit}</span>
      </p>
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div className="rounded-lg bg-black/30 py-2">
      <p className="text-white/40">{label}</p>
      <p className="mt-0.5 font-semibold text-white/85">{value}</p>
    </div>
  );
}
