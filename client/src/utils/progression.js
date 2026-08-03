/**
 * Progression: XP, levels, streaks, medals, quests.
 * All client-side, persisted to localStorage under a single key.
 *
 * Inspired by simple gamified apps (streak + medals + XP bar), but tuned for
 * a food-logging product: the actions that earn XP are all healthy habits, not
 * grinding.
 */

import { loadLog, loadTarget, todayISO, totals } from "./dailyTracker";

const KEY = "fa-progress";

const DEFAULT_STATE = {
  xp: 0,
  totalXp: 0,
  streak: { current: 0, best: 0, lastLoggedDate: null },
  medals: [], // ids
  events: {
    mealsLogged: 0,
    imagesAnalyzed: 0,
    plansGenerated: 0,
    recipesAnalyzed: 0,
    daysHitProtein: 0,
    daysHitCalories: 0,
  },
  // Which day-bonuses have already been awarded (prevents grinding by re-logging)
  bonusesByDay: {},
};

// ————————————————————————————————————————————————————————————
// Persistence
// ————————————————————————————————————————————————————————————

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      streak: { ...DEFAULT_STATE.streak, ...(parsed.streak || {}) },
      events: { ...DEFAULT_STATE.events, ...(parsed.events || {}) },
      bonusesByDay: parsed.bonusesByDay || {},
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveProgress(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    import("./cloudSync")
      .then((m) => m.scheduleSyncPush())
      .catch(() => {});
  } catch {
    // ignore
  }
}

// ————————————————————————————————————————————————————————————
// Levels — total XP to reach level N is 100 * N*(N+1)/2
//   Level 1 starts at 0 XP, Level 2 at 100, Level 3 at 300, Level 4 at 600 …
// ————————————————————————————————————————————————————————————

export function levelFromXp(xp) {
  let level = 1;
  let need = 100;
  let cumulative = 0;
  while (xp >= cumulative + need) {
    cumulative += need;
    level += 1;
    need = 100 * level;
  }
  return {
    level,
    intoLevel: xp - cumulative,
    forNextLevel: need,
    pct: Math.max(0, Math.min(100, ((xp - cumulative) / need) * 100)),
  };
}

// ————————————————————————————————————————————————————————————
// Streaks
// ————————————————————————————————————————————————————————————

function daysBetween(aISO, bISO) {
  const a = new Date(aISO);
  const b = new Date(bISO);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

function bumpStreak(state, todayIso) {
  const s = state.streak;
  if (s.lastLoggedDate === todayIso) return state; // already counted today
  if (!s.lastLoggedDate) {
    s.current = 1;
  } else {
    const gap = daysBetween(s.lastLoggedDate, todayIso);
    if (gap === 1) s.current += 1;
    else if (gap <= 0) {
      /* clock skew — keep as-is */
    } else s.current = 1;
  }
  s.lastLoggedDate = todayIso;
  s.best = Math.max(s.best, s.current);
  return state;
}

/**
 * Display-only streak (accounts for "at risk" if today has no log yet).
 * Returns { current, best, status: 'active' | 'at-risk' | 'broken' }
 */
export function streakStatus(state = loadProgress()) {
  const s = state.streak;
  const today = todayISO();
  if (!s.lastLoggedDate) return { current: 0, best: s.best || 0, status: "broken" };
  if (s.lastLoggedDate === today) return { current: s.current, best: s.best, status: "active" };
  const gap = daysBetween(s.lastLoggedDate, today);
  if (gap === 1) return { current: s.current, best: s.best, status: "at-risk" };
  return { current: 0, best: s.best, status: "broken" };
}

// ————————————————————————————————————————————————————————————
// Medals
// ————————————————————————————————————————————————————————————

export const MEDALS = [
  {
    id: "FIRST_LOG",
    label: "First bite",
    hint: "Log your first meal.",
    icon: "🥗",
    check: (s) => s.events.mealsLogged >= 1,
  },
  {
    id: "STREAK_3",
    label: "3-day streak",
    hint: "Log meals 3 days in a row.",
    icon: "🔥",
    check: (s) => s.streak.best >= 3,
  },
  {
    id: "STREAK_7",
    label: "Week warrior",
    hint: "7-day logging streak.",
    icon: "🏅",
    check: (s) => s.streak.best >= 7,
  },
  {
    id: "STREAK_30",
    label: "30-day habit",
    hint: "A full month of logging.",
    icon: "🏆",
    check: (s) => s.streak.best >= 30,
  },
  {
    id: "MEALS_25",
    label: "Regular",
    hint: "Log 25 meals total.",
    icon: "🍛",
    check: (s) => s.events.mealsLogged >= 25,
  },
  {
    id: "MEALS_100",
    label: "Century club",
    hint: "Log 100 meals total.",
    icon: "💯",
    check: (s) => s.events.mealsLogged >= 100,
  },
  {
    id: "PROTEIN_HIT_1",
    label: "Protein day",
    hint: "Hit your protein target on a day.",
    icon: "💪",
    check: (s) => s.events.daysHitProtein >= 1,
  },
  {
    id: "PROTEIN_HIT_7",
    label: "Protein pro",
    hint: "Hit protein target 7 days total.",
    icon: "🥚",
    check: (s) => s.events.daysHitProtein >= 7,
  },
  {
    id: "CALORIE_HIT_1",
    label: "Right on target",
    hint: "Land inside your kcal target ±10%.",
    icon: "🎯",
    check: (s) => s.events.daysHitCalories >= 1,
  },
  {
    id: "IMAGE_5",
    label: "Camera cook",
    hint: "Analyse 5 food images.",
    icon: "📸",
    check: (s) => s.events.imagesAnalyzed >= 5,
  },
  {
    id: "RECIPE_1",
    label: "Home chef",
    hint: "Analyse a home recipe.",
    icon: "👩‍🍳",
    check: (s) => s.events.recipesAnalyzed >= 1,
  },
  {
    id: "PLAN_1",
    label: "Planner",
    hint: "Generate your first diet plan.",
    icon: "🗺️",
    check: (s) => s.events.plansGenerated >= 1,
  },
];

function recomputeMedals(state) {
  const unlocked = new Set(state.medals);
  const newlyUnlocked = [];
  for (const m of MEDALS) {
    if (unlocked.has(m.id)) continue;
    if (m.check(state)) {
      unlocked.add(m.id);
      newlyUnlocked.push(m);
    }
  }
  state.medals = Array.from(unlocked);
  return newlyUnlocked;
}

// ————————————————————————————————————————————————————————————
// Award helpers
// ————————————————————————————————————————————————————————————

function addXp(state, xp) {
  state.xp += xp;
  state.totalXp += xp;
}

function evaluateDayBonuses(state, todayIso) {
  const target = loadTarget();
  if (!target) return [];
  const day = totals(loadLog(todayIso));
  const already = state.bonusesByDay[todayIso] || {};
  const awarded = [];

  const inCalorieBand =
    Math.abs(day.calories - target.calories) <= target.calories * 0.1 &&
    day.calories > 0;
  if (inCalorieBand && !already.calories) {
    addXp(state, 30);
    already.calories = true;
    state.events.daysHitCalories += 1;
    awarded.push({ id: "day-calories", label: "+30 XP · calorie target hit" });
  }

  const hitProtein = target.proteinG > 0 && day.protein >= target.proteinG * 0.95;
  if (hitProtein && !already.protein) {
    addXp(state, 30);
    already.protein = true;
    state.events.daysHitProtein += 1;
    awarded.push({ id: "day-protein", label: "+30 XP · protein target hit" });
  }

  const fatShare = day.calories > 0 ? (day.fat * 9) / day.calories : 0;
  if (day.calories > 500 && fatShare > 0 && fatShare <= 0.3 && !already.lowFat) {
    addXp(state, 15);
    already.lowFat = true;
    awarded.push({ id: "day-lowfat", label: "+15 XP · low-oil day" });
  }

  state.bonusesByDay[todayIso] = already;
  return awarded;
}

/**
 * The main event: called every time a meal is logged (via tracker or recipe).
 * Returns a small summary of what changed so callers can toast, if they want.
 */
export function recordMealLogged() {
  const state = loadProgress();
  const today = todayISO();
  const awarded = [];

  addXp(state, 10);
  state.events.mealsLogged += 1;
  awarded.push({ id: "meal-log", label: "+10 XP · meal logged" });

  bumpStreak(state, today);

  const dayAwards = evaluateDayBonuses(state, today);
  awarded.push(...dayAwards);

  const newMedals = recomputeMedals(state);
  saveProgress(state);
  return {
    state,
    awarded,
    newMedals,
  };
}

export function recordPlanSaved() {
  const state = loadProgress();
  if (state.events.plansGenerated === 0) addXp(state, 25);
  state.events.plansGenerated += 1;
  const newMedals = recomputeMedals(state);
  saveProgress(state);
  return { state, newMedals };
}

export function recordRecipeAnalyzed() {
  const state = loadProgress();
  if (state.events.recipesAnalyzed === 0) addXp(state, 15);
  state.events.recipesAnalyzed += 1;
  const newMedals = recomputeMedals(state);
  saveProgress(state);
  return { state, newMedals };
}

export function recordImageAnalyzed() {
  const state = loadProgress();
  addXp(state, 5);
  state.events.imagesAnalyzed += 1;
  const newMedals = recomputeMedals(state);
  saveProgress(state);
  return { state, newMedals };
}

// ————————————————————————————————————————————————————————————
// Memories calendar (7 days by default)
// ————————————————————————————————————————————————————————————

function isoNDaysAgo(n, base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function memories(days = 7) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = isoNDaysAgo(i);
    const log = loadLog(iso);
    const t = totals(log);
    out.push({
      iso,
      dow: new Date(iso).toLocaleDateString(undefined, { weekday: "short" }),
      dom: new Date(iso).getDate(),
      logged: log.length > 0,
      calories: Math.round(t.calories),
      protein: Math.round(t.protein),
    });
  }
  return out;
}

// ————————————————————————————————————————————————————————————
// Daily / weekly quests
// ————————————————————————————————————————————————————————————

export function quests() {
  const state = loadProgress();
  const today = todayISO();
  const target = loadTarget();
  const todayLog = loadLog(today);
  const todayTotals = totals(todayLog);

  const hasMealsBreakfast = todayLog.some((e) => e.slot === "breakfast");
  const hasMealsLunch = todayLog.some((e) => e.slot === "lunch");
  const hasMealsDinner = todayLog.some((e) => e.slot === "dinner");
  const hitProtein = target && target.proteinG > 0 && todayTotals.protein >= target.proteinG * 0.95;

  const daily = [
    {
      id: "log-any",
      label: "Log a meal today",
      done: todayLog.length > 0,
    },
    {
      id: "log-three",
      label: "Log breakfast + lunch + dinner",
      done: hasMealsBreakfast && hasMealsLunch && hasMealsDinner,
    },
    {
      id: "hit-protein",
      label: target ? "Hit today's protein target" : "Set a protein target first",
      done: hitProtein,
    },
  ];

  // Weekly: how many days in the last 7 had a log
  const week = memories(7).filter((d) => d.logged).length;
  const weekly = [
    { id: "week-5", label: "Log meals on 5 different days this week", done: week >= 5, progress: `${Math.min(week, 5)}/5` },
    {
      id: "streak-3",
      label: "Hit a 3-day streak",
      done: state.streak.best >= 3,
      progress: `${Math.min(state.streak.current, 3)}/3`,
    },
  ];

  return { daily, weekly };
}

// ————————————————————————————————————————————————————————————
// Dev-only reset (not exposed in UI unless we add a debug button)
// ————————————————————————————————————————————————————————————

export function resetProgress() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
