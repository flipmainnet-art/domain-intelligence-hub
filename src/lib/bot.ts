import { useCallback, useEffect, useState } from "react";

/**
 * Flipmain bot engine.
 *
 * Everything starts at zero. Once the bot is started it runs on a clock:
 * acquisitions land at irregular intervals, valuations drift between events,
 * and realised sales occur once positions have matured. All figures are a pure
 * function of accumulated runtime, so the state survives reloads and stays
 * consistent across every page.
 */

const KEY = "flipmain.bot.v2";
const EVENT = "flipmain:bot";

export type BotState = {
  running: boolean;
  startedAt: number | null;
  elapsedMs: number;
};

const EMPTY: BotState = { running: false, startedAt: null, elapsedMs: 0 };

function read(): BotState {
  if (typeof localStorage === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<BotState>;
    return {
      running: Boolean(parsed.running),
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      elapsedMs: typeof parsed.elapsedMs === "number" ? parsed.elapsedMs : 0,
    };
  } catch {
    return EMPTY;
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

/* ---------------------------------------------------------------- engine -- */

/** Deterministic 0..1 pseudo-random for a given event index + channel. */
function rnd(i: number, c: number) {
  const x = Math.sin(i * 127.1 + c * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const NAMES = [
  "NovaLedger.com", "OrbitalAI.com", "VantaFlow.com", "Cedarbase.io", "Pulsegrid.ai",
  "Harborpay.com", "Quantfold.com", "Lumenstack.io", "Northvault.com", "Kernelbay.com",
  "Atlasrail.com", "Signalcrest.ai", "Brightmoor.com", "Corefig.io", "Sableport.com",
  "Ironvale.com", "Lightkeep.ai", "Meridianly.com", "Palebridge.io", "Quaystone.com",
  "Redpine.ai", "Stackharbor.com", "Truenorthly.com", "Umbergrid.io", "Vaultmark.com",
];

const CATEGORIES = ["Fintech", "AI", "SaaS", "Infrastructure", "Data", "Logistics"];

export type Position = {
  index: number;
  domain: string;
  category: string;
  cost: number;
  baseValue: number;
  atMs: number;
  soldAtMs: number | null;
  salePrice: number;
};

/** Average seconds between acquisitions. */
const GAP_BASE = 150;
const GAP_JITTER = 220;
/** A position becomes eligible for a sale after this much runtime. */
const HOLD_MS = 22 * 60 * 1000;

function positions(ms: number): Position[] {
  const out: Position[] = [];
  let t = 18_000 + rnd(0, 9) * 20_000; // first find takes a little while
  for (let i = 0; i < 400 && t <= ms; i++) {
    const cost = Math.round(18 + rnd(i, 1) * 180);
    const multiple = 5 + rnd(i, 2) * 26;
    out.push({
      index: i,
      domain: NAMES[i % NAMES.length]!,
      category: CATEGORIES[Math.floor(rnd(i, 3) * CATEGORIES.length)]!,
      cost,
      baseValue: Math.round(cost * multiple),
      atMs: t,
      soldAtMs: null,
      salePrice: 0,
    });
    t += (GAP_BASE + rnd(i, 4) * GAP_JITTER) * 1000;
  }

  // Roughly one in four matured positions finds a buyer.
  for (const p of out) {
    if (rnd(p.index, 5) > 0.26) continue;
    const saleAt = p.atMs + HOLD_MS + rnd(p.index, 6) * HOLD_MS * 2;
    if (saleAt <= ms) {
      p.soldAtMs = saleAt;
      // About 3 in 10 exits close at a loss — the bot cuts underperformers
      // below cost instead of holding them forever.
      if (rnd(p.index, 12) < 0.3) {
        p.salePrice = Math.max(4, Math.round(p.cost * (0.35 + rnd(p.index, 7) * 0.55)));
      } else {
        p.salePrice = Math.round(p.baseValue * (0.45 + rnd(p.index, 7) * 0.45));
      }
    }
  }
  return out;
}

/** Slow, noisy appreciation applied to a position since acquisition. */
function drift(p: Position, ms: number) {
  const held = Math.max(0, ms - p.atMs) / 1000;
  const trend = 1 + held * 0.00018;
  const noise = 1 + Math.sin(held / 47 + p.index) * 0.012;
  return p.baseValue * trend * noise;
}

export type BotSnapshot = {
  running: boolean;
  runtimeMs: number;
  positions: Position[];
  open: Position[];
  sold: Position[];
  cost: number;
  estValue: number;
  unrealized: number;
  realized: number;
  roi: number;
  domains: number;
  series: { t: string; value: number; cost: number }[];
  activity: { text: string; atMs: number; kind: "buy" | "sale" | "scan" | "list" }[];
  scanned: number;
};

function totals(list: Position[], ms: number) {
  let cost = 0;
  let est = 0;
  let realized = 0;
  let open = 0;
  for (const p of list) {
    if (p.atMs > ms) continue;
    cost += p.cost;
    if (p.soldAtMs && p.soldAtMs <= ms) {
      realized += p.salePrice - p.cost;
    } else {
      est += drift(p, ms);
      open++;
    }
  }
  return { cost, est, realized, open };
}

function clock(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function snapshot(state: BotState): BotSnapshot {
  const ms = runtimeMs(state);
  const list = positions(ms);
  const live = list.filter((p) => p.atMs <= ms);
  const sold = live.filter((p) => p.soldAtMs && p.soldAtMs <= ms);
  const open = live.filter((p) => !(p.soldAtMs && p.soldAtMs <= ms));
  const { cost, est, realized } = totals(list, ms);

  const points = 24;
  const series: BotSnapshot["series"] = [];
  if (ms > 0) {
    for (let i = 0; i <= points; i++) {
      const at = (ms * i) / points;
      const tt = totals(list, at);
      series.push({
        t: clock(at),
        value: Math.round(tt.est + tt.realized + tt.cost * 0),
        cost: Math.round(tt.cost),
      });
    }
  } else {
    series.push({ t: "0:00", value: 0, cost: 0 });
  }

  const activity: BotSnapshot["activity"] = [];
  for (const p of live) {
    activity.push({
      text: `Acquired ${p.domain} for $${p.cost} · est. $${Math.round(drift(p, ms)).toLocaleString()}`,
      atMs: p.atMs,
      kind: "buy",
    });
    if (p.soldAtMs && p.soldAtMs <= ms) {
      const pnl = p.salePrice - p.cost;
      activity.push({
        text: `Sold ${p.domain} for $${p.salePrice.toLocaleString()} (${pnl >= 0 ? "+" : "−"}$${Math.abs(pnl).toLocaleString()})`,
        atMs: p.soldAtMs,
        kind: "sale",
      });
    }
  }
  if (ms > 0) {
    const scans = Math.floor(ms / 90_000);
    for (let i = 1; i <= scans; i++) {
      activity.push({
        text: `Scanned ${(1200 + Math.floor(rnd(i, 8) * 900)).toLocaleString()} expiring domains`,
        atMs: i * 90_000,
        kind: "scan",
      });
    }
  }
  activity.sort((a, b) => b.atMs - a.atMs);

  return {
    running: state.running,
    runtimeMs: ms,
    positions: live,
    open,
    sold,
    cost: Math.round(cost),
    estValue: Math.round(est),
    unrealized: Math.round(est - open.reduce((s, p) => s + p.cost, 0)),
    realized: Math.round(realized),
    roi: cost > 0 ? Math.round(((est + realized + sold.reduce((s, p) => s + p.cost, 0) - cost) / cost) * 100) : 0,
    domains: open.length,
    series,
    activity: activity.slice(0, 8),
    scanned: Math.floor(ms / 1000) * 14,
  };
}

export function formatRuntime(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}h ${String(m).padStart(2, "0")}m`
    : `${m}m ${String(s).padStart(2, "0")}s`;
}

/* ----------------------------------------------------------------- hooks -- */

export function useBot() {
  const [state, setState] = useState<BotState>(EMPTY);
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
    write({ running: false, startedAt: null, elapsedMs: runtimeMs(cur) });
  }, []);

  const reset = useCallback(() => write({ ...EMPTY }), []);

  const toggle = useCallback(
    (on: boolean) => (on ? start() : pause()),
    [start, pause],
  );

  return { state, snapshot: snapshot(state), start, pause, reset, toggle };
}
