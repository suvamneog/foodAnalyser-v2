/* eslint-disable react/prop-types */
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pageVariants, fadeUpProps, mountFadeProps, IOS_EASE, MOTION } from "../utils/motion";

/**
 * Soft route enter/exit — wraps page trees so every navigation feels iOS-smooth.
 */
export function PageTransition({ children }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div key={location.pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
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
