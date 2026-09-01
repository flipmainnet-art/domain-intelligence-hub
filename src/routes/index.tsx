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
import { ArrowUpRight, Bell, Pause, Play, Radar, Tag as TagIcon, ShoppingCart } from "lucide-react";
import { Btn, Cell, DataTable, PageHeader, Panel, Row, Score, Tag } from "@/components/flip/kit";
import { DepositDialog } from "@/components/flip/DepositDialog";
import { WithdrawDialog } from "@/components/flip/WithdrawDialog";
import { EditableMetric, EditableSeries, EditableText } from "@/components/flip/customizable";
import { money, opportunities } from "@/data/mock";
import { formatRuntime, useBot } from "@/lib/bot";

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
  sale: TagIcon,
  alert: Bell,
  scan: Radar,
  list: TagIcon,
};

function ago(atMs: number, nowMs: number) {
  const s = Math.max(0, Math.round((nowMs - atMs) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

function Dashboard() {
  const [range, setRange] = useState("3M");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { snapshot: bot, state, start, pause } = useBot();
  const top = opportunities.slice(0, 5);

  const balance = 0 + bot.sold.reduce((s, p) => s + p.salePrice, 0) - bot.cost;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning"
        subtitle={
          bot.running
            ? `Autopilot running · ${formatRuntime(bot.runtimeMs)} · ${bot.scanned.toLocaleString()} domains scanned`
            : "Autopilot is idle. Start the bot to begin scanning and acquiring."
        }
        right={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-2.5">
              <div>
                <p className="label-xs">USDC Balance</p>
                <p className="text-lg font-semibold tabular">
                  <EditableText
                    id="dashboard.balance"
                    initial={money(Math.round(balance))}
                    title="Edit USDC balance"
                  />
                </p>
              </div>
              <Btn variant="primary" onClick={() => setDepositOpen(true)}>
                Deposit
              </Btn>
            </div>
            <Btn
              variant={bot.running ? "secondary" : "primary"}
              onClick={() => (bot.running ? pause() : start())}
            >
              {bot.running ? (
                <span className="inline-flex items-center gap-1.5">
                  <Pause className="h-3.5 w-3.5" /> Pause bot
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5" /> Start bot
                </span>
              )}
            </Btn>
          </div>
        }
      />

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <EditableMetric
          id="dashboard.cost"
          label="Portfolio Cost"
          value={money(bot.cost)}
          delta={`${bot.positions.length} acquisitions`}
        />
        <EditableMetric
          id="dashboard.estvalue"
          label="Estimated Value"
          value={money(bot.estValue)}
          delta={bot.realized ? `${money(bot.realized)} realised` : "No sales yet"}
        />
        <EditableMetric
          id="dashboard.profit"
          label="Unrealized Profit"
          value={`${bot.unrealized >= 0 ? "+" : ""}${money(bot.unrealized)}`}
          tone={bot.unrealized > 0 ? "success" : "default"}
          delta={`${bot.roi}% return`}
        />
        <EditableMetric
          id="dashboard.domains"
          label="Domains"
          value={String(bot.domains)}
          delta={`${bot.sold.length} sold`}
        />
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
        <EditableSeries id="dashboard.perf" initial={bot.series}>
          {(series) => (
            <div className="h-[300px] px-2 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
                    tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
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
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="var(--muted-foreground)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="none"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </EditableSeries>
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
          {bot.activity.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px] text-muted-foreground">
                {state.running ? "Scanning the drop lists…" : "No activity yet."}
              </p>
              {!state.running ? (
                <Btn variant="primary" size="sm" className="mt-3" onClick={start}>
                  Start bot
                </Btn>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {bot.activity.map((a) => {
                const Icon = icons[a.kind] ?? Radar;
                return (
                  <li key={`${a.kind}-${a.atMs}-${a.text}`} className="flex items-start gap-3 px-5 py-3.5">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-5 text-foreground">{a.text}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{ago(a.atMs, bot.runtimeMs)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
