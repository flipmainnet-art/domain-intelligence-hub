import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Select, Tag } from "@/components/flip/kit";
import { money, slugify } from "@/data/mock";
import { formatRuntime, useBot } from "@/lib/bot";

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
  const { snapshot: bot } = useBot();

  const all = useMemo(
    () =>
      [...bot.positions, ...bot.sold].map((p) => {
        const sold = p.status === "Sold";
        return {
          domain: p.domain,
          acquired: formatRuntime(p.atMs),
          cost: p.cost,
          estValue: sold ? p.salePrice : Math.round(p.baseValue),
          status: sold ? "Sold" : p.status === "Listed" ? "Listed" : "Owned",
        };
      }),
    [bot.positions, bot.sold],
  );

  const rows = all.filter((h) => status === "all" || h.status === status);
  const cost = all.reduce((s, h) => s + h.cost, 0);
  const value = all.reduce((s, h) => s + h.estValue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Domains"
        subtitle="Everything the bot owns, with live valuation and status."
        right={<Btn variant="primary">Import domain</Btn>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Domains owned" value={String(all.length)} />
        <Metric label="Total cost basis" value={money(cost)} />
        <Metric label="Estimated value" value={money(value)} tone="primary" />
        <Metric
          label="Unrealized gain"
          value={money(value - cost)}
          delta={`${cost ? Math.round(((value - cost) / cost) * 100) : 0}% return`}
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
            <option value="Sold">Sold</option>
          </Select>
        }
      >
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
            No domains yet. Start the bot from the dashboard and acquisitions will appear here.
          </p>
        ) : (
          <DataTable head={["Domain", "Acquired at", "Cost", "Est. Value", "Gain", "Status", ""]}>
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
                  <Btn size="sm">{h.status === "Listed" ? "Manage" : "List for sale"}</Btn>
                </Cell>
              </Row>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
