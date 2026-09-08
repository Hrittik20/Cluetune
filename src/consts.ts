export const SITE = {
  name: "Cluetune",
  domain: "cluetune.com",
  url: "https://cluetune.com",
  tagline: "Guess the song from 1 second.",
  description:
    "Cluetune is a free song guess game. Name the track from 1 second — a Songless and Guessable-style daily, then unlimited rounds with no account.",
  themeColor: "#08080a",
  ogImage: "/og.png",
  email: "hello@cluetune.com",
  gaId: "G-L34VGBLWGK",
  keywords: [
    "Cluetune",
    // Core game phrases
    "song guess game",
    "song guessing game",
    "song guessing game online",
    "guess the song game",
    "guess song game",
    "guess song from 1 second",
    "guess the song from 1 second",
    "music guessing game",
    "music quiz game",
    // Songless cluster
    "songless",
    "songless unlimited",
    "songless game",
    "songless infinite",
    "lessgames songless",
    "unlimited songless",
    "songless unlimited hip hop",
    // Guessable cluster
    "guessable",
    "guessable.gg",
    // Heardle / genre cluster
    "heardle",
    "heardle unlimited",
    "music heardle",
    "song heardle",
    // Generic
    "name that tune",
    "name that tune game online",
    "guess the song",
    "guess the music",
    "identify the song",
    "what song is this",
    // Drunk / high mode
    "drunk mode",
    "high mode",
    "guess drunk songs",
    "guess high songs",
    "drunk song guess",
    "high song quiz",
    "guess the song drunk",
    "guess the song high",
    "wasted song game",
    "drunk music quiz",
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
  { href: "/drunk", label: "Drunk" },
  { href: "/lyrics", label: "Lyrics" },
  { href: "/gauntlet", label: "Gauntlet" },
];
