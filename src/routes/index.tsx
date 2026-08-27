import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Bell, Radar, Tag as TagIcon, ShoppingCart } from "lucide-react";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Score, Tag } from "@/components/flip/kit";
import { activity, money, opportunities, perfSeries } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flipmain" },
      { name: "description", content: "Your domain portfolio at a glance: value, profit and AI-ranked opportunities." },
      { property: "og:title", content: "Dashboard — Flipmain" },
      { property: "og:description", content: "Your domain portfolio at a glance." },
    ],
  }),
  component: Dashboard,
});

const ranges = ["7D", "30D", "3M", "1Y", "ALL"];

const icons = {
  buy: ShoppingCart,
  alert: Bell,
  offer: TagIcon,
  scan: Radar,
  list: TagIcon,
};

function Dashboard() {
  const [range, setRange] = useState("3M");
  const top = opportunities.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning"
        subtitle="Your domain portfolio at a glance."
        right={
          <div className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-2.5">
            <div>
              <p className="label-xs">USDC Balance</p>
              <p className="text-lg font-semibold tabular">$1,284.42</p>
            </div>
            <Btn variant="primary">Deposit</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Portfolio Cost" value="$1,240" delta="37 acquisitions" />
        <Metric label="Estimated Value" value="$7,850" delta="+18.4% vs last month" />
        <Metric label="Unrealized Profit" value="+$6,610" tone="success" delta="533% return" />
        <Metric label="Domains" value="37" delta="4 listed · 2 offers" />
      </div>

      <Panel
        title="Portfolio Performance"
        action={
          <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors duration-150 ${
                  range === r
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      >
        <div className="h-[300px] px-2 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={perfSeries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="t"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                cursor={{ stroke: "var(--border-strong)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--muted-foreground)" }}
                formatter={(v: number, n) => [money(v), n === "value" ? "Est. value" : "Cost basis"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={1.75}
                fill="url(#pv)"
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="var(--muted-foreground)"
                strokeWidth={1}
                strokeDasharray="3 3"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="AI Opportunities"
          action={
            <Link
              to="/discover"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors duration-150 hover:text-primary"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          <DataTable head={["Domain", "Asking Price", "Est. Value", "Flip Score", "Category", "Action"]}>
            {top.map((o) => (
              <Row key={o.domain}>
                <Cell>
                  <Link
                    to="/domain/$domain"
                    params={{ domain: o.domain }}
                    className="font-medium transition-colors duration-150 hover:text-primary"
                  >
                    {o.domain}
                  </Link>
                </Cell>
                <Cell className="tabular">{money(o.price)}</Cell>
                <Cell className="tabular text-muted-foreground">
                  {money(Math.round((o.estLow + o.estHigh) / 2))}
                </Cell>
                <Cell>
                  <Score value={o.score} />
                </Cell>
                <Cell>
                  <Tag>{o.category}</Tag>
                </Cell>
                <Cell align="right">
                  <Btn variant={o.score >= 90 ? "primary" : "secondary"} size="sm">
                    {o.score >= 90 ? "Buy" : "Watch"}
                  </Btn>
                </Cell>
              </Row>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Recent Activity">
          <ul className="divide-y divide-border/60">
            {activity.map((a) => {
              const Icon = icons[a.kind];
              return (
                <li key={a.text} className="flex items-start gap-3 px-5 py-3.5">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[13px] leading-5 text-foreground">{a.text}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
