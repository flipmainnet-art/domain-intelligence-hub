import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Cell, DataTable, Metric, PageHeader, Panel, Row, Tag } from "@/components/flip/kit";
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
  component: WalletPage;
});

function WalletPage() {
  return null;
}
