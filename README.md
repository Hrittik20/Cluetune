# Cluetune

A music-guessing game. You get one second of a song and six attempts; every wrong
guess buys you a little more audio. [cluetune.com](https://cluetune.com)

Built with [Astro](https://astro.build) 7, React islands, Tailwind CSS v4 and the
Vercel adapter.

## Quick start

```bash
npm install
npm run dev
```

The site runs with **no API keys**. Autocomplete and preview clips both fall back
to keyless public endpoints, so a fresh clone is immediately playable. Copy
`.env.example` to `.env` only when you want Spotify metadata or a YouTube embed
on the reveal screen.

| Script                  | What it does                                        |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Dev server on `localhost:4321`                       |
| `npm run build`         | Production build into `.vercel/output`               |
| `npm run preview`       | Serve the production build locally                   |
| `npm run check`         | `astro check` — types across `.astro`, `.ts`, `.tsx` |
| `npm run catalog:report`| Catalogue coverage per genre, decade and pack        |

## Game modes

| Mode | Route | Shape |
| --- | --- | --- |
| **Unlimited** | `/` | Continuous rounds, no cooldown, live session stats, genre/decade/difficulty filters. This is the landing page. |
| **Daily** | `/daily` | One clip for everyone, resets at *your* local midnight. Streaks persist. |
| **Sped-Up** | `/sped-up` | Same ladder at 1.35× playback rate. |
| **Lyric-Flip** | `/lyric-flip` | A scrambled, redacted hook shown alongside the clip. Each miss un-redacts more: word order, then vowels, then initials. |
| **Genre Gauntlet** | `/gauntlet/[pack]` | Five back-to-back rounds from one scene. Six packs. |
| **Challenge** | `/challenge/[code]` | A friend's exact round, replayed and scored against their result. No account. |

Every mode draws from one catalogue (`src/lib/catalog.ts`), so difficulty
calibration and coverage stay consistent.

### The clip ladder

`1s → 2s → 4s → 7s → 11s → 16s`, one rung per wrong guess or skip. Sped-Up uses a
shorter ladder because the audio is compressed in time.

## Architecture

### Where the logic lives

Game logic is **client-side**, deliberately. Guess matching, the clip ladder and
scoring all run in the browser so a round costs zero round-trips and works
without an account. The trade-off is that a determined player can read the answer
out of devtools — acceptable for a party game, and the same choice Wordle made.

The server exists only to hold API credentials and to talk to services that
refuse CORS:

- `src/pages/api/search.ts` — autocomplete, merging local catalogue hits with remote suggestions
- `src/pages/api/round.ts` — picks a track and resolves a playable clip URL

### Audio sourcing

This is the fiddliest part of the project, so it is worth stating plainly.

**Spotify does not provide audio.** `preview_url` was withdrawn from the Web API
on 2024-11-27 for every app registered after that date, and now returns `null`.
Any tutorial that tells you to build a Heardle clone on Spotify previews predates
that change. Spotify is used here purely for metadata: canonical titles, artist
spellings, album art.

Clips come from a fallback chain in `src/lib/providers/resolver.ts`:

```
Spotify        →  metadata, canonical naming, artwork   (optional, needs keys)
iTunes Search  →  30s preview MP3                       (keyless)
Deezer         →  30s preview MP3                       (keyless)
YouTube        →  full-track embed on the reveal only   (optional, needs a key)
```

Audio is streamed directly from the rights holder's own CDN. Cluetune never
downloads, caches, proxies or re-serves an audio file.

YouTube is **reveal-only** by default. Its IFrame Player terms require a visible,
unobscured player — which would show the answer during a round. There is an
`ALLOW_YOUTUBE_CLIP_FALLBACK` escape hatch, but flipping it is a legal decision
rather than a technical one; read the note in `src/lib/providers/youtube.ts`
first.

### Persistence

Everything is in `localStorage` under one `cluetune:*` key, written through
`src/lib/storage.ts`. There is no database and no login. Stats can be exported as
JSON from `/stats`, which is the migration path if accounts are added later.

Daily puzzles are seeded deterministically from the local date
(`src/lib/daily.ts`), so every player sees the same track without the server
knowing anything about them.

## Project layout

```
src/
├─ components/
│  ├─ game/              React islands — the entire interactive surface
│  │  ├─ GameShell.tsx      state machine and orchestrator for every mode
│  │  ├─ VinylPlayer.tsx    canvas record: spins, reacts to FFT, glitches on a miss
│  │  ├─ GuessInput.tsx     accessible combobox with debounced autocomplete
│  │  ├─ GuessRows.tsx      the attempt ladder; tile width tracks unlocked audio
│  │  ├─ RevealPanel.tsx    win/loss reveal, track info, challenge link
│  │  ├─ ShareCard.tsx      9:16 result card, rendered to canvas
│  │  └─ useAudioClip.ts    playback with hard clip boundaries + optional FFT
│  ├─ MeshGradient.astro  the brand's only decorative system
│  └─ Nav / Footer / ModeCard
├─ lib/
│  ├─ catalog.ts         the track pool + genre packs
│  ├─ game.ts            ladder, scoring, tile patterns, session stats
│  ├─ matching.ts        fuzzy guess matching (typos, features, remaster suffixes)
│  ├─ daily.ts           deterministic daily seeding, local-midnight reset
│  ├─ share.ts           challenge link encode/decode, share text
│  ├─ lyricflip.ts       progressive redaction for Lyric-Flip
│  ├─ storage.ts         localStorage schema and migrations
│  └─ providers/         Spotify, iTunes, Deezer, YouTube + the resolver
├─ pages/                one file per mode, plus the API routes
└─ styles/
   ├─ theme.css          design tokens (@theme)
   ├─ base.css           element defaults
   ├─ components.css     btn / card / badge / field
   └─ utilities.css      page-shell, eyebrow, hairlines
```

## Design system

Dark by default, with a light theme available from the nav. The palette,
typography and spacing follow `DESIGN.md`, adapted for a dark-first game rather
than a documentation site.

Tokens live in `src/styles/theme.css` as Tailwind v4 `@theme` variables. Change a
value there and it propagates to utilities, components and the canvas renderers
alike — the vinyl player and the share card both read their colours from the same
custom properties rather than hard-coding hex values.

The mesh gradient is treated as a single object: never cropped to one stop, never
shrunk to an icon, only ever used at band scale.

## Guess matching

`src/lib/matching.ts` is intentionally generous. It accepts:

- Title only. Naming the artist is never required.
- `artist - title` in either order.
- Typos, via edit distance scaled to the length of the answer.
- Noise that streaming services attach: `(Remastered 2011)`, `- Radio Edit`, `feat. …`.

A guess that names the right artist but the wrong song returns a distinct
`close` verdict, which is what the amber tile means.

## Accessibility

- Full keyboard path through the combobox (`aria-activedescendant`, arrow keys, escape).
- `prefers-reduced-motion` disables the mesh drift, the vinyl spin and the glitch.
- Lyric-Flip redaction uses real character substitution, not a CSS blur, so it
  survives a screen reader.
- Live regions announce verdicts and round transitions.
- The share card is an image with a full text alternative describing the result.

## Deployment

Configured for Vercel via `@astrojs/vercel`. Marketing and rules pages prerender;
the API routes and `/challenge/[code]` run on the server.

```bash
npm run build   # → .vercel/output
```

Set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `YOUTUBE_API_KEY` in the
Vercel dashboard if you want them. The build does not require them.

## Adding tracks

Append to `CATALOG` in `src/lib/catalog.ts` and run:

```bash
npm run catalog:report
```

It fails if two tracks share an id, and warns when a Gauntlet pack has fewer than
ten tracks — below that, a five-round run starts repeating itself.

Entries carry metadata only. No file paths, no CDN URLs; playable audio is
resolved at request time. That is what makes it possible to swap this array for
an editorial database later without touching game code.
