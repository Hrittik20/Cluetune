import { TIER_LABELS, type DifficultyTier, type Standing } from "../../lib/difficulty";

const STICKER_TONE: Record<DifficultyTier, { face: string; caption: string }> = {
  easy: { face: "bg-cyan text-[#04241c]", caption: "text-[#04241c]/70" },
  medium: { face: "bg-amber text-[#2b2000]", caption: "text-[#2b2000]/70" },
  hard: { face: "bg-coral text-white", caption: "text-white/80" },
  expert: { face: "bg-pink text-white", caption: "text-white/80" },
  impossible: { face: "bg-violet text-white", caption: "text-white/80" },
};

const INK_TONE: Record<DifficultyTier, string> = {
  easy: "var(--color-cyan)",
  medium: "var(--color-amber)",
  hard: "var(--color-coral)",
  expert: "var(--color-pink)",
  impossible: "var(--color-violet)",
};

/**
 * Die-cut record-shop sticker on the disc's top-right edge. The tilt lives on
 * the outer box and is never animated, so text rasterises at its final angle.
 */
export function DifficultySticker({ tier }: { tier: DifficultyTier }) {
  const tone = STICKER_TONE[tier];

  return (
    <div
      className="absolute -right-7 top-3 z-10 rotate-6 sm:-right-10 sm:top-4"
      title="Based on how quickly other players guessed it"
    >
      <div className="animate-stamp rounded-lg bg-white p-[2px] shadow-[0_8px_18px_-6px_rgba(0,0,0,0.7),0_2px_4px_rgba(0,0,0,0.35)] sm:rounded-[0.6rem] sm:p-[3px]">
        <div className={`relative overflow-hidden rounded-[0.375rem] px-2 py-1 text-center sm:rounded-[0.45rem] sm:px-3.5 sm:py-2 ${tone.face}`}>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/30 to-transparent"
          />
          <span
            className={`relative block text-[0.5rem] font-semibold uppercase leading-none tracking-[0.1em] sm:text-[0.625rem] ${tone.caption}`}
          >
            Difficulty
          </span>
          <span className="relative mt-0.5 block text-[0.8125rem] font-bold uppercase leading-none tracking-[0.01em] sm:mt-1 sm:text-[1.125rem]">
            {TIER_LABELS[tier]}
          </span>
        </div>
      </div>
    </div>
  );
}

/** How this result compares to everyone else's, scrawled across the record in silver marker. */
export function CrowdNote({ standing, tier }: { standing: Standing; tier: DifficultyTier }) {
  const { percent } = standing;
  const [headline, aside, sentence] =
    standing.kind === "beat"
      ? [`beat ${percent}%`, "of players!", `You beat ${percent}% of players.`]
      : percent < 50
        ? [`only ${percent}%`, "got this one", `Only ${percent}% of players got this one.`]
        : [`${percent}% got it`, "get the next one!", `${percent}% of players got this one.`];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[64%] flex justify-center">
      <p className="sr-only" role="status">
        {sentence}
      </p>
      <div
        aria-hidden="true"
        className="flex -rotate-6 animate-scrawl flex-col items-center font-marker leading-none text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
      >
        <span className="whitespace-nowrap text-[1.15rem] sm:text-[1.8rem]">{headline}</span>
        <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="-mt-0.5 h-1.5 w-[110%] sm:h-2">
          <path
            d="M2 5.5 C 25 2, 55 7, 98 3"
            fill="none"
            stroke={INK_TONE[tier]}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="mt-0.5 whitespace-nowrap text-[0.7rem] text-white/80 sm:text-[0.95rem]">{aside}</span>
      </div>
    </div>
  );
}
