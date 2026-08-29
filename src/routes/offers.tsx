import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { money, slugify } from "@/data/mock";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers — Flipmain" },
      { name: "description", content: "Review inbound offers on your domains with valuation context and negotiation guidance." },
      { property: "og:title", content: "Offers — Flipmain" },
      { property: "og:description", content: "Review inbound offers with valuation context." },
    ],
  }),
  component: Offers,
});

type Offer = {
  domain: string;
  buyer: string;
  amount: number;
  est: number;
  received: string;
  status: "Pending" | "Countered" | "Declined" | "Accepted";
};

const offers: Offer[] = [
  { domain: "OrbitalAI.com", buyer: "Verified buyer · US", amount: 2100, est: 2400, received: "2h ago", status: "Pending" },
  { domain: "VantaFlow.com", buyer: "Agency · DE", amount: 640, est: 850, received: "Yesterday", status: "Pending" },
  { domain: "Cedarbase.io", buyer: "Verified buyer · UK", amount: 900, est: 1150, received: "2 days ago", status: "Countered" },
  { domain: "Atlasrail.com", buyer: "Broker · NL", amount: 1400, est: 1750, received: "4 days ago", status: "Declined" },
  { domain: "Quantfold.com", buyer: "Verified buyer · CA", amount: 980, est: 760, received: "Last week", status: "Accepted" },
];

const tone = (s: Offer["status"]) =>
  s === "Accepted" ? "success" : s === "Countered" ? "primary" : s === "Declined" ? "danger" : "warning";

function Offers() {
  const [selected, setSelected] = useState<Offer>(offers[0]!);
  const pending = offers.filter((o) => o.status === "Pending");

  return (
    <div className="space-y-6">
      <PageHeader title="Offers" subtitle="Inbound interest on your portfolio, scored against Flipmain valuations." />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Pending offers" value={String(pending.length)} />
        <Metric label="Pending value" value={money(pending.reduce((s, o) => s + o.amount, 0))} tone="primary" />
        <Metric label="Avg. offer vs est." value="-19%" delta="Counter recommended" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="All offers">
          <DataTable head={["Domain", "Buyer", "Offer", "Est. Value", "Received", "Status"]}>
            {offers.map((o) => (
              <Row key={o.domain + o.received} className="cursor-pointer">
                <Cell>
                  <button onClick={() => setSelected(o)} className="font-medium hover:text-primary">
                    {o.domain}
                  </button>
                </Cell>
                <Cell className="text-muted-foreground">{o.buyer}</Cell>
                <Cell className="tabular">{money(o.amount)}</Cell>
                <Cell className="tabular text-muted-foreground">{money(o.est)}</Cell>
                <Cell className="text-muted-foreground">{o.received}</Cell>
                <Cell align="right">
                  <Tag tone={tone(o.status) as never}>{o.status}</Tag>
                </Cell>
              </Row>
            ))}
          </DataTable>
        </Panel>

        <Panel title="Offer detail">
          <div className="space-y-4 px-5 py-4">
            <div>
              <p className="label-xs">Domain</p>
              <Link
                to="/domain/$domain"
                params={{ domain: slugify(selected.domain) }}
                className="text-[15px] font-semibold hover:text-primary"
              >
                {selected.domain}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-xs">Offer</p>
                <p className="mt-1 text-lg font-semibold tabular">{money(selected.amount)}</p>
              </div>
              <div>
                <p className="label-xs">Estimated value</p>
                <p className="mt-1 text-lg font-semibold tabular text-muted-foreground">{money(selected.est)}</p>
              </div>
            </div>
            <div className="rounded-md border border-border bg-secondary/50 px-3.5 py-3">
              <p className="label-xs">Flipmain guidance</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Offer sits {Math.round((selected.amount / selected.est) * 100 - 100)}% against our midpoint estimate.
                Comparable sales in this category cleared above the ask within 90 days — countering at{" "}
                {money(Math.round(selected.est * 1.15))} is reasonable.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn variant="primary">Accept</Btn>
              <Btn>Counter</Btn>
              <Btn variant="outline">Decline</Btn>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
