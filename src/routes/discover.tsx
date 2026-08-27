import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Btn,
  Cell,
  DataTable,
  Input,
  PageHeader,
  Panel,
  Row,
  Score,
  Select,
} from "@/components/flip/kit";
import { money, opportunities, roi } from "@/data/mock";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Domains — Flipmain" },
      { name: "description", content: "AI-ranked domains with potential resale value, filtered by TLD, price and Flip Score." },
      { property: "og:title", content: "Discover Domains — Flipmain" },
      { property: "og:description", content: "AI-ranked domains with potential resale value." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [q, setQ] = useState("");
  const [tld, setTld] = useState("all");
  const [maxPrice, setMaxPrice] = useState("all");
  const [minScore, setMinScore] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recommended");

  const categories = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.category))),
    [],
  );

  const rows = useMemo(() => {
    let list = opportunities.filter((o) => {
      if (q && !o.domain.toLowerCase().includes(q.toLowerCase())) return false;
      if (tld !== "all" && o.tld !== tld) return false;
      if (maxPrice !== "all" && o.price > Number(maxPrice)) return false;
      if (minScore !== "all" && o.score < Number(minScore)) return false;
      if (category !== "all" && o.category !== category) return false;
      return true;
    });
    list = [...list];
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    if (sort === "price") list.sort((a, b) => a.price - b.price);
    if (sort === "roi") list.sort((a, b) => roi(b) - roi(a));
    return list;
  }, [q, tld, maxPrice, minScore, category, sort]);

  return (
    <div className="space-y-6">
      <PageHeader title="Discover Domains" subtitle="AI-ranked domains with potential resale value." />

      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search domains..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={tld} onChange={(e) => setTld(e.target.value)}>
            <option value="all">TLD: All</option>
            <option value=".com">.com</option>
            <option value=".ai">.ai</option>
            <option value=".io">.io</option>
          </Select>
          <Select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
            <option value="all">Price: Any</option>
            <option value="50">Under $50</option>
            <option value="100">Under $100</option>
            <option value="250">Under $250</option>
          </Select>
          <Select value={minScore} onChange={(e) => setMinScore(e.target.value)}>
            <option value="all">Flip Score: Any</option>
            <option value="80">80+</option>
            <option value="85">85+</option>
            <option value="90">90+</option>
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Category: All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select defaultValue="all">
            <option value="all">Auction: Any</option>
            <option value="yes">Auction only</option>
            <option value="no">Buy now only</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">Age: Any</option>
            <option value="1">1+ years</option>
            <option value="5">5+ years</option>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <span className="label-xs">Sort</span>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="score">Highest Flip Score</option>
              <option value="price">Lowest Price</option>
              <option value="roi">Highest Estimated ROI</option>
              <option value="newest">Newest</option>
            </Select>
          </div>
        </div>
      </div>

      <Panel>
        <DataTable head={["Domain", "Price", "Est. Value", "Est. ROI", "Flip Score", "Reason", "Action"]}>
          {rows.map((o) => (
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
                {money(o.estLow)}–{money(o.estHigh)}
              </Cell>
              <Cell className="tabular text-success">+{roi(o).toLocaleString()}%</Cell>
              <Cell>
                <Score value={o.score} />
              </Cell>
              <Cell className="max-w-[220px] truncate text-muted-foreground">{o.reason}</Cell>
              <Cell align="right">
                <div className="flex justify-end gap-2">
                  <Btn variant="outline" size="sm">
                    Watch
                  </Btn>
                  <Btn variant="primary" size="sm">
                    Buy
                  </Btn>
                </div>
              </Cell>
            </Row>
          ))}
          {rows.length === 0 ? (
            <Row>
              <Cell className="text-muted-foreground">No domains match these filters.</Cell>
            </Row>
          ) : null}
        </DataTable>
      </Panel>
    </div>
  );
}
