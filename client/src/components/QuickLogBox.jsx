import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Send } from "lucide-react";
import { logQuickText, previewQuickLog, slotByTime } from "../utils/quickLog";

const SUGGESTIONS = [
  "2 roti, dal 1 katori, sabzi",
  "100g paneer, 2 eggs, 1 glass milk",
  "1 dosa, sambar, coconut chutney",
  "1 bowl poha, chai, 5 almonds",
];

const SLOTS = ["breakfast", "lunch", "snack", "dinner"];

export default function QuickLogBox({ onLogged }) {
  const [text, setText] = useState("");
  const [slot, setSlot] = useState(slotByTime());
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(null);

  const runPreview = async (value) => {
    setText(value);
    if (!value.trim()) {
      setPreview(null);
      return;
    }
    try {
      const p = await previewQuickLog(value);
      setPreview(p);
    } catch {
      setPreview(null);
    }
  };

  const doLog = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await logQuickText(text, { slot });
      setFlash({
        kind: "ok",
        message: `Logged ${res.logged.length} item${res.logged.length === 1 ? "" : "s"} to ${
          res.slot
        } · ${Math.round(res.totals.calories)} kcal · P ${Math.round(res.totals.protein)}g`,
      });
      setText("");
      setPreview(null);
      onLogged?.(res);
    } catch (e) {
      setFlash({ kind: "err", message: e.message || "Could not log." });
    } finally {
      setBusy(false);
      setTimeout(() => setFlash(null), 3200);
    }
  };

  return (
    <div className="fa-sticker fa-sticker-saffron relative p-4 sm:p-5">
      <div className="relative flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-saffron-400/40 bg-saffron-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          <Sparkles className="h-3.5 w-3.5 text-saffron-200" />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-saffron-200">
          Quick log · type your meal
        </p>
      </div>
      <p className="relative mt-1 text-sm text-white/55">
        One line, plain language. e.g. <span className="text-white/80">&quot;2 roti dal sabzi 100g curd&quot;</span>.
        Portions can be in <em>g / katori / bowl / tsp / tbsp / cup / pieces</em>.
      </p>

      <div className="relative mt-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => runPreview(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doLog();
          }}
          placeholder="e.g. 2 roti, 1 katori dal, 100g paneer"
          className="fa-input flex-1 min-w-[220px]"
        />
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          className="fa-select w-auto"
        >
          {SLOTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={doLog}
          disabled={busy || !text.trim()}
          className="fa-btn-chunky text-sm"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Log meal
        </button>
      </div>

      <div className="relative mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => runPreview(s)}
            className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] font-medium text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:-translate-y-0.5 hover:border-saffron-400/45 hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {preview && preview.rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-xl border border-white/8 bg-black/30 p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Preview · {preview.rows.length} item{preview.rows.length === 1 ? "" : "s"} · ~
              {Math.round(preview.totals.calories)} kcal · P{" "}
              {Math.round(preview.totals.protein)} g
            </p>
            <ul className="mt-2 space-y-1 text-[12px]">
              {preview.rows.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-md bg-white/[0.03] px-2 py-1"
                >
                  <span className="min-w-0 truncate text-white/80">
                    {r.matchedName || r.name}
                    <span className="text-white/40"> · {Math.round(r.grams || 0)} g</span>
                  </span>
                  <span className="text-white/60">
                    {Math.round(r.calories || 0)} kcal
                  </span>
                </li>
              ))}
            </ul>
            {preview.rows.some((r) => r.source === "unresolved") && (
              <p className="mt-2 text-[10px] text-yellow-300/80">
                Some items had no match — they’ll be skipped. Add grams (e.g. "50g X") to help.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {flash && (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-[11px] ${
            flash.kind === "ok"
              ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border border-red-400/30 bg-red-500/10 text-red-100"
          }`}
        >
          {flash.message}
        </p>
      )}
    </div>
  );
}
