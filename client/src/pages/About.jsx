import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Camera,
  Barcode,
  Calculator,
  Utensils,
  MessageSquare,
} from "lucide-react";
import { useReviews } from "../utils/ReviewsContext";
import TestimonialsSection from "../components/ui/testimonials-6";
import { IOS_EASE, MOTION } from "../utils/motion";

/**
 * Editorial About page — anchored on the group hero image and the manifesto
 * "We should know what's going inside us." No emoji, restrained accents,
 * long slow motion so it never reads as auto-generated.
 */

const HERO_IMG = "/images/about-hero.jpg";

const fadeUp = (delay = 0, y = 24, duration = 0.85) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25, margin: "-8% 0px -6% 0px" },
  transition: { duration, delay, ease: IOS_EASE },
});

const VALUES = [
  {
    label: "Awareness",
    body:
      "Food is the most repeated decision of your life. Knowing what's inside it isn't a diet trend — it's basic self-respect.",
  },
  {
    label: "Honesty",
    body:
      "No inflated accuracy claims. Every number carries its source — IFCT, INDB, regional, or third-party fallback — right on the card.",
  },
  {
    label: "Indian-first",
    body:
      "Roti, dal, sabji, sambar, thali. The app is built around how people actually eat here, not translated from a US calorie tracker.",
  },
];

const METHOD = [
  {
    num: "01",
    icon: Camera,
    title: "Scan the plate.",
    body:
      "Photograph any meal. The model recognises the dish, estimates portion, and returns macros with a health score you can trust.",
    to: "/image",
    cta: "Try image scan",
  },
  {
    num: "02",
    icon: Barcode,
    title: "Read the label.",
    body:
      "Point the camera at a barcode and get an honest reading of what's inside — ingredients, sugar, sodium, and safer swaps.",
    to: "/scan",
    cta: "Open scanner",
  },
  {
    num: "03",
    icon: Calculator,
    title: "Know your numbers.",
    body:
      "A calorie and macro target that respects your body and your goal — maintenance, deficit, or slow lean gain. No crash targets.",
    to: "/calculator",
    cta: "Calculate",
  },
  {
    num: "04",
    icon: Utensils,
    title: "Log the day.",
    body:
      "Log meals fast, see running totals, watch the week take shape. Fewer numbers. More clarity.",
    to: "/tracker",
    cta: "Open tracker",
  },
];

const SOURCES = [
  {
    id: "IFCT 2017",
    origin: "ICMR–NIN",
    note: "Lab-measured Indian foods — the backbone of every core dish.",
  },
  {
    id: "INDB",
    origin: "Indian Nutrient Databank",
    note: "Recipe-level composition for cooked Indian preparations.",
  },
  {
    id: "Regional",
    origin: "Assam / Northeast estimates",
    note: "Community estimates for regional dishes — labelled separately, never merged with IFCT.",
  },
  {
    id: "Fallback",
    origin: "CalorieNinjas · Open Food Facts",
    note: "Only used when the food is not in the primary sets — clearly marked.",
  },
];

const About = () => {
  const { reviews } = useReviews();
  const reduce = useReducedMotion();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink-950 text-white">
      {/* Ambient background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[80vh] bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(232,168,74,0.10),transparent_60%)]" />
        <div className="absolute inset-x-0 top-[40vh] h-[80vh] bg-[radial-gradient(ellipse_60%_50%_at_90%_30%,rgba(79,154,98,0.06),transparent_60%)]" />
      </div>

      {/* ─────────────────── HERO ─────────────────── */}
      <section
        ref={heroRef}
        className="relative mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:pb-32 lg:pt-40"
      >
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          {/* Copy */}
          <motion.div style={{ y: heroTextY }}>
            <motion.p
              {...fadeUp(0, 12, 0.7)}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-saffron-300/90"
            >
              <span className="inline-block h-px w-8 bg-saffron-300/60" />
              A quiet manifesto
            </motion.p>

            <motion.h1
              {...fadeUp(0.08, 22, 0.95)}
              className="font-display text-[2.65rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]"
            >
              We should know
              <br />
              <span className="text-white/60">what&apos;s going</span>
              <br />
              <span className="italic text-saffron-200">inside us.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.2, 18, 0.85)}
              className="mt-7 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg"
            >
              FoodAnalyser is a slow, careful attempt at giving Indian food the
              honest nutrition data it deserves. No inflated claims, no
              guesswork disguised as science — just clear numbers, labelled
              sources, and a calm interface built for daily use.
            </motion.p>

            <motion.div
              {...fadeUp(0.3, 14, 0.8)}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/image"
                className="fa-btn fa-btn-primary group"
              >
                Start with a photo
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/calculator"
                className="fa-btn fa-btn-secondary"
              >
                Find my numbers
              </Link>
            </motion.div>

            {/* small trust row */}
            <motion.div
              {...fadeUp(0.42, 12, 0.8)}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-white/40"
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-saffron-300/80" />
                IFCT 2017 · ICMR–NIN
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf-400/80" />
                INDB recipe database
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                Regional Assam & Northeast
              </span>
            </motion.div>
          </motion.div>

          {/* Hero image — floating card, parallax, soft mask */}
          <motion.div
            {...fadeUp(0.15, 30, 1)}
            className="relative"
          >
            <motion.div
              style={{ y: imageY, scale: imageScale }}
              className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(232,168,74,0.06)] sm:max-w-lg"
            >
              {/* colour wash so the cartoon reads as premium art, not a stock illustration */}
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-ink-950/70" />
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(232,168,74,0.10),transparent_60%)] mix-blend-screen" />
              <div className="pointer-events-none absolute inset-0 z-10 ring-1 ring-inset ring-white/10" />

              {/* subtle continuous float */}
              <motion.img
                src={HERO_IMG}
                alt="A group of people, curious about the food they eat"
                loading="eager"
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={
                  reduce
                    ? undefined
                    : { duration: 9, ease: "easeInOut", repeat: Infinity }
                }
                className="absolute inset-0 h-full w-full object-cover object-[center_35%] saturate-[0.92] contrast-[1.02]"
              />

              {/* floating micro-labels — the "data" flavour */}
              <motion.div
                {...fadeUp(0.6, 10, 0.7)}
                className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md"
              >
                Real people · real plates
              </motion.div>
              <motion.div
                {...fadeUp(0.75, 10, 0.7)}
                className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-saffron-300/25 bg-saffron-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-100 backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-saffron-300 animate-pulse" />
                Reading nutrition, live
              </motion.div>
            </motion.div>

            {/* Ambient bloom behind the card */}
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(232,168,74,0.12),transparent_70%)] blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── MANIFESTO PULL-QUOTE ─────────────────── */}
      <section className="relative mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
        <motion.div
          {...fadeUp(0, 30, 0.9)}
          className="relative"
        >
          <span className="absolute -top-8 left-0 font-display text-[7rem] leading-none text-saffron-300/15 sm:text-[9rem]">
            &ldquo;
          </span>
          <blockquote className="relative font-display text-2xl font-medium leading-snug tracking-tight text-white/85 sm:text-3xl md:text-[2.35rem] md:leading-[1.2]">
            Every bite is a decision. Every meal, a signal your body will act
            on for the next twelve hours. The least we can do is{" "}
            <span className="text-saffron-200">read the label</span>.
          </blockquote>
          <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/40">
            <span className="h-px w-8 bg-white/30" />
            The FoodAnalyser principle
          </div>
        </motion.div>
      </section>

      {/* ─────────────────── VALUES / 3 COLUMNS ─────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <motion.div
          {...fadeUp(0, 22, 0.8)}
          className="mb-14 flex flex-col items-start gap-3"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-saffron-300/90">
            02 &nbsp;— &nbsp;What we believe
          </span>
          <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Three quiet rules the whole app is built on.
          </h2>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-3">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.label}
              {...fadeUp(i * 0.12, 20, 0.85)}
              className="group relative bg-ink-950 p-8 transition-colors duration-500 hover:bg-white/[0.02] sm:p-10"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-4xl font-bold text-saffron-300/80 sm:text-5xl">
                  0{i + 1}
                </span>
                <span className="h-px w-10 bg-white/20 transition-all duration-700 group-hover:w-16 group-hover:bg-saffron-300/70" />
              </div>
              <h3 className="mb-4 font-display text-xl font-bold text-white sm:text-2xl">
                {v.label}
              </h3>
              <p className="text-sm leading-relaxed text-white/55 sm:text-base">
                {v.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────── METHOD — numbered rows ─────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <motion.div
          {...fadeUp(0, 22, 0.8)}
          className="mb-16 flex flex-col items-start gap-3"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-saffron-300/90">
            03 &nbsp;— &nbsp;How it works
          </span>
          <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Four small tools. One clear idea.
          </h2>
        </motion.div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {METHOD.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.num}
                {...fadeUp(i * 0.08, 24, 0.9)}
                className="group grid gap-4 py-10 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:gap-8 sm:py-12"
              >
                <div className="flex items-baseline gap-4 sm:block">
                  <span className="font-display text-5xl font-bold text-white/25 transition-colors duration-500 group-hover:text-saffron-300/80 sm:text-6xl">
                    {m.num}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-3">
                    <Icon className="h-4 w-4 text-saffron-300/80" />
                    <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                      {m.title}
                    </h3>
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
                    {m.body}
                  </p>
                </div>

                <Link
                  to={m.to}
                  className="group/link inline-flex items-center gap-2 self-start text-sm font-semibold text-white/70 transition-colors hover:text-saffron-200 sm:self-center"
                >
                  <span>{m.cta}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────── DATA SOURCES ─────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <motion.div {...fadeUp(0, 22, 0.8)}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-saffron-300/90">
              04 &nbsp;— &nbsp;Where the numbers come from
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Sources on every card.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/55">
              Nutrition data is only as trustworthy as its origin. Nothing is
              averaged into anonymity here — every food shows exactly which set
              it came from, so you can decide what to trust.
            </p>
          </motion.div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {SOURCES.map((s, i) => (
              <motion.div
                key={s.id}
                {...fadeUp(i * 0.08, 18, 0.8)}
                className="grid grid-cols-[auto_1fr] items-start gap-6 py-6 sm:grid-cols-[140px_1fr] sm:gap-8"
              >
                <div className="pt-1">
                  <div className="font-display text-lg font-bold text-white">
                    {s.id}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                    {s.origin}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/55 sm:text-base">
                  {s.note}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── TESTIMONIALS ─────────────────── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 sm:px-8">
        <motion.div
          {...fadeUp(0, 22, 0.8)}
          className="mb-6 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-saffron-300/90">
              05 &nbsp;— &nbsp;What people say
            </span>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Small notes from people using it.
            </h2>
          </div>

          <Link
            to="/review"
            className="fa-btn fa-btn-secondary whitespace-nowrap"
          >
            <MessageSquare className="h-4 w-4" />
            Share your experience
          </Link>
        </motion.div>

        <TestimonialsSection reviews={reviews} showHeader={false} className="pt-4" />

        <motion.div
          {...fadeUp(0, 20, 0.8)}
          className="mx-auto mt-14 grid max-w-md grid-cols-2 gap-10 border-y border-white/10 py-8 text-center"
        >
          <div>
            <div className="font-display text-3xl font-bold text-white">
              {totalReviews}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">
              User reviews
            </div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-white">
              {averageRating}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">
              Average rating
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────── CLOSING ─────────────────── */}
      <section className="relative mx-auto max-w-5xl px-5 pb-32 pt-16 sm:px-8 sm:pb-40">
        <motion.div
          {...fadeUp(0, 26, 0.95)}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-10 text-center sm:p-16"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(232,168,74,0.10),transparent_65%)]" />

          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-saffron-300/90">
            One last thing
          </p>
          <h3 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            Know what you eat.
            <br />
            <span className="text-white/55">The rest gets easier.</span>
          </h3>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/image" className="fa-btn fa-btn-primary group">
              Start with a photo
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link to="/scan" className="fa-btn fa-btn-secondary">
              Or scan a barcode
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
