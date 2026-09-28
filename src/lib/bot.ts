import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Flipmain autopilot engine (SIMULATED EXECUTION — no registrar or payment
 * network is connected).
 *
 * Every account starts completely empty: zero balance, zero portfolio, zero
 * P&L, no trades and no history. Nothing is generated until the user funds the
 * bot with a confirmed deposit. From that moment the deposited capital becomes
 * the bot's operating balance and all activity is a pure function of how long
 * the bot has been running, so figures stay internally consistent and survive
 * reloads.
 */

const KEY = "flipmain.bot.v4";
const EVENT = "flipmain:bot";

export type Txn = {
  id: string;
  at: number;
  kind: "Deposit" | "Withdrawal";
  amount: number;
  status: "Completed" | "Pending";
  /** Epoch ms when a pending deposit is credited. */
  creditAt?: number;
};

/** Deposits stay pending for 5 minutes before the balance is credited. */
export const DEPOSIT_HOLD_MS = 5 * 60_000;

export type BotState = {
  running: boolean;
  startedAt: number | null;
  elapsedMs: number;
  txns: Txn[];
};

const EMPTY: BotState = { running: false, startedAt: null, elapsedMs: 0, txns: [] };

/** The signed-in user whose account the engine is operating on. */
let currentUser: string | null = null;
const userKey = () => (currentUser ? `${KEY}:${currentUser}` : null);
let saveTimer: number | undefined;
let boundFor: string | null | undefined;

function sanitize(p: Partial<BotState>): BotState {
  return {
    running: Boolean(p.running),
    startedAt: typeof p.startedAt === "number" ? p.startedAt : null,
    elapsedMs: typeof p.elapsedMs === "number" ? p.elapsedMs : 0,
    txns: Array.isArray(p.txns) ? (p.txns as Txn[]) : [],
  };
}

function persistRemote(state: BotState) {
  const uid = currentUser;
  if (!uid) return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    void supabase.from("bot_accounts").upsert({ user_id: uid, state: state as never });
  }, 400);
}

/** Load the signed-in user's own account from the backend. */
async function bindUser(uid: string | null) {
  currentUser = uid;
  window.dispatchEvent(new CustomEvent(EVENT));
  if (!uid) return;
  const { data } = await supabase.from("bot_accounts").select("state").eq("user_id", uid).maybeSingle();
  if (currentUser !== uid) return;
  const state = data?.state ? sanitize(data.state as Partial<BotState>) : { ...EMPTY };
  try {
    localStorage.setItem(`${KEY}:${uid}`, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  if (!data) void supabase.from("bot_accounts").insert({ user_id: uid, state: state as never });
  window.dispatchEvent(new CustomEvent(EVENT));
}

function read(): BotState {
  const key = userKey();
  if (typeof localStorage === "undefined" || !key) return { ...EMPTY };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<BotState>;
    return {
      running: Boolean(p.running),
      startedAt: typeof p.startedAt === "number" ? p.startedAt : null,
      elapsedMs: typeof p.elapsedMs === "number" ? p.elapsedMs : 0,
      txns: Array.isArray(p.txns) ? (p.txns as Txn[]) : [],
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(state: BotState) {
  const key = userKey();
  if (!key) return;
  persistRemote(state);
  try {
    localStorage.setItem(key, JSON.stringify(state));
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

function roundPrice(n: number) {
  return Math.max(29, Math.round(n / 10) * 10 - 1);
}

export type Position = {
  index: number;
  domain: string;
  category: string;
  cost: number;
  baseValue: number;
  /** How long ago the domain was acquired, in ms of bot runtime. */
  ageMs: number;
  /** Runtime timestamp of the acquisition. */
  atMs: number;
  soldAtMs: number | null;
  salePrice: number;
  status: "Holding" | "Listed" | "Sold";
  listPrice: number | null;
  offers: number;
  daysListed: number;
};

/* ----------------------------------------------------------- event clock -- */

/** One engine tick every 45s of runtime. */
const GAP = 45_000;
/** Minimum holding period before the bot will exit a position. */
const HOLD_MS = 9 * 60_000;
const MAX_TICKS = 6_000;

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

function tickKind(id: number) {
  return CYCLE[((id % CYCLE.length) + CYCLE.length) % CYCLE.length] as EventKind;
}

export type SeriesPoint = { t: string; value: number; cost: number };
export type Range = "7D" | "30D" | "3M" | "1Y" | "ALL";

type Sim = {
  cash: number;
  held: Position[];
  sold: Position[];
  events: BotEvent[];
  realized: number;
  wins: number;
  losses: number;
  timeline: { at: number; value: number; cost: number; equity: number }[];
  scanned: number;
};

/** Replay the engine from t=0 to the current runtime with the funded capital. */
function simulate(tMs: number, capital: number, now: number): Sim {
  const sim: Sim = {
    cash: capital,
    held: [],
    sold: [],
    events: [],
    realized: 0,
    wins: 0,
    losses: 0,
    timeline: [],
    scanned: 0,
  };
  if (capital <= 0) return sim;

  const ticks = Math.min(MAX_TICKS, Math.floor(tMs / GAP));
  const push = (e: Omit<BotEvent, "ageMs" | "at">, atRuntime: number) => {
    const ageMs = Math.max(0, tMs - atRuntime);
    sim.events.push({ ...e, ageMs, at: now - ageMs });
  };

  for (let id = 0; id <= ticks; id++) {
    const at = id * GAP;
    const kind = tickKind(id);
    const domain = domainName(id + 4000);

    if (kind === "scan") {
      const n = 900 + Math.floor(rnd(id, 33) * 2_600);
      sim.scanned += n;
      push({ id, kind, title: `Scanned ${n.toLocaleString()} expiring domains`, detail: "Market sweep completed" }, at);
    } else if (kind === "found") {
      push({ id, kind, title: `Found ${2 + Math.floor(rnd(id, 34) * 9)} candidates worth valuing`, detail: "Queued for valuation" }, at);
    } else if (kind === "evaluate") {
      push({
        id, kind,
        title: `Evaluating ${domain}`,
        detail: rnd(id, 35) > 0.5 ? "Strong keyword demand detected" : "Comparable sales look favourable",
      }, at);
    } else if (kind === "purchase") {
      const budget = Math.min(capital * 0.12, sim.cash * 0.35, 500);
      const cost = Math.round(Math.max(12, budget * (0.45 + rnd(id, 31) * 0.55)));
      if (cost > 0 && sim.cash >= cost) {
        sim.cash -= cost;
        const est = Math.round(cost * (1.35 + rnd(id, 41) * 1.6));
        sim.held.push({
          index: id,
          domain,
          category: categoryFor(id + 4000),
          cost,
          baseValue: est,
          ageMs: Math.max(0, tMs - at),
          atMs: at,
          soldAtMs: null,
          salePrice: 0,
          status: "Holding",
          listPrice: null,
          offers: 0,
          daysListed: 0,
        });
        push({
          id, kind, amount: cost,
          title: `Purchased ${domain} for $${cost.toLocaleString()}`,
          detail: `Flip score: ${80 + Math.floor(rnd(id, 36) * 16)}`,
        }, at);
      } else {
        push({ id, kind: "scan", title: "Skipped acquisition — insufficient available capital", detail: "Waiting for a sale or deposit" }, at);
      }
    } else if (kind === "list") {
      const target = sim.held.find((p) => p.status === "Holding" && at - p.atMs >= GAP);
      if (target) {
        target.status = "Listed";
        target.listPrice = roundPrice(target.baseValue * (0.95 + rnd(id, 37) * 0.35));
        push({
          id, kind, amount: target.listPrice,
          title: `Listed ${target.domain} for $${target.listPrice.toLocaleString()}`,
          detail: "Published to marketplace network",
        }, at);
      }
    } else if (kind === "offer") {
      const target = sim.held.find((p) => p.status === "Listed");
      if (target) {
        target.offers += 1;
        const amount = roundPrice((target.listPrice ?? target.baseValue) * (0.55 + rnd(id, 38) * 0.4));
        push({
          id, kind, amount,
          title: `Received offer on ${target.domain}`,
          detail: `Buyer offered $${amount.toLocaleString()}`,
        }, at);
      }
    } else if (kind === "sale") {
      const idx = sim.held.findIndex((p) => at - p.atMs >= HOLD_MS);
      if (idx >= 0) {
        const pos = sim.held.splice(idx, 1)[0] as Position;
        const win = rnd(id, 39) > 0.34;
        const mult = win ? 1.15 + rnd(id, 40) * 1.2 : 0.4 + rnd(id, 40) * 0.5;
        const proceeds = Math.max(5, Math.round(pos.cost * mult));
        const pnl = proceeds - pos.cost;
        sim.cash += proceeds;
        sim.realized += pnl;
        if (pnl >= 0) sim.wins += 1;
        else sim.losses += 1;
        sim.sold.push({
          ...pos,
          status: "Sold",
          salePrice: proceeds,
          soldAtMs: at,
          ageMs: Math.max(0, tMs - at),
        });
        push({
          id, kind, amount: proceeds,
          title: `Sold ${pos.domain} for $${proceeds.toLocaleString()} (${pnl >= 0 ? "+" : "−"}$${Math.abs(pnl).toLocaleString()})`,
          detail: "Proceeds credited to the bot wallet",
        }, at);
      }
    }

    // Sample the equity curve every few ticks, anchored to the hourly growth target.
    if (id % 3 === 0 || id === ticks) {
      const cost = sim.held.reduce((s, p) => s + p.cost, 0);
      const value = sim.held.reduce((s, p) => s + p.baseValue, 0);
      const target = targetEquity(capital, at, id);
      const adj = sim.held.length ? target - (sim.cash + value) : 0;
      sim.timeline.push({ at, value: value + adj, cost, equity: sim.cash + value + adj });
    }
  }

  // Age the open book, then mark it to the target equity curve (~33%/hour).
  for (const p of sim.held) {
    p.ageMs = Math.max(0, tMs - p.atMs);
    p.daysListed = p.status === "Listed" ? Math.max(0, Math.floor(p.ageMs / 60_000)) : 0;
  }
  const bookValue = sim.held.reduce((s, p) => s + p.baseValue, 0);
  if (bookValue > 0) {
    const target = targetEquity(capital, tMs, ticks + 1);
    const wanted = Math.max(bookValue * 0.6, target - sim.cash);
    const scale = wanted / bookValue;
    for (const p of sim.held) p.baseValue = Math.max(1, Math.round(p.baseValue * scale));
  }
  sim.events.reverse();
  return sim;
}

/** Hourly growth rate of the bot portfolio (33% of capital per hour), with small natural wobble. */
const HOURLY_RATE = 0.33;
function targetEquity(capital: number, atMs: number, seed: number): number {
  const hours = atMs / 3_600_000;
  const wobble = 1 + (Math.sin(seed * 0.7) * 0.004 + (rnd(seed, 55) - 0.5) * 0.006) * Math.min(1, hours * 4);
  return capital * (1 + HOURLY_RATE * hours) * wobble;

}

/* -------------------------------------------------------------- snapshot -- */

export type BotSnapshot = {
  running: boolean;
  funded: boolean;
  runtimeMs: number;
  /** Available USDC. Never negative. */
  balance: number;
  deposited: number;
  withdrawn: number;
  /** Capital currently locked in domains. */
  deployed: number;
  portfolioValue: number;
  /** Cash + estimated value of open positions. */
  equity: number;
  unrealized: number;
  realized: number;
  todayPnl: number;
  roi: number;
  trades: number;
  wins: number;
  losses: number;
  acquired: number;
  domains: number;
  positions: Position[];
  open: Position[];
  sold: Position[];
  listed: Position[];
  events: BotEvent[];
  transactions: Txn[];
  scanned: number;
  series: SeriesPoint[];
  seriesFor: (range: Range) => SeriesPoint[];
  /** Legacy aliases used by secondary screens. */
  cost: number;
  estValue: number;
  activity: { text: string; atMs: number; kind: "buy" | "sale" | "scan" | "list" }[];
};

const RANGE_SPAN: Record<Range, number> = {
  "7D": 0.15,
  "30D": 0.35,
  "3M": 0.6,
  "1Y": 0.85,
  ALL: 1,
};

function buildSeries(sim: Sim, tMs: number, range: Range): SeriesPoint[] {
  if (sim.timeline.length === 0) return [];
  const from = tMs * (1 - RANGE_SPAN[range]);
  const pts = sim.timeline.filter((p) => p.at >= from);
  const source = pts.length >= 2 ? pts : sim.timeline;
  const max = 40;
  const step = Math.max(1, Math.ceil(source.length / max));
  const out: SeriesPoint[] = [];
  for (let i = 0; i < source.length; i += step) {
    const p = source[i]!;
    out.push({ t: shortRuntime(p.at), value: Math.round(p.equity), cost: Math.round(p.cost) });
  }
  const last = source[source.length - 1]!;
  const tail = out[out.length - 1];
  if (!tail || tail.t !== shortRuntime(last.at)) {
    out.push({ t: shortRuntime(last.at), value: Math.round(last.equity), cost: Math.round(last.cost) });
  }
  return out;
}

function shortRuntime(ms: number) {
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h${String(m % 60).padStart(2, "0")}`;
}

export function snapshot(state: BotState): BotSnapshot {
  const t = runtimeMs(state);
  const now = Date.now();

  const deposited = state.txns
    .filter((x) => x.kind === "Deposit" && x.status === "Completed")
    .reduce((s, x) => s + x.amount, 0);
  const withdrawn = state.txns.filter((x) => x.kind === "Withdrawal").reduce((s, x) => s + x.amount, 0);
  const capital = Math.max(0, deposited - withdrawn);

  const sim = simulate(t, capital, now);

  const deployed = sim.held.reduce((s, p) => s + p.cost, 0);
  const portfolioValue = sim.held.reduce((s, p) => s + p.baseValue, 0);
  const balance = Math.max(0, Math.round(sim.cash));
  const unrealized = portfolioValue - deployed;
  const equity = balance + portfolioValue;

  const dayAgo = Math.max(0, t - 86_400_000);
  const past = [...sim.timeline].reverse().find((p) => p.at <= dayAgo);
  const todayPnl = past ? Math.round(equity - (past.equity + 0)) : Math.round(equity - capital);

  const sold = [...sim.sold].sort((a, b) => (b.soldAtMs ?? 0) - (a.soldAtMs ?? 0));
  const held = [...sim.held].sort((a, b) => b.atMs - a.atMs);

  return {
    running: state.running,
    funded: capital > 0,
    runtimeMs: t,
    balance,
    deposited,
    withdrawn,
    deployed,
    portfolioValue,
    equity,
    unrealized,
    realized: sim.realized,
    todayPnl,
    roi: deployed > 0 ? Math.round((unrealized / deployed) * 1000) / 10 : 0,
    trades: sold.length,
    wins: sim.wins,
    losses: sim.losses,
    acquired: held.length + sold.length,
    domains: held.length,
    positions: held,
    open: held.filter((p) => p.status === "Holding"),
    listed: held.filter((p) => p.status === "Listed"),
    sold,
    events: sim.events.slice(0, 80),
    transactions: [...state.txns].sort((a, b) => b.at - a.at),
    scanned: sim.scanned,
    series: buildSeries(sim, t, "ALL"),
    seriesFor: (range: Range) => buildSeries(sim, t, range),
    cost: deployed,
    estValue: portfolioValue,
    activity: sim.events.slice(0, 8).map((e) => ({
      text: e.title,
      atMs: e.at,
      kind: e.kind === "purchase" ? "buy" : e.kind === "sale" ? "sale" : e.kind === "list" ? "list" : "scan",
    })),
  };
}

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
  return {
    running: false,
    funded: false,
    runtimeMs: 0,
    balance: 0,
    deposited: 0,
    withdrawn: 0,
    deployed: 0,
    portfolioValue: 0,
    equity: 0,
    unrealized: 0,
    realized: 0,
    todayPnl: 0,
    roi: 0,
    trades: 0,
    wins: 0,
    losses: 0,
    acquired: 0,
    domains: 0,
    positions: [],
    open: [],
    sold: [],
    listed: [],
    events: [],
    transactions: [],
    scanned: 0,
    series: [],
    seriesFor: () => [],
    cost: 0,
    estValue: 0,
    activity: [],
  };
}

export function useBot() {
  const { session } = useAuth();
  const [state, setState] = useState<BotState>(EMPTY);
  const [, force] = useState(0);
  const uid = session?.user.id ?? null;

  useEffect(() => {
    if (boundFor === uid) return;
    boundFor = uid;
    void bindUser(uid);
  }, [uid]);

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
    if (cur.running || !currentUser) return;
    const s = snapshot(cur);
    if (!s.funded) return;
    write({ ...cur, running: true, startedAt: Date.now() });
  }, []);

  const pause = useCallback(() => {
    const cur = read();
    if (!cur.running) return;
    write({ ...cur, running: false, startedAt: null, elapsedMs: runtimeMs(cur) });
  }, []);

  const reset = useCallback(() => write({ ...EMPTY }), []);

  const toggle = useCallback((on: boolean) => (on ? start() : pause()), [start, pause]);

  /** Credit a confirmed deposit or record a withdrawal. */
  const recordTxn = useCallback((kind: Txn["kind"], amount: number) => {
    const cur = read();
    const now = Date.now();
    const txn: Txn = {
      id: `${kind === "Deposit" ? "DEP" : "WDL"}-${now.toString(36).toUpperCase()}`,
      at: now,
      kind,
      amount: Math.round(amount),
      status: kind === "Deposit" ? "Pending" : "Completed",
      ...(kind === "Deposit" ? { creditAt: now + DEPOSIT_HOLD_MS } : {}),
    };
    write({ ...cur, txns: [...cur.txns, txn] });
  }, []);

  // Finalize pending deposits once their 5-minute hold elapses.
  useEffect(() => {
    const finalize = () => {
      const cur = read();
      const now = Date.now();
      if (!cur.txns.some((x) => x.status === "Pending" && (x.creditAt ?? 0) <= now)) return;
      write({
        ...cur,
        txns: cur.txns.map((x) =>
          x.status === "Pending" && (x.creditAt ?? 0) <= now
            ? { ...x, status: "Completed" as const }
            : x,
        ),
      });
    };
    finalize();
    const id = window.setInterval(finalize, 1000);
    return () => window.clearInterval(id);
  }, []);

  const deposit = useCallback((amount: number) => recordTxn("Deposit", amount), [recordTxn]);
  const withdraw = useCallback((amount: number) => recordTxn("Withdrawal", amount), [recordTxn]);

  const signedIn = Boolean(session);
  const effective: BotState = signedIn ? state : { ...EMPTY };

  return {
    state: effective,
    snapshot: signedIn ? snapshot(state) : zeroSnapshot(),
    start,
    pause,
    reset,
    toggle,
    deposit,
    withdraw,
    /** Legacy alias: positive credits, negative debits. */
    adjustCash: (delta: number) => (delta >= 0 ? deposit(delta) : withdraw(-delta)),
  };
}
