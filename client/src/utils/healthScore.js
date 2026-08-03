/**
 * Daily Health Score — a single 0–100 number that combines nutrition,
 * activity, hydration, and consistency, computed from today's tracker state.
 *
 * Pillar weights (mirrors the Nutrimate breakdown that Indian users read as
 * an easy at-a-glance daily metric):
 *   Nutrition   40
 *   Activity    35
 *   Hydration   15
 *   Consistency 10
 * Total        100
 *
 * The score is intentionally kind: partial credit is given rather than a
 * cliff, so days where the user is close (e.g. protein 80% of target) still
 * feel worth logging.
 */

import {
  WATER_TARGET_ML_DEFAULT,
  loadActivity,
  loadLog,
  loadTarget,
  loadWater,
  todayISO,
  totals,
} from "./dailyTracker";
import { streakStatus } from "./progression";

const STEP_TARGET = 8000;
const WORKOUT_KCAL_TARGET = 250;

export function computeHealthScore(dateISO = todayISO()) {
  const target = loadTarget();
  const entries = loadLog(dateISO);
  const day = totals(entries);
  const water = loadWater(dateISO);
  const activity = loadActivity(dateISO);
  const streak = streakStatus();

  const nutrition = nutritionPillar({ target, day });
  const hydration = hydrationPillar({ water });
  const activityPillar_ = activityPillar({ activity });
  const consistency = consistencyPillar({ streak });

  const total =
    Math.round(nutrition.pts + hydration.pts + activityPillar_.pts + consistency.pts);

  return {
    total,
    band: bandFor(total),
    parts: {
      nutrition,
      activity: activityPillar_,
      hydration,
      consistency,
    },
    inputs: {
      target,
      day,
      water,
      activity,
      streakCurrent: streak.current,
    },
  };
}

function nutritionPillar({ target, day }) {
  if (!target) {
    return {
      pts: 0,
      max: 40,
      label: "Nutrition",
      status: "no-target",
      hint: "Set a diet-plan target to unlock nutrition points.",
    };
  }
  const kcalPts = bandedScore({
    actual: day.calories,
    target: target.calories,
    max: 20,
    tolerance: 0.1,
  });
  const proteinPts = proteinScore(day.protein, target.proteinG, 20);
  const pts = kcalPts + proteinPts;
  return {
    pts,
    max: 40,
    label: "Nutrition",
    detail: `${Math.round(day.calories)}/${target.calories} kcal · ${Math.round(
      day.protein
    )}/${target.proteinG}g protein`,
    breakdown: [
      { label: "Calories", pts: Math.round(kcalPts), max: 20 },
      { label: "Protein", pts: Math.round(proteinPts), max: 20 },
    ],
  };
}

/** Reward calories that are close to target on either side; sharper penalty for very-low. */
function bandedScore({ actual, target, max, tolerance }) {
  if (!target) return 0;
  const ratio = actual / target;
  if (ratio >= 1 - tolerance && ratio <= 1 + tolerance) return max;
  if (ratio >= 1 - tolerance * 2 && ratio <= 1 + tolerance * 2) return max * 0.6;
  if (ratio >= 0.5 && ratio <= 1.5) return max * 0.3;
  return 0;
}

/** Protein rewards ≥95% strongly; over-target still gets full credit up to 1.5×. */
function proteinScore(actual, target, max) {
  if (!target) return 0;
  const ratio = actual / target;
  if (ratio >= 0.95 && ratio <= 1.5) return max;
  if (ratio >= 0.8) return max * 0.6;
  if (ratio >= 0.5) return max * 0.3;
  return 0;
}

function hydrationPillar({ water }) {
  const targetMl = WATER_TARGET_ML_DEFAULT;
  const pts = Math.max(0, Math.min(15, (water / targetMl) * 15));
  return {
    pts,
    max: 15,
    label: "Hydration",
    detail: `${water} / ${targetMl} ml`,
  };
}

function activityPillar({ activity }) {
  const stepsPts = Math.max(0, Math.min(20, (activity.steps / STEP_TARGET) * 20));
  const workoutKcalPts = Math.max(
    0,
    Math.min(15, (activity.workoutKcal / WORKOUT_KCAL_TARGET) * 15)
  );
  return {
    pts: stepsPts + workoutKcalPts,
    max: 35,
    label: "Activity",
    detail: `${activity.steps.toLocaleString("en-IN")} steps · ${activity.workoutKcal} kcal workout`,
    breakdown: [
      { label: "Steps", pts: Math.round(stepsPts), max: 20 },
      { label: "Workout", pts: Math.round(workoutKcalPts), max: 15 },
    ],
  };
}

function consistencyPillar({ streak }) {
  const pts = Math.max(0, Math.min(10, streak.current));
  return {
    pts,
    max: 10,
    label: "Consistency",
    detail: `${streak.current}-day streak`,
  };
}

function bandFor(total) {
  if (total >= 75) return { label: "Excellent", color: "emerald" };
  if (total >= 50) return { label: "On track", color: "saffron" };
  if (total >= 25) return { label: "Needs work", color: "amber" };
  return { label: "Start today", color: "gray" };
}
