import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  REGIONS,
  getRegionBySlug,
} from "../data/discoveryData";
import { fetchFoodData } from "../utils/fetchFoodData";

const EASE = [0.22, 1, 0.36, 1];

export default function CuisinePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const region = useMemo(() => getRegionBySlug(slug), [slug]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyseDish = async (query) => {
    const trimmed = String(query || "").trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Prefetch to surface empty results early, then land on home with state
      const data = await fetchFoodData(trimmed);
      navigate("/", {
        state: {
          cuisineSearch: {
            query: trimmed,
            results: Array.isArray(data) ? data : [data],
          },
        },
      });
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  if (!region) {
    return (
      <div className="min-h-screen bg-ink-950 px-4 pt-24 text-white">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-display text-2xl font-bold">Cuisine not found</p>
          <p className="mt-2 text-white/50">
            That region isn’t in our discovery list yet.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-saffron-300 hover:text-saffron-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {REGIONS.map((r) => (
              <Link
                key={r.slug}
                to={`/cuisine/${r.slug}`}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-saffron-400/30 hover:text-white"
              >
                {r.state}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="relative h-[42vh] min-h-[280px] overflow-hidden sm:h-[48vh]">
        <img
          src={region.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
        <div className="fa-on-media absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron-300/90">
              <MapPin className="h-3.5 w-3.5" /> Regional cuisine
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {region.state}
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/60 sm:text-lg">
              {region.tagline}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Tap a dish to search IFCT / INDB nutrition — results open on the home analyser.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {(region.dishes || []).map((dish, i) => (
            <motion.button
              key={dish.name}
              type="button"
              disabled={loading}
              onClick={() => analyseDish(dish.query || dish.name)}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3), ease: EASE }}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left transition hover:border-saffron-400/35 hover:bg-white/[0.06] disabled:opacity-50"
            >
              <div>
                <p className="font-display text-lg font-semibold text-white">
                  {dish.name}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Search IFCT / INDB
                </p>
              </div>
              <Search className="h-4 w-4 text-saffron-300 opacity-70 transition group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>

        <div className="mt-12 border-t border-white/8 pt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
            More regions
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {REGIONS.filter((r) => r.slug !== region.slug).map((r) => (
              <Link
                key={r.slug}
                to={`/cuisine/${r.slug}`}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 transition hover:border-saffron-400/30 hover:text-white"
              >
                {r.state}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
