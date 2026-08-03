/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Sweeping highlight across text.
 * CSS-driven so it actually runs (framer backgroundPosition is flaky here).
 */
export function TextShimmer({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}) {
  const dynamicSpread = useMemo(() => {
    return String(children).length * spread;
  }, [children, spread]);

  return (
    <Component
      className={cn("fa-text-shimmer relative inline-block", className)}
      style={{
        "--spread": `${dynamicSpread}px`,
        "--shimmer-duration": `${duration}s`,
        backgroundImage: [
          `linear-gradient(90deg, #0000 calc(50% - var(--spread)), var(--base-gradient-color, #ffffff), #0000 calc(50% + var(--spread)))`,
          `linear-gradient(var(--base-color, #a1a1aa), var(--base-color, #a1a1aa))`,
        ].join(", "),
      }}
    >
      {children}
    </Component>
  );
}

export default TextShimmer;
