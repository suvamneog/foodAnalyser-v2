/* eslint-disable react/prop-types */
import { Children, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { TextShimmer } from "../components/ui/text-shimmer";
import {
  Camera,
  ScanLine,
  Calculator,
  UtensilsCrossed,
  Sparkles,
  Database,
  ScanBarcode,
  ClipboardList,
  HeartPulse,
  GraduationCap,
  ArrowRight,
  Search,
  Check,
  Dumbbell,
  Scale,
  Wheat,
  Leaf,
  Salad,
  Sprout,
  Utensils,
  Store,
  Coffee,
  Apple,
  MapPin,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  GitCompareArrows,
  Flame,
} from "lucide-react";
import PlaceholdersAndVanishInputDemo from "./input";
import FoodAnalyzer from "./Text";
import { fetchFoodData, fetchFoodById, prefetchFoodCategory } from "../utils/fetchFoodData";
import { pushRecentSearch } from "../utils/recentSearches";
import {
  TRENDING_DISHES,
  CATEGORIES,
  WHY_FEATURES,
  QUICK_ACTIONS,
  REGIONS,
  FEATURED_DISHES,
  TRUST_BADGES,
  FOOTER_LINKS,
  HERO_COLLAGE,
  CREDIBILITY_STATS,
  POPULAR_SEARCHES,
  matchRegionQuery,
} from "../data/discoveryData";
import { fadeUpProps, IOS_EASE, MOTION } from "../utils/motion";

const QUICK_ICONS = {
  "Diet plan": Sparkles,
  "Daily tracker": HeartPulse,
  "Recipe nutrition": UtensilsCrossed,
  "Your profile": Flame,
  "Analyze Food Image": Camera,
  "Scan Barcode": ScanLine,
  "Compare regions": GitCompareArrows,
  "Calculate Calories": Calculator,
};

const WHY_ICONS = [
  Sparkles,
  Database,
  Camera,
  ScanBarcode,
  ClipboardList,
  HeartPulse,
  GraduationCap,
];

const CATEGORY_ICONS = {
  Dumbbell,
  Scale,
  Wheat,
  Leaf,
  Salad,
  Sprout,
  Utensils,
  Store,
  Coffee,
  Apple,
};

const STAT_ICONS = {
  Utensils,
  Database,
  Leaf,
  Camera,
  GraduationCap,
};

function useFadeUp(reduceMotion) {
  return fadeUpProps(reduceMotion, {
    y: MOTION.y,
    duration: MOTION.section.duration,
  });
}

function scoreTone(score) {
  if (score >= 75)
    return "bg-gradient-to-b from-leaf-400/25 to-leaf-600/20 text-leaf-300 border-leaf-500/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_6px_rgba(0,0,0,0.35)]";
  if (score >= 55)
    return "bg-gradient-to-b from-saffron-400/30 to-saffron-600/20 text-saffron-200 border-saffron-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_6px_rgba(0,0,0,0.35)]";
  return "bg-gradient-to-b from-ember-400/30 to-ember-600/20 text-ember-300 border-ember-500/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_6px_rgba(0,0,0,0.35)]";
}

/**
 * Horizontal card rail for desktop + mobile.
 * Slow auto-glide while in view. Native swipe still works; autoplay
 * pauses while the finger is down and resumes after release.
 *
 * Important: keep scroll-behavior: auto on the rail. Inherited
 * `html { scroll-behavior: smooth }` breaks per-frame scrollLeft
 * updates on iOS Safari (each tiny tick gets smoothed away).
 */
function HorizontalRail({
  children,
  className = "",
  ariaLabel = "Scrollable cards",
  autoPlay = false,
  /** px per second */
  autoSpeed = 26,
}) {
  const ref = useRef(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
    suppressClick: false,
  });
  const auto = useRef({
    hold: false, // true only while pointer/touch is down
    dir: 1,
    raf: 0,
    last: 0,
    visible: false,
    resumeTimer: 0,
  });
  const reduceMotion = useReducedMotion();
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const releaseHold = () => {
    // Small delay so momentum from a swipe settles before autoplay resumes
    window.clearTimeout(auto.current.resumeTimer);
    auto.current.resumeTimer = window.setTimeout(() => {
      auto.current.hold = false;
      auto.current.last = 0;
    }, 450);
  };

  const updateEdges = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    window.addEventListener("resize", updateEdges);

    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        el.scrollLeft += e.deltaX;
        return;
      }
      if (e.shiftKey && e.deltaY) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("scroll", updateEdges);
      el.removeEventListener("wheel", onWheel);
      ro.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  // Continuous auto-scroll while any part of the rail is on screen
  useEffect(() => {
    if (!autoPlay || reduceMotion) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        // Start as soon as any slice is visible (mobile viewports are short)
        auto.current.visible = entry.isIntersecting;
        auto.current.last = 0;
      },
      { threshold: [0, 0.01, 0.1, 0.25, 0.5], rootMargin: "40px 0px" }
    );
    io.observe(el);

    // Always clear hold on window — iOS often skips element pointerup
    // when the gesture becomes a page scroll or link tap.
    const onWinUp = () => {
      if (!auto.current.hold && !drag.current.active) return;
      drag.current.active = false;
      drag.current.moved = false;
      releaseHold();
    };
    window.addEventListener("pointerup", onWinUp);
    window.addEventListener("pointercancel", onWinUp);
    window.addEventListener("touchend", onWinUp, { passive: true });
    window.addEventListener("touchcancel", onWinUp, { passive: true });

    const tick = (now) => {
      auto.current.raf = requestAnimationFrame(tick);

      if (!auto.current.visible || auto.current.hold || drag.current.active) {
        auto.current.last = 0;
        return;
      }

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 8) return;

      if (!auto.current.last) {
        auto.current.last = now;
        return;
      }

      const dt = Math.min(48, now - auto.current.last) / 1000;
      auto.current.last = now;

      let next = el.scrollLeft + auto.current.dir * autoSpeed * dt;

      // Ping-pong: glide to the end, then reverse
      if (next >= max - 0.5) {
        next = max;
        auto.current.dir = -1;
      } else if (next <= 0.5) {
        next = 0;
        auto.current.dir = 1;
      }

      // Instant set — never smooth (breaks rAF autoplay on WebKit)
      el.scrollLeft = next;
    };

    auto.current.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(auto.current.raf);
      window.clearTimeout(auto.current.resumeTimer);
      io.disconnect();
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
      window.removeEventListener("touchend", onWinUp);
      window.removeEventListener("touchcancel", onWinUp);
    };
  }, [autoPlay, autoSpeed, reduceMotion]);

  const scrollByAmount = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(340, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      {canLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          className="absolute left-0 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-900/90 text-white shadow-lg backdrop-blur sm:-left-1 sm:h-10 sm:w-10 hover:border-saffron-400/50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          className="absolute right-0 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-900/90 text-white shadow-lg backdrop-blur sm:-right-1 sm:h-10 sm:w-10 hover:border-saffron-400/50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div
        ref={ref}
        role="list"
        aria-label={ariaLabel}
        className="fa-rail flex cursor-grab gap-5 overflow-x-auto overflow-y-hidden pb-4 active:cursor-grabbing"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x pan-y",
          overscrollBehaviorX: "contain",
          scrollSnapType: "none",
          // Override inherited html { scroll-behavior: smooth } — critical for iOS autoplay
          scrollBehavior: "auto",
        }}
        onPointerDown={(e) => {
          window.clearTimeout(auto.current.resumeTimer);
          auto.current.hold = true;
          // Mouse drag-to-scrub only; touch uses native overflow swipe
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          if (e.target.closest("a,button,input,select,textarea,label")) return;
          const el = ref.current;
          if (!el) return;
          drag.current = {
            active: true,
            startX: e.clientX,
            startScroll: el.scrollLeft,
            moved: false,
            suppressClick: false,
          };
          try {
            el.setPointerCapture?.(e.pointerId);
          } catch {
            /* ignore */
          }
        }}
        onPointerMove={(e) => {
          if (!drag.current.active || e.pointerType !== "mouse") return;
          const el = ref.current;
          if (!el) return;
          const dx = e.clientX - drag.current.startX;
          if (Math.abs(dx) > 4) drag.current.moved = true;
          el.scrollLeft = drag.current.startScroll - dx;
        }}
        onPointerUp={() => {
          if (drag.current.active) {
            const wasMoved = drag.current.moved;
            drag.current.active = false;
            drag.current.moved = false;
            if (wasMoved) drag.current.suppressClick = true;
          }
          releaseHold();
        }}
        onPointerCancel={() => {
          drag.current.active = false;
          drag.current.moved = false;
          releaseHold();
        }}
        onClickCapture={(e) => {
          if (drag.current.suppressClick) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.suppressClick = false;
          }
        }}
      >
        {Children.map(children, (child) => (
          <div
            role="listitem"
            className="shrink-0"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionDivider() {
  return (
    <div
      className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 sm:px-6"
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
      <div className="h-1 w-1 rounded-full bg-saffron-400/40" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
    </div>
  );
}

function Home({
  foodName,
  setFoodName,
  output,
  setOutput,
  loading,
  setLoading,
  setOriginalQuery,
  originalQuery,
  searchHandoff = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchAttempted, setSearchAttempted] = useState(
    () => Boolean(location.state?.cuisineSearch?.query) || searchHandoff
  );
  const [stickySearch, setStickySearch] = useState(() =>
    Boolean(location.state?.cuisineSearch?.query)
  );
  const [showTop, setShowTop] = useState(false);
  const [regionalPreset, setRegionalPreset] = useState(null);
  const resultsRef = useRef(null);
  const heroSearchRef = useRef(null);
  // Only auto-scroll on the first search from the centered hero (or cuisine handoff).
  const shouldScrollRef = useRef(Boolean(location.state?.cuisineSearch?.query));
  const hasLandedResultsRef = useRef(
    Boolean(location.state?.cuisineSearch?.query) || Boolean(searchHandoff)
  );
  const reduceMotion = useReducedMotion();
  const fadeUp = useFadeUp(reduceMotion);

  // Keep results mode if App already applied the handoff before mount
  useEffect(() => {
    if (searchHandoff || (originalQuery && Array.isArray(output) && output.length > 0)) {
      setSearchAttempted(true);
      hasLandedResultsRef.current = true;
    }
  }, [searchHandoff, originalQuery, output]);

  /** Results view: sticky search + compact hero — includes empty “not found” outcomes. */
  const viewingResults =
    searchAttempted &&
    (loading ||
      Boolean(originalQuery) ||
      (Array.isArray(output) && output.length > 0));
  const showHeroSearch = !viewingResults;
  const showStickySearch = viewingResults || stickySearch;

  const featured = useMemo(
    () => FEATURED_DISHES[Math.floor(Math.random() * FEATURED_DISHES.length)],
    []
  );

  const markFirstSearchScroll = () => {
    // Later searches use the top sticky bar — don't jump the page again.
    if (hasLandedResultsRef.current) return;
    shouldScrollRef.current = true;
  };

  // Cuisine / category / compare pages can hand off a completed IFCT/INDB search
  useEffect(() => {
    const payload = location.state?.cuisineSearch;
    if (!payload?.query) return;

    const apply = async () => {
      setSearchAttempted(true);
      setRegionalPreset(payload.regionalPreset || null);
      shouldScrollRef.current = true;

      // App may already have applied results — only fetch if missing
      let results = Array.isArray(payload.results) ? payload.results : [];
      if (results.length === 0) {
        try {
          const data = await fetchFoodData(payload.query);
          results = Array.isArray(data) ? data : data ? [data] : [];
        } catch {
          results = [];
        }
        results.originalQuery = payload.query;
        setOutput(results);
        setOriginalQuery(payload.query);
        setFoodName("");
      }
      // Router state is cleared by App after paint
    };
    apply();
  }, [location.state, setFoodName, setOriginalQuery, setOutput]);

  useEffect(() => {
    const onScroll = () => {
      const marker = heroSearchRef.current;
      if (marker) setStickySearch(marker.getBoundingClientRect().bottom < 64);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // First search only: slide from centered hero down to the result / not-found card.
  useLayoutEffect(() => {
    if (!searchAttempted || !shouldScrollRef.current) return;

    const pin = (smooth) => {
      const el = resultsRef.current || document.getElementById("search-results");
      if (!el) return;
      el.scrollIntoView({
        behavior: smooth && !reduceMotion ? "smooth" : "auto",
        block: "start",
      });
    };

    // Smooth slide once search starts; retries catch loader → card / not-found settle.
    pin(true);
    const timers = [180, 450, 900, 1400].map((ms, i) =>
      window.setTimeout(() => pin(i === 0), ms)
    );

    // Settled = have hits, or a confirmed empty search (not-found card).
    const settled =
      !loading &&
      (Boolean(originalQuery) || (Array.isArray(output) && output.length > 0));

    if (settled) {
      hasLandedResultsRef.current = true;
      const clearTimer = window.setTimeout(() => {
        shouldScrollRef.current = false;
      }, 1500);
      return () => {
        timers.forEach((id) => window.clearTimeout(id));
        window.clearTimeout(clearTimer);
      };
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [loading, searchAttempted, output, originalQuery, reduceMotion]);

  const runSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    const regionHit = matchRegionQuery(trimmed);
    if (regionHit) {
      navigate(`/cuisine/${regionHit.slug}`);
      return;
    }

    markFirstSearchScroll();
    setRegionalPreset(null);
    setFoodName(trimmed);
    setLoading(true);
    setSearchAttempted(true);
    pushRecentSearch(trimmed);
    try {
      const data = await fetchFoodData(trimmed);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setOutput([]);
        setOriginalQuery(trimmed);
      } else {
        const results = Array.isArray(data) ? data : [data];
        results.originalQuery = trimmed;
        setOutput(results);
        setFoodName("");
        setOriginalQuery(trimmed);
      }
    } catch (err) {
      console.error(err);
      setOutput([]);
      setOriginalQuery(trimmed);
    } finally {
      setLoading(false);
    }
  };

  /** Discover cards: exact IFCT/INDB code lookup (falls back to text search). */
  const runExactFood = async ({ match, label, query }) => {
    const friendly = (label || query || "").trim();
    if (loading) return;
    if (match?.source && match?.code) {
      markFirstSearchScroll();
      setRegionalPreset(null);
      setFoodName(friendly);
      setLoading(true);
      setSearchAttempted(true);
      if (friendly) pushRecentSearch(friendly);
      try {
        const data = await fetchFoodById({
          source: match.source,
          code: match.code,
          label: friendly,
        });
        const results = Array.isArray(data) ? data : [data];
        results.originalQuery = friendly;
        setOutput(results);
        setFoodName("");
        setOriginalQuery(friendly);
      } catch (err) {
        console.error(err);
        // Fall back to fuzzy search if exact id missing
        await runSearch(friendly || query || "");
        return;
      } finally {
        setLoading(false);
      }
      return;
    }
    return runSearch(friendly || query || "");
  };

  return (
    <div className="min-h-screen w-full pt-14 sm:pt-16">
      {showStickySearch && (
        <motion.div
          initial={{ y: -72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: IOS_EASE }}
          className="fixed top-14 inset-x-0 z-40 px-3 sm:top-16 sm:px-4"
        >
          <div className="mx-auto max-w-xl">
            <PlaceholdersAndVanishInputDemo
              foodName={foodName}
              setFoodName={setFoodName}
              setOutput={setOutput}
              loading={loading}
              setLoading={setLoading}
              setOriginalQuery={setOriginalQuery}
              setSearchAttempted={setSearchAttempted}
              onSearchStart={() => {
                markFirstSearchScroll();
                setRegionalPreset(null);
              }}
              compact
              inputId="food-input-sticky"
            />
          </div>
        </motion.div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden px-4 sm:px-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
            }
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 50% at 20% 20%, rgba(212,137,42,0.16), transparent 55%), radial-gradient(ellipse 60% 45% at 80% 30%, rgba(79,154,98,0.1), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 90%, rgba(232,168,74,0.06), transparent 55%)",
              backgroundSize: "200% 200%",
            }}
          />
          {HERO_COLLAGE.map((item, i) => (
            <motion.div
              key={item.src + i}
              className={`fa-collage-tile fa-collage-${item.depth || "mid"} pointer-events-auto absolute overflow-hidden ${item.className}`}
              whileHover={
                reduceMotion
                  ? undefined
                  : { scale: 1.05, rotate: 0, zIndex: 20 }
              }
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, i % 2 === 0 ? -10 : 10, 0] }
              }
              transition={{
                y: {
                  duration: 9 + i * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                scale: { type: "spring", stiffness: 280, damping: 20 },
                rotate: { type: "spring", stiffness: 220, damping: 18 },
              }}
            >
              <img
                src={item.src}
                alt=""
                className="fa-collage-img h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="fa-collage-glass absolute inset-0" aria-hidden="true" />
            </motion.div>
          ))}
          {!reduceMotion &&
            [...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-saffron-300/30"
                style={{ left: `${12 + i * 16}%`, top: `${24 + (i % 3) * 18}%` }}
                animate={{ y: [0, -14, 0], opacity: [0.15, 0.5, 0.15] }}
                transition={{ duration: 6 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
        </div>

        <div
          className={`relative mx-auto flex max-w-3xl flex-col items-center justify-center transition-[min-height,padding] duration-500 ${
            viewingResults
              ? "min-h-0 py-10 sm:py-12"
              : "min-h-[calc(100svh-3.5rem)] py-20 sm:min-h-[calc(100vh-4rem)] sm:py-28"
          }`}
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 sm:mb-6"
          >
            <TextShimmer
              as="p"
              duration={1.8}
              className="font-display text-base font-bold tracking-[0.08em] sm:text-xl md:text-2xl [--base-color:#d4892a] [--base-gradient-color:#fff6e8]"
            >
              FoodAnalyser × Fit
            </TextShimmer>
          </motion.div>

          {!viewingResults && (
            <>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.06, ease: IOS_EASE }}
            className="max-w-3xl text-center font-display text-[2.15rem] font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-[3.35rem]"
          >
            Discover the Nutrition Behind India&apos;s Favourite Foods
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: IOS_EASE }}
            className="mt-6 max-w-lg text-center text-[15px] leading-[1.7] text-white/52 sm:mt-7 sm:text-lg sm:leading-relaxed"
          >
            Explore authentic Indian foods, analyze nutrition from IFCT, INDB, and
            regional data, identify dishes with AI, and make clearer food choices.
          </motion.p>
            </>
          )}

          <motion.div
            ref={heroSearchRef}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: showHeroSearch ? 1 : 0, y: showHeroSearch ? 0 : -8 }}
            transition={{ duration: 0.4, ease: IOS_EASE }}
            className={`mt-11 w-full max-w-2xl sm:mt-12 ${
              showHeroSearch
                ? "pointer-events-auto relative"
                : "pointer-events-none absolute h-0 overflow-hidden opacity-0"
            }`}
            aria-hidden={!showHeroSearch}
          >
            {showHeroSearch && (
              <>
            <PlaceholdersAndVanishInputDemo
              foodName={foodName}
              setFoodName={setFoodName}
              setOutput={setOutput}
              loading={loading}
              setLoading={setLoading}
              setOriginalQuery={setOriginalQuery}
              setSearchAttempted={setSearchAttempted}
              onSearchStart={() => {
                markFirstSearchScroll();
                setRegionalPreset(null);
              }}
            />
            <div
              className="mt-4 flex flex-wrap items-center justify-center gap-2"
              aria-label="Popular searches"
            >
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  disabled={loading}
                  onClick={() => runSearch(term)}
                  className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_0_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-saffron-400/45 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 sm:text-xs"
                >
                  {term}
                </button>
              ))}
            </div>
              </>
            )}
          </motion.div>

          {!viewingResults && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32, ease: IOS_EASE }}
            className="mt-8 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2.5 sm:mt-9"
            role="navigation"
            aria-label="Quick actions"
          >
            {QUICK_ACTIONS.map((action) => {
              const Icon = QUICK_ICONS[action.label] || Search;
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-white/12 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_rgba(0,0,0,0.35)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-saffron-400/45 hover:bg-white/[0.08] hover:text-white active:translate-y-0 sm:min-h-[46px] sm:text-sm"
                >
                  <Icon className="h-4 w-4 text-saffron-300" aria-hidden="true" />
                  {action.label}
                </Link>
              );
            })}
          </motion.div>
          )}
        </div>
      </section>

      {/* Results sit above the credibility strip so first search lands on the card */}
      <div
        id="search-results"
        ref={resultsRef}
        className={`scroll-mt-28 px-4 sm:scroll-mt-36 sm:px-6 ${
          viewingResults ? "pt-16 pb-10 sm:pt-14" : ""
        }`}
      >
        {(loading || searchAttempted) && (
          <div className="mx-auto mb-8 max-w-5xl">
            <FoodAnalyzer
              output={output}
              loading={loading}
              originalQuery={originalQuery}
              searchAttempted={searchAttempted}
              regionalPreset={regionalPreset}
              onSuggestionClick={runSearch}
            />
          </div>
        )}
      </div>

      {/* CREDIBILITY STRIP */}
      <section
        className={`px-4 pb-6 pt-2 sm:px-6 ${viewingResults ? "hidden" : ""}`}
        aria-hidden={viewingResults}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...fadeUp}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            {CREDIBILITY_STATS.map((stat) => {
              const Icon = STAT_ICONS[stat.icon] || Sparkles;
              return (
                <div
                  key={stat.label}
                  className="fa-sticker fa-sticker-hover px-4 py-5 text-center"
                >
                  <span className="mx-auto inline-grid h-9 w-9 place-items-center rounded-full border border-saffron-400/30 bg-saffron-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <Icon className="h-4 w-4 text-saffron-200" />
                  </span>
                  <p className="fa-num relative mt-3 text-2xl text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="relative mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-leaf-500/25 bg-leaf-500/[0.07] px-3 py-1.5 text-[11px] font-semibold text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-leaf-500/25 text-leaf-300">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* REGIONAL */}
      <section className="fa-defer-section px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            fadeUp={fadeUp}
            eyebrow="Discover"
            title="Explore India's Regional Cuisine"
            subtitle="Famous dishes from every corner of India — open a state page or jump straight into analysis."
          />
          <div className="mt-4 flex justify-center sm:justify-start">
            <Link
              to="/compare/roti"
              className="inline-flex items-center gap-2 rounded-full border border-saffron-400/25 bg-saffron-500/10 px-4 py-2 text-xs font-semibold text-saffron-200 transition hover:bg-saffron-500/20"
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              Compare roti, rice, dal & breakfast by region
            </Link>
          </div>
          <HorizontalRail
            className="mt-8"
            ariaLabel="Regional cuisine cards"
            autoPlay
            autoSpeed={22}
          >
            {REGIONS.map((region, i) => (
              <motion.div
                key={region.state}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: Math.min(i * 0.04, 0.28) }}
                className="fa-card group relative h-[340px] w-[250px] shrink-0 overflow-hidden sm:h-[400px] sm:w-[300px]"
              >
                <img
                  src={region.image}
                  alt=""
                  className="fa-img-zoom absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent" />
                <div className="fa-on-media absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-saffron-300/90 backdrop-blur-sm">
                  Regional
                </div>
                <div className="fa-on-media absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <Link to={`/cuisine/${region.slug}`} className="block">
                    <p className="font-display text-2xl font-bold text-white">{region.state}</p>
                    <p className="mt-2 text-sm leading-snug text-white/58">{region.tagline}</p>
                  </Link>
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      to={`/cuisine/${region.slug}`}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                      Browse dishes
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        runExactFood({
                          match: region.match,
                          label: region.state,
                          query: region.query,
                        })
                      }
                      disabled={loading}
                      className="rounded-full border border-saffron-400/30 bg-saffron-500/15 px-3 py-1.5 text-[11px] font-semibold text-saffron-200 transition hover:bg-saffron-500/25 disabled:opacity-50"
                    >
                      Quick analyse
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </HorizontalRail>
        </div>
      </section>

      <SectionDivider />

      {/* TRENDING */}
      <section className="fa-defer-section px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            fadeUp={fadeUp}
            eyebrow="Discover"
            title="Trending Across India"
            subtitle="Explore India's most searched dishes. Values shown per 100 g from IFCT / INDB."
          />
          <HorizontalRail
            className="mt-12"
            ariaLabel="Trending dishes"
            autoPlay
            autoSpeed={24}
          >
            {TRENDING_DISHES.map((dish, i) => (
              <motion.button
                key={dish.name}
                type="button"
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: Math.min(i * 0.04, 0.28) }}
                onClick={() =>
                  runExactFood({
                    match: dish.match,
                    label: dish.name,
                    query: dish.name,
                  })
                }
                disabled={loading}
                aria-label={`Analyse ${dish.name}`}
                className="fa-card group w-[260px] shrink-0 overflow-hidden text-left disabled:opacity-60 sm:w-[290px]"
              >
                <div className="relative h-44 overflow-hidden sm:h-48">
                  <img
                    src={dish.image}
                    alt=""
                    className="fa-img-zoom h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-800 to-transparent" />
                  <span className="fa-on-media absolute left-3 top-3 rounded-full border border-white/15 bg-ink-950/75 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/80 backdrop-blur-sm">
                    {dish.source}
                  </span>
                </div>
                <div className="space-y-3.5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold leading-snug text-white">
                        {dish.name}
                      </h3>
                      {dish.note && (
                        <p className="mt-1 text-[11px] leading-snug text-white/40">
                          {dish.note}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${scoreTone(
                        dish.healthScore
                      )}`}
                    >
                      {dish.healthScore}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Calories</p>
                      <p className="mt-1 font-semibold text-white/90">{dish.calories} kcal</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Protein</p>
                      <p className="mt-1 font-semibold text-white/90">{dish.protein} g</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <span className="text-[11px] font-medium text-white/40">
                      per 100 g · score {dish.healthScore}/100
                    </span>
                    <span className="text-[11px] font-medium text-white/30 transition group-hover:text-saffron-300">
                      Analyse →
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </HorizontalRail>
        </div>
      </section>

      <SectionDivider />

      {/* CATEGORIES */}
      <section className="fa-defer-section px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            fadeUp={fadeUp}
            eyebrow="Browse"
            title="Browse by Category"
            subtitle="Open a verified IFCT/INDB list — filters and curated codes, not marketing claims."
          />
          <div className="mt-12 grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.icon] || Leaf;
              return (
                <motion.div
                  key={cat.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: Math.min(i * 0.03, 0.24) }}
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                >
                  <Link
                    to={`/category/${cat.id}`}
                    aria-label={`Browse ${cat.label}`}
                    onMouseEnter={() => prefetchFoodCategory(cat.id)}
                    onFocus={() => prefetchFoodCategory(cat.id)}
                    onTouchStart={() => prefetchFoodCategory(cat.id)}
                    className="fa-card group relative flex min-h-[220px] overflow-hidden text-left sm:min-h-[250px]"
                  >
                    <img
                      src={cat.image}
                      alt=""
                      className="fa-img-zoom absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent}`} />
                    <div className="fa-on-media absolute inset-0 flex flex-col justify-between p-4">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-saffron-300 backdrop-blur-sm">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-white sm:text-base">
                          {cat.label}
                        </p>
                        <p className="mt-1.5 text-[11px] leading-snug text-white/55 sm:text-xs">
                          {cat.blurb}
                        </p>
                        <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                          {cat.examples.slice(0, 3).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* FEATURED */}
      <section className="fa-defer-section px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            fadeUp={fadeUp}
            eyebrow="Featured"
            title="Today's Featured Indian Dish"
            subtitle="An editorial highlight refreshed each visit — explore the nutrition behind the plate."
          />
          <motion.div {...fadeUp} className="fa-card mt-12 overflow-hidden lg:grid lg:grid-cols-[1.15fr_1fr]">
            <div className="relative min-h-[320px] sm:min-h-[440px] lg:min-h-full">
              <img
                src={featured.image}
                alt={featured.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink-800/95 max-lg:bg-gradient-to-t max-lg:from-ink-800 max-lg:to-transparent" />
            </div>
            <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  <MapPin className="h-3.5 w-3.5 text-saffron-300" aria-hidden="true" />
                  {featured.state}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  Source · {featured.source}
                </span>
              </div>
              <h3 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                {featured.name}
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
                {featured.description}
              </p>
              <div className="mt-5 flex gap-3 rounded-2xl border border-leaf-500/15 bg-leaf-500/[0.06] p-4">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-leaf-400" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-white/65">{featured.insight}</p>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  ["Calories", `${featured.calories} kcal`],
                  ["Protein", `${featured.protein} g`],
                  ["Carbs", `${featured.carbs} g`],
                  ["Fat", `${featured.fat} g`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
                    <p className="mt-1 font-display text-lg font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-white/40">
                Per 100 g · {featured.source} verified match
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${scoreTone(
                    featured.healthScore
                  )}`}
                >
                  Health score {featured.healthScore}/100
                </span>
                <span className="text-[11px] text-white/40">
                  computed from IFCT/INDB macros
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    runExactFood({
                      match: featured.match,
                      label: featured.name,
                      query: featured.name,
                    })
                  }
                  disabled={loading}
                  className="fa-btn fa-btn-primary disabled:opacity-60"
                >
                  Explore nutrition
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  to={
                    featured.cuisineSlug
                      ? `/cuisine/${featured.cuisineSlug}`
                      : "/"
                  }
                  className="fa-btn fa-btn-secondary"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* WHY */}
      <section className="fa-defer-section px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            fadeUp={fadeUp}
            eyebrow="Platform"
            title="Why FoodAnalyser"
            subtitle="Nutrition intelligence built for Indian dietary patterns."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_FEATURES.map((feature, i) => {
              const Icon = WHY_ICONS[i] || Sparkles;
              return (
                <motion.div
                  key={feature.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: Math.min(i * 0.04, 0.24) }}
                  className="fa-card bg-white/[0.03] p-6"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-500/12 text-saffron-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/50">{feature.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-10 sm:px-6">
        <motion.div
          {...fadeUp}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-saffron-400/20 px-6 py-16 text-center shadow-glow sm:px-12 sm:py-20"
          style={{
            background:
              "linear-gradient(135deg, #1c2230 0%, #0c0e14 45%, #141821 100%)",
          }}
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-saffron-500/18 blur-3xl"
          />
          <motion.div
            animate={reduceMotion ? undefined : { opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-16 -left-8 h-64 w-64 rounded-full bg-leaf-500/12 blur-3xl"
          />
          <img
            src={HERO_COLLAGE[0].src}
            alt=""
            className="pointer-events-none absolute left-6 top-8 hidden h-20 w-20 rounded-2xl object-cover opacity-25 blur-[1px] rotate-[-8deg] lg:block"
          />
          <img
            src={HERO_COLLAGE[1].src}
            alt=""
            className="pointer-events-none absolute bottom-8 right-8 hidden h-24 w-24 rounded-2xl object-cover opacity-25 blur-[1px] rotate-[6deg] lg:block"
          />

          <h2 className="relative font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Start Eating Smarter Today
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/55 sm:text-base">
            Explore thousands of Indian foods with AI-powered nutrition intelligence.
          </p>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => document.getElementById("food-input")?.focus(), 400);
              }}
              className="fa-btn fa-btn-primary"
            >
              Search Foods
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link to="/image" className="fa-btn fa-btn-secondary">
              Analyze Image
              <Camera className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="relative mx-auto mt-6 max-w-lg text-xs leading-relaxed text-white/35 sm:text-sm">
            Trusted by students, fitness enthusiasts and nutrition-conscious users across India.
          </p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-white/8 bg-ink-950 px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-bold text-white">
              FoodAnalyser <span className="text-white/30">×</span> Fit
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/42">
              Indian nutrition tools using IFCT 2017, INDB, Open Food Facts, and
              regional estimates — with clear source labels so nothing is oversold.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs text-white/35">Made in India</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/30">
              Quick Links
            </p>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/50 transition duration-300 hover:text-saffron-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/30">
              Resources
            </p>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className="text-sm text-white/50 transition duration-300 hover:text-saffron-300"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target={link.href?.startsWith("http") ? "_blank" : undefined}
                      rel={link.href?.startsWith("http") ? "noreferrer" : undefined}
                      className="text-sm text-white/50 transition duration-300 hover:text-saffron-300"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <span className="text-sm text-white/28">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-2 border-t border-white/8 pt-7 text-xs text-white/32 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Suvam Neog. All rights reserved.</p>
          <p>v2.0 · Built for healthier Indian nutrition</p>
        </div>
      </footer>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink-800/90 text-white/70 shadow-glow backdrop-blur-md transition hover:-translate-y-0.5 hover:text-saffron-300 sm:bottom-24 sm:right-5"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <a
        href="https://www.buymeacoffee.com/suvamneog"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 z-40 transition-transform hover:scale-105 sm:bottom-4 sm:right-4"
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          className="h-10 w-auto shadow-lg sm:h-12"
        />
      </a>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle, fadeUp }) {
  return (
    <motion.div {...(fadeUp || {})} className="max-w-2xl">
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-saffron-300/80 sm:text-[11px]">
        {eyebrow}
      </p>
      <h2 className="mt-3.5 font-display text-[1.85rem] font-extrabold tracking-tight text-white sm:text-4xl md:text-[2.85rem] md:leading-[1.08]">
        {title}
      </h2>
      <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-base">
        {subtitle}
      </p>
    </motion.div>
  );
}

export default Home;
