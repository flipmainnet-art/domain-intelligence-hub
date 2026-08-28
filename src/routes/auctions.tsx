import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Btn, Cell, DataTable, PageHeader, Panel, Row, Score, Select, Tag } from "@/components/flip/kit";
import { auctions, money, slugify } from "@/data/mock";

export const Route = createFileRoute("/auctions")({
  head: () => ({
    meta: [
      { title: "Live Auctions — Flipmain" },
      { name: "description", content: "Track expiring domain auctions with live countdowns, current bids and Flip Score valuations." },
      { property: "og:title", content: "Live Auctions — Flipmain" },
      { property: "og:description", content: "Track expiring domain auctions with live countdowns and valuations." },
    ],
  }),
  component: Auctions,
});

function fmt(sec: number) {
  if (sec <= 0) return "Ended";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Auctions() {
  const [tick, setTick] = useState(0);
  const [window_, setWindow] = useState("all");
  const [sort, setSort] = useState("ending");

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    let list = auctions.map((a) => ({ ...a, left: Math.max(0, a.endsInSec - tick) }));
    if (window_ !== "all") list = list.filter((a) => a.left <= Number(window_));
    if (sort === "ending") list.sort((a, b) => a.left - b.left);
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    if (sort === "bid") list.sort((a, b) => a.bid - b.bid);
    return list;
  }, [tick, window_, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Auctions"
        subtitle="Expiring and marketplace auctions Flipmain is currently monitoring."
        right={
          <div className="flex gap-2">
            <Select value={window_} onChange={(e) => setWindow(e.target.value)}>
              <option value="all">All auctions</option>
              <option value="3600">Ending in 1h</option>
              <option value="21600">Ending in 6h</option>
              <option value="86400">Ending in 24h</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="ending">Ending soonest</option>
              <option value="score">Flip Score</option>
              <option value="bid">Lowest bid</option>
            </Select>
          </div>
        }
      />

      <Panel title={`${rows.length} active auctions`}>
        <DataTable head={["Domain", "Current Bid", "Bids", "Est. Value", "Flip Score", "Time Left", ""]}>
          {rows.map((a) => (
            <Row key={a.domain}>
              <Cell>
                <Link to="/domain/$domain" params={{ domain: slugify(a.domain) }} className="font-medium hover:text-primary">
                  {a.domain}
                </Link>
              </Cell>
              <Cell className="tabular">{money(a.bid)}</Cell>
              <Cell className="tabular text-muted-foreground">{a.bids}</Cell>
              <Cell className="tabular text-muted-foreground">
                {money(a.estLow)} – {money(a.estHigh)}
              </Cell>
              <Cell>
                <Score value={a.score} />
              </Cell>
              <Cell>
                {a.left <= 3600 ? (
                  <Tag tone="warning">{fmt(a.left)}</Tag>
                ) : (
                  <span className="tabular text-muted-foreground">{fmt(a.left)}</span>
                )}
              </Cell>
              <Cell align="right">
                <Btn size="sm" variant="primary">
                  Place bid
                </Btn>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
