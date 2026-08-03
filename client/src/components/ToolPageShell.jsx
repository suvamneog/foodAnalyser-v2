/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ShootingStars } from "./ui/shooting-stars";
import { StarsBackground } from "./ui/stars-background";
import { Reveal, RevealMount, MOTION, IOS_EASE } from "./PageTransition";

/**
 * Shared chrome for tool pages — matches home / Daily Tracker language:
 * ink surface, soft stars, saffron eyebrow, display title.
 * Slow top→bottom cascade for a premium iOS feel.
 */
export default function ToolPageShell({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  backTo = "/",
  backLabel = "Home",
  maxWidth = "max-w-4xl",
  actions,
  children,
  stars = true,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink-950 text-white">
      {stars && (
        <div className="fa-stars-layer pointer-events-none absolute inset-0 opacity-40">
          <ShootingStars />
          <StarsBackground />
        </div>
      )}

      <div className={`relative z-10 mx-auto ${maxWidth} px-4 pb-20 pt-24 sm:px-6`}>
        <RevealMount delay={0} y={10} duration={0.55}>
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </RevealMount>

        <RevealMount
          delay={0.08}
          y={MOTION.ySm}
          duration={MOTION.hero.duration}
          className="mt-6 flex items-start gap-3"
        >
          {Icon && (
            <div className="rounded-2xl border border-saffron-400/20 bg-saffron-500/10 p-3">
              <Icon className="h-5 w-5 text-saffron-300" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-saffron-300/90">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
                {subtitle}
              </p>
            )}
          </div>
          {actions}
        </RevealMount>

        <Reveal delay={0.12} className="mt-8">
          {children}
        </Reveal>

        {/* Soft bottom fade so long pages never hard-cut */}
        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none h-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: IOS_EASE }}
          />
        )}
      </div>
    </div>
  );
}
