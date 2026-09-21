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
import {
  ArrowUpRight,
  Bell,
  Pause,
  Play,
  Radar,
  Tag as TagIcon,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Score, Tag } from "@/components/flip/kit";
import { DepositDialog } from "@/components/flip/DepositDialog";
import { WithdrawDialog } from "@/components/flip/WithdrawDialog";
import { EditableMetric } from "@/components/flip/customizable";
import { money, opportunities } from "@/data/mock";
import { timeAgo, useBot, type Range } from "@/lib/bot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flipmain" },
      { name: "description", content: "Your domain portfolio at a glance: balance, positions, P&L and AI-ranked opportunities." },
      { property: "og:title", content: "Dashboard — Flipmain" },
      { property: "og:description", content: "Your domain portfolio at a glance." },
    ],
  }),
  component: Dashboard,
});

const ranges: Range[] = ["7D", "30D", "3M", "1Y", "ALL"];

const icons = {
  purchase: ShoppingCart,
  sale: TagIcon,
  offer: Bell,
  scan: Radar,
  found: Radar,
  evaluate: Radar,
  list: TagIcon,
};

function Dashboard() {
  const [range, setRange] = useState<Range>("ALL");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { snapshot: bot, start, pause } = useBot();
  const top = opportunities.slice(0, 5);

  const series = bot.seriesFor(range);
  const totalPnl = bot.realized + bot.unrealized;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning"
        subtitle={
          !bot.funded
            ? "Your account is empty. Add funds to give the bot operating capital."
            : bot.running
              ? `Autopilot running · ${bot.scanned.toLocaleString()} domains scanned`
              : "Autopilot is idle. Start the bot to begin scanning and acquiring."
        }
        right={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-2.5">
              <div>
                <p className="label-xs">USDC Balance</p>
                <p className="text-lg font-semibold tabular">{money(bot.balance)}</p>
              </div>
              <Btn variant="primary" onClick={() => setDepositOpen(true)}>
                Deposit
              </Btn>
              <Btn variant="secondary" disabled={bot.balance <= 0} onClick={() => setWithdrawOpen(true)}>
                Withdraw
              </Btn>
            </div>
            <Btn
              variant={bot.running ? "secondary" : "primary"}
              disabled={!bot.funded}
              onClick={() => (bot.running ? pause() : start())}
            >
              {bot.running ? (
                <span className="inline-flex items-center gap-1.5">
                  <Pause className="h-3.5 w-3.5" /> Stop bot
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
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        available={bot.balance}
      />

      {!bot.funded ? (
        <div className="flex flex-col gap-4 rounded-md border border-primary/25 bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-foreground">Add Funds to Operate Bot</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Deposit USDC or SOL on Solana. Your deposit becomes the bot portfolio it trades with.
              </p>
            </div>
          </div>
          <Btn variant="primary" onClick={() => setDepositOpen(true)}>
            Add funds
          </Btn>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <EditableMetric
          id="dashboard.balance"
          label="Available balance"
          value={money(bot.balance)}
          delta={bot.funded ? `${money(bot.deposited)} deposited` : "No deposits yet"}
        />
        <EditableMetric
          id="dashboard.portfolio"
          label="Portfolio value"
          value={money(bot.portfolioValue)}
          delta={`${bot.domains} open position${bot.domains === 1 ? "" : "s"}`}
        />
        <EditableMetric
          id="dashboard.pnl"
          label="Total P&L"
          value={`${totalPnl > 0 ? "+" : ""}${money(totalPnl)}`}
          tone={totalPnl > 0 ? "success" : "default"}
          delta={`${money(bot.realized)} realized`}
        />
        <EditableMetric
          id="dashboard.todaypnl"
          label="Today's P&L"
          value={`${bot.todayPnl > 0 ? "+" : ""}${money(bot.todayPnl)}`}
          tone={bot.todayPnl > 0 ? "success" : "default"}
          delta={bot.deployed ? `${bot.roi}% unrealized return` : "No capital deployed"}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total trades" value={String(bot.trades)} />
        <Metric label="Winning trades" value={String(bot.wins)} tone={bot.wins ? "success" : "default"} />
        <Metric label="Losing trades" value={String(bot.losses)} />
        <Metric label="Capital deployed" value={money(bot.deployed)} />
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
        {series.length < 2 ? (
          <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-[13px] text-muted-foreground">
              No performance history yet.
            </p>
            <p className="text-xs text-muted-foreground">
              {bot.funded
                ? "Start the bot — the curve builds as positions are opened and closed."
                : "Deposit funds and start the bot to begin tracking performance."}
            </p>
          </div>
        ) : (
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
                  formatter={(v: number, n) => [money(v), n === "value" ? "Account equity" : "Cost basis"]}
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

        <Panel
          title="AI Activity"
          action={
            <span className="text-xs text-muted-foreground">Live actions from your autopilot</span>
          }
        >
          {bot.events.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px] text-muted-foreground">
                {!bot.funded
                  ? "No activity yet. Add funds to start the bot."
                  : bot.running
                    ? "Scanning the drop lists…"
                    : "No activity yet. Start the bot to begin."}
              </p>
              {bot.funded && !bot.running ? (
                <Btn variant="primary" size="sm" className="mt-3" onClick={start}>
                  Start bot
                </Btn>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {bot.events.slice(0, 8).map((a) => {
                const Icon = icons[a.kind] ?? Radar;
                return (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-5 text-foreground">{a.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(a.ageMs)}</p>
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
