/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Database, Info, Loader2, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CATEGORIES,
  getCategoryById,
} from "../data/discoveryData";
import {
  fetchFoodCategory,
  peekFoodCategory,
  prefetchFoodCategory,
} from "../utils/fetchFoodData";
import { IOS_EASE, MOTION } from "../utils/motion";
import { markInstantNavigation } from "../components/PageTransition";

function fmt(n, digits = 0) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  return digits === 0 ? String(Math.round(v)) : v.toFixed(digits);
}

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const local = useMemo(() => getCategoryById(id), [id]);
  const cached = useMemo(() => peekFoodCategory(id, { limit: 48 }), [id]);

  const [payload, setPayload] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const warm = peekFoodCategory(id, { limit: 48 });
    if (warm && retryTick === 0) {
      setPayload(warm);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);
    // Keep previous list visible while switching — don't clear to null

    fetchFoodCategory(id, { limit: 48 })
      .then((data) => {
        if (cancelled) return;
        setPayload(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setPayload(null);
        const msg = err.message || "Could not load this category";
        const cold =
          /timeout|network|failed to fetch|503|502|504|ECONN|awake|render/i.test(msg);
        setError(
          cold
            ? `${msg} — the API may be waking up (free hosting). Wait a few seconds and retry.`
            : msg
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryTick]);

  const analyseFood = async (food) => {
    if (!food || analysing) return;
    setAnalysing(true);
    setError(null);
    try {
      markInstantNavigation();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      navigate("/", {
        state: {
          cuisineSearch: {
            query: food.displayName || food.name,
            results: [food],
          },
        },
        preventScrollReset: true,
      });
    } finally {
      setAnalysing(false);
    }
  };

  if (!local && !loading && !payload) {
    return (
      <div className="min-h-screen bg-ink-950 px-4 pt-24 text-white">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-display text-2xl font-bold">Category not found</p>
          <p className="mt-2 text-white/50">
            That browse list isn’t available.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-saffron-300 hover:text-saffron-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <div className="mt-10 flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-saffron-400/30 hover:text-white"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const items = payload?.items || [];
  const listMatchesPage = !payload?.id || payload.id === (local?.id || id);
  const title = local?.label || payload?.label || "Category";
  const blurb =
    (listMatchesPage && payload?.criteria) || local?.blurb || payload?.criteria || "";
  const disclaimer = listMatchesPage ? payload?.disclaimer || "" : "";
  const total = payload?.totalMatching ?? items.length;
  const shown = payload?.shown ?? items.length;
  const showInitialLoader = loading && (items.length === 0 || !listMatchesPage);

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="relative h-[38vh] min-h-[240px] overflow-hidden sm:h-[44vh]">
        <img
          src={local?.image || "/foods/indian-thali.jpg"}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/35" />
        <div className="fa-on-media absolute inset-x-0 bottom-0 px-4 pb-9 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron-300/90">
              <Database className="h-3.5 w-3.5" /> Browse · verified data
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
              {blurb}
            </p>
            {!showInitialLoader && payload && listMatchesPage && (
              <p className="mt-2 text-xs text-white/40">
                Showing {shown}
                {total > shown ? ` of ${total} matching` : ""} · values per 100 g
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {disclaimer && listMatchesPage && (
          <div className="mb-6 flex gap-2.5 rounded-xl border border-saffron-400/20 bg-saffron-500/[0.07] px-4 py-3 text-[12px] leading-relaxed text-white/70">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-saffron-300" aria-hidden="true" />
            <p>{disclaimer}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-4 text-sm text-red-100">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetryTick((n) => n + 1)}
              className="mt-3 rounded-full border border-red-300/30 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-500/25"
            >
              Retry load
            </button>
          </div>
        )}

        {showInitialLoader && (
          <div
            className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-12 text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-6 w-6 animate-spin text-saffron-300" aria-hidden="true" />
            <p className="font-display text-base font-semibold text-white/80">
              Loading verified foods…
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-white/40">
              Pulling IFCT / INDB matches for this category. Usually quick after the first open.
            </p>
          </div>
        )}

        {!showInitialLoader && items.length === 0 && !error && (
          <p className="text-center text-sm text-white/45">
            No verified foods matched this filter yet.
          </p>
        )}

        {items.length > 0 && listMatchesPage && !showInitialLoader && (
          <div className={`grid gap-3 sm:grid-cols-2 ${loading ? "opacity-85" : ""}`}>
            {items.map((food, i) => (
              <motion.button
                key={`${food.sourceShort}-${food.food_code}-${food.name}`}
                type="button"
                disabled={analysing}
                onClick={() => analyseFood(food)}
                initial={reduceMotion || cached ? false : { opacity: 0, y: MOTION.ySm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduceMotion || cached ? 0 : Math.min(i * MOTION.stagger, 0.4),
                  duration: MOTION.section.duration,
                  ease: IOS_EASE,
                }}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-saffron-400/35 hover:bg-white/[0.06] disabled:opacity-50 sm:px-5 sm:py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-semibold leading-snug text-white sm:text-base">
                      {food.displayName || food.name}
                    </p>
                    <p className="mt-1 text-[11px] text-white/40">
                      {food.sourceShort || "Data"}
                      {food.food_code ? ` · ${food.food_code}` : ""}
                      {food.food_group ? ` · ${food.food_group}` : ""}
                    </p>
                  </div>
                  <Search className="mt-0.5 h-4 w-4 shrink-0 text-saffron-300 opacity-70 transition group-hover:opacity-100" />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                  <div className="rounded-lg bg-white/[0.04] px-1 py-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-white/35">kcal</p>
                    <p className="fa-num mt-0.5 text-xs font-semibold text-white/90">
                      {fmt(food.calories)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-1 py-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-white/35">P</p>
                    <p className="fa-num mt-0.5 text-xs font-semibold text-white/90">
                      {fmt(food.protein_g, 1)}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-1 py-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-white/35">C</p>
                    <p className="fa-num mt-0.5 text-xs font-semibold text-white/90">
                      {fmt(food.carbohydrates_total_g, 1)}g
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] px-1 py-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-white/35">F</p>
                    <p className="fa-num mt-0.5 text-xs font-semibold text-white/90">
                      {fmt(food.fat_total_g, 1)}g
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-white/8 pt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
            More categories
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== (local?.id || id)).map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                onMouseEnter={() => prefetchFoodCategory(c.id)}
                onFocus={() => prefetchFoodCategory(c.id)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 transition hover:border-saffron-400/30 hover:text-white"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
