import pins from "./itunes-pins.json";

export interface ItunesPin {
  itunesId: number;
  previewUrl: string;
  artworkUrl?: string;
  durationMs?: number;
}

/** Server-only: written by scripts/fetch-itunes-ids.mts. Keep out of client bundles. */
const PINS: Record<string, ItunesPin | undefined> = pins;

export function itunesPin(trackId: string): ItunesPin | undefined {
  return PINS[trackId];
}
