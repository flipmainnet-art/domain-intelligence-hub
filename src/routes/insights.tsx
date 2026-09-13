import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Btn, Cell, DataTable, Input, Metric, PageHeader, Panel, Row, Score, Select, Tag } from "@/components/flip/kit";
import { money, opportunities, roi, scanRoi, scannedDomains, slugify } from "@/data/mock";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — Flipmain" },
      { name: "description", content: "Market signals, trending keyword clusters and AI-generated theses on where domain value is moving." },
      { property: "og:title", content: "AI Insights — Flipmain" },
      { property: "og:description", content: "Market signals and AI theses on domain value." },
    ],
  }),
  component: Insights,
});

const themes = [
  { name: "Agentic AI tooling", change: "+38%", note: "Registrations for *agent, *flow and *ops brands accelerating." },
  { name: "Embedded payments", change: "+21%", note: "Fintech infra buyers paying premiums for trust-signal names." },
  { name: "Climate logistics", change: "+14%", note: "Freight and grid naming quietly appreciating on resale." },
  { name: "Consumer crypto", change: "-9%", note: "Cooling. Avoid speculative token-adjacent acquisitions." },
];

const briefs = [
  {
    title: "Fintech brandables remain the best risk-adjusted category",
    body: "Names combining a trust noun with a payments verb resold at a 46% median premium last quarter. Your Harborpay.com and Northvault.com exposure is well positioned; consider adding one more sub-$300 acquisition.",
  },
  {
    title: ".ai pricing has stabilized after Q1 correction",
    body: "Renewal-driven churn cleared the weakest inventory. Two-word .ai domains with a real English head noun are clearing faster than three-word coined names.",
  },
  {
    title: "Your portfolio is concentrated in SaaS-adjacent names",
    body: "62% of estimated value sits in SaaS and AI categories. Diversifying into logistics or healthcare naming would reduce correlated drawdown risk.",
  },
];

function Insights() {
  const top = [...opportunities].sort((a, b) => roi(b) - roi(a)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Insights"
        subtitle="What Flipmain's models are seeing across the domain market this week."
        right={<Btn variant="primary">Regenerate analysis</Btn>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Domains analyzed" value="1.24M" delta="Last 7 days" />
        <Metric label="Signals fired" value="318" delta="42 high-confidence" tone="primary" />
        <Metric label="Median category ROI" value="+64%" tone="success" />
        <Metric label="Model confidence" value="87" delta="Backtested on 9,400 sales" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Trending themes">
          <div className="divide-y divide-border/60">
            {themes.map((t) => (
              <div key={t.name} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-[13px] font-medium">{t.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.note}</p>
                </div>
                <Tag tone={t.change.startsWith("-") ? "danger" : "success"}>{t.change}</Tag>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Analyst briefs">
          <div className="divide-y divide-border/60">
            {briefs.map((b) => (
              <div key={b.title} className="px-5 py-3.5">
                <p className="flex items-start gap-2 text-[13px] font-medium">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {b.title}
                </p>
                <p className="mt-1 pl-5.5 text-xs leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Highest conviction opportunities"
        action={
          <Link to="/discover" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        }
      >
        <DataTable head={["Domain", "Category", "Price", "Est. Value", "ROI", "Flip Score", ""]}>
          {top.map((o) => (
            <Row key={o.domain}>
              <Cell>
                <Link to="/domain/$domain" params={{ domain: slugify(o.domain) }} className="font-medium hover:text-primary">
                  {o.domain}
                </Link>
              </Cell>
              <Cell className="text-muted-foreground">{o.category}</Cell>
              <Cell className="tabular">{money(o.price)}</Cell>
              <Cell className="tabular text-muted-foreground">
                {money(o.estLow)} – {money(o.estHigh)}
              </Cell>
              <Cell className="tabular text-success">+{roi(o)}%</Cell>
              <Cell>
                <Score value={o.score} />
              </Cell>
              <Cell align="right">
                <Btn size="sm" variant="primary">
                  Acquire
                </Btn>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </Panel>

      <ScanUniverse />
    </div>
  );
}

const PAGE = 25;
const CATS = ["All", "Fintech", "AI", "SaaS", "Infrastructure", "Data", "Technology", "Logistics", "Health", "Crypto", "Brandable"];

function ScanUniverse() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [tld, setTld] = useState("all");
  const [signal, setSignal] = useState("all");
  const [sort, setSort] = useState("score");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = scannedDomains.filter(
      (d) =>
        (needle === "" || d.domain.toLowerCase().includes(needle)) &&
        (cat === "All" || d.category === cat) &&
        (tld === "all" || d.tld === tld) &&
        (signal === "all" || d.signal === signal),
    );
    list = [...list];
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    if (sort === "roi") list.sort((a, b) => scanRoi(b) - scanRoi(a));
    if (sort === "price") list.sort((a, b) => a.price - b.price);
    if (sort === "value") list.sort((a, b) => b.estHigh - a.estHigh);
    return list;
  }, [q, cat, tld, signal, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE, current * PAGE + PAGE);
  const reset = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(0);
  };

  return (
    <Panel
      title={`Scanned domain universe — ${filtered.length.toLocaleString("en-US")} of ${scannedDomains.length} domains`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => reset(setQ)(e.target.value)}
            placeholder="Search domains…"
            className="h-8 w-44"
          />
          <Select value={cat} onChange={(e) => reset(setCat)(e.target.value)} className="h-8">
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All categories" : c}
              </option>
            ))}
          </Select>
          <Select value={tld} onChange={(e) => reset(setTld)(e.target.value)} className="h-8">
            <option value="all">All TLDs</option>
            <option value=".com">.com</option>
            <option value=".io">.io</option>
            <option value=".ai">.ai</option>
            <option value=".co">.co</option>
          </Select>
          <Select value={signal} onChange={(e) => reset(setSignal)(e.target.value)} className="h-8">
            <option value="all">All signals</option>
            <option value="Rising">Rising</option>
            <option value="Stable">Stable</option>
            <option value="Cooling">Cooling</option>
          </Select>
          <Select value={sort} onChange={(e) => reset(setSort)(e.target.value)} className="h-8">
            <option value="score">Flip Score</option>
            <option value="roi">Highest ROI</option>
            <option value="price">Lowest price</option>
            <option value="value">Highest est. value</option>
          </Select>
        </div>
      }
    >
      <DataTable head={["Domain", "Category", "Price", "Est. Value", "ROI", "Flip Score", "Signal", "AI reasoning", ""]}>
        {rows.map((d) => (
          <Row key={d.domain}>
            <Cell>
              <Link to="/domain/$domain" params={{ domain: slugify(d.domain) }} className="font-medium hover:text-primary">
                {d.domain}
              </Link>
            </Cell>
            <Cell className="text-muted-foreground">{d.category}</Cell>
            <Cell className="tabular">{money(d.price)}</Cell>
            <Cell className="tabular text-muted-foreground">
              {money(d.estLow)} – {money(d.estHigh)}
            </Cell>
            <Cell className="tabular text-success">+{scanRoi(d)}%</Cell>
            <Cell>
              <Score value={d.score} />
            </Cell>
            <Cell>
              <Tag tone={d.signal === "Rising" ? "success" : d.signal === "Cooling" ? "danger" : "default"}>{d.signal}</Tag>
            </Cell>
            <Cell className="max-w-[260px] truncate text-xs text-muted-foreground">{d.reason}</Cell>
            <Cell align="right">
              <Btn size="sm" variant="primary">
                Buy
              </Btn>
            </Cell>
          </Row>
        ))}
      </DataTable>

      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Page {current + 1} of {pages}
        </p>
        <div className="flex gap-2">
          <Btn size="sm" onClick={() => setPage(Math.max(0, current - 1))}>
            Previous
          </Btn>
          <Btn size="sm" onClick={() => setPage(Math.min(pages - 1, current + 1))}>
            Next
          </Btn>
        </div>
      </div>
    </Panel>
  );
}
