import { useCallback, useEffect, useRef, useState } from "react";
import { shareOrCopy } from "../../lib/share";
import { CARD_HEIGHT, CARD_WIDTH, renderShareCard, type ShareCardOptions } from "./renderShareCard";

export interface ShareCardProps {
  options: ShareCardOptions;
  /** Plain-text fallback for platforms without file sharing. */
  shareText: string;
  shareUrl: string;
}

type Status = "idle" | "shared" | "copied" | "downloaded" | "failed";

const STATUS_MESSAGE: Record<Exclude<Status, "idle">, string> = {
  shared: "Shared.",
  copied: "Result copied to your clipboard.",
  downloaded: "Card saved to your downloads.",
  failed: "Sharing didn’t work. Try downloading the card instead.",
};

/**
 * Preview and export for the vertical result card.
 *
 * The rendered PNG is what gets shared, not a link preview — a 9:16 image
 * drops straight into a Story or a TikTok upload, which is where this format
 * actually travels. Text sharing stays as the fallback for platforms that
 * refuse files.
 */
export function ShareCard({ options, shareText, shareUrl }: ShareCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    void renderShareCard(options).then((blob) => {
      if (cancelled || !blob) return;
      blobRef.current = blob;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [options]);

  const handleShare = useCallback(async () => {
    setBusy(true);
    setStatus("idle");

    const blob = blobRef.current;
    const files = blob
      ? [new File([blob], "cluetune-result.png", { type: "image/png" })]
      : undefined;

    const result = await shareOrCopy({
      title: "Cluetune",
      text: shareText,
      url: shareUrl,
      files,
    });

    setStatus(result === "failed" ? "failed" : result);
    setBusy(false);
  }, [shareText, shareUrl]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = "cluetune-result.png";
    link.click();
    setStatus("downloaded");
  }, [previewUrl]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="overflow-hidden rounded-xl bg-canvas-soft-2 shadow-level-3"
        style={{ width: "min(216px, 100%)", aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Your Cluetune result card, formatted for Stories and Reels"
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-caption text-mute">
            Rendering card…
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <button type="button" className="btn btn-primary btn-md" onClick={handleShare} disabled={busy}>
          {busy ? "Sharing…" : "Share Result"}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-md"
          onClick={handleDownload}
          disabled={!previewUrl}
        >
          Save 9:16 Card
        </button>
      </div>

      <p aria-live="polite" className="min-h-4 text-caption text-mute">
        {status === "idle" ? "" : STATUS_MESSAGE[status]}
      </p>
    </div>
  );
}
