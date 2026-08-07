import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { useTheme } from "@/utils/ThemeContext";

/**
 * Immersive 404 — expanding circles reveal the message, stick figures drift across.
 * Theme-aware (light / dark) and responsive for mobile → desktop.
 */
export default function NotFoundPage() {
  const { resolved } = useTheme();
  const isLight = resolved === "light";

  return (
    <div
      className={`relative flex h-[100svh] w-full items-center justify-center overflow-hidden pt-14 sm:pt-16 ${
        isLight ? "bg-[#f5f1ea]" : "bg-[#07080c]"
      }`}
    >
      <MessageDisplay isLight={isLight} />
      <CharactersAnimation isLight={isLight} />
      <CircleAnimation isLight={isLight} />
    </div>
  );
}

function MessageDisplay({ isLight }: { isLight: boolean }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  // After the white/ink flood: text sits on the circle color.
  // Dark theme → white flood → black text. Light theme → ink flood → cream text.
  const text = isLight ? "text-[#f5f1ea]" : "text-[#07080c]";
  const muted = isLight ? "text-[#f5f1ea]/75" : "text-[#07080c]/70";
  const outlineBtn = isLight
    ? "border-[#f5f1ea] text-[#f5f1ea] hover:bg-[#f5f1ea] hover:text-[#07080c]"
    : "border-[#07080c] text-[#07080c] hover:bg-[#07080c] hover:text-white";
  const solidBtn = isLight
    ? "bg-[#f5f1ea] text-[#07080c] hover:bg-white"
    : "bg-[#07080c] text-white hover:bg-[#1c2230]";

  return (
    <div className="absolute z-[100] flex h-[90%] w-[92%] max-w-3xl flex-col items-center justify-center px-4 sm:w-[90%]">
      <div
        className={`flex flex-col items-center text-center transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <p
          className={`m-[1%] font-display text-xl font-semibold sm:text-[28px] md:text-[35px] ${text}`}
        >
          Page Not Found
        </p>
        <p
          className={`m-[1%] font-display text-[56px] font-extrabold leading-none tracking-tight sm:text-[72px] md:text-[80px] ${text}`}
        >
          404
        </p>
        <p
          className={`m-[1%] w-full max-w-md text-[13px] leading-relaxed sm:w-3/5 sm:min-w-[40%] sm:text-[15px] ${muted}`}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`inline-flex h-auto items-center justify-center gap-2 border-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105 sm:px-6 sm:text-base ${outlineBtn}`}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className={`inline-flex h-auto items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105 sm:px-6 sm:text-base ${solidBtn}`}
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

type StickFigure = {
  top?: string;
  bottom?: string;
  src: string;
  transform?: string;
  speedX: number;
  speedRotation?: number;
};

const STICK_FIGURES: StickFigure[] = [
  {
    top: "0%",
    src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg",
    transform: "rotateZ(-90deg)",
    speedX: 1500,
  },
  {
    top: "10%",
    src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick1.svg",
    speedX: 3000,
    speedRotation: 2000,
  },
  {
    top: "20%",
    src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick2.svg",
    speedX: 5000,
    speedRotation: 1000,
  },
  {
    top: "25%",
    src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg",
    speedX: 2500,
    speedRotation: 1500,
  },
  {
    top: "35%",
    src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg",
    speedX: 2000,
    speedRotation: 300,
  },
  {
    bottom: "5%",
    src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick3.svg",
    speedX: 0,
  },
];

function CharactersAnimation({ isLight }: { isLight: boolean }) {
  const charactersRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const container = charactersRef.current;
    if (!container) return;

    container.innerHTML = "";

    const isMobile = window.innerWidth < 640;
    const size = isMobile ? "28%" : "18%";

    STICK_FIGURES.forEach((figure, index) => {
      const stick = document.createElement("img");
      stick.alt = "";
      stick.draggable = false;
      stick.className = "characters pointer-events-none select-none";
      stick.style.position = "absolute";
      stick.style.width = size;
      stick.style.height = size;
      // Invert sticks on light bg so they stay visible before the flood
      stick.style.filter = isLight ? "invert(1) brightness(0.15)" : "none";

      if (figure.top) stick.style.top = figure.top;
      if (figure.bottom) stick.style.bottom = figure.bottom;
      stick.src = figure.src;
      if (figure.transform) stick.style.transform = figure.transform;

      container.appendChild(stick);

      if (index === 5 || figure.speedX === 0) return;

      stick.animate([{ left: "100%" }, { left: "-20%" }], {
        duration: figure.speedX,
        easing: "linear",
        fill: "forwards",
      });

      if (index === 0 || !figure.speedRotation) return;

      stick.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(-360deg)" }],
        {
          duration: figure.speedRotation,
          iterations: Infinity,
          easing: "linear",
        }
      );
    });

    return () => {
      container.innerHTML = "";
    };
  }, [tick, isLight]);

  return (
    <div
      ref={charactersRef}
      className="pointer-events-none absolute inset-x-[0.5%] top-[3%] z-10 h-[92%] w-[99%]"
      aria-hidden="true"
    />
  );
}

interface Circulo {
  x: number;
  y: number;
  size: number;
}

function CircleAnimation({ isLight }: { isLight: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | undefined>(undefined);
  const timerRef = useRef(0);
  const circulosRef = useRef<Circulo[]>([]);
  const fillColor = isLight ? "#16181f" : "#ffffff";

  const initArr = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    circulosRef.current = [];
    // Fewer particles on small screens for perf
    const count = canvas.width < 640 ? 160 : 300;

    for (let index = 0; index < count; index++) {
      const randomX =
        Math.floor(
          Math.random() * (canvas.width * 3 - canvas.width * 1.2 + 1)
        ) +
        canvas.width * 1.2;

      const randomY =
        Math.floor(
          Math.random() * (canvas.height - canvas.height * -0.2 + 1)
        ) +
        canvas.height * -0.2;

      const size = canvas.width / 1000;
      circulosRef.current.push({ x: randomX, y: randomY, size });
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    timerRef.current++;
    context.setTransform(1, 0, 0, 1, 0, 0);

    const distanceX = canvas.width / 80;
    const growthRate = canvas.width / 1000;

    context.fillStyle = fillColor;
    context.clearRect(0, 0, canvas.width, canvas.height);

    circulosRef.current.forEach((circulo) => {
      context.beginPath();

      if (timerRef.current < 65) {
        circulo.x = circulo.x - distanceX;
        circulo.size = circulo.size + growthRate;
      }

      if (timerRef.current > 65 && timerRef.current < 500) {
        circulo.x = circulo.x - distanceX * 0.02;
        circulo.size = circulo.size + growthRate * 0.2;
      }

      context.arc(circulo.x, circulo.y, circulo.size, 0, Math.PI * 2);
      context.fill();
    });

    if (timerRef.current > 500) {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
      return;
    }

    requestIdRef.current = requestAnimationFrame(draw);
  }, [fillColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const start = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      timerRef.current = 0;
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
      initArr();
      draw();
    };

    start();

    let resizeTimer = 0;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(start, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(resizeTimer);
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
  }, [initArr, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
