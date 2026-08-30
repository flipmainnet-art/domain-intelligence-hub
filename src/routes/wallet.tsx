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

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Deposit USDC / SOL</DialogTitle>
            <DialogDescription>
              Send funds to the address below. Deposits are credited after network confirmation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="rounded-md border border-border bg-background p-4">
              <p className="label-xs mb-2">Deposit address</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-secondary px-2.5 py-2 text-xs font-medium text-foreground">
                  {DEPOSIT_ADDRESS}
                </code>
                <Btn size="sm" variant="secondary" onClick={copyAddress} className="shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </Btn>
              </div>
            </div>

            <div className="flex gap-3 rounded-md border border-warning/20 bg-warning/10 p-3.5 text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Hot wallet notice</p>
                <p className="text-warning/90">
                  This is a shared hot wallet. Flipmain does not take custody of your funds. You may
                  withdraw your balance at any time.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Only send USDC or SOL on the Solana network to this address. Sending other assets may
              result in permanent loss.
            </p>
          </div>

          <div className="flex justify-end">
            <Btn variant="secondary" onClick={() => setDepositOpen(false)}>
              Done
            </Btn>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
