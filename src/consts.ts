export const SITE = {
  name: "Cluetune",
  domain: "cluetune.com",
  url: "https://cluetune.com",
  tagline: "Name the track before the clip runs out.",
  description:
    "A music guessing game with no daily limit. Hear a one-second clip, name the song, and keep playing as long as you like — no account, no cooldown.",
  themeColor: "#08080a",
} as const;

export interface NavItem {
  href: string;
  label: string;
  /** Shown as a small marker in the nav. */
  tag?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Unlimited" },
  { href: "/daily", label: "Daily" },
  { href: "/sped-up", label: "Sped-Up" },
  { href: "/lyric-flip", label: "Lyric-Flip" },
  { href: "/gauntlet", label: "Gauntlet" },
];
