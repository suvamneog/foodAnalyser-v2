/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Figtree"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#07080c",
          900: "#0c0e14",
          800: "#141821",
          700: "#1c2230",
        },
        saffron: {
          200: "#fadfad",
          300: "#f0c27a",
          400: "#e8a84a",
          500: "#d4892a",
          600: "#a8691a",
        },
        leaf: {
          300: "#a6dab0",
          400: "#7dba8a",
          500: "#4f9a62",
          600: "#3b7a4a",
        },
        // Gamified accents — used ONLY on progression / streak / medal / quest surfaces.
        ember: {
          300: "#ffb385",
          400: "#ff8a52",
          500: "#f26a2e",
          600: "#c8501e",
        },
        plum: {
          300: "#c9a4ff",
          400: "#a97bf3",
          500: "#8c58d8",
          600: "#6d40b0",
        },
        mint: {
          300: "#9be3c8",
          400: "#5fc9a4",
          500: "#33ab86",
        },
        sky2: {
          300: "#9ecff5",
          400: "#5aaee6",
          500: "#3a8bcf",
        },
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212, 137, 42, 0.22), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(79, 154, 98, 0.12), transparent)",
        // Subtle inner top-light — gives "sticker" depth on rounded panels.
        "sticker-sheen":
          "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 30%)",
      },
      borderRadius: {
        chunk: "1.25rem",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 12px 40px rgba(0,0,0,0.35)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 18px 50px rgba(0,0,0,0.45)",
        // "Sticker" — the signature restrained-cartoon depth.
        sticker:
          "0 2px 0 rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        pop:
          "0 3px 0 rgba(0,0,0,0.4), 0 14px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
        // Colored glows for gamified accents.
        emberGlow:
          "0 0 0 1px rgba(255,138,82,0.35), 0 10px 30px rgba(255,106,46,0.28)",
        plumGlow:
          "0 0 0 1px rgba(169,123,243,0.35), 0 10px 30px rgba(140,88,216,0.28)",
        mintGlow:
          "0 0 0 1px rgba(95,201,164,0.35), 0 10px 30px rgba(51,171,134,0.28)",
        saffronGlow:
          "0 0 0 1px rgba(232,168,74,0.35), 0 10px 30px rgba(212,137,42,0.30)",
      },
    },
  },
  plugins: [],
};
