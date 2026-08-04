/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Database, Info, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CATEGORIES,
  getCategoryById,
} from "../data/discoveryData";
import { fetchFoodCategory } from "../utils/fetchFoodData";
import { IOS_EASE, MOTION } from "../utils/motion";

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

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysing, setAnalysing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPayload(null);

    fetchFoodCategory(id, { limit: 48 })
      .then((data) => {
        if (cancelled) return;
        setPayload(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Could not load this category");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const analyseFood = async (food) => {
    if (!food || analysing) return;
    setAnalysing(true);
    setError(null);
    try {
      navigate("/", {
        state: {
          cuisineSearch: {
            query: food.displayName || food.name,
            results: [food],
          },
        },
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
          <div className="mt-10 flex flex-wrap justify-center gap-2">
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

  const title = payload?.label || local?.label || "Category";
  const blurb = payload?.criteria || local?.blurb || "";
  const disclaimer = payload?.disclaimer || "";
  const items = payload?.items || [];
  const total = payload?.totalMatching ?? items.length;
  const shown = payload?.shown ?? items.length;

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
            {!loading && payload && (
              <p className="mt-2 text-xs text-white/40">
                Showing {shown}
                {total > shown ? ` of ${total} matching` : ""} · values per 100 g
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {disclaimer && (
          <div className="mb-6 flex gap-2.5 rounded-xl border border-saffron-400/20 bg-saffron-500/[0.07] px-4 py-3 text-[12px] leading-relaxed text-white/70">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-saffron-300" aria-hidden="true" />
            <p>{disclaimer}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse rounded-2xl border border-white/8 bg-white/[0.03]"
              />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <p className="text-center text-sm text-white/45">
            No verified foods matched this filter yet.
          </p>
        )}

        {!loading && items.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((food, i) => (
              <motion.button
                key={`${food.sourceShort}-${food.food_code}-${food.name}`}
                type="button"
                disabled={analysing}
                onClick={() => analyseFood(food)}
                initial={reduceMotion ? false : { opacity: 0, y: MOTION.ySm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(i * MOTION.stagger, 0.4),
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
            {CATEGORIES.filter((c) => c.id !== (payload?.id || local?.id)).map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
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
