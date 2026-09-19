import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

/**
 * Flipmain autopilot simulation (DEMO DATA ONLY).
 *
 * The app ships with a realistic baseline portfolio. While the autopilot is
 * running, a deterministic event clock produces new scans, evaluations,
 * purchases, listings, offers and sales, and every figure on every page is a
 * pure function of accumulated runtime — so numbers stay internally
 * consistent and survive reloads.
 *
 * No real registrar, payment or financial system is connected.
 */

const KEY = "flipmain.bot.v3";
const EVENT = "flipmain:bot";

export type BotState = {
  running: boolean;
  startedAt: number | null;
  elapsedMs: number;
  /** Simulated deposits / withdrawals made from the wallet screens. */
  cashDelta: number;
};

const EMPTY: BotState = { running: true, startedAt: null, elapsedMs: 0, cashDelta: 0 };

function read(): BotState {
  if (typeof localStorage === "undefined") return { ...EMPTY, running: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const seeded: BotState = { running: true, startedAt: Date.now(), elapsedMs: 0, cashDelta: 0 };
      localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    const p = JSON.parse(raw) as Partial<BotState>;
    return {
      running: Boolean(p.running),
      startedAt: typeof p.startedAt === "number" ? p.startedAt : null,
      elapsedMs: typeof p.elapsedMs === "number" ? p.elapsedMs : 0,
      cashDelta: typeof p.cashDelta === "number" ? p.cashDelta : 0,
    };
  } catch {
    return { ...EMPTY, running: false };
  }
}

function write(state: BotState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function runtimeMs(state: BotState) {
  return state.running && state.startedAt
    ? state.elapsedMs + (Date.now() - state.startedAt)
    : state.elapsedMs;
}

/* --------------------------------------------------------------- helpers -- */

/** Deterministic 0..1 pseudo-random for an index + channel. */
function rnd(i: number, c: number) {
  const x = Math.sin(i * 127.1 + c * 311.7 + 17.13) * 43758.5453;
  return x - Math.floor(x);
}

function scaleTo(values: number[], target: number) {
  const sum = values.reduce((s, v) => s + v, 0) || 1;
  const out = values.map((v) => Math.max(1, Math.round((v * target) / sum)));
  const drift = target - out.reduce((s, v) => s + v, 0);
  if (out.length) out[out.length - 1] = Math.max(1, (out[out.length - 1] as number) + drift);
  return out;
}

const HEADS = [
  "nova", "orbit", "quantum", "zen", "lumen", "atlas", "vault", "pulse", "cedar", "north",
  "bright", "kernel", "signal", "harbor", "meridian", "vertex", "aster", "cobalt", "onyx", "summit",
  "ember", "delta", "sable", "helio", "terra", "vireo", "axiom", "fable", "noble", "zephyr",
  "arc", "flint", "prism", "haven", "solace", "koda", "riven", "quay", "tundra", "vela",
];
const TAILS = [
  "labs", "pay", "base", "stack", "grid", "flow", "works", "hq", "core", "forge",
  "link", "wave", "mint", "scale", "bridge", "shift", "point", "loop", "vault", "form",
];
const TLDS = [".com", ".com", ".com", ".io", ".ai"];
export const CATEGORIES = ["Tech", "Fintech", "SaaS", "AI", "Crypto", "Brandable"] as const;

function domainName(i: number) {
  const h = HEADS[Math.floor(rnd(i, 21) * HEADS.length)] as string;
  const t = TAILS[Math.floor(rnd(i, 22) * TAILS.length)] as string;
  const tld = TLDS[Math.floor(rnd(i, 23) * TLDS.length)] as string;
  return `${h}${t}${tld}`;
}

function categoryFor(i: number) {
  return CATEGORIES[Math.floor(rnd(i, 24) * CATEGORIES.length)] as string;
}

const DAY = 86_400_000;

/* -------------------------------------------------------------- baseline -- */

const BASE = {
  held: 199,
  sold: 33,
  deployed: 21_117,
  value: 55_914,
  realized: 1_255,
  balance: 28_420,
  deposited: 50_000,
  withdrawn: 1_718,
};

export type Position = {
  index: number;
  domain: string;
  category: string;
  cost: number;
  baseValue: number;
  /** How long ago the domain was acquired, in ms. */
  ageMs: number;
  /** Legacy runtime-relative timestamp (kept for older screens). */
  atMs: number;
  soldAtMs: number | null;
  salePrice: number;
  status: "Holding" | "Listed" | "Sold";
  listPrice: number | null;
  offers: number;
  daysListed: number;
};

function roundPrice(n: number) {
  return Math.max(99, Math.round(n / 50) * 50 - 1);
}

const baseHeld: Position[] = (() => {
  const rawCost = Array.from({ length: BASE.held }, (_, i) => 60 + rnd(i, 1) * 420);
  const costs = scaleTo(rawCost, BASE.deployed);
  const rawVal = costs.map((c, i) => c * (2.2 + rnd(i, 2) * 5.5));
  const vals = scaleTo(rawVal, BASE.value);
  return Array.from({ length: BASE.held }, (_, i) => {
    const listed = rnd(i, 4) < 0.42;
    const est = vals[i] as number;
    return {
      index: i,
      domain: domainName(i),
      category: categoryFor(i),
      cost: costs[i] as number,
      baseValue: est,
      ageMs: (0.6 + rnd(i, 5) * 74) * DAY,
      atMs: 0,
      soldAtMs: null,
      salePrice: 0,
      status: listed ? "Listed" : "Holding",
      listPrice: listed ? roundPrice(est * (0.9 + rnd(i, 6) * 0.5)) : null,
      offers: listed ? Math.floor(rnd(i, 7) * 3.4) : 0,
      daysListed: listed ? 1 + Math.floor(rnd(i, 8) * 26) : 0,
    } satisfies Position;
  }).sort((a, b) => a.ageMs - b.ageMs);
})();

const baseSold: Position[] = (() => {
  const n = BASE.sold;
  const costs = Array.from({ length: n }, (_, i) => Math.round(80 + rnd(i + 900, 1) * 400));
  const rawPnl = Array.from({ length: n }, (_, i) => (rnd(i + 900, 2) - 0.32) * 900);
  const total = rawPnl.reduce((s, v) => s + v, 0) || 1;
  const pnl = rawPnl.map((v) => Math.round((v * BASE.realized) / total));
  const drift = BASE.realized - pnl.reduce((s, v) => s + v, 0);
  if (pnl.length) pnl[n - 1] = (pnl[n - 1] as number) + drift;
  return Array.from({ length: n }, (_, i) => {
    const cost = costs[i] as number;
    const age = (2 + rnd(i + 900, 5) * 70) * DAY;
    return {
      index: 1000 + i,
      domain: domainName(i + 900),
      category: categoryFor(i + 900),
      cost,
      baseValue: cost + Math.max(0, pnl[i] as number),
      ageMs: age,
      atMs: 0,
      soldAtMs: age - DAY,
      salePrice: Math.max(20, cost + (pnl[i] as number)),
      status: "Sold",
      listPrice: null,
      offers: 0,
      daysListed: 0,
    } satisfies Position;
  }).sort((a, b) => a.ageMs - b.ageMs);
})();

/* ----------------------------------------------------------- event clock -- */

const GAP = 45_000;

const CYCLE = [
  "scan", "found", "evaluate", "purchase", "list", "scan",
  "evaluate", "purchase", "offer", "sale", "scan", "list",
] as const;

export type EventKind = (typeof CYCLE)[number];

export type BotEvent = {
  id: number;
  kind: EventKind;
  title: string;
  detail?: string;
  amount?: number;
  ageMs: number;
  at: number;
};

function eventKind(id: number) {
  const idx = ((id % CYCLE.length) + CYCLE.length) % CYCLE.length;
  return CYCLE[idx] as EventKind;
}

function purchaseCost(id: number) {
  return Math.round(120 + rnd(id, 31) * 360);
}

function saleProceeds(id: number) {
  return roundPrice(600 + rnd(id, 32) * 1500);
}

function buildEvent(id: number, now: number, tMs: number): BotEvent {
  const kind = eventKind(id);
  const ageMs = Math.max(0, tMs - id * GAP);
  const at = now - ageMs;
  const domain = domainName(id + 4000);
  switch (kind) {
    case "scan":
      return {
        id, kind, ageMs, at,
        title: `Scanned ${(8_000 + Math.floor(rnd(id, 33) * 7_000)).toLocaleString()} domains`,
        detail: "Market sweep completed",
      };
    case "found":
      return {
        id, kind, ageMs, at,
        title: `Found ${8 + Math.floor(rnd(id, 34) * 42)} potential opportunities`,
        detail: "Queued for valuation",
      };
    case "evaluate":
      return {
        id, kind, ageMs, at,
        title: `Evaluating ${domain}`,
        detail: rnd(id, 35) > 0.5 ? "Strong keyword demand detected" : "Comparable sales look favourable",
      };
    case "purchase": {
      const amount = purchaseCost(id);
      return {
        id, kind, ageMs, at, amount,
        title: `Purchased ${domain} for $${amount.toLocaleString()}`,
        detail: `Flip score: ${82 + Math.floor(rnd(id, 36) * 15)}`,
      };
    }
    case "list": {
      const amount = roundPrice(700 + rnd(id, 37) * 1600);
      return {
        id, kind, ageMs, at, amount,
        title: `Listed ${domain} for $${amount.toLocaleString()}`,
        detail: "Published to marketplace network",
      };
    }
    case "offer": {
      const amount = roundPrice(400 + rnd(id, 38) * 1100);
      return {
        id, kind, ageMs, at, amount,
        title: `Received offer on ${domain}`,
        detail: `Buyer offered $${amount.toLocaleString()}`,
      };
    }
    case "sale": {
      const amount = saleProceeds(id);
      return {
        id, kind, ageMs, at, amount,
        title: `Sold ${domain} for $${amount.toLocaleString()}`,
        detail: "Proceeds credited to wallet",
      };
    }
  }
}

/** Positions bought during this session. */
function livePurchases(tMs: number): Position[] {
  const last = Math.floor(tMs / GAP);
  const out: Position[] = [];
  for (let id = 0; id <= last; id++) {
    if (eventKind(id) !== "purchase") continue;
    const cost = purchaseCost(id);
    const est = Math.round(cost * (3 + rnd(id, 41) * 6));
    const listed = rnd(id, 42) < 0.5;
    out.push({
      index: 5000 + id,
      domain: domainName(id + 4000),
      category: categoryFor(id + 4000),
      cost,
      baseValue: est,
      ageMs: Math.max(0, tMs - id * GAP),
      atMs: id * GAP,
      soldAtMs: null,
      salePrice: 0,
      status: listed ? "Listed" : "Holding",
      listPrice: listed ? roundPrice(est * 1.05) : null,
      offers: listed ? Math.floor(rnd(id, 43) * 2.6) : 0,
      daysListed: 0,
    });
  }
  return out;
}

/** Baseline positions the autopilot has exited during this session. */
function liveSales(tMs: number) {
  const last = Math.floor(tMs / GAP);
  const taken = new Set<number>();
  const out: { id: number; position: Position; proceeds: number }[] = [];
  for (let id = 0; id <= last; id++) {
    if (eventKind(id) !== "sale") continue;
    let idx = (id * 37) % baseHeld.length;
    while (taken.has(idx)) idx = (idx + 1) % baseHeld.length;
    taken.add(idx);
    const position = baseHeld[idx] as Position;
    out.push({ id, position, proceeds: saleProceeds(id) });
  }
  return out;
}

/* -------------------------------------------------------------- snapshot -- */

export type SeriesPoint = { t: string; value: number; cost: number };
export type Range = "7D" | "30D" | "3M" | "1Y" | "ALL";

export type BotSnapshot = {
  running: boolean;
  runtimeMs: number;
  /** Available USDC. Never negative. */
  balance: number;
  /** Capital currently locked in domains. */
  deployed: number;
  portfolioValue: number;
  unrealized: number;
  realized: number;
  roi: number;
  acquired: number;
  domains: number;
  positions: Position[];
  open: Position[];
  sold: Position[];
  listed: Position[];
  events: BotEvent[];
  scanned: number;
  series: SeriesPoint[];
  seriesFor: (range: Range) => SeriesPoint[];
  /** Legacy aliases used by secondary screens. */
  cost: number;
  estValue: number;
  activity: { text: string; atMs: number; kind: "buy" | "sale" | "scan" | "list" }[];
};

const RANGES: Record<Range, { points: number; label: (i: number, n: number) => string; span: number }> = {
  "7D": { points: 7, label: (i, n) => `D${i - n + 1 === 0 ? "0" : i - n + 1}`, span: 7 },
  "30D": { points: 15, label: (i, n) => `${(n - 1 - i) * 2}d`, span: 30 },
  "3M": { points: 12, label: (i, n) => `W${i - n + 1}`, span: 90 },
  "1Y": { points: 12, label: (i, n) => `M${i - n + 1}`, span: 365 },
  ALL: { points: 14, label: (i, n) => `P${i + 1}/${n}`, span: 540 },
};

function makeSeries(range: Range, value: number, cost: number): SeriesPoint[] {
  const cfg = RANGES[range];
  const n = cfg.points;
  // Older ranges start further back, so the curve steepness feels believable.
  const startFactor = range === "7D" ? 0.94 : range === "30D" ? 0.78 : range === "3M" ? 0.52 : range === "1Y" ? 0.18 : 0.06;
  const out: SeriesPoint[] = [];
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const base = startFactor + (1 - startFactor) * Math.pow(p, 1.08);
    const noise = 1 + (rnd(i + cfg.span, 51) - 0.5) * (range === "7D" ? 0.018 : 0.05) * (1 - p * 0.55);
    const costBase = startFactor + (1 - startFactor) * Math.pow(p, 0.95);
    out.push({
      t: cfg.label(i, n),
      value: Math.round(value * base * (i === n - 1 ? 1 : noise)),
      cost: Math.round(cost * costBase),
    });
  }
  return out;
}

export function snapshot(state: BotState): BotSnapshot {
  const t = runtimeMs(state);
  const now = Date.now();

  const bought = livePurchases(t);
  const sales = liveSales(t);
  const soldIdx = new Set(sales.map((s) => s.position.index));

  const heldBase = baseHeld.filter((p) => !soldIdx.has(p.index));
  const soldLive: Position[] = sales.map((s) => ({
    ...s.position,
    status: "Sold",
    salePrice: s.proceeds,
    soldAtMs: Math.max(0, t - s.id * GAP),
    ageMs: Math.max(0, t - s.id * GAP),
  }));

  const held = [...bought, ...heldBase].sort((a, b) => a.ageMs - b.ageMs);
  const sold = [...soldLive, ...baseSold].sort((a, b) => a.ageMs - b.ageMs);

  // Slow, noisy appreciation on the open book while the bot runs.
  const appreciation = 1 + Math.min(0.06, (t / 1000) * 0.0000075);
  const deployed = held.reduce((s, p) => s + p.cost, 0);
  const portfolioValue = Math.round(held.reduce((s, p) => s + p.baseValue, 0) * appreciation);

  const realized =
    BASE.realized + sales.reduce((s, x) => s + (x.proceeds - x.position.cost), 0);
  const spent = bought.reduce((s, p) => s + p.cost, 0);
  const proceeds = sales.reduce((s, x) => s + x.proceeds, 0);
  const balance = Math.max(0, Math.round(BASE.balance - spent + proceeds + state.cashDelta));

  const events: BotEvent[] = [];
  const newest = Math.floor(t / GAP);
  for (let i = 0; i < 60; i++) events.push(buildEvent(newest - i, now, t));

  const unrealized = portfolioValue - deployed;

  return {
    running: state.running,
    runtimeMs: t,
    balance,
    deployed,
    portfolioValue,
    unrealized,
    realized,
    roi: deployed > 0 ? Math.round((unrealized / deployed) * 1000) / 10 : 0,
    acquired: held.length,
    domains: held.length,
    positions: held,
    open: held.filter((p) => p.status === "Holding"),
    listed: held.filter((p) => p.status === "Listed"),
    sold,
    events,
    scanned: 12_482 + Math.floor(t / 1000) * 9,
    series: makeSeries("30D", portfolioValue, deployed),
    seriesFor: (range: Range) => makeSeries(range, portfolioValue, deployed),
    cost: deployed,
    estValue: portfolioValue,
    activity: events.slice(0, 8).map((e) => ({
      text: e.title,
      atMs: e.at,
      kind: e.kind === "purchase" ? "buy" : e.kind === "sale" ? "sale" : e.kind === "list" ? "list" : "scan",
    })),
  };
}

export const BASELINE = BASE;

/* -------------------------------------------------------------- format -- */

export function formatRuntime(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

export function timeAgo(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 45) return `${Math.max(1, s)} seconds ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export function clockTime(at: number) {
  return new Date(at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/* ---------------------------------------------------------------- hooks -- */

/** Everything at zero — used before a user signs in. */
export function zeroSnapshot(): BotSnapshot {
  const emptySeries: SeriesPoint[] = [];
  return {
    running: false,
    runtimeMs: 0,
    balance: 0,
    deployed: 0,
    portfolioValue: 0,
    unrealized: 0,
    realized: 0,
    roi: 0,
    acquired: 0,
    domains: 0,
    positions: [],
    open: [],
    sold: [],
    listed: [],
    events: [],
    scanned: 0,
    series: emptySeries,
    seriesFor: () => emptySeries,
    cost: 0,
    estValue: 0,
    activity: [],
  };
}

export function useBot() {
  const { session } = useAuth();
  const [state, setState] = useState<BotState>({ ...EMPTY, running: false });
  const [, force] = useState(0);

  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [state.running]);

  const start = useCallback(() => {
    const cur = read();
    if (cur.running) return;
    write({ ...cur, running: true, startedAt: Date.now() });
  }, []);

  const pause = useCallback(() => {
    const cur = read();
    if (!cur.running) return;
    write({ ...cur, running: false, startedAt: null, elapsedMs: runtimeMs(cur) });
  }, []);

  const reset = useCallback(() => write({ running: false, startedAt: null, elapsedMs: 0, cashDelta: 0 }), []);

  const toggle = useCallback((on: boolean) => (on ? start() : pause()), [start, pause]);

  const adjustCash = useCallback((delta: number) => {
    const cur = read();
    write({ ...cur, cashDelta: cur.cashDelta + delta });
  }, []);

  return { state, snapshot: snapshot(state), start, pause, reset, toggle, adjustCash };
}
