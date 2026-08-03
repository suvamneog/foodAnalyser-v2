/**
 * Shared motion tokens — slow, soft iOS-like easing for desktop + mobile.
 * Prefer these over one-off durations so every page feels consistent.
 */

/** Apple-like decelerate (easeOutExpo-ish) */
export const IOS_EASE = [0.22, 1, 0.36, 1];

/** Slightly softer for exits */
export const IOS_EASE_OUT = [0.4, 0, 0.2, 1];

export const MOTION = {
  /** Page enter / route change */
  page: { duration: 0.65, ease: IOS_EASE },
  pageExit: { duration: 0.35, ease: IOS_EASE_OUT },
  /** Header / hero first paint */
  hero: { duration: 0.75, ease: IOS_EASE },
  /** Section scroll reveal */
  section: { duration: 0.7, ease: IOS_EASE },
  /** Stagger between siblings */
  stagger: 0.09,
  staggerFast: 0.06,
  /** Small y travel — premium, not bouncy */
  y: 22,
  ySm: 14,
};

/**
 * Scroll-triggered fade-up props for framer-motion.
 * @param {boolean} reduceMotion
 * @param {{ delay?: number, y?: number, duration?: number }} [opts]
 */
export function fadeUpProps(reduceMotion, opts = {}) {
  const delay = opts.delay ?? 0;
  const y = opts.y ?? MOTION.y;
  const duration = opts.duration ?? MOTION.section.duration;

  if (reduceMotion) {
    return {
      initial: false,
      whileInView: { opacity: 1 },
      viewport: { once: true },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-8% 0px -6% 0px", amount: 0.2 },
    transition: { duration, delay, ease: IOS_EASE },
  };
}

/**
 * Mount (animate-in) props — for page headers / first paint.
 */
export function mountFadeProps(reduceMotion, opts = {}) {
  const delay = opts.delay ?? 0;
  const y = opts.y ?? MOTION.ySm;
  const duration = opts.duration ?? MOTION.hero.duration;

  if (reduceMotion) {
    return { initial: false, animate: { opacity: 1 } };
  }

  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: IOS_EASE },
  };
}

export const pageVariants = {
  /* Opacity only — translateY on the whole page shifts layout and fights the scrollbar gutter */
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: MOTION.page,
  },
  exit: {
    opacity: 0,
    transition: MOTION.pageExit,
  },
};

export const staggerContainer = (reduceMotion, stagger = MOTION.stagger) => {
  if (reduceMotion) {
    return { initial: false, animate: "show" };
  }
  return {
    initial: "hidden",
    animate: "show",
    variants: {
      hidden: {},
      show: {
        transition: { staggerChildren: stagger, delayChildren: 0.08 },
      },
    },
  };
};

export const staggerItem = (reduceMotion) => {
  if (reduceMotion) {
    return { variants: { hidden: {}, show: {} } };
  }
  return {
    variants: {
      hidden: { opacity: 0, y: MOTION.ySm },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: MOTION.section.duration, ease: IOS_EASE },
      },
    },
  };
};
