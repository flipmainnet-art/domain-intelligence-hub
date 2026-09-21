import { createFileRoute } from "@tanstack/react-router";
import { Cell, DataTable, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { money } from "@/data/mock";
import { useBot } from "@/lib/bot";

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

type Entry = { ref: string; at: number; type: string; amount: number };

function TransactionsPage() {
  const { snapshot: bot } = useBot();

  const ledger: Entry[] = [
    ...bot.transactions.map((t) => ({
      ref: t.id,
      at: t.at,
      type: `${t.kind} · USDC`,
      amount: t.kind === "Deposit" ? t.amount : -t.amount,
    })),
    ...bot.positions.map((p) => ({
      ref: `BUY-${p.index}`,
      at: p.atMs,
      type: `Domain purchase · ${p.domain}`,
      amount: -p.cost,
    })),
    ...bot.sold.flatMap((p) => [
      { ref: `BUY-${p.index}`, at: p.atMs, type: `Domain purchase · ${p.domain}`, amount: -p.cost },
      { ref: `SELL-${p.index}`, at: p.soldAtMs ?? 0, type: `Domain sale · ${p.domain}`, amount: p.salePrice },
    ]),
  ].sort((a, b) => b.at - a.at);

  const stamp = (at: number) =>
    at > 1_000_000_000_000 ? new Date(at).toLocaleString() : `+${Math.floor(at / 60_000)}m runtime`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        subtitle="Complete ledger of account activity — deposits, purchases, sales and withdrawals."
      />
      <Panel title="All activity">
        {ledger.length === 0 ? (
          <p className="px-5 py-12 text-center text-[13px] text-muted-foreground">
            No transactions yet. Deposit funds and start the bot to begin recording activity.
          </p>
        ) : (
          <DataTable head={["Reference", "When", "Type", "Status", "Amount"]}>
            {ledger.map((t, i) => (
              <Row key={`${t.ref}-${i}`}>
                <Cell className="font-mono text-xs text-muted-foreground">{t.ref}</Cell>
                <Cell className="text-muted-foreground tabular">{stamp(t.at)}</Cell>
                <Cell>{t.type}</Cell>
                <Cell>
                  <Tag tone="success">Completed</Tag>
                </Cell>
                <Cell align="right" className={t.amount > 0 ? "text-success tabular" : "tabular"}>
                  {t.amount > 0 ? `+${money(t.amount)}` : money(t.amount)}
                </Cell>
              </Row>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  );
}
