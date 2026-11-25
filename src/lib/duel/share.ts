import { SITE_URL } from "../share";
import type { DuelSnapshot, MatchResult, Seat } from "./protocol";
import { renderShareCard, type ShareCardOptions } from "../../components/game/renderShareCard";

export function duelRoomUrl(code: string, origin = SITE_URL): string {
  return `${origin}/duel/r/${code}`;
}

export function duelMatchUrl(roomId: string, origin = SITE_URL): string {
  return `${origin}/duel/m/${roomId}`;
}

export function buildDuelShareText(snapshot: DuelSnapshot, inviteUrl?: string): string {
  const result = snapshot.result;
  if (!result) return `Cluetune Duel\n${inviteUrl ?? SITE_URL}`;

  const you = snapshot.you;
  const them = you === 0 ? 1 : 0;
  const yourName = snapshot.players[you]?.name ?? "You";
  const theirName = snapshot.players[them]?.name ?? "Rival";
  const line = resultLine(result, you, yourName, theirName);

  return [`Cluetune Duel · ${line}`, `${result.scores[you]}–${result.scores[them]}`, inviteUrl ?? SITE_URL].join("\n");
}

function resultLine(result: MatchResult, you: Seat, yourName: string, theirName: string): string {
  if (result.reason === "cancelled") return "Match cancelled";
  if (result.reason === "forfeit") return result.winner === you ? `${theirName} left` : "You left";
  if (result.winner === null) return "Draw";
  return result.winner === you ? `${yourName} beat ${theirName}` : `${theirName} beat ${yourName}`;
}

export async function renderDuelShareCard(snapshot: DuelSnapshot): Promise<Blob | null> {
  const result = snapshot.result;
  if (!result) return null;

  const you = snapshot.you;
  const them = you === 0 ? 1 : 0;
  const last = snapshot.history.at(-1);
  const track = last?.track;

  const options: ShareCardOptions = {
    headline: "Cluetune Duel",
    result: `${result.scores[you]}–${result.scores[them]}`,
    title: track?.title ?? "Duel",
    artist: track?.artist ?? resultLine(result, you, "You", "Rival"),
    artworkUrl: track?.artworkUrl,
    verdicts: snapshot.yourTiles.map((tile) => (tile.verdict === "timeout" ? "skip" : tile.verdict)),
    seconds: 0,
    waveform: [],
    won: result.winner === you,
    footer: "cluetune.com/duel",
    seed: snapshot.roomId,
  };

  return renderShareCard(options);
}
