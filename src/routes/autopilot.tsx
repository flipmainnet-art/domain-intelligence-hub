import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Cell, DataTable, Field, Input, Metric, PageHeader, Panel, Row, Select, Tag, Toggle } from "@/components/flip/kit";
import { money } from "@/data/mock";
import { DepositDialog } from "@/components/flip/DepositDialog";
import { formatRuntime, useBot } from "@/lib/bot";

export const Route = createFileRoute("/autopilot")({
  head: () => ({
    meta: [
      { title: "Autopilot — Flipmain" },
      { name: "description", content: "Set rules and budgets so Flipmain can acquire qualifying domains automatically on your behalf." },
      { property: "og:title", content: "Autopilot — Flipmain" },
      { property: "og:description", content: "Rule-based automated domain acquisition." },
    ],
  }),
  component: Autopilot,
});

function Autopilot() {
  const { snapshot: bot, toggle } = useBot();
  const [autoBid, setAutoBid] = useState(true);
  const [autoList, setAutoList] = useState(false);
  const [notify, setNotify] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);

  const runs = bot.activity.map((a) => ({
    time: formatRuntime(a.atMs),
    text: a.text,
    action: a.kind === "buy" ? "Acquired" : a.kind === "sale" ? "Sold" : "Scanned",
    rule: a.kind === "scan" ? "Discovery sweep" : "Score ≥ 85 · ROI ≥ 500%",
  }));

  const avgCost = bot.positions.length ? Math.round(bot.cost / bot.positions.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autopilot"
        subtitle="Let Flipmain execute your strategy while you sleep — within limits you define."
        right={
          <div className="flex items-center gap-3">
            <Tag tone={bot.running ? "success" : "default"}>{bot.running ? "Running" : "Stopped"}</Tag>
            <Btn
              variant={bot.running ? "secondary" : "primary"}
              disabled={!bot.funded}
              onClick={() => toggle(!bot.running)}
            >
              {bot.running ? "Stop bot" : "Start bot"}
            </Btn>
          </div>
        }
      />

      {!bot.funded ? (
        <div className="flex flex-col gap-3 rounded-md border border-primary/25 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] font-semibold">Deposit funds to use the bot</p>
            <p className="text-[13px] text-muted-foreground">Your balance is $0. The bot can only start once you've deposited funds into your bot portfolio.</p>
          </div>
          <Btn variant="primary" onClick={() => setDepositOpen(true)}>Deposit funds</Btn>
        </div>
      ) : null}
      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Monthly budget used"
          value={`${money(bot.cost)} / ${money(500)}`}
          delta={`${Math.min(100, Math.round((bot.cost / 500) * 100))}% consumed`}
        />
        <Metric label="Acquisitions this month" value={String(bot.positions.length)} tone="primary" />
        <Metric label="Avg. acquisition cost" value={money(avgCost)} />
        <Metric label="Est. value added" value={money(bot.estValue + bot.realized)} tone="success" />
      </div>


      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Acquisition rules">
          <div className="space-y-4 px-5 py-4">
            <Field label="Monthly budget" hint="Autopilot pauses when the budget is exhausted.">
              <Input defaultValue="500" inputMode="numeric" />
            </Field>
            <Field label="Max price per domain">
              <Input defaultValue="150" inputMode="numeric" />
            </Field>
            <Field label="Minimum Flip Score">
              <Select defaultValue="85">
                <option value="75">75+</option>
                <option value="80">80+</option>
                <option value="85">85+</option>
                <option value="90">90+ (conservative)</option>
              </Select>
            </Field>
            <Field label="Minimum projected ROI">
              <Select defaultValue="500">
                <option value="200">200%</option>
                <option value="500">500%</option>
                <option value="1000">1000%</option>
              </Select>
            </Field>
            <Field label="Allowed TLDs">
              <Select defaultValue="com-io-ai">
                <option value="com">.com only</option>
                <option value="com-io-ai">.com, .io, .ai</option>
                <option value="all">All TLDs</option>
              </Select>
            </Field>

            <div className="space-y-3 border-t border-border pt-4">
              {[
                { l: "Auto-bid in auctions", v: autoBid, s: setAutoBid },
                { l: "Auto-list after acquisition", v: autoList, s: setAutoList },
                { l: "Notify me before each purchase", v: notify, s: setNotify },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between gap-4">
                  <span className="text-[13px]">{r.l}</span>
                  <Toggle on={r.v} onChange={r.s} label={r.l} />
                </div>
              ))}
            </div>

            <Btn variant="primary" className="w-full">
              Save strategy
            </Btn>
          </div>
        </Panel>

        <Panel title="Recent activity">
          {runs.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
              Autopilot has not executed anything yet. Enable it to start hunting.
            </p>
          ) : (
            <DataTable head={["Runtime", "Event", "Action", "Rule"]}>
              {runs.map((r, i) => (
                <Row key={i}>
                  <Cell className="tabular text-muted-foreground">{r.time}</Cell>
                  <Cell className="font-medium">{r.text}</Cell>
                  <Cell>
                    <Tag tone={r.action === "Acquired" ? "success" : r.action === "Sold" ? "primary" : "default"}>
                      {r.action}
                    </Tag>
                  </Cell>
                  <Cell className="text-muted-foreground">{r.rule}</Cell>
                </Row>
              ))}
            </DataTable>
          )}
        </Panel>

      </div>
    </div>
  );
}
