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
import { Cell, DataTable, Metric, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { money } from "@/data/mock";
import { formatRuntime, timeAgo, useBot } from "@/lib/bot";

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

const shades = ["var(--color-primary)", "var(--color-success)", "var(--color-border-strong)", "var(--color-muted-foreground)", "var(--color-secondary)"];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--color-foreground)",
};

function Analytics() {
  const { snapshot: bot } = useBot();
  const cost = bot.cost;
  const value = bot.estValue;

  const capital = Math.max(0, bot.deposited - bot.withdrawn);
  const totalProfit = Math.round(bot.equity - capital);
  const revenue = bot.sold.reduce((sum, p) => sum + (p.salePrice ?? 0), 0);
  const roi = capital > 0 ? Math.round((totalProfit / capital) * 1000) / 10 : 0;
  const trades = [
    ...bot.positions.map((p) => ({ id: `BUY-${p.index}`, at: p.atMs, kind: "Purchase", domain: p.domain, amount: -p.cost })),
    ...bot.sold.flatMap((p) => [
      { id: `BUY-${p.index}`, at: p.atMs, kind: "Purchase", domain: p.domain, amount: -p.cost },
      { id: `SELL-${p.index}`, at: p.soldAtMs ?? p.atMs, kind: "Sale", domain: p.domain, amount: p.salePrice ?? 0 },
    ]),
  ].sort((a, b) => b.at - a.at).slice(0, 15);

  const buckets = 6;
  const acquisitions = Array.from({ length: buckets }, (_, i) => {
    const from = (bot.runtimeMs * i) / buckets;
    const to = (bot.runtimeMs * (i + 1)) / buckets;
    return {
      m: `P${i + 1}`,
      n: bot.positions.filter((p) => p.atMs > from && p.atMs <= to).length,
    };
  });

  const byCategory = bot.positions.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + p.cost;
    return acc;
  }, {});
  const allocation = Object.entries(byCategory).map(([name, v]) => ({
    name,
    value: cost ? Math.round((v / cost) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle={
          !bot.funded
            ? "Deposit funds and start the bot — analytics build from its live activity."
            : bot.running
              ? `Live · updating with bot activity · runtime ${formatRuntime(bot.runtimeMs)}`
              : `Paused · bot stopped at ${formatRuntime(bot.runtimeMs)} runtime`
        }
        right={<Tag tone={bot.running ? "success" : "default"}>{bot.running ? "Live" : "Paused"}</Tag>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Domains scanned" value={bot.scanned.toLocaleString()} />
        <Metric label="Domains purchased" value={String(bot.acquired)} tone="primary" />
        <Metric label="Domains sold" value={String(bot.sold.length)} delta={`${bot.wins} wins · ${bot.losses} losses`} />
        <Metric label="Active trades" value={String(bot.domains)} delta={`${bot.listed.length} listed`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total profit" value={`${totalProfit >= 0 ? "+" : ""}${money(totalProfit)}`} tone={totalProfit > 0 ? "success" : "default"} delta={`${money(bot.realized)} realized`} />
        <Metric label="Revenue from sales" value={money(revenue)} />
        <Metric label="ROI on capital" value={`${roi}%`} tone={roi > 0 ? "success" : "default"} />
        <Metric label="Portfolio value" value={money(value)} delta={`${money(cost)} invested`} />
      </div>

      <Panel title="Portfolio value vs cost basis">
        <div className="h-[300px] px-2 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bot.series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
        <Panel title="Acquisitions over runtime">
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

      <Panel title="Trade history" action={<span className="text-xs text-muted-foreground">{bot.running ? "Updating live" : "Paused"}</span>}>
        {trades.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">No trades yet. Start the bot to begin recording activity.</p>
        ) : (
          <DataTable head={["When", "Type", "Domain", "Amount"]}>
            {trades.map((t) => (
              <Row key={t.id}>
                <Cell className="tabular text-muted-foreground">{timeAgo(Math.max(0, bot.runtimeMs - t.at))}</Cell>
                <Cell><Tag tone={t.kind === "Sale" ? "success" : "default"}>{t.kind}</Tag></Cell>
                <Cell className="font-medium">{t.domain}</Cell>
                <Cell align="right" className="tabular">{t.amount >= 0 ? "+" : "−"}{money(Math.abs(t.amount))}</Cell>
              </Row>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
