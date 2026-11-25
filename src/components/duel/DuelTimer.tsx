import { useEffect, useRef, useState } from "react";

export function DuelTimer({
  deadline,
  toLocal,
  label,
  durationMs,
}: {
  deadline: number | null;
  toLocal: (serverTime: number) => number;
  label?: string;
  /** Full length of this timer window, for the progress bar. */
  durationMs?: number;
}) {
  const [leftMs, setLeftMs] = useState(0);
  const durationRef = useRef(durationMs ?? 8000);

  useEffect(() => {
    if (durationMs && durationMs > 0) durationRef.current = durationMs;
  }, [durationMs]);

  useEffect(() => {
    if (deadline == null) {
      setLeftMs(0);
      return;
    }
    const tick = () => setLeftMs(Math.max(0, toLocal(deadline) - Date.now()));
    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [deadline, toLocal]);

  if (deadline == null) return null;

  const seconds = Math.ceil(leftMs / 1000);
  const urgent = leftMs <= 2000;
  const closing = Boolean(label?.toLowerCase().includes("chance"));
  const pct = Math.max(0, Math.min(100, (leftMs / durationRef.current) * 100));

  return (
    <div className="flex w-full flex-col gap-1.5" aria-live="polite">
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-caption ${closing || urgent ? "text-tone-wrong" : "text-mute"}`}>
          {label ?? "Timer"}
        </p>
        <p className={`tabular text-display-sm leading-none ${urgent ? "text-tone-wrong" : "text-ink"}`}>
          {seconds}
          <span className="text-caption text-mute">s</span>
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-hairline" role="progressbar" aria-valuenow={seconds} aria-valuemin={0} aria-valuemax={Math.ceil(durationRef.current / 1000)}>
        <div
          className={`h-full rounded-full transition-[width] duration-75 ease-linear ${
            urgent || closing ? "bg-tone-wrong" : "bg-ink"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
