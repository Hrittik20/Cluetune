/**
 * End-to-end smoke test for Duel against a running dev server.
 *
 *   npm run dev            (in another terminal)
 *   npm run duel:smoke     (or: node scripts/duel-smoke.mjs http://localhost:4321)
 *
 * Plays a private room against the dev bot, a two-human private room, and a
 * quick-match pairing. Only uses the public protocol, so it doubles as a check
 * that no answer metadata reaches the client before the reveal.
 */
const base = process.argv[2] ?? "http://localhost:4321";
const wsBase = base.replace(/^http/, "ws");

class Client {
  constructor(name, path) {
    this.name = name;
    this.playerId = `smoke-${name}-${Math.random().toString(36).slice(2, 8)}`;
    this.messages = [];
    this.waiters = [];
    this.ws = new WebSocket(`${wsBase}${path}`, { headers: { origin: base } });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      this.messages.push(msg);
      if (msg.type === "state" || msg.type === "welcome") this.snapshot = msg.snapshot;
      if (msg.type === "audio") this.audio = msg;
      for (const waiter of [...this.waiters]) waiter();
    };
    this.opened = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = () => reject(new Error(`${name}: socket error`));
    });
  }
  send(msg) {
    this.ws.send(JSON.stringify(msg));
  }
  until(predicate, label, timeoutMs = 20_000) {
    return new Promise((resolve, reject) => {
      const check = () => {
        const hit = predicate(this);
        if (hit) {
          this.waiters = this.waiters.filter((w) => w !== check);
          clearTimeout(timer);
          resolve(hit);
        }
      };
      const timer = setTimeout(() => reject(new Error(`${this.name}: timed out waiting for ${label}`)), timeoutMs);
      this.waiters.push(check);
      check();
    });
  }
  phase(p, timeoutMs) {
    return this.until((c) => c.snapshot?.phase === p && c.snapshot, `phase ${p}`, timeoutMs);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/** Anything that looks like answer metadata in a pre-reveal frame is a leak. */
function assertNoLeak(client) {
  for (const msg of client.messages) {
    const snap = msg.snapshot;
    if (!snap) continue;
    const text = JSON.stringify(snap.history?.length ? { ...snap, history: [] } : snap);
    assert(!/"title"|"artist"|trackId|previewUrl/.test(text), `${client.name}: answer metadata leaked in ${snap.phase}`);
  }
  for (const msg of client.messages) {
    if (msg.type === "audio") {
      for (const clip of msg.clips) assert(/^\/api\/duel\/audio\/[a-f0-9]{20}\/[a-f0-9]{32}$/.test(clip), `bad clip url ${clip}`);
    }
  }
}

async function createRoom() {
  const res = await fetch(`${base}/api/duel/rooms`, { method: "POST" });
  assert(res.ok, `create room: ${res.status}`);
  return res.json();
}

async function readyUp(client) {
  await client.until((c) => c.audio, "audio clips", 40_000);
  client.send({ type: "ready", match: client.audio.match });
}

async function botMatch() {
  const { roomId, code } = await createRoom();
  const lookup = await fetch(`${base}/api/duel/rooms/${code}`).then((r) => r.json());
  assert(lookup.roomId === roomId, "code lookup should return the room");

  const a = new Client("solo", `/api/duel/room/${roomId}?bot=1`);
  await a.opened;
  a.send({ type: "hello", playerId: a.playerId, name: "Solo" });
  await a.until((c) => c.messages.find((m) => m.type === "welcome"), "welcome");
  await readyUp(a);

  const clip = await fetch(`${base}${a.audio.clips[0]}`, { headers: { range: "bytes=0-1023" } });
  assert(clip.ok, `audio clip: ${clip.status}`);
  assert((await clip.arrayBuffer()).byteLength > 0, "audio clip should have bytes");

  await a.phase("step", 10_000);
  a.send({ type: "guess", label: "definitely not the song zzz" });
  await a.until((c) => c.snapshot.yourTiles.some((t) => t.verdict === "wrong"), "wrong tile");
  a.send({ type: "emote", emote: "🔥" });
  await a.until((c) => c.messages.find((m) => m.type === "emote"), "emote echo");

  // Skip through the rest; the bot plays on its own.
  while (a.snapshot.phase !== "ended") {
    const seen = a.messages.length;
    if (a.snapshot.canAct) a.send({ type: "skip" });
    await a.until((c) => c.messages.length > seen && c.snapshot, "next state", 30_000);
  }
  const end = a.snapshot;
  assert(end.result, "match should have a result");
  assert(end.history.length >= 3 && end.history.every((h) => h.track?.title), "history should reveal every track");
  assertNoLeak(a);
  a.ws.close();
  return `winner=${end.result.winner} reason=${end.result.reason} scores=${end.result.scores.join("-")}`;
}

async function humanMatch() {
  const { roomId } = await createRoom();
  const a = new Client("alice", `/api/duel/room/${roomId}`);
  const b = new Client("bob", `/api/duel/room/${roomId}`);
  await Promise.all([a.opened, b.opened]);
  a.send({ type: "hello", playerId: a.playerId, name: "Alice" });
  await a.phase("lobby");
  b.send({ type: "hello", playerId: b.playerId, name: "Bob" });
  await Promise.all([readyUp(a), readyUp(b)]);
  await Promise.all([a.phase("step", 10_000), b.phase("step", 10_000)]);

  a.send({ type: "skip" });
  await b.until((c) => c.snapshot.players[0].actedThisStep, "opponent acted flag");
  assert(!JSON.stringify(b.snapshot.players[0]).includes("label"), "opponent tiles must not carry labels");
  b.send({ type: "guess", label: "nope" });
  await a.until((c) => c.snapshot.step === 2, "step 2 after both acted");

  // Third client is turned away.
  const c = new Client("carol", `/api/duel/room/${roomId}`);
  await c.opened;
  c.send({ type: "hello", playerId: c.playerId, name: "Carol" });
  await c.until((x) => x.messages.find((m) => m.type === "error" && m.code === "room-full"), "room-full");

  // Bob drops and comes back with his seat token.
  const token = b.messages.find((m) => m.type === "welcome").seatToken;
  b.ws.close();
  await a.until((x) => x.snapshot.players[1].connected === false, "bob disconnected");
  const b2 = new Client("bob2", `/api/duel/room/${roomId}`);
  await b2.opened;
  b2.send({ type: "hello", playerId: "someone-else", seatToken: token });
  const welcome = await b2.until((x) => x.messages.find((m) => m.type === "welcome"), "welcome back");
  assert(welcome.seat === 1, "seat token should restore seat 1");
  await b2.until((x) => x.audio, "audio resent on reconnect");

  a.send({ type: "leave" });
  const end = await b2.phase("ended");
  assert(end.result.reason === "forfeit" && end.result.winner === 1, "leaving should forfeit to bob");
  assertNoLeak(a);
  assertNoLeak(b2);
  b2.ws.close();
  return "join / step advance / room-full / reconnect / forfeit ok";
}

async function quickMatch() {
  const q1 = new Client("q1", "/api/duel/queue");
  const q2 = new Client("q2", "/api/duel/queue");
  await Promise.all([q1.opened, q2.opened]);
  q1.send({ type: "queue", playerId: q1.playerId, name: "Q1" });
  await q1.until((c) => c.messages.find((m) => m.type === "queued"), "queued");
  const queued = q1.messages.find((m) => m.type === "queued");
  assert(Object.keys(queued).length === 1, "queue messages must not carry counts");
  q2.send({ type: "queue", playerId: q2.playerId, name: "Q2" });
  const [m1, m2] = await Promise.all([
    q1.until((c) => c.messages.find((m) => m.type === "matched"), "matched"),
    q2.until((c) => c.messages.find((m) => m.type === "matched"), "matched"),
  ]);
  assert(m1.roomId === m2.roomId, "both players should land in the same room");

  const intruder = new Client("intruder", `/api/duel/room/${m1.roomId}`);
  await intruder.opened;
  intruder.send({ type: "hello", playerId: "intruder", name: "X" });
  await intruder.until((c) => c.messages.find((m) => m.type === "error" && m.code === "not-allowed"), "not-allowed");
  return `paired into ${m1.roomId}`;
}

const tests = [
  ["quick match pairing", quickMatch],
  ["two humans", humanMatch],
  ["private room vs dev bot (full match)", botMatch],
];

let failed = 0;
for (const [name, run] of tests) {
  const started = Date.now();
  try {
    const detail = await run();
    console.log(`ok   ${name} (${((Date.now() - started) / 1000).toFixed(1)}s) ${detail ?? ""}`);
  } catch (error) {
    failed++;
    console.log(`FAIL ${name}: ${error.message}`);
  }
}
process.exit(failed ? 1 : 0);
