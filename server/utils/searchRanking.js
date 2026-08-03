/**
 * Search ranking primitives for IFCT/INDB.
 *
 * Boosts:
 *  - exact / prefix / word-start matches
 *  - typo tolerance via Levenshtein (up to distance 2 gets partial credit)
 *  - "Indian cooked dish" keywords (curry, dal, biryani, chapatti, ...)
 *  - preferred short/simple names
 * Penalties:
 *  - IFCT "raw" entries when a cooked match is available (handled by caller)
 */

const COOKED_TOKENS = new Set([
  "curry",
  "masala",
  "biryani",
  "pulao",
  "korma",
  "kadhai",
  "handi",
  "tandoori",
  "grilled",
  "roasted",
  "fried",
  "chapatti",
  "chapati",
  "roti",
  "dosa",
  "idli",
  "sambar",
  "rasam",
  "dal",
  "dhokla",
  "poha",
  "upma",
  "khichdi",
  "rajma",
  "chole",
  "paneer",
  "bhurji",
  "thali",
]);

const STOPWORDS = new Set(["with", "and", "the", "in", "of", "raw", "cooked"]);

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s) {
  return normalize(s).split(" ").filter((t) => t && !STOPWORDS.has(t));
}

/** Levenshtein distance (iterative, O(m*n)) — small strings only. */
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

/**
 * Score a candidate name against the query. Higher is better.
 * @param {string} query   raw user query
 * @param {string} name    candidate food name
 * @param {object} [opts]  { source: "IFCT" | "INDB" }
 */
function scoreName(query, name, opts = {}) {
  const q = normalize(query);
  const n = normalize(name);
  if (!q || !n) return 0;

  let matchScore = 0;

  if (n === q) matchScore += 200;
  if (n.startsWith(q)) matchScore += 60;
  if (n.includes(` ${q}`) || n.startsWith(`${q} `)) matchScore += 30;
  else if (n.includes(q)) matchScore += 15;

  const qTokens = q.split(" ").filter(Boolean);
  const nTokens = n.split(" ").filter(Boolean);
  const nTokenSet = new Set(nTokens);

  let strongTokenHits = 0;
  let matchedTokens = 0;
  const meaningful = qTokens.filter((t) => t.length >= 2);
  for (const qt of meaningful) {
    let hit = false;
    if (nTokenSet.has(qt)) {
      matchScore += 25;
      strongTokenHits += 1;
      hit = true;
    } else {
      let best = 0;
      for (const nt of nTokens) {
        if (!nt) continue;
        if (nt.startsWith(qt) || qt.startsWith(nt)) {
          best = Math.max(best, 18);
          continue;
        }
        const d = levenshtein(qt, nt);
        const maxLen = Math.max(qt.length, nt.length);
        // Only reward tight fuzzy — no ratio-based mush.
        if (d === 1 && maxLen >= 4) best = Math.max(best, 14);
        else if (d === 2 && maxLen >= 6) best = Math.max(best, 8);
      }
      matchScore += best;
      if (best >= 14) strongTokenHits += 1;
      if (best > 0) hit = true;
    }
    if (hit) matchedTokens += 1;
  }

  // Bail out early if nothing in the query actually matched the candidate.
  if (matchScore <= 0) return 0;

  // Multi-token coverage: for queries with 2+ meaningful tokens, penalise
  // candidates that only match some of them. Full coverage gets a bonus.
  if (meaningful.length >= 2) {
    const coverage = matchedTokens / meaningful.length;
    if (coverage < 1) {
      // e.g. "chana masala" against a name containing only "masala"
      matchScore = Math.round(matchScore * (0.35 + 0.65 * coverage));
    } else {
      matchScore += 20;
    }
  }

  let score = matchScore;

  // Indian cooked-dish keyword bonus (only when we already have a real match)
  for (const t of nTokens) {
    if (COOKED_TOKENS.has(t)) {
      score += 6;
      break;
    }
  }

  if (n.length < 40) score += 2;
  if (n.length > 80) score -= 4;

  const looksCooked = qTokens.some((t) => COOKED_TOKENS.has(t));
  if (looksCooked && opts.source === "INDB") score += 3;
  if (!looksCooked && opts.source === "IFCT") score += 1;

  return score;
}

/**
 * Return top N candidates from an array of { name, item, source } after
 * scoring. `getName` extracts the display string from an item.
 */
function rankCandidates(query, items, { source, getName, limit = 12, minScore = 6 }) {
  const scored = [];
  for (const it of items) {
    const name = getName(it);
    if (!name) continue;
    const s = scoreName(query, name, { source });
    if (s < minScore) continue;
    scored.push({ item: it, name, score: s, source });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

module.exports = { levenshtein, scoreName, rankCandidates, normalize };
