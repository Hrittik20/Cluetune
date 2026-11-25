/**
 * Fun lines for the quick-match waiting screen. Never imply how many people
 * are online — that is intentional.
 */
export const WAITING_MESSAGES = [
  "Make this game famous and you won't have to wait this long.",
  "Your opponent is probably still humming the last song.",
  "Tell a friend. Seriously. We'll wait.",
  "Finding someone worthy of your ears…",
  "The queue is small but mighty.",
  "Warming up the vinyl. Don't go anywhere.",
  "Good taste takes a minute to match.",
  "Invite a friend and skip the wait entirely.",
  "Somewhere, someone else just hit Play. Almost.",
  "Patience is a genre. You're crushing it.",
  "The next challenger is buffering their courage.",
  "Share the link. Be the reason someone else is here.",
  "Still searching the airwaves…",
  "A duel without a rival is just karaoke. Hold tight.",
  "You're early to something good. That's a flex.",
  "One more chorus and we should have company.",
  "Opponents spawn when you least expect them.",
  "Meanwhile: name three songs that start with the letter you just thought of.",
] as const;

export function pickWaitingMessage(seed = Date.now()): string {
  return WAITING_MESSAGES[seed % WAITING_MESSAGES.length]!;
}
