import { createFileRoute } from "@tanstack/react-router";
import { Cell, DataTable, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { money, walletTx } from "@/data/mock";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Flipmain" },
      { name: "description", content: "Full ledger of deposits, withdrawals, purchases and sales across your Flipmain account." },
      { property: "og:title", content: "Transactions — Flipmain" },
      { property: "og:description", content: "Complete account ledger for domain investing activity." },
    ],
  }),
  component: TransactionsPage,
});

const ledger = [
  ...walletTx.map((t) => ({ ...t, ref: `TX-${t.date.replaceAll("-", "")}-${Math.abs(t.amount)}` })),
  { date: "2026-07-22", type: "Domain purchase", amount: -61, status: "Completed", ref: "TX-20260722-61" },
  { date: "2026-07-15", type: "Deposit", amount: 400, status: "Completed", ref: "TX-20260715-400" },
  { date: "2026-07-02", type: "Domain purchase", amount: -29, status: "Completed", ref: "TX-20260702-29" },
  { date: "2026-06-24", type: "Domain sale", amount: 1320, status: "Completed", ref: "TX-20260624-1320" },
  { date: "2026-06-11", type: "Domain purchase", amount: -38, status: "Completed", ref: "TX-20260611-38" },
];

function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        subtitle="Complete ledger of account activity — deposits, purchases, sales and withdrawals."
      />
      <Panel title="All activity">
        <DataTable head={["Reference", "Date", "Type", "Status", "Amount"]}>
          {ledger.map((t) => (
            <Row key={t.ref}>
              <Cell className="font-mono text-xs text-muted-foreground">{t.ref}</Cell>
              <Cell className="text-muted-foreground tabular">{t.date}</Cell>
              <Cell>{t.type}</Cell>
              <Cell>
                <Tag tone={t.status === "Completed" ? "success" : "warning"}>{t.status}</Tag>
              </Cell>
              <Cell align="right" className={t.amount > 0 ? "text-success tabular" : "tabular"}>
                {t.amount > 0 ? `+${money(t.amount)}` : money(t.amount)}
              </Cell>
            </Row>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
