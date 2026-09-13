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
    </div>
  );
}
