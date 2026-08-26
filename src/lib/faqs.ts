/**
 * Homepage FAQ copy. Questions keep the phrasing people actually search
 * (Songless, guess-the-song, etc.) so the visible FAQ and the JSON-LD stay aligned.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQS: FaqItem[] = [
  {
    q: "How to play Songless",
    a: "Songless-style play on Cluetune is the Daily: press Play, listen to one second, and type the song title. You get six tries. Each miss or skip unlocks more of the clip (1s, 2s, 4s, 7s, 11s, 16s). No account is required — open cluetune.com and start.",
  },
  {
    q: "How to play Songless multiple times",
    a: "Finish the Daily, then open Unlimited. Unlimited is how you play Songless multiple times in a row: same guess-the-song ladder, no cooldown, no login. You can also use Sped-Up, Lyrics Guess, or Genre Gauntlet for more rounds.",
  },
  {
    q: "How to play Songless more than once",
    a: "The Daily is one shared clip per local day. To play Songless more than once, go to Unlimited — it queues the next round as soon as you finish. Filters let you stick to hip hop, a decade, or how well-known the track is.",
  },
  {
    q: "How to play Songless unlimited",
    a: "Open /unlimited on Cluetune. That is the Songless unlimited mode: endless rounds, live streak and accuracy, and genre/decade filters. It is free and works in the browser on your phone.",
  },
  {
    q: "Guess who song",
    a: "If you mean “guess who sang this song,” Cluetune scores a correct title as a win. Naming only the artist counts as close (the amber tile) — useful when you know the voice but not the track. Type the title to win.",
  },
  {
    q: "Game where you guess the song",
    a: "Cluetune is a game where you guess the song from a short clip. It is a free Heardle / Songless / Guessable-style guess song game: one second to start, six attempts, then Unlimited if you want to keep going.",
  },
  {
    q: "Can you guess this song",
    a: "Yes. Send someone a Cluetune challenge link after a round — it pins that exact clip. They open the page, guess the song, and see whether they beat your score. No app and no account on either side.",
  },
  {
    q: "Website where you guess the song",
    a: "Cluetune (cluetune.com) is a website where you guess the song in the browser. There is nothing to install. Daily, Unlimited, Sped-Up, Lyrics Guess and Genre Gauntlet all run on the same site.",
  },
  {
    q: "Guess what song",
    a: "That is the whole loop: guess what song is playing from one second of audio, or from a few lyric lines in Lyrics Guess. Type the title (artist optional). Typos and remaster suffixes are ignored.",
  },
  {
    q: "Is Cluetune like Songless or Guessable.gg?",
    a: "Yes. Cluetune is a guess song from 1 second game in the same family as Songless, Songless Unlimited, Songless Infinite, LessGames Songless and Guessable. You get a shared daily, then unlimited rounds with no account.",
  },
  {
    q: "Do I need an account to play?",
    a: "No. Every mode works the moment the page loads. Streaks and stats stay in this browser. Export them from the Stats page if you want a backup.",
  },
];

export function faqJsonLd(faqs: FaqItem[] = HOME_FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: `<p>${faq.a}</p>`,
      },
    })),
  };
}
