import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
import { DepositDialog } from "@/components/flip/DepositDialog";
import { WithdrawDialog } from "@/components/flip/WithdrawDialog";
import { money } from "@/data/mock";
import { useBot } from "@/lib/bot";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Flipmain" },
      { name: "description", content: "Fund your bot, review balances and manage payouts for domain purchases and sales." },
      { property: "og:title", content: "Wallet — Flipmain" },
      { property: "og:description", content: "Balances, funding and payouts for domain investing." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { snapshot: bot } = useBot();

  const tx = [
    ...bot.transactions.map((t) => ({
      at: t.at,
      type: `${t.kind} · USDC`,
      amount: t.kind === "Withdrawal" ? -t.amount : t.amount,
    })),
    ...bot.positions.map((pos) => ({
      at: pos.atMs,
      type: `Domain purchase · ${pos.domain}`,
      amount: -pos.cost,
    })),
    ...bot.sold.map((pos) => ({
      at: pos.soldAtMs ?? 0,
      type: `Domain sale · ${pos.domain}`,
      amount: pos.salePrice,
    })),
  ].sort((a, b) => b.at - a.at);

  const stamp = (at: number) =>
    at > 1_000_000_000_000 ? new Date(at).toLocaleString() : `+${Math.floor(at / 60_000)}m runtime`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Wallet"
        subtitle="Fund the bot, receive sale proceeds, and withdraw at any time."
        right={
          <div className="flex gap-2">
            <Btn variant="primary" onClick={() => setDepositOpen(true)}>
              Deposit USDC
            </Btn>
            <Btn disabled={bot.balance <= 0} onClick={() => setWithdrawOpen(true)}>
              Withdraw USDC
            </Btn>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Available USDC" value={money(bot.balance)} delta="Operating capital" tone="primary" />
        <Metric label="Capital deployed" value={money(bot.deployed)} delta={`${bot.domains} open positions`} />
        <Metric
          label="Realized profit"
          value={`${bot.realized > 0 ? "+" : ""}${money(bot.realized)}`}
          tone={bot.realized > 0 ? "success" : "default"}
          delta={`${bot.trades} closed trades`}
        />
        <Metric label="Total portfolio value" value={money(bot.equity)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Recent transactions" className="lg:col-span-2">
          {tx.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
              No transactions yet. Deposit funds to give the bot operating capital.
            </p>
          ) : (
            <DataTable head={["When", "Type", "Status", "Amount"]}>
              {tx.slice(0, 15).map((t, i) => (
                <Row key={i}>
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

        <Panel title="Funding">
          <div className="space-y-3 px-5 py-4 text-[13px] text-muted-foreground">
            <p>
              Deposits are made in USDC or SOL on the Solana network and become the bot's operating
              capital immediately after confirmation.
            </p>
            <p>
              Security note: this is a hot wallet used for operating the bot. We do not have access
              to or control your deposited funds. You can withdraw 24/7 at any time.
            </p>
            <Btn size="sm" variant="secondary" onClick={() => setDepositOpen(true)}>
              View deposit address
            </Btn>
          </div>
        </Panel>
      </div>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} available={bot.balance} />
    </div>
  );
}
