import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChefHat, Loader2 } from "lucide-react";
import { parseRecipe, resolveRecipe } from "../utils/ingredientParser";
import { addEntry } from "../utils/dailyTracker";
import { recordMealLogged, recordRecipeAnalyzed } from "../utils/progression";
import TrustBadge from "../components/TrustBadge";
import AddToTrackerButton from "../components/AddToTrackerButton";

const EXAMPLE = `250 g paneer
2 tbsp mustard oil
1 medium onion
2 medium tomato
1 tsp ghee
1 katori dal
2 rotis`;

export default function RecipeAnalyzer() {
  const reduce = useReducedMotion();
  const [text, setText] = useState(EXAMPLE);
  const [servings, setServings] = useState(2);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const analyse = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = parseRecipe(text);
      if (rows.length === 0) {
        setError("Add at least one ingredient line.");
        return;
      }
      const r = await resolveRecipe(rows);
      setResult(r);
      recordRecipeAnalyzed();
    } catch (e) {
      setError(e.message || "Could not analyse recipe.");
    } finally {
      setLoading(false);
    }
  };

  const perServing = result
    ? {
        calories: result.totals.calories / Math.max(1, servings),
        protein: result.totals.protein / Math.max(1, servings),
        carbs: result.totals.carbs / Math.max(1, servings),
        fat: result.totals.fat / Math.max(1, servings),
        fiber: result.totals.fiber / Math.max(1, servings),
      }
    : null;

  const logAsMeal = () => {
    if (!perServing) return;
    addEntry({
      name: "Home recipe (1 serving)",
      slot: "lunch",
      grams: Math.round(result.totals.grams / Math.max(1, servings)),
      calories: Math.round(perServing.calories),
      protein: Math.round(perServing.protein),
      carbs: Math.round(perServing.carbs),
      fat: Math.round(perServing.fat),
      source: "Recipe analyser",
    });
    recordMealLogged();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <header className="mt-6 flex items-start gap-3">
          <div className="rounded-2xl border border-saffron-400/20 bg-saffron-500/10 p-3">
            <ChefHat className="h-5 w-5 text-saffron-300" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron-300/90">
              Recipe → nutrition
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Analyse a home recipe
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">
              Type or paste ingredients — one per line, or comma separated. Units supported:
              g / kg / ml / tsp / tbsp / cup / katori / bowl, and pieces (small/medium/large).
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Ingredients
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="fa-input mt-2 min-h-[220px] w-full resize-y font-mono text-sm"
              placeholder={EXAMPLE}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-white/50">
                Servings
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="fa-input w-16 text-center"
                />
              </label>
              <button
                type="button"
                onClick={analyse}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-saffron-500 px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Analyse recipe
              </button>
              {error && <span className="text-xs text-red-300">{error}</span>}
            </div>
          </div>

          <div>
            {result ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-300/80">
                  Per serving ({servings} servings total)
                </p>
                <p className="mt-2 font-display text-4xl font-extrabold text-white">
                  {Math.round(perServing.calories)}{" "}
                  <span className="text-sm font-medium text-white/45">kcal</span>
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px]">
                  <MacroCell label="P" value={`${perServing.protein.toFixed(1)}g`} />
                  <MacroCell label="C" value={`${perServing.carbs.toFixed(1)}g`} />
                  <MacroCell label="F" value={`${perServing.fat.toFixed(1)}g`} />
                  <MacroCell label="Fibre" value={`${perServing.fiber.toFixed(1)}g`} />
                </div>

                <div className="mt-4 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-[11px] text-white/50">
                  Whole recipe: {Math.round(result.totals.calories)} kcal ·{" "}
                  {Math.round(result.totals.grams)} g total edible mass.
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <TrustBadge kind="portion" compact />
                  <TrustBadge source="Recipe analyser" kind="macros" compact />
                </div>
                <AddToTrackerButton
                  className="mt-3"
                  name="Home recipe (1 serving)"
                  calories={perServing.calories}
                  protein={perServing.protein}
                  carbs={perServing.carbs}
                  fat={perServing.fat}
                  grams={Math.round(result.totals.grams / Math.max(1, servings))}
                  source="Recipe analyser"
                />
                <button
                  type="button"
                  onClick={logAsMeal}
                  className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:border-white/20"
                >
                  {saved ? "Also logged ✓" : "Quick log (same as above)"}
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
                Fill ingredients and press <strong>Analyse recipe</strong>. The tool tries
                IFCT/INDB first for each ingredient and falls back to a small local table
                for common kitchen items.
              </div>
            )}

            {result && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Ingredient breakdown
                </p>
                <ul className="mt-3 space-y-2 text-[12px]">
                  {result.rows.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-lg bg-black/30 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-white">{r.raw}</p>
                        <p className="mt-0.5 text-[10px] text-white/40">
                          {r.grams ? `${Math.round(r.grams)} g · ` : "no mass · "}
                          {r.matchedName || r.name}
                        </p>
                        <div className="mt-1">
                          <TrustBadge source={r.source} kind="macros" compact />
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-white/70">
                        <p>{Math.round(r.calories || 0)} kcal</p>
                        <p className="text-white/40">
                          P {(r.protein || 0).toFixed(1)} · F {(r.fat || 0).toFixed(1)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <p className="mt-8 text-[11px] leading-relaxed text-white/35">
          Estimate only. Individual ingredient composition varies; household cooking losses
          (water evaporation, fat absorption) aren’t modelled. For strict tracking, weigh
          cooked portions and use the plate customiser.
        </p>
      </div>
    </div>
  );
}

function MacroCell({ label, value }) {
  return (
    <div className="rounded-lg bg-black/30 py-2">
      <p className="text-white/40">{label}</p>
      <p className="mt-0.5 font-semibold text-white/85">{value}</p>
    </div>
  );
}
