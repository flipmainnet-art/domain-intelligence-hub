import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell as RCell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Metric, PageHeader, Panel } from "@/components/flip/kit";
import { holdings, money, perfSeries } from "@/data/mock";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Flipmain" },
      { name: "description", content: "Portfolio performance, category allocation and realized returns across your domain investments." },
      { property: "og:title", content: "Analytics — Flipmain" },
      { property: "og:description", content: "Portfolio performance and allocation analytics." },
    ],
  }),
  component: Analytics,
});

const acquisitions = [
  { m: "Mar", n: 3 },
  { m: "Apr", n: 5 },
  { m: "May", n: 4 },
  { m: "Jun", n: 7 },
  { m: "Jul", n: 6 },
  { m: "Aug", n: 9 },
];

const allocation = [
  { name: "Fintech", value: 38 },
  { name: "AI", value: 26 },
  { name: "SaaS", value: 19 },
  { name: "Infrastructure", value: 10 },
  { name: "Other", value: 7 },
];

const shades = ["var(--color-primary)", "var(--color-success)", "var(--color-border-strong)", "var(--color-muted-foreground)", "var(--color-secondary)"];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--color-foreground)",
};

function Analytics() {
  const cost = holdings.reduce((s, h) => s + h.cost, 0);
  const value = holdings.reduce((s, h) => s + h.estValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="How your portfolio is compounding over time." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Portfolio value" value={money(value)} tone="primary" />
        <Metric label="Invested" value={money(cost)} />
        <Metric label="Net return" value={`+${Math.round(((value - cost) / cost) * 100)}%`} tone="success" />
        <Metric label="Realized P&L" value={money(942)} delta="1 domain sold" />
      </div>

      <Panel title="Portfolio value vs cost basis">
        <div className="h-[300px] px-2 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={perfSeries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="an-v" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} width={48} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fill="url(#an-v)" />
              <Area type="monotone" dataKey="cost" stroke="var(--color-border-strong)" strokeWidth={1.5} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Acquisitions per month">
          <div className="h-[260px] px-2 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acquisitions} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} width={32} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-elevated)" }} />
                <Bar dataKey="n" fill="var(--color-primary)" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Category allocation">
          <div className="flex flex-col items-center gap-4 px-5 py-4 sm:flex-row">
            <div className="h-[200px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
                    {allocation.map((a, i) => (
                      <RCell key={a.name} fill={shades[i % shades.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full space-y-2 sm:w-1/2">
              {allocation.map((a, i) => (
                <li key={a.name} className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-sm" style={{ background: shades[i % shades.length] }} />
                    {a.name}
                  </span>
                  <span className="tabular">{a.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}
