/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, GitCompareArrows, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  STAPLE_FAMILIES,
  getVariantsByFamily,
  getFamily,
  getRegion,
  estimateVariantFromFallback,
  customizeStateFromVariant,
} from "../data/regionalVariants";
import { computeCustomNutrition } from "../utils/portionCustomize";
import { fetchFoodData } from "../utils/fetchFoodData";
import TrustBadge from "../components/TrustBadge";
import AddToTrackerButton from "../components/AddToTrackerButton";

const EASE = [0.22, 1, 0.36, 1];

function plateForVariant(variant, liveFood) {
  const { food: fallbackFood, customize } = estimateVariantFromFallback(variant);
  const food = liveFood || fallbackFood;
  const plate = computeCustomNutrition(food, customize);
  return { plate, customize, usedLive: Boolean(liveFood) };
}

export default function CompareStaples() {
  const { familyId: paramFamily } = useParams();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const initialFamily =
    STAPLE_FAMILIES.find((f) => f.id === paramFamily)?.id || "roti";
  const [familyId, setFamilyId] = useState(initialFamily);
  const [liveMap, setLiveMap] = useState({});
  const [loadingLive, setLoadingLive] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  const family = getFamily(familyId);
  const variants = useMemo(() => getVariantsByFamily(familyId), [familyId]);

  useEffect(() => {
    if (paramFamily && STAPLE_FAMILIES.some((f) => f.id === paramFamily)) {
      setFamilyId(paramFamily);
    }
  }, [paramFamily]);

  // Best-effort live IFCT/INDB enrichment per unique searchQuery
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingLive(true);
      const queries = [...new Set(variants.map((v) => v.searchQuery))];
      const next = {};
      await Promise.all(
        queries.map(async (q) => {
          try {
            const items = await fetchFoodData(q);
            const first = Array.isArray(items) ? items[0] : items;
            if (first) next[q] = first;
          } catch {
            // keep fallback
          }
        })
      );
      if (!cancelled) {
        setLiveMap(next);
        setLoadingLive(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [variants]);

  const openVariant = async (variant) => {
    setOpeningId(variant.id);
    try {
      let results = [];
      try {
        const data = await fetchFoodData(variant.searchQuery);
        results = Array.isArray(data) ? data : data ? [data] : [];
      } catch {
        results = [];
      }
      navigate("/", {
        state: {
          cuisineSearch: {
            query: variant.searchQuery,
            results,
            regionalPreset: {
              customize: customizeStateFromVariant(variant),
              regionId: variant.regionId,
              variantId: variant.id,
            },
          },
        },
      });
    } finally {
      setOpeningId(null);
    }
  };

  const rows = variants.map((variant) => {
    const live = liveMap[variant.searchQuery];
    const { plate, usedLive } = plateForVariant(variant, live);
    return { variant, plate, usedLive };
  });

  const sorted = [...rows].sort((a, b) => a.plate.calories - b.plate.calories);

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="mt-6 flex items-start gap-3">
          <div className="rounded-2xl border border-saffron-400/20 bg-saffron-500/10 p-3">
            <GitCompareArrows className="h-5 w-5 text-saffron-300" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron-300/90">
              Regional compare
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Same staple, different kitchens
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
              Typical portion + oil/ghee presets by region. Base food from IFCT/INDB
              when matched; fat add-ons use standard tsp calories. Household recipes still vary.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {STAPLE_FAMILIES.map((f) => (
            <Link
              key={f.id}
              to={`/compare/${f.id}`}
              onClick={() => setFamilyId(f.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                familyId === f.id
                  ? "border-saffron-400/50 bg-saffron-500/20 text-saffron-100"
                  : "border-white/10 text-white/55 hover:border-white/20 hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {family && (
          <p className="mt-4 text-sm text-white/40">{family.blurb}</p>
        )}

        {loadingLive && (
          <p className="mt-3 text-xs text-white/35">Refreshing IFCT/INDB matches…</p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {sorted.map(({ variant, plate, usedLive }, i) => {
            const region = getRegion(variant.regionId);
            const liveFood = liveMap[variant.searchQuery] || null;
            return (
              <motion.article
                key={variant.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.35), ease: EASE }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-saffron-300/80">
                      <MapPin className="h-3 w-3" />
                      {region?.label || variant.regionId}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-white">
                      {variant.localName}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-extrabold text-white">
                      {Math.round(plate.calories)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-white/40">
                      kcal / plate
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {variant.cookingNote}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-lg bg-black/30 px-2 py-2">
                    <p className="text-white/40">Portion</p>
                    <p className="mt-0.5 font-semibold text-white/85">
                      {variant.portionGrams} g
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-2 py-2">
                    <p className="text-white/40">Food</p>
                    <p className="mt-0.5 font-semibold text-white/85">
                      {Math.round(plate.foodCalories)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/30 px-2 py-2">
                    <p className="text-white/40">+ Fat</p>
                    <p className="mt-0.5 font-semibold text-amber-200/90">
                      {Math.round(plate.oilCalories)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[10px] leading-relaxed text-white/35">
                  {variant.sourceNote}
                  {usedLive ? " · live IFCT/INDB match" : " · fallback macros"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <TrustBadge
                    source={
                      usedLive
                        ? liveFood?.source || "IFCT 2017"
                        : "Local estimate"
                    }
                    kind="macros"
                    portionAdjusted
                    compact
                  />
                  <TrustBadge kind="oil" compact />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {region?.cuisineSlug && (
                    <Link
                      to={`/cuisine/${region.cuisineSlug}`}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/55 hover:border-saffron-400/30 hover:text-white"
                    >
                      {region.label} cuisine
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={openingId === variant.id}
                    onClick={() => openVariant(variant)}
                    className="rounded-full border border-saffron-400/30 bg-saffron-500/15 px-3 py-1.5 text-[11px] font-semibold text-saffron-100 hover:bg-saffron-500/25 disabled:opacity-50"
                  >
                    {openingId === variant.id ? "Opening…" : "Analyse & customise"}
                  </button>
                </div>
                <AddToTrackerButton
                  className="mt-3"
                  name={`${variant.localName || variant.name} (${region?.label || "India"})`}
                  calories={plate.calories}
                  protein={plate.protein_g}
                  carbs={plate.carbohydrates_total_g}
                  fat={plate.fat_total_g}
                  grams={plate.portionGrams}
                  source={usedLive ? liveFood?.source || "IFCT 2017" : "Local estimate"}
                />
              </motion.article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-[11px] text-white/30">
          Sorted low → high calorie for the regional preset plate. Adjust oil and grams on the result card for your home.
        </p>
      </div>
    </div>
  );
}
