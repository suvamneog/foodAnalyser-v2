import { useEffect, useState } from "react";

// Rotating "still working" lines shown once the wait crosses ~5s.
// Written in plain, human wording — never mention server/idle/wake.
const ROTATING_HINTS = [
  "Almost there…",
  "Warming up the kitchen…",
  "Just a few more seconds…",
  "Loading fresh nutrition data…",
  "Nearly ready…",
];

function LoadingCard() {
  const [hintIndex, setHintIndex] = useState(-1); // -1 = only the primary line

  useEffect(() => {
    // Keep the primary line alone for a few seconds so brief searches never
    // flash a "taking longer" message. Only after ~4.5s do we start rotating.
    const start = window.setTimeout(() => {
      setHintIndex(0);
    }, 4500);

    const rotate = window.setInterval(() => {
      setHintIndex((prev) => {
        if (prev < 0) return 0;
        return (prev + 1) % ROTATING_HINTS.length;
      });
    }, 3200);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(rotate);
    };
  }, []);

  const rotatingHint = hintIndex >= 0 ? ROTATING_HINTS[hintIndex] : "";

  return (
    <div
      className="fa-sticker mx-auto flex w-full max-w-sm flex-col items-center gap-5 px-6 py-8 sm:py-9"
      role="status"
      aria-live="polite"
    >
      <div className="fa-pacman-wrap" aria-hidden="true">
        <div className="fa-pacman">
          <div className="fa-pac-top" />
          <div className="fa-pac-bottom" />
        </div>
        <div className="fa-pac-dots">
          <span className="fa-pac-dot" />
          <span className="fa-pac-dot" />
          <span className="fa-pac-dot" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-white/85 sm:text-[15px]">
          First search of the day may take a bit longer
        </p>
        <p className="mt-1.5 min-h-[1.15em] text-xs text-white/50 sm:text-[13px]">
          {rotatingHint && (
            <span key={hintIndex} className="fa-loader-hint">
              {rotatingHint}
            </span>
          )}
        </p>
      </div>

      <span className="sr-only">Loading nutrition data…</span>
    </div>
  );
}

export default LoadingCard;
