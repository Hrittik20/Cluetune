export const SITE = {
  name: "Cluetune",
  domain: "cluetune.com",
  url: "https://cluetune.com",
  tagline: "Guess the song from 1 second.",
  description:
    "Cluetune is a free guess song game. Name the track from 1 second — a Songless and Guessable-style daily, then unlimited rounds with no account.",
  themeColor: "#08080a",
  ogImage: "/og.png",
  email: "hello@cluetune.com",
  gaId: "G-2YMYW2SK8X",
  keywords: [
    "Cluetune",
    "songless",
    "songless unlimited",
    "songless game",
    "songless infinite",
    "lessgames songless",
    "unlimited songless",
    "songless unlimited hip hop",
    "guessable",
    "guessable.gg",
    "guess song",
    "guess song from 1 second",
    "guess song game",
  ],
} as const;

export interface NavItem {
  href: string;
  label: string;
  /** Shown as a small marker in the nav. */
  tag?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Daily" },
  { href: "/unlimited", label: "Unlimited" },
  { href: "/sped-up", label: "Sped-Up" },
  { href: "/lyrics", label: "Lyrics" },
  { href: "/gauntlet", label: "Gauntlet" },
];
