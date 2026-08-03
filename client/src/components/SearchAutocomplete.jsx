/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Search as SearchIcon, Clock, TrendingUp, Loader2, X } from "lucide-react";
import { fetchSuggest } from "../utils/searchSuggest";
import { loadRecentSearches, pushRecentSearch, clearRecentSearches } from "../utils/recentSearches";
import { POPULAR_SEARCHES } from "../data/discoveryData";

/**
 * User-friendly search input with:
 *  - Live suggestions from /api/food/suggest (typo-tolerant, IFCT + INDB)
 *  - Recent searches (localStorage) shown when empty
 *  - Popular Indian searches as a starter
 *  - Full keyboard nav (↑ ↓ Enter Esc)
 *  - Source pill (IFCT / INDB) on each suggestion
 *
 * Props:
 *  - value: string
 *  - onChange(next)
 *  - onSubmit(term)               // called when user picks/enters a term
 *  - placeholder
 *  - autoFocus
 *  - inputId
 *  - compact  (smaller styling)
 *  - hideSubmitButton
 */
export default function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = "Search a dish — dal, dosa, chicken curry, roti…",
  autoFocus = false,
  inputId = "fa-search",
  compact = false,
  hideSubmitButton = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recent, setRecent] = useState(() => loadRecentSearches());

  const wrapRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const trimmed = (value || "").trim();

  const groups = useMemo(() => {
    if (trimmed.length >= 2) {
      return [{ kind: "suggest", label: "Suggestions", entries: items.map((it) => ({ term: it.displayName || it.name, meta: it })) }];
    }
    const g = [];
    if (recent.length) g.push({ kind: "recent", label: "Recent", entries: recent.map((r) => ({ term: r })) });
    g.push({ kind: "popular", label: "Popular in India", entries: POPULAR_SEARCHES.map((p) => ({ term: p })) });
    return g;
  }, [items, recent, trimmed]);

  const flat = useMemo(() => groups.flatMap((g) => g.entries.map((e) => ({ ...e, groupKind: g.kind }))), [groups]);

  useEffect(() => {
    if (trimmed.length < 2) {
      setItems([]);
      setLoading(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      const { items: next, canceled } = await fetchSuggest(trimmed, { signal: ctrl.signal });
      if (canceled) return;
      setItems(next);
      setLoading(false);
    }, 140);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmed]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    setActiveIdx(-1);
  }, [items, trimmed, open]);

  const commit = useCallback(
    (term) => {
      if (!term) return;
      const q = String(term).trim();
      if (!q) return;
      setRecent(pushRecentSearch(q));
      setOpen(false);
      onChange?.(q);
      onSubmit?.(q);
    },
    [onChange, onSubmit]
  );

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      if (open && activeIdx >= 0 && flat[activeIdx]) {
        e.preventDefault();
        commit(flat[activeIdx].term);
      } else if (trimmed) {
        e.preventDefault();
        commit(trimmed);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const highlight = (name) => {
    if (!trimmed) return name;
    const idx = name.toLowerCase().indexOf(trimmed.toLowerCase());
    if (idx < 0) return name;
    return (
      <>
        {name.slice(0, idx)}
        <span className="font-semibold text-saffron-300">{name.slice(idx, idx + trimmed.length)}</span>
        {name.slice(idx + trimmed.length)}
      </>
    );
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.03] px-3 ${
          compact ? "py-2" : "py-2.5"
        } focus-within:border-saffron-400/60 focus-within:bg-white/[0.05] transition`}
      >
        <SearchIcon className="h-4 w-4 shrink-0 text-white/50" />
        <input
          id={inputId}
          type="text"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange?.(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`min-w-0 flex-1 bg-transparent text-white placeholder:text-white/35 outline-none ${
            compact ? "text-sm" : "text-[15px]"
          }`}
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
        {!!value && !loading && (
          <button
            type="button"
            onClick={() => {
              onChange?.("");
              setItems([]);
            }}
            className="rounded-full p-1 text-white/40 hover:bg-white/8 hover:text-white/80"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {!hideSubmitButton && (
          <button
            type="button"
            onClick={() => commit(trimmed)}
            disabled={!trimmed}
            className="ml-1 rounded-xl bg-saffron-500 px-3 py-1.5 text-xs font-semibold text-ink-950 disabled:opacity-40"
          >
            Search
          </button>
        )}
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[380px] overflow-auto rounded-2xl border border-white/10 bg-ink-950/95 shadow-2xl shadow-black/40 backdrop-blur"
        >
          {trimmed.length >= 2 && !loading && items.length === 0 && (
            <div className="px-4 py-4 text-center text-xs text-white/45">
              No matches for “{trimmed}”. Try Hindi/regional name, or check spelling.
            </div>
          )}

          {groups.map((g) => {
            if (g.entries.length === 0) return null;
            let flatOffset = 0;
            for (const grp of groups) {
              if (grp === g) break;
              flatOffset += grp.entries.length;
            }
            return (
              <div key={g.kind}>
                <div className="flex items-center justify-between border-b border-white/6 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  <span className="inline-flex items-center gap-1.5">
                    {g.kind === "recent" ? (
                      <Clock className="h-3 w-3" />
                    ) : g.kind === "popular" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <SearchIcon className="h-3 w-3" />
                    )}
                    {g.label}
                  </span>
                  {g.kind === "recent" && (
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="text-[10px] normal-case tracking-normal text-white/40 hover:text-white/75"
                    >
                      clear
                    </button>
                  )}
                </div>
                <ul className="py-1">
                  {g.entries.map((e, i) => {
                    const idx = flatOffset + i;
                    const active = idx === activeIdx;
                    return (
                      <li key={`${g.kind}-${e.term}-${i}`}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => commit(e.term)}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition ${
                            active ? "bg-saffron-500/12 text-white" : "text-white/85 hover:bg-white/5"
                          }`}
                        >
                          <span className="min-w-0 truncate">
                            {g.kind === "suggest" ? highlight(e.term) : e.term}
                          </span>
                          {e.meta?.sourceShort && (
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                                e.meta.sourceShort === "IFCT"
                                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                                  : "border-sky-400/30 bg-sky-500/10 text-sky-100"
                              }`}
                            >
                              {e.meta.sourceShort}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div className="border-t border-white/6 px-4 py-2 text-[10px] text-white/35">
            Tip: try Hindi/regional names — <span className="text-white/60">rajma, kadhi, moong dal, aloo paratha</span>. ↑↓ to navigate · Enter to search.
          </div>
        </div>
      )}
    </div>
  );
}
