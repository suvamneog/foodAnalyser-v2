/* eslint-disable react/prop-types */
import {
  COOKING_FATS,
  PORTION_PRESETS,
  FAT_AMOUNT_PRESETS,
  computeCustomNutrition,
} from "../utils/portionCustomize";

/**
 * Compact Indian plate customizer: portion + cooking fat type/amount.
 */
export default function PortionCustomizer({
  food,
  state,
  onChange,
  compact = false,
}) {
  const nutrition = computeCustomNutrition(food, state);
  const showFatAmount = state.fatId !== "none";

  const set = (patch) => onChange({ ...state, ...patch });

  return (
    <div
      className={`fa-sticker relative ${
        compact ? "p-3" : "p-3.5"
      }`}
    >
      <button
        type="button"
        onClick={() => set({ open: !state.open })}
        className="relative flex w-full items-center justify-between gap-2 text-left"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saffron-200/90">
            Customise your plate
          </p>
          <p className="mt-0.5 text-[11px] text-white/50">
            Portion + oil/ghee — calories update for your household
          </p>
        </div>
        <span className="fa-chip-chunky !px-2.5 !py-1 text-[10px] text-white/70">
          {state.open ? "Hide" : "Edit"}
        </span>
      </button>

      {!state.open && (
        <div className="relative mt-2.5 space-y-1 text-[11px] text-white/55">
          <p>
            Portion: <span className="font-semibold text-white/85">{nutrition.portionGrams} g</span>
            {nutrition.oilLabel && (
              <>
                {" · "}
                <span className="font-semibold text-white/85">{nutrition.oilLabel}</span>
                <span className="text-amber-300/80"> (+{Math.round(nutrition.oilCalories)} kcal)</span>
              </>
            )}
          </p>
          <p className="text-white/80">
            Plate total:{" "}
            <strong className="fa-num text-base text-white">
              {Math.round(nutrition.calories)} kcal
            </strong>
          </p>
        </div>
      )}

      {state.open && (
        <div className="relative mt-3 space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">
              Portion size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PORTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    set({
                      portionPresetId: preset.id,
                      customGrams:
                        preset.grams === "custom" || preset.grams == null
                          ? state.customGrams || nutrition.baseServing
                          : preset.grams,
                    })
                  }
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    state.portionPresetId === preset.id
                      ? "border-saffron-400/55 bg-saffron-500/20 text-saffron-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_0_rgba(0,0,0,0.25)]"
                      : "border-white/10 bg-black/25 text-white/55 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {(state.portionPresetId === "custom" ||
              state.portionPresetId === "db") && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={2000}
                  value={
                    state.portionPresetId === "db"
                      ? nutrition.baseServing
                      : state.customGrams
                  }
                  disabled={state.portionPresetId === "db"}
                  onChange={(e) =>
                    set({
                      portionPresetId: "custom",
                      customGrams: e.target.value,
                    })
                  }
                  className="fa-input w-24 !py-1.5"
                />
                <span className="text-xs text-white/40">grams edible</span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/50">
              Cooking fat used for this serving
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COOKING_FATS.map((fat) => (
                <button
                  key={fat.id}
                  type="button"
                  onClick={() =>
                    set({
                      fatId: fat.id,
                      fatAmountId: fat.id === "none" ? "0" : state.fatAmountId === "0" ? "1" : state.fatAmountId,
                    })
                  }
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                    state.fatId === fat.id
                      ? "border-ember-400/50 bg-ember-500/15 text-ember-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_rgba(0,0,0,0.25)]"
                      : "border-white/10 bg-black/25 text-white/55 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {fat.label}
                </button>
              ))}
            </div>
          </div>

          {showFatAmount && (
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/50">
                How much fat for this plate?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FAT_AMOUNT_PRESETS.filter((a) => a.tsp > 0).map((amount) => (
                  <button
                    key={amount.id}
                    type="button"
                    onClick={() => set({ fatAmountId: amount.id })}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      state.fatAmountId === amount.id
                        ? "border-mint-400/45 bg-mint-500/15 text-mint-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_0_rgba(0,0,0,0.25)]"
                        : "border-white/10 bg-black/25 text-white/55 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-white/35">
                {getCookingFatNote(state.fatId)}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[11px] leading-relaxed text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex justify-between gap-2">
              <span>Food ({nutrition.portionGrams} g)</span>
              <span className="font-semibold text-white/85">{Math.round(nutrition.foodCalories)} kcal</span>
            </div>
            <div className="mt-1 flex justify-between gap-2">
              <span>Added fat</span>
              <span className="font-semibold text-amber-200/90">
                +{Math.round(nutrition.oilCalories)} kcal
              </span>
            </div>
            <div className="mt-1.5 flex justify-between gap-2 border-t border-white/10 pt-1.5">
              <span className="font-semibold text-white">Your plate</span>
              <span className="fa-num text-base text-white">
                {Math.round(nutrition.calories)} kcal
              </span>
            </div>
            <p className="mt-2 text-[10px] text-white/35">{nutrition.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function getCookingFatNote(fatId) {
  const fat = COOKING_FATS.find((f) => f.id === fatId);
  return fat?.note || "";
}

export { computeCustomNutrition };
