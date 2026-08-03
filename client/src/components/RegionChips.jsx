/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import {
  getRegionsForFamily,
  getMatchingVariants,
  customizeStateFromVariant,
  getRegion,
} from "../data/regionalVariants";

/**
 * Region chips for staple searches (roti / rice / dal / breakfast).
 * Selecting a region auto-applies portion + fat presets.
 */
export default function RegionChips({
  query = "",
  foodName = "",
  selectedRegionId = "all",
  selectedVariantId = null,
  onSelectRegion,
  onSelectVariant,
}) {
  const { family, variants: allFamilyVariants } = getMatchingVariants(
    query,
    foodName,
    "all"
  );

  if (!family) return null;

  const regions = getRegionsForFamily(family.id);
  const { variants } = getMatchingVariants(query, foodName, selectedRegionId);
  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  return (
    <div className="mx-auto w-full max-w-md space-y-2.5">
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-200/85">
            Regional style
          </p>
          <p className="text-[11px] text-white/50">{family.blurb}</p>
        </div>
        <Link
          to={`/compare/${family.id}`}
          className="fa-chip-chunky shrink-0 !px-2.5 !py-1 text-[10px] text-white/70"
        >
          Compare
        </Link>
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar"
        role="listbox"
        aria-label="Choose region"
      >
        {regions.map((region) => (
          <button
            key={region.id}
            type="button"
            role="option"
            aria-selected={selectedRegionId === region.id}
            onClick={() => {
              onSelectRegion?.(region.id);
              if (region.id === "all") {
                onSelectVariant?.(null);
                return;
              }
              const match = allFamilyVariants.find((v) => v.regionId === region.id);
              if (match) {
                onSelectVariant?.(match.id, customizeStateFromVariant(match));
              }
            }}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              selectedRegionId === region.id
                ? "border-saffron-400/55 bg-saffron-500/20 text-saffron-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_0_rgba(0,0,0,0.3)]"
                : "border-white/12 bg-white/[0.04] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/25 hover:text-white/80"
            }`}
          >
            {region.short || region.label}
          </button>
        ))}
      </div>

      {selectedRegionId !== "all" && variants.length > 0 && (
        <div className="space-y-1.5">
          {variants.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() =>
                    onSelectVariant?.(v.id, customizeStateFromVariant(v))
                  }
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeVariant?.id === v.id
                      ? "border-mint-400/45 bg-mint-500/15 text-mint-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "border-white/10 text-white/50 hover:text-white/75"
                  }`}
                >
                  {v.localName}
                </button>
              ))}
            </div>
          )}
          {activeVariant && (
            <div className="fa-sticker fa-sticker-leaf relative px-3 py-2.5">
              <p className="relative text-xs font-bold text-white">
                {activeVariant.localName}
                <span className="ml-1.5 font-normal text-white/45">
                  · {getRegion(activeVariant.regionId)?.label}
                </span>
              </p>
              <p className="relative mt-1 text-[11px] leading-relaxed text-white/55">
                {activeVariant.cookingNote}
              </p>
              <p className="relative mt-1.5 text-[10px] text-white/40">
                Preset: {activeVariant.portionGrams} g
                {activeVariant.fatId !== "none"
                  ? ` + ${activeVariant.fatId} (${activeVariant.fatAmountId})`
                  : " · no extra fat"}
                {" · "}
                typical household estimate — adjust below
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
