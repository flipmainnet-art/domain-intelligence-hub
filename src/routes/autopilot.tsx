import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Cell, DataTable, Field, Input, Metric, PageHeader, Panel, Row, Select, Tag, Toggle } from "@/components/flip/kit";
import { money } from "@/data/mock";

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

const runs = [
  { time: "18:42", domain: "NovaLedger.com", action: "Acquired", amount: -42, rule: "Fintech · Score ≥ 90" },
  { time: "17:10", domain: "Pulsegrid.ai", action: "Skipped", amount: 0, rule: "Budget guard" },
  { time: "15:03", domain: "Kernelbay.com", action: "Bid placed", amount: -47, rule: "Auctions · ROI ≥ 500%" },
  { time: "11:27", domain: "Signalcrest.ai", action: "Watchlisted", amount: 0, rule: "AI · Score ≥ 85" },
  { time: "09:14", domain: "Lumenstack.io", action: "Skipped", amount: 0, rule: "TLD filter" },
];

function Autopilot() {
  const [on, setOn] = useState(true);
  const [autoBid, setAutoBid] = useState(true);
  const [autoList, setAutoList] = useState(false);
  const [notify, setNotify] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autopilot"
        subtitle="Let Flipmain execute your strategy while you sleep — within limits you define."
        right={
          <div className="flex items-center gap-3">
            <Tag tone={on ? "success" : "default"}>{on ? "Active" : "Paused"}</Tag>
            <Toggle on={on} onChange={setOn} label="Autopilot enabled" />
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Monthly budget used" value={`${money(164)} / ${money(500)}`} delta="33% consumed" />
        <Metric label="Acquisitions this month" value="4" tone="primary" />
        <Metric label="Avg. acquisition cost" value={money(41)} />
        <Metric label="Est. value added" value={money(5820)} tone="success" />
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
          <DataTable head={["Time", "Domain", "Action", "Rule", "Amount"]}>
            {runs.map((r) => (
              <Row key={r.time}>
                <Cell className="tabular text-muted-foreground">{r.time}</Cell>
                <Cell className="font-medium">{r.domain}</Cell>
                <Cell>
                  <Tag tone={r.action === "Acquired" ? "success" : r.action === "Skipped" ? "default" : "primary"}>
                    {r.action}
                  </Tag>
                </Cell>
                <Cell className="text-muted-foreground">{r.rule}</Cell>
                <Cell align="right" className="tabular">
                  {r.amount ? money(r.amount) : "—"}
                </Cell>
              </Row>
            ))}
          </DataTable>
        </Panel>
      </div>
    </div>
  );
}
