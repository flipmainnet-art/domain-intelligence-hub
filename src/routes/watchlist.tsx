import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { Btn, Cell, DataTable, PageHeader, Panel, Row, Score, Tag } from "@/components/flip/kit";
import { money, opportunities, roi, slugify } from "@/data/mock";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — Flipmain" },
      { name: "description", content: "Domains you are tracking, with price movement alerts and Flip Score changes." },
      { property: "og:title", content: "Watchlist — Flipmain" },
      { property: "og:description", content: "Domains you are tracking, with price and score alerts." },
    ],
  }),
  component: Watchlist,
});

function Watchlist() {
  const [watched, setWatched] = useState(() => opportunities.slice(0, 6).map((o) => o.domain));
  const rows = opportunities.filter((o) => watched.includes(o.domain));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Watchlist"
        subtitle="Domains you're tracking. Flipmain alerts you when price or score moves."
        right={
          <Link to="/discover">
            <Btn variant="primary">Add from Discover</Btn>
          </Link>
        }
      />

      <Panel title={`${rows.length} tracked domains`}>
        {rows.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm text-muted-foreground">Nothing on your watchlist yet.</p>
            <Link to="/discover" className="mt-3 inline-block">
              <Btn size="sm">Browse Discover</Btn>
            </Link>
          </div>
        ) : (
          <DataTable head={["Domain", "Price", "Est. Value", "ROI", "Flip Score", "Signal", ""]}>
            {rows.map((o, i) => (
              <Row key={o.domain}>
                <Cell>
                  <Link to="/domain/$domain" params={{ domain: slugify(o.domain) }} className="font-medium hover:text-primary">
                    {o.domain}
                  </Link>
                </Cell>
                <Cell className="tabular">{money(o.price)}</Cell>
                <Cell className="tabular text-muted-foreground">
                  {money(o.estLow)} – {money(o.estHigh)}
                </Cell>
                <Cell className="tabular text-success">+{roi(o)}%</Cell>
                <Cell>
                  <Score value={o.score} />
                </Cell>
                <Cell>
                  <Tag tone={i % 3 === 0 ? "success" : i % 3 === 1 ? "default" : "warning"}>
                    {i % 3 === 0 ? "Score up" : i % 3 === 1 ? "Stable" : "Expiring soon"}
                  </Tag>
                </Cell>
                <Cell align="right">
                  <button
                    aria-label={`Remove ${o.domain}`}
                    onClick={() => setWatched((w) => w.filter((d) => d !== o.domain))}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </Cell>
              </Row>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
