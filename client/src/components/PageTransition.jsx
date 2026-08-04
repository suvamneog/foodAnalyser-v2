/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pageVariants, fadeUpProps, mountFadeProps, IOS_EASE, MOTION } from "../utils/motion";

const INSTANT_EVENT = "fa-instant-nav";

/** Call right before navigating to home results — skips blank page-transition wait. */
export function markInstantNavigation() {
  try {
    window.dispatchEvent(new Event(INSTANT_EVENT));
  } catch {
    /* ignore */
  }
}

const instantVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

/**
 * Soft route enter/exit — wraps page trees so every navigation feels iOS-smooth.
 * Analyse handoffs (category/cuisine → home results) skip the wait-for-exit flash.
 */
export function PageTransition({ children }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [instant, setInstant] = useState(false);
  const handoff = Boolean(location.state?.cuisineSearch);
  const skipWait = instant || handoff;

  useEffect(() => {
    const onInstant = () => setInstant(true);
    window.addEventListener(INSTANT_EVENT, onInstant);
    return () => window.removeEventListener(INSTANT_EVENT, onInstant);
  }, []);

  useEffect(() => {
    if (!instant) return undefined;
    const t = window.setTimeout(() => setInstant(false), 400);
    return () => window.clearTimeout(t);
  }, [instant, location.pathname]);

  if (reduceMotion) {
    return <div key={location.pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode={skipWait ? "sync" : "wait"} initial={false}>
      <motion.div
        key={location.pathname}
        variants={skipWait ? instantVariants : pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fa-page-transition min-h-[100svh]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Scroll-triggered fade-up block. Use around sections for top→bottom reveal.
 */
export function Reveal({
  as: Tag = motion.div,
  children,
  className = "",
  delay = 0,
  y,
  duration,
  ...rest
}) {
  const reduceMotion = useReducedMotion();
  const props = fadeUpProps(reduceMotion, { delay, y, duration });

  return (
    <Tag className={className} {...props} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Mount fade for headers / first paint (not scroll-bound).
 */
export function RevealMount({
  as: Tag = motion.div,
  children,
  className = "",
  delay = 0,
  y,
  duration,
  ...rest
}) {
  const reduceMotion = useReducedMotion();
  const props = mountFadeProps(reduceMotion, { delay, y, duration });

  return (
    <Tag className={className} {...props} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Staggered list of children on mount — premium cascade top→bottom.
 */
export function RevealStagger({ children, className = "", stagger = MOTION.stagger }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const kids = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: 0.1 },
        },
      }}
    >
      {kids.map((child, i) => (
        <motion.div
          key={child?.key ?? i}
          variants={{
            hidden: { opacity: 0, y: MOTION.ySm },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: MOTION.section.duration, ease: IOS_EASE },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export { fadeUpProps, mountFadeProps, IOS_EASE, MOTION };
