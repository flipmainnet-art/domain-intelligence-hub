import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Btn, Cell, DataTable, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { comparableSales, money, opportunities } from "@/data/mock";

export const Route = createFileRoute("/domain/$domain")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.domain} — Domain Research | Flipmain` },
      {
        name: "description",
        content: `AI valuation, comparable sales and history research for ${params.domain}.`,
      },
      { property: "og:title", content: `${params.domain} — Domain Research | Flipmain` },
      { property: "og:description", content: `AI valuation and comparable sales for ${params.domain}.` },
    ],
  }),
  component: DomainDetail,
});

const factors = [
  { label: "Brandability", value: "96" },
  { label: "Market Demand", value: "91" },
  { label: "Memorability", value: "94" },
  { label: "TLD", value: "100" },
  { label: "Buyer Pool", value: "89" },
  { label: "Risk", value: "Low" },
];

const history = [
  { label: "Registration age", value: "6 years, 2 months" },
  { label: "Previous ownership", value: "2 registrants" },
  { label: "Backlinks", value: "184 referring domains" },
  { label: "Traffic estimate", value: "~320 visits / month" },
  { label: "Trademark risk", value: "No conflicts detected" },
];

function DomainDetail() {
  const { domain } = Route.useParams();
  const data = opportunities.find((o) => o.domain.toLowerCase() === domain.toLowerCase());
  const price = data?.price ?? 42;
  const low = data?.estLow ?? 1200;
  const high = data?.estHigh ?? 3500;
  const score = data?.score ?? 94;

  return (
    <div className="space-y-6">
      <Link
        to="/discover"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Discover
      </Link>

      <PageHeader
        title={domain}
        subtitle="Placeholder research data for prototype purposes."
        right={
          <div className="flex gap-2">
            <Btn variant="secondary">Watch</Btn>
            <Btn variant="primary">Buy Domain</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-5 py-4">
          <p className="label-xs">Status</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium">
            <Tag tone="success">Available</Tag>
            <Tag tone="warning">Auction</Tag>
          </p>
        </div>
        <div className="rounded-md border border-border bg-card px-5 py-4">
          <p className="label-xs">Asking price</p>
          <p className="mt-2 text-2xl font-semibold tabular">{money(price)}</p>
        </div>
        <div className="rounded-md border border-border bg-card px-5 py-4">
          <p className="label-xs">Estimated resale value</p>
          <p className="mt-2 text-lg font-semibold tabular">
            {money(low)}–{money(high)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card px-5 py-4">
          <p className="label-xs">Flip Score</p>
          <p className="mt-2 text-2xl font-semibold tabular text-primary">
            {score}
            <span className="text-sm font-normal text-muted-foreground"> / 100</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="AI Valuation">
            <p className="px-5 py-4 text-[13px] leading-6 text-muted-foreground">
              {domain.split(".")[0]} combines a strong brandable prefix with a finance-related
              keyword. It is short, pronounceable and suitable for fintech, accounting and
              financial infrastructure companies. Comparable sales in the same naming family have
              cleared four figures consistently over the last 18 months, and the .com extension
              keeps the buyer pool wide.
            </p>
          </Panel>

          <Panel title="Comparable Sales">
            <DataTable head={["Domain", "Sale Price", "Date", "Venue"]}>
              {comparableSales.map((c) => (
                <Row key={c.domain}>
                  <Cell className="font-medium">{c.domain}</Cell>
                  <Cell className="tabular">{money(c.price)}</Cell>
                  <Cell className="text-muted-foreground">{c.date}</Cell>
                  <Cell align="right" className="text-muted-foreground">
                    {c.venue}
                  </Cell>
                </Row>
              ))}
            </DataTable>
          </Panel>

          <Panel title="Domain History">
            <dl className="divide-y divide-border/60">
              {history.map((h) => (
                <div key={h.label} className="flex items-center justify-between px-5 py-3">
                  <dt className="text-[13px] text-muted-foreground">{h.label}</dt>
                  <dd className="text-[13px] font-medium tabular">{h.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Valuation Factors">
            <ul className="divide-y divide-border/60">
              {factors.map((f) => (
                <li key={f.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-muted-foreground">{f.label}</span>
                  <span className="text-[13px] font-semibold tabular">{f.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Potential Buyers">
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {["Fintech", "Accounting SaaS", "Crypto infrastructure", "Financial AI"].map((b) => (
                <Tag key={b}>{b}</Tag>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
