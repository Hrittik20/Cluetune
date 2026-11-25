# Cluetune Duel — plan and task board

Single source of truth for the Duel mode. Every model working on a Duel task
reads this file first. If a task needs a rule changed, stop and ask; do not
silently diverge from the spec below.

## Spec (agreed)

### Match

- 1v1, real time, **best of 3 songs**. Tie after 3 → **sudden death**: one
  more song on the normal ladder, and the first correct guess ends it and wins
  the match (no closing window). Nobody correct after six steps → draw.
- Each song is drawn at random from the mixed pool (no genre draft for now;
  a pick/ban "Draft mode" is backlog).
- No account. Identity is the existing anonymous `playerId` from
  `src/lib/storage.ts` plus an optional nickname (16 chars, filtered).

### A round (one song)

- Six **steps** following the existing ladder `1s → 2s → 4s → 7s → 11s → 16s`
  (`CLIP_LADDER_MS` in `src/lib/game.ts`).
- Each step has a visible timer (start at **8s**, tunable server constant).
- On each step **each player gets exactly one action: a guess or a skip**.
  After acting, their input locks until the next step.
- **If both players have acted before the timer ends, advance to the next
  step immediately.**
- When a player is **correct**: the opponent may still use their action on the
  current step (the step timer shrinks to at most 5s); if already used, they
  get **one final guess on the next step with a 5s countdown**. Then the round
  ends.
- Round ends when both are correct, both are out of actions, or step 6 ends.
  Then a short reveal (art, title, both players' steps/times), then next song.
- Opponent's actions are shown as **tiles only** (green / amber / red / skip),
  never the guessed text.

### Scoring

- Correct on step N: `[1000, 700, 500, 340, 220, 120][N-1]`.
- First correct player in the round (by server receive time): **+150**.
- Wrong guesses cost nothing beyond the used action.
- **Total points** decide the match (pending owner confirmation vs. songs
  won); sudden death only on equal points. Sudden death never changes scores.

### Fairness

- **Server-authoritative.** The client never receives title/artist/track id
  before the reveal. Guesses go to the server, which judges them with
  `judgeGuess` from `src/lib/matching.ts` and returns the verdict.
- Audio is served through an **opaque per-match token**
  (`/api/duel/audio/<roomId>/<token>`); the provider URL never reaches the
  client. Tokens die on rematch.
- Accepted MVP risk (O3 decision): the client downloads the whole 30s preview
  so it can preload. Someone who digs the blob out of devtools hears more than
  1s, but still has to recognise the song. Revisit only if cheating shows up
  in practice; truncating per step would reintroduce network stalls mid-round.
- Step timing is measured on the server from a broadcast start time after a
  ready handshake. Guess order uses server receive time.

### Social

- Fixed emote set (😂 🔥 💀 🫡 🐐), no free chat.
- One-tap **rematch** in the same room. **Head-to-head record** per player pair.
- Result share card (9:16) + share text with a playable room/rematch link.

### Queue (public quick match)

- **Never show player or queue counts publicly.** The public API must not
  return them at all.
- Rotating fun messages while waiting, e.g. "Make this game famous and you
  won't have to wait this long."
- "Invite a friend" button (creates a private room), and a solo round to play
  while waiting. After ~60s offer "Play a friend instead?".
- Chime + "Match found" banner on pairing.

### Private rooms

- Created from `/duel`, joined by link (`/duel/r/<code>`) or 4-letter code.

### Developer visibility

- `/admin/duel` page + `/api/admin/duel` endpoint: queue size, wait times,
  live rooms, matches today, median match time, queue abandon rate.
- Protected by **Cloudflare Access** on `/admin/*` and `/api/admin/*`, plus an
  `ADMIN_TOKEN` secret check (wrong/missing token → 404). `noindex`, never linked.
- Dev-only `?bot=1` fills the opponent seat with a scripted bot; rejected unless
  the environment is dev.
- Structured logs for queue join / match / leave (visible in `astro dev logs`
  and `wrangler tail`).

## Architecture

```
src/worker.ts          custom Worker entry: exports the DOs, routes /api/duel/*, else Astro
src/lib/duel/
  protocol.ts          wire types + constants (shared client/server)        DONE
  engine.ts            pure rulebook reducer, snapshotFor()                 DONE
  scoring.ts           duel points                                          DONE
  store.ts             D1 contract (stub bodies)                            S6
src/server/duel/
  DuelRoom.ts          DO per room: state, alarms, judging, audio tokens    DONE
  Matchmaker.ts        singleton DO: queue, room codes, stats()             DONE
  routes.ts            /api/duel/* HTTP + websocket routing                 DONE
  stubs.ts             matchmakerStub(env), roomStub(env, id)               DONE
src/components/duel/
  useDuelSocket.ts     room socket, reconnect, server clock offset          DONE
  useDuelAudio.ts      preloads all match clips to blob URLs                DONE
  useDuelQueue.ts      quick-match queue socket                             DONE
  DuelShell.tsx        orchestrator island                                  O6 (after S2)
  *.tsx                presentational components                            S2, S5
src/pages/
  duel.astro, duel/r/[code].astro, admin/duel.astro, api/admin/duel.ts
migrations/0002_duel.sql                                                    S6
scripts/duel-engine-check.mts   npm run duel:check  (rule scenarios, no server)
scripts/duel-smoke.mjs          npm run duel:smoke  (end-to-end vs running dev server)
```

Reuse, don't fork: `VinylPlayer`, `GuessInput`, `GuessRows`, `useAudioClip`,
`renderShareCard`. Do not add Duel branches inside `GameShell.tsx`.

### Endpoints

| Route | Purpose |
| --- | --- |
| `POST /api/duel/rooms` | Create private room → `{ roomId, code }` (rate-limited per IP) |
| `GET /api/duel/rooms/:code` | 4-letter code → `{ roomId }` or 404 |
| `WS /api/duel/room/:roomId` | Room socket (`?bot=1` in dev only) |
| `WS /api/duel/queue` | Quick-match queue socket (never sends counts) |
| `GET /api/duel/audio/:roomId/:token` | Opaque audio stream, supports Range |

### Client flow (for S2 / O6)

1. Lobby: `POST /api/duel/rooms`, navigate to `/duel/r/<code>`; the page
   resolves the code and mounts DuelShell with the `roomId`.
2. `useDuelSocket({ roomId, playerId, name })` → `snapshot` drives every
   screen by `snapshot.phase`: `lobby` (share link, waiting for friend),
   `loading` (preloading, `useDuelAudio(clips)` progress; send
   `ready(match)` when `ready`), `countdown`, `step` / `closing`
   (timer from `toLocal(deadline)`, input enabled by `canAct`), `reveal`
   (`history.at(-1)`), `ended` (`result`, `rematchVotes`, `headToHead`).
3. Quick match: `useDuelQueue` → on `matched` navigate to
   `/duel/m/<roomId>`. An `opponent-missing` error means requeue.

### D1 schema (for S6)

```sql
-- migrations/0002_duel.sql
CREATE TABLE IF NOT EXISTS duel_matches (
  id TEXT PRIMARY KEY,            -- `${roomId}:${match}`
  room_id TEXT NOT NULL,
  kind TEXT NOT NULL,             -- 'private' | 'public'
  p1_id TEXT NOT NULL,
  p2_id TEXT NOT NULL,
  p1_name TEXT NOT NULL,
  p2_name TEXT NOT NULL,
  p1_score INTEGER NOT NULL,
  p2_score INTEGER NOT NULL,
  winner INTEGER,                 -- 0 | 1 | NULL (draw)
  reason TEXT NOT NULL,           -- MatchEndReason
  track_ids TEXT NOT NULL,        -- comma separated
  started_at INTEGER NOT NULL,
  ended_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS duel_matches_ended ON duel_matches (ended_at);

-- One row per unordered pair; player_a < player_b lexicographically.
CREATE TABLE IF NOT EXISTS duel_h2h (
  player_a TEXT NOT NULL,
  player_b TEXT NOT NULL,
  a_wins INTEGER NOT NULL DEFAULT 0,
  b_wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (player_a, player_b)
);
```

`recordDuelMatch` inserts with `INSERT OR IGNORE` and only touches `duel_h2h`
when the insert changed a row; `readHeadToHead` maps the sorted pair back to
the caller's order. Forfeits count as wins; `cancelled` is never recorded.

### Admin stats (for S4)

`await matchmakerStub(env).stats()` returns `DuelAdminStats` (see
`protocol.ts`). The Astro endpoint imports `env` from `cloudflare:workers`,
compares `request.headers.get("x-admin-token")` or `?token=` to
`env.ADMIN_TOKEN` (constant-time), and returns 404 on mismatch or when the
secret is unset. Local secret: `.dev.vars` → `ADMIN_TOKEN=...`.

**Cloudflare Access:** in the Zero Trust dashboard, add an Access application
covering `cluetune.com/admin*` (and `/api/admin*` if you want the JSON gated
too). Allow only your email. Access sits in front of the Worker, so the
token check is a second lock for scripts — not a substitute for Access.

### Dev notes

- Test a full match alone: create a room, open `/duel/r/<code>?bot=1` (dev
  server only). Two humans: one normal window + one incognito window.
- `npm run duel:check` after touching the engine; `npm run duel:smoke` with
  the dev server running after touching the server.
- Server logs are JSON lines with a `duel` key (`queue-join`,
  `queue-matched`, `match-started`, `match-ended`, ...).
- `astro dev` sometimes dies on first start with "The file does not exist at
  node_modules/.vite/deps_ssr/...". Pre-existing (happens without Duel too);
  just start it again.

## Task board

Model legend:

- **Opus 5.5** — crucial: architecture, real-time, fairness, integration, review.
- **Sonnet 5.5** — medium: well-specified UI/pages/endpoints against fixed types.
- **Sonnet 4.6 (medium)** — trivial: copy, lists, small utils, link wiring, type fixes.

Status: `[ ]` todo, `[~]` in progress, `[x]` done. Update this file when you
start/finish a task.

### Crucial — Opus 5.5

| ID | Task | Depends on |
| --- | --- | --- |
| O1 | **Spike**: Durable Object + WebSocket hibernation inside the Astro Cloudflare build (custom worker entry exporting the DO class). Prove local dev and deploy both work. Fallback: separate `cluetune-duel` Worker. Document the outcome here. | — |
| O2 | **Protocol + engine**: `protocol.ts`, pure `engine.ts` (timers as events), `scoring.ts`, D1 schema for matches + head-to-head (written into this file for S6). Freeze types so Sonnet tasks can start. | O1 |
| O3 | **DuelRoom DO**: authoritative state, step timers via alarms, guess judging, opaque audio tokens, reconnect/forfeit rules, rematch, emotes relay, results write. | O2 |
| O4 | **Synced start**: preload + ready handshake, clock offset (ping), countdown, late-join/slow-loader handling. | O3 |
| O5 | **Matchmaker DO**: public queue, private room codes, pairing, stats RPC for admin (define the stats shape here for S4), dev bot. | O2 |
| O6 | **Client orchestration**: `useDuelSocket`, `DuelShell`, wire step unlocks into `useAudioClip`/`VinylPlayer`, plug in S2/S5 components. | O3, S2 |
| O7 | **Review + security pass** on every Sonnet task; answer-leak audit (network tab, websocket frames, audio URLs). | all |

- [x] O1 — works in-process: `wrangler.jsonc` `main: ./src/worker.ts`, DO bindings + `duel-v1` migration. Verified in `astro dev`, `astro build`, and `wrangler deploy --dry-run`. No separate Worker needed.
- [x] O2 — protocol/engine/scoring done, 15 scenario checks (`npm run duel:check`). Store contract in `store.ts`, schema above.
- [x] O3 — DuelRoom done; full matches verified end-to-end (`npm run duel:smoke`).
- [x] O4 — server: ready handshake + 15s ready timeout + countdown; client: `useDuelSocket` clock offset, `useDuelAudio` preload.
- [x] O5 — Matchmaker done (queue, codes, `stats()`, dev bot lives in DuelRoom). Elo pairing deferred: FIFO until traffic justifies it.
- [x] O6 — `DuelShell`, lobby, `/duel`, `/duel/r/[code]`, `/duel/m/[roomId]` wired.
- [x] O7 — `astro check` clean; smoke + engine checks green; answer stays off the wire until reveal (audio tokens only).

### Medium — Sonnet 5.5

| ID | Task | Depends on |
| --- | --- | --- |
| S1 | `/duel` landing page + localized versions via `LocalizedModePage` / `src/i18n/mode-pages.ts`; SEO copy targeting "multiplayer heardle", "guess the song with friends", "song quiz 1v1"; Create room / Join by code / Quick match entry points (buttons can call stub handlers until O5). Add `ModeCard`. | — |
| S2 | Presentational Duel components (props only, no networking): lobby, queue screen (rotating messages, invite button, 60s fallback prompt), step timer bar, opponent tiles, scoreboard, round reveal, match result + rematch. Typed against `protocol.ts`. | O2 |
| S3 | Duel share card (reuse `renderShareCard.ts`), share text, OG image for room/result links (pattern: `src/pages/og-card.astro`). | O2 |
| S4 | `/admin/duel` page + `/api/admin/duel` endpoint (ADMIN_TOKEN check → 404 otherwise, `noindex`), rendering the stats shape defined in O5. Short note in this file on enabling Cloudflare Access. | O5 |
| S5 | Emote bar + head-to-head record display components. | O2 |
| S6 | `migrations/0002_duel.sql` + typed D1 helpers in `src/lib/duel/store.ts` from the O2 schema. | O2 |

- [x] S1 — `/duel` landing + SEO/FAQ (EN). Mode card on home for all locales.
- [x] S2 — Lobby / queue / timer / tiles / scoreboard / reveal / result components.
- [x] S3 — `src/lib/duel/share.ts` (text + share card via `renderShareCard`).
- [x] S4 — `/admin/duel` + `/api/admin/duel` behind `ADMIN_TOKEN` (404 otherwise).
- [x] S5 — Emote bar / toasts + head-to-head display.
- [x] S6 — `migrations/0002_duel.sql` + `store.ts` D1 helpers.

### Trivial — Sonnet 4.6 (medium)

| ID | Task | Depends on |
| --- | --- | --- |
| C1 | Waiting-screen message list (15–20 fun lines, no player counts implied) + Duel UI strings in `src/i18n/translations.ts`. | — |
| C2 | Nickname validation + profanity filter util `src/lib/duel/nickname.ts` (length, charset, blocklist incl. common leetspeak). | — |
| C3 | Wire links: nav, footer, sitemap, how-to-play section, README modes table, `robots.txt` disallow `/admin`. | S1 |
| C4 | Run `npm run check` after merges and fix trivial type errors (no logic changes; escalate anything non-trivial). | any |

- [x] C1 — `waitingMessages.ts` + home ModeCard copy (EN + other locales).
- [x] C2 — `nickname.ts`; used by lobby, Matchmaker, DuelRoom.
- [x] C3 — nav / footer / sitemap / robots / how-to-play / README.
- [x] C4 — `astro check` 0 errors.

### Suggested order

**All board tasks complete.** Remaining product backlog only (draft mode, streamer, ranks, Duel Hours).

### Backlog

- Draft mode (genre pick/ban) as a room option.
- Streamer mode (streamer vs Twitch chat overlay).
- Visible ranks once there is enough traffic (Elo used silently for pairing first).
- Scheduled "Duel Hours".

## Rules for every model

- Read this file and the files your task names before editing.
- Stay inside your task's files; if you need to touch shared code, say so.
- Match the existing style (see `DESIGN.md`, `src/styles/theme.css`); no new
  dependencies without asking.
- Run `npm run check` before finishing. Mark your task `[x]` and add a one-line
  note under it if you left anything open.
