import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { holdings, money, slugify } from "@/data/mock";

export const Route = createFileRoute("/listings")({
  head: () => ({
    meta: [
      { title: "Listings — Flipmain" },
      { name: "description", content: "Manage active domain listings, asking prices, views and inquiry volume across marketplaces." },
      { property: "og:title", content: "Listings — Flipmain" },
      { property: "og:description", content: "Manage active domain listings and asking prices." },
    ],
  }),
  component: Listings,
});

const listed = holdings.filter((h) => h.listPrice !== null);

function Listings() {
  const gross = listed.reduce((s, h) => s + (h.listPrice ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        subtitle="Domains currently for sale and how buyers are responding."
        right={<Btn variant="primary">New listing</Btn>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Active listings" value={String(listed.length)} />
        <Metric label="Combined ask" value={money(gross)} tone="primary" />
        <Metric label="Avg. days listed" value="24" delta="Market median 41 days" />
      </div>

      <Panel title="Active listings">
        <DataTable head={["Domain", "Ask", "Est. Value", "Ask vs Est.", "Views", "Inquiries", ""]}>
          {listed.map((h, i) => {
            const ask = h.listPrice ?? 0;
            const ratio = Math.round((ask / h.estValue) * 100 - 100);
            return (
              <Row key={h.domain}>
                <Cell>
                  <Link to="/domain/$domain" params={{ domain: slugify(h.domain) }} className="font-medium hover:text-primary">
                    {h.domain}
                  </Link>
                </Cell>
                <Cell className="tabular">{money(ask)}</Cell>
                <Cell className="tabular text-muted-foreground">{money(h.estValue)}</Cell>
                <Cell>
                  <Tag tone={ratio > 40 ? "warning" : "success"}>{ratio > 0 ? `+${ratio}%` : `${ratio}%`}</Tag>
                </Cell>
                <Cell className="tabular text-muted-foreground">{[482, 219, 96, 341][i % 4]}</Cell>
                <Cell className="tabular text-muted-foreground">{[6, 2, 1, 4][i % 4]}</Cell>
                <Cell align="right">
                  <Btn size="sm">Edit price</Btn>
                </Cell>
              </Row>
            );
          })}
        </DataTable>
      </Panel>
    </div>
  );
}
