import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Trophy,
  Sparkles,
  Camera,
  ChefHat,
  HeartPulse,
  BookOpen,
  Target as TargetIcon,
} from "lucide-react";
import {
  MEDALS,
  levelFromXp,
  loadProgress,
  memories,
  quests,
  streakStatus,
} from "../utils/progression";
import { loadTarget, todayISO, totals, loadLog } from "../utils/dailyTracker";
import HealthScoreCard from "../components/HealthScoreCard";
import WeeklyView from "../components/WeeklyView";
import TrustBadge from "../components/TrustBadge";
import { isLoggedInForSync, lastSyncAt, pullFromCloud } from "../utils/cloudSync";
import { IOS_EASE, MOTION } from "../utils/motion";

export default function Profile() {
  const reduce = useReducedMotion();
  const [state, setState] = useState(() => loadProgress());
  const [target, setTarget] = useState(() => loadTarget());

  useEffect(() => {
    setState(loadProgress());
    setTarget(loadTarget());
  }, []);

  const lvl = useMemo(() => levelFromXp(state.xp), [state.xp]);
  const streak = useMemo(() => streakStatus(state), [state]);
  const week = useMemo(() => memories(7), []);
  const q = useMemo(() => quests(), []);
  const todaySummary = useMemo(() => totals(loadLog(todayISO())), []);

  const unlocked = new Set(state.medals);
  const unlockedCount = unlocked.size;

  const streakLabel =
    streak.status === "active"
      ? "on fire"
      : streak.status === "at-risk"
      ? "log today to keep it"
      : "start a new streak";

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        {/* Header — level medal + streak flame + xp bar */}
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.hero.duration, ease: IOS_EASE }}
          className="fa-sticker fa-dots relative mt-6 overflow-hidden p-5 sm:p-6"
        >
          <div className="relative flex flex-wrap items-center gap-4">
            {/* Level medal */}
            <div className="fa-sticker fa-sticker-saffron fa-shine grid h-16 w-16 place-items-center rounded-2xl">
              <div className="text-center leading-none">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-saffron-200/90">
                  Lvl
                </p>
                <p className="fa-num mt-0.5 text-2xl text-saffron-100">{lvl.level}</p>
              </div>
            </div>

            {/* Streak chip */}
            <div
              className={`fa-chip-chunky ${
                streak.status === "active"
                  ? "fa-sticker-ember"
                  : streak.status === "at-risk"
                  ? "fa-sticker-saffron"
                  : ""
              }`}
            >
              <Flame
                className={`h-4 w-4 ${
                  streak.status === "active"
                    ? "fa-flame-pulse text-ember-300"
                    : streak.status === "at-risk"
                    ? "text-saffron-300"
                    : "text-white/50"
                }`}
              />
              <span className="fa-num text-base">{streak.current}</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                day streak
              </span>
            </div>

            <div className="ml-auto text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Total XP
              </p>
              <p className="fa-num text-3xl text-white">
                {state.totalXp.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* XP bar */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span className="font-semibold">
                <span className="text-saffron-200">{lvl.intoLevel}</span>
                <span className="text-white/40"> / {lvl.forNextLevel} XP</span>
              </span>
              <span className="uppercase tracking-[0.14em] text-white/45">
                Level {lvl.level} · {streakLabel}
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border border-black/40 bg-black/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${lvl.pct}%` }}
                transition={{ ease: IOS_EASE, duration: reduce ? 0 : 1.1 }}
                className="fa-shine relative h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, #ffd68a 0%, #e8a84a 55%, #c68520 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.5), 0 0 12px rgba(232,168,74,0.6)",
                }}
              />
            </div>
          </div>
        </motion.header>

        {/* Health Score */}
        <section className="mt-6 space-y-2">
          <HealthScoreCard />
          <TrustBadge kind="health-score" />
          <p className="text-[11px] text-white/40">
            {isLoggedInForSync()
              ? `Cloud sync ${
                  lastSyncAt()
                    ? `· last ${new Date(lastSyncAt()).toLocaleString()}`
                    : "· pending"
                }`
              : "Local only — log in to sync across devices."}
            {isLoggedInForSync() && (
              <button
                type="button"
                className="ml-2 text-saffron-300 underline"
                onClick={async () => {
                  await pullFromCloud();
                  setState(loadProgress());
                  setTarget(loadTarget());
                }}
              >
                Sync now
              </button>
            )}
          </p>
        </section>

        <section className="mt-6">
          <WeeklyView />
        </section>

        {/* Stat tiles */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={<Flame className="h-4 w-4" />}
            label="Best streak"
            value={`${streak.best}d`}
            tone="ember"
          />
          <StatTile
            icon={<BookOpen className="h-4 w-4" />}
            label="Meals logged"
            value={state.events.mealsLogged}
            tone="saffron"
          />
          <StatTile
            icon={<TargetIcon className="h-4 w-4" />}
            label="Protein hits"
            value={state.events.daysHitProtein}
            tone="leaf"
          />
          <StatTile
            icon={<Camera className="h-4 w-4" />}
            label="Images analysed"
            value={state.events.imagesAnalyzed}
            tone="sky"
          />
        </section>

        {/* Memories */}
        <section className="fa-sticker mt-8 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Memories · last 7 days
              </p>
              <h2 className="mt-1 font-display text-lg font-bold text-white">
                Your logging streak
              </h2>
            </div>
            <Link to="/tracker" className="fa-btn-chunky text-xs">
              Log today →
            </Link>
          </div>
          <ol className="mt-4 grid grid-cols-7 gap-2 text-center">
            {week.map((d) => (
              <li
                key={d.iso}
                className={`rounded-xl border-2 p-2 text-[10px] transition ${
                  d.logged
                    ? "border-saffron-400/50 bg-gradient-to-b from-saffron-500/20 to-saffron-500/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    : "border-white/8 bg-black/25 text-white/40"
                }`}
                title={`${d.iso} · ${d.calories} kcal`}
              >
                <p className="uppercase tracking-wider">{d.dow}</p>
                <p className="fa-num mt-1 text-lg">{d.dom}</p>
                <p className="mt-0.5 font-semibold">
                  {d.logged ? `${d.calories}` : "—"}
                </p>
              </li>
            ))}
          </ol>
          {target ? (
            <p className="mt-3 text-[11px] text-white/45">
              Target: {target.calories} kcal · P {target.proteinG} g. Today so far:{" "}
              {Math.round(todaySummary.calories)} kcal · P{" "}
              {Math.round(todaySummary.protein)} g.
            </p>
          ) : (
            <p className="mt-3 text-[11px] text-white/45">
              Set a target on the <Link className="underline" to="/plan">diet plan</Link> page
              to earn kcal/protein bonuses.
            </p>
          )}
        </section>

        {/* Quests */}
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <QuestBlock title="Today’s quests" items={q.daily} />
          <QuestBlock title="This week" items={q.weekly} />
        </section>

        {/* Medals */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Medals
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-white">
                <span className="text-saffron-300">{unlockedCount}</span>
                <span className="text-white/50"> / {MEDALS.length}</span> unlocked
              </h2>
            </div>
            <div className="fa-chip-chunky">
              <Trophy className="h-3.5 w-3.5 text-saffron-300" />
              <span className="text-white/70">Keep logging to unlock more</span>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {MEDALS.map((m, i) => {
              const on = unlocked.has(m.id);
              const tones = ["fa-sticker-saffron", "fa-sticker-leaf", "fa-sticker-ember", "fa-sticker-plum", "fa-sticker-sky"];
              const tone = on ? tones[i % tones.length] : "";
              return (
                <li
                  key={m.id}
                  className={`fa-sticker fa-sticker-tilt p-4 ${on ? tone : "opacity-60 grayscale"}`}
                >
                  <div className="relative flex items-start gap-3">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-xl ${
                        on
                          ? "border-white/25 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_10px_rgba(0,0,0,0.35)]"
                          : "border-white/8 bg-black/30"
                      }`}
                    >
                      <span className={on ? "drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" : ""}>
                        {m.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{m.label}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">
                        {m.hint}
                      </p>
                    </div>
                    {on && (
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-black/40 bg-emerald-400 text-[10px] font-black text-emerald-950 shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                        ✓
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Shortcuts */}
        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <Shortcut to="/tracker" icon={<HeartPulse className="h-5 w-5" />} title="Daily tracker" hint="Earn XP by logging meals." />
          <Shortcut to="/plan" icon={<Sparkles className="h-5 w-5" />} title="Diet plan" hint="+25 XP the first time you save a target." />
          <Shortcut to="/recipe" icon={<ChefHat className="h-5 w-5" />} title="Recipe analyser" hint="+15 XP on your first recipe." />
        </section>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, tone = "saffron" }) {
  const toneClass = {
    ember: "fa-sticker-ember",
    saffron: "fa-sticker-saffron",
    leaf: "fa-sticker-leaf",
    plum: "fa-sticker-plum",
    sky: "fa-sticker-sky",
  }[tone] || "";
  const iconTone = {
    ember: "text-ember-300",
    saffron: "text-saffron-200",
    leaf: "text-mint-300",
    plum: "text-plum-300",
    sky: "text-sky2-300",
  }[tone];
  return (
    <div className={`fa-sticker ${toneClass} p-4 transition hover:-translate-y-0.5`}>
      <div className={`flex items-center gap-2 ${iconTone}`}>
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
          {label}
        </p>
      </div>
      <p className="fa-num mt-2 text-3xl text-white">{value}</p>
    </div>
  );
}

function QuestBlock({ title, items }) {
  const doneCount = items.filter((i) => i.done).length;
  return (
    <div className="fa-sticker p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          {title}
        </p>
        <span className="fa-chip-chunky text-[10px]">
          <span className="fa-num text-saffron-200">{doneCount}</span>
          <span className="text-white/50">/{items.length}</span>
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
              it.done
                ? "border-emerald-400/25 bg-emerald-500/10"
                : "border-white/8 bg-black/25 hover:border-white/15"
            }`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-black transition ${
                  it.done
                    ? "border-emerald-400/70 bg-emerald-500 text-emerald-950 shadow-[0_2px_6px_rgba(52,211,153,0.35)]"
                    : "border-white/20 text-white/30"
                }`}
              >
                {it.done ? "✓" : ""}
              </span>
              <span
                className={`truncate ${
                  it.done ? "text-white/60 line-through" : "text-white/90"
                }`}
              >
                {it.label}
              </span>
            </div>
            {it.progress && (
              <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                {it.progress}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Shortcut({ to, icon, title, hint }) {
  return (
    <Link to={to} className="fa-sticker fa-sticker-hover block p-5">
      <span className="inline-grid h-9 w-9 place-items-center rounded-xl border border-saffron-400/30 bg-saffron-500/12 text-saffron-300">
        {icon}
      </span>
      <p className="mt-3 font-semibold text-white">{title}</p>
      <p className="mt-1 text-[11px] text-white/50">{hint}</p>
    </Link>
  );
}
