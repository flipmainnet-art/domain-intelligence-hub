export type Opportunity = {
  domain: string;
  price: number;
  estLow: number;
  estHigh: number;
  score: number;
  category: string;
  reason: string;
  tld: string;
  auction?: boolean;
};

export const opportunities: Opportunity[] = [
  { domain: "NovaLedger.com", price: 42, estLow: 1200, estHigh: 3500, score: 94, category: "Fintech", reason: "Strong fintech brand", tld: ".com" },
  { domain: "OrbitalAI.com", price: 75, estLow: 1400, estHigh: 2400, score: 91, category: "AI", reason: "Two high-demand keywords", tld: ".com" },
  { domain: "VantaFlow.com", price: 29, estLow: 620, estHigh: 850, score: 87, category: "SaaS", reason: "Brandable SaaS pattern", tld: ".com" },
  { domain: "Cedarbase.io", price: 61, estLow: 900, estHigh: 1800, score: 85, category: "Infrastructure", reason: "Clean infra naming", tld: ".io" },
  { domain: "Pulsegrid.ai", price: 120, estLow: 1900, estHigh: 4100, score: 89, category: "AI", reason: "Energy + AI crossover", tld: ".ai" },
  { domain: "Harborpay.com", price: 210, estLow: 3200, estHigh: 7400, score: 92, category: "Fintech", reason: "Payments keyword, short", tld: ".com" },
  { domain: "Quantfold.com", price: 38, estLow: 540, estHigh: 1400, score: 81, category: "Data", reason: "Quant-adjacent, pronounceable", tld: ".com" },
  { domain: "Lumenstack.io", price: 54, estLow: 700, estHigh: 1600, score: 78, category: "SaaS", reason: "Dev-tool naming convention", tld: ".io" },
  { domain: "Northvault.com", price: 340, estLow: 4200, estHigh: 9000, score: 93, category: "Fintech", reason: "Trust-signal brandable", tld: ".com" },
  { domain: "Kernelbay.com", price: 47, estLow: 480, estHigh: 1200, score: 74, category: "Technology", reason: "Compound tech brand", tld: ".com" },
  { domain: "Atlasrail.com", price: 88, estLow: 1100, estHigh: 2600, score: 83, category: "Logistics", reason: "Industrial + memorable", tld: ".com" },
  { domain: "Signalcrest.ai", price: 96, estLow: 1300, estHigh: 2900, score: 86, category: "AI", reason: "Analyst-tool naming", tld: ".ai" },
];

export const roi = (o: Opportunity) => Math.round((((o.estLow + o.estHigh) / 2 - o.price) / o.price) * 100);

export type Auction = {
  domain: string;
  bid: number;
  endsInSec: number;
  estLow: number;
  estHigh: number;
  score: number;
  bids: number;
};

export const auctions: Auction[] = [
  { domain: "QuantumLedger.com", bid: 38, endsInSec: 8040, estLow: 1200, estHigh: 3500, score: 94, bids: 12 },
  { domain: "Bridgewell.com", bid: 420, endsInSec: 1875, estLow: 3800, estHigh: 8200, score: 90, bids: 31 },
  { domain: "Coreframe.io", bid: 65, endsInSec: 26400, estLow: 700, estHigh: 1900, score: 82, bids: 7 },
  { domain: "Provenmint.com", bid: 145, endsInSec: 54210, estLow: 1600, estHigh: 3400, score: 88, bids: 19 },
  { domain: "Halcyonlabs.com", bid: 92, endsInSec: 3320, estLow: 900, estHigh: 2100, score: 79, bids: 5 },
  { domain: "Fieldnote.ai", bid: 250, endsInSec: 121000, estLow: 2200, estHigh: 5100, score: 91, bids: 24 },
];

export type Holding = {
  domain: string;
  acquired: string;
  cost: number;
  estValue: number;
  status: "Owned" | "Listed" | "Offer Received" | "Sold";
  listPrice: number | null;
};

export const holdings: Holding[] = [
  { domain: "NovaLedger.com", acquired: "2026-08-14", cost: 42, estValue: 1800, status: "Listed", listPrice: 2450 },
  { domain: "OrbitalAI.com", acquired: "2026-08-02", cost: 75, estValue: 2400, status: "Offer Received", listPrice: 2900 },
  { domain: "VantaFlow.com", acquired: "2026-07-28", cost: 29, estValue: 850, status: "Owned", listPrice: null },
  { domain: "Cedarbase.io", acquired: "2026-07-19", cost: 61, estValue: 1150, status: "Listed", listPrice: 1400 },
  { domain: "Harborpay.com", acquired: "2026-06-30", cost: 210, estValue: 4600, status: "Owned", listPrice: null },
  { domain: "Quantfold.com", acquired: "2026-06-11", cost: 38, estValue: 760, status: "Sold", listPrice: 980 },
  { domain: "Lumenstack.io", acquired: "2026-05-27", cost: 54, estValue: 980, status: "Owned", listPrice: null },
  { domain: "Atlasrail.com", acquired: "2026-05-08", cost: 88, estValue: 1750, status: "Listed", listPrice: 2100 },
];

export const perfSeries = [
  { t: "Feb", value: 1240, cost: 1240 },
  { t: "Mar", value: 1980, cost: 1310 },
  { t: "Apr", value: 2640, cost: 1380 },
  { t: "May", value: 3120, cost: 1420 },
  { t: "Jun", value: 4310, cost: 1510 },
  { t: "Jul", value: 5480, cost: 1610 },
  { t: "Aug", value: 6720, cost: 1720 },
  { t: "Sep", value: 7850, cost: 1840 },
];

export const activity = [
  { text: "Acquired NovaLedger.com for $42", time: "12m ago", kind: "buy" as const },
  { text: "Price alert triggered for OrbitalAI.com", time: "1h ago", kind: "alert" as const },
  { text: "New offer received for VantaFlow.com", time: "3h ago", kind: "offer" as const },
  { text: "Flipmain discovered 1,248 new domains", time: "6h ago", kind: "scan" as const },
  { text: "Listed Atlasrail.com at $2,100", time: "Yesterday", kind: "list" as const },
];

export const comparableSales = [
  { domain: "CoreLedger.com", price: 12500, date: "Mar 2026", venue: "Sedo" },
  { domain: "NovaPay.com", price: 8900, date: "Jan 2026", venue: "Afternic" },
  { domain: "LedgerStack.com", price: 4200, date: "Nov 2025", venue: "Dan" },
  { domain: "NovaVault.com", price: 3100, date: "Sep 2025", venue: "Sedo" },
  { domain: "FinLedger.com", price: 2750, date: "Aug 2025", venue: "Dan" },
];

export const walletTx = [
  { date: "2026-08-27", type: "Domain purchase", amount: -42, status: "Completed" },
  { date: "2026-08-24", type: "Deposit", amount: 500, status: "Completed" },
  { date: "2026-08-19", type: "Domain sale", amount: 980, status: "Completed" },
  { date: "2026-08-11", type: "Domain purchase", amount: -75, status: "Completed" },
  { date: "2026-08-04", type: "Withdrawal", amount: -250, status: "Pending" },
  { date: "2026-07-30", type: "Deposit", amount: 750, status: "Completed" },
];

export const money = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export const slugify = (domain: string) => domain.toLowerCase();

/* ---------------------------------------------------------------
   Scanned domain universe — deterministic demo dataset (500 names)
   Used by the AI Insights page.
---------------------------------------------------------------- */

export type ScannedDomain = {
  domain: string;
  price: number;
  estLow: number;
  estHigh: number;
  score: number;
  category: string;
  tld: string;
  signal: "Rising" | "Stable" | "Cooling";
  reason: string;
};

const HEADS = [
  "Nova", "Orbit", "Vanta", "Cedar", "Pulse", "Harbor", "Quant", "Lumen", "North", "Kernel",
  "Atlas", "Signal", "Bright", "Iron", "Solar", "Vector", "Ember", "Cobalt", "Juniper", "Aster",
  "Halcyon", "Prime", "Summit", "Delta", "Onyx", "Zephyr", "Terra", "Lyra", "Helio", "Meridian",
  "Copper", "Arbor", "Basalt", "Crest", "Drift", "Echo", "Flint", "Granite", "Haven", "Indigo",
  "Kite", "Loom", "Mica", "Nimbus", "Opal", "Pioneer", "Quarry", "Ridge", "Slate", "Tundra",
];
const TAILS = [
  "ledger", "flow", "base", "grid", "pay", "fold", "stack", "vault", "bay", "rail",
  "crest", "labs", "works", "core", "mint", "loop", "wave", "forge", "port", "scale",
  "sync", "hub", "byte", "link", "point", "frame", "edge", "path", "gate", "bloom",
];
const TLDS = [".com", ".com", ".com", ".io", ".ai", ".co"];
const CATEGORIES = ["Fintech", "AI", "SaaS", "Infrastructure", "Data", "Technology", "Logistics", "Health", "Crypto", "Brandable"];
const REASONS = [
  "Two high-demand keywords with clean pronunciation",
  "Short, trust-signal brandable in a premium category",
  "Matches current dev-tool naming conventions",
  "Comparable sales cluster 8-14x above ask",
  "Keyword search volume rising quarter over quarter",
  "Category scarcity — few clean alternatives left",
  "Strong end-user buyer pool identified",
  "Renewal-driven drop pricing below fair value",
];

function hash(n: number, salt: number) {
  const x = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const scannedDomains: ScannedDomain[] = Array.from({ length: 500 }, (_, i) => {
  const head = HEADS[i % HEADS.length]!;
  const tail = TAILS[(i * 7 + Math.floor(i / HEADS.length)) % TAILS.length]!;
  const tld = TLDS[Math.floor(hash(i, 1) * TLDS.length)]!;
  const score = 62 + Math.floor(hash(i, 2) * 37);
  const price = Math.round(18 + hash(i, 3) * 480);
  const mult = 6 + hash(i, 4) * 26 + (score - 62) * 0.4;
  const estLow = Math.round(price * mult);
  const estHigh = Math.round(estLow * (1.3 + hash(i, 5) * 1.1));
  const sig = hash(i, 6);
  return {
    domain: `${head}${tail}${tld}`,
    price,
    estLow,
    estHigh,
    score,
    category: CATEGORIES[Math.floor(hash(i, 7) * CATEGORIES.length)]!,
    tld,
    signal: sig > 0.62 ? "Rising" : sig > 0.2 ? "Stable" : "Cooling",
    reason: REASONS[Math.floor(hash(i, 8) * REASONS.length)]!,
  };
});

export const scanRoi = (d: ScannedDomain) =>
  Math.round((((d.estLow + d.estHigh) / 2 - d.price) / d.price) * 100);
