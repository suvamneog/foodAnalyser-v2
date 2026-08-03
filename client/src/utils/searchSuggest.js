import axios from "axios";
import { API_ENDPOINTS } from "./apiConfig";

/**
 * Fetch fast autocomplete suggestions.
 * Returns { items: [{ name, displayName, source, sourceShort }] }
 */
export async function fetchSuggest(query, { signal } = {}) {
  const q = String(query || "").trim();
  if (q.length < 2) return { items: [] };
  const url = `${API_ENDPOINTS.FOOD_SUGGEST}?q=${encodeURIComponent(q)}&limit=8`;
  try {
    const { data } = await axios.get(url, { signal, timeout: 4000 });
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      query: q,
    };
  } catch (err) {
    if (axios.isCancel?.(err) || err?.name === "CanceledError") {
      return { items: [], canceled: true };
    }
    return { items: [], error: err?.message || "suggest failed" };
  }
}
