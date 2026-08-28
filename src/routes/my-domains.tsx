import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Select, Tag } from "@/components/flip/kit";
import { holdings, money, slugify } from "@/data/mock";

export const Route = createFileRoute("/my-domains")({
  head: () => ({
    meta: [
      { title: "My Domains — Flipmain" },
      { name: "description", content: "Your domain portfolio: acquisition cost, estimated value, unrealized gain and listing status." },
      { property: "og:title", content: "My Domains — Flipmain" },
      { property: "og:description", content: "Your domain portfolio with cost basis and estimated value." },
    ],
  }),
  component: MyDomains,
});

const tone = (s: string) =>
  s === "Sold" ? "success" : s === "Listed" ? "primary" : s === "Offer Received" ? "warning" : "default";

function MyDomains() {
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () => holdings.filter((h) => status === "all" || h.status === status),
    [status],
  );

  const cost = holdings.reduce((s, h) => s + h.cost, 0);
  const value = holdings.reduce((s, h) => s + h.estValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Domains"
        subtitle="Everything you own, with live valuation and status."
        right={<Btn variant="primary">Import domain</Btn>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Domains owned" value={String(holdings.length)} />
        <Metric label="Total cost basis" value={money(cost)} />
        <Metric label="Estimated value" value={money(value)} tone="primary" />
        <Metric
          label="Unrealized gain"
          value={money(value - cost)}
          delta={`${Math.round(((value - cost) / cost) * 100)}% return`}
          tone="success"
        />
      </div>

      <Panel
        title="Portfolio"
        action={
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="Owned">Owned</option>
            <option value="Listed">Listed</option>
            <option value="Offer Received">Offer Received</option>
            <option value="Sold">Sold</option>
          </Select>
        }
      >
        <DataTable head={["Domain", "Acquired", "Cost", "Est. Value", "Gain", "Status", ""]}>
          {rows.map((h) => (
            <Row key={h.domain}>
              <Cell>
                <Link to="/domain/$domain" params={{ domain: slugify(h.domain) }} className="font-medium hover:text-primary">
                  {h.domain}
                </Link>
              </Cell>
              <Cell className="tabular text-muted-foreground">{h.acquired}</Cell>
              <Cell className="tabular">{money(h.cost)}</Cell>
              <Cell className="tabular">{money(h.estValue)}</Cell>
              <Cell className="tabular text-success">+{money(h.estValue - h.cost)}</Cell>
              <Cell>
                <Tag tone={tone(h.status) as never}>{h.status}</Tag>
              </Cell>
              <Cell align="right">
                <Btn size="sm">{h.listPrice ? "Manage" : "List for sale"}</Btn>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
