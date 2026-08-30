import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Btn, Cell, DataTable, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { DepositDialog } from "@/components/flip/DepositDialog";
import { EditableMetric } from "@/components/flip/customizable";
import { money, walletTx } from "@/data/mock";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Flipmain" },
      { name: "description", content: "Fund your account, review balances and manage payout methods for domain purchases and sales." },
      { property: "og:title", content: "Wallet — Flipmain" },
      { property: "og:description", content: "Balances, funding and payouts for domain investing." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const inflow = walletTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outflow = walletTx.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const balance = 2140;


  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wallet"
        subtitle="Fund purchases, receive sale proceeds, and manage payouts."
        right={
          <div className="flex gap-2">
            <Btn variant="primary" onClick={() => setDepositOpen(true)}>
              Add funds
            </Btn>
            <Btn>Withdraw</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <EditableMetric
          id="wallet.balance"
          label="Available balance"
          value={money(balance)}
          delta="USDC"
          tone="primary"
        />
        <EditableMetric
          id="wallet.escrow"
          label="In escrow"
          value={money(38)}
          delta="1 active auction bid"
        />
        <EditableMetric id="wallet.inflow" label="Inflow · 60d" value={money(inflow)} tone="success" />
        <EditableMetric id="wallet.outflow" label="Outflow · 60d" value={money(outflow)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Recent transactions" className="lg:col-span-2">
          <DataTable head={["Date", "Type", "Status", "Amount"]}>
            {walletTx.map((t, i) => (
              <Row key={i}>
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

        <div className="flex flex-col gap-6">
          <Panel title="Funding methods">
            <div className="flex flex-col divide-y divide-border/60">
              <div className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-[13px] font-medium text-foreground">USDC wallet</p>
                  <p className="text-xs text-muted-foreground">Primary · 0x8f…2c4a</p>
                </div>
                <Tag tone="primary">Default</Tag>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-[13px] font-medium text-foreground">Bank transfer</p>
                  <p className="text-xs text-muted-foreground">USD · ****4821</p>
                </div>
                <Btn size="sm" variant="outline">
                  Verify
                </Btn>
              </div>
            </div>
          </Panel>

          <Panel title="Auto-refill">
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Keep a minimum balance of <span className="text-foreground tabular">$500</span> so
                Autopilot can execute acquisitions without delay.
              </p>
              <Btn size="sm" variant="secondary" className="mt-3">
                Configure
              </Btn>
            </div>
          </Panel>
        </div>
      </div>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
    </div>
  );
}
