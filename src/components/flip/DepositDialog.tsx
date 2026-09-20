import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Loader2, ShieldCheck } from "lucide-react";
import { Btn } from "@/components/flip/kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money } from "@/data/mock";
import { useBot } from "@/lib/bot";

export const DEPOSIT_ADDRESS = "4yLhuc6hDmgRovbybMqEafh2jEtFpV2T6t4uEj7JAwjb";

type Stage = "form" | "waiting" | "credited";

export function DepositDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { deposit } = useBot();
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState<Stage>("form");

  useEffect(() => {
    if (!open) {
      setStage("form");
      setAmount("");
      setCopied(false);
    }
  }, [open]);

  const numeric = Number(amount);
  const validAmount = Number.isFinite(numeric) && numeric > 0;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(DEPOSIT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* address is visible for manual copy */
    }
  };

  const confirm = () => {
    if (!validAmount) return;
    deposit(numeric);
    setStage("credited");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Deposit Funds to Use the Bot</DialogTitle>
          <DialogDescription>
            Fund the bot wallet on Solana with USDC or SOL to start operating.
          </DialogDescription>
        </DialogHeader>

        {stage === "credited" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-foreground">
              {money(Math.round(numeric))} credited to your bot portfolio
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              The bot can now deploy this capital. Start the bot from the dashboard to begin
              scanning, buying and listing domains.
            </p>
            <Btn variant="primary" className="mt-2" onClick={() => onOpenChange(false)}>
              Go to dashboard
            </Btn>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-1">
            <div className="rounded-md border border-border bg-background p-4">
              <p className="label-xs mb-1.5">Your bot portfolio</p>
              <p className="text-[13px] leading-5 text-muted-foreground">
                The funds you deposit become your bot portfolio. The bot uses this balance as its
                operating capital to automatically buy and sell domains based on its configured
                strategy. Your dashboard tracks available balance, domain purchases and sales, open
                positions, completed transactions and P&amp;L.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
              <div className="mx-auto rounded-md border border-border bg-white p-2.5">
                <QRCodeSVG value={DEPOSIT_ADDRESS} size={124} level="M" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="label-xs">Bot wallet address (Solana)</p>
                <code className="break-all rounded bg-secondary px-2.5 py-2 text-xs font-medium text-foreground">
                  {DEPOSIT_ADDRESS}
                </code>
                <Btn size="sm" variant="secondary" onClick={copyAddress} className="w-fit">
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy wallet address"}
                </Btn>
                <p className="text-[11px] leading-4 text-muted-foreground">
                  Send only USDC or SOL on the Solana network. Other assets or networks may be lost
                  permanently.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dep-amount" className="label-xs">
                Deposit amount (USDC)
              </Label>
              <Input
                id="dep-amount"
                inputMode="decimal"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={stage === "waiting"}
              />
            </div>

            <ol className="space-y-1 rounded-md border border-border bg-background p-3.5 text-[12px] text-muted-foreground">
              <li>1. Copy the wallet address or scan the QR code in your Solana wallet.</li>
              <li>2. Send the exact amount you entered above.</li>
              <li>3. Confirm below — funds are credited once the transfer is verified.</li>
            </ol>

            {stage === "waiting" ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-warning/20 bg-warning/10 p-3.5">
                <div className="flex items-center gap-2.5 text-warning">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <div className="text-sm">
                    <p className="font-medium">Waiting for deposit</p>
                    <p className="text-warning/90">
                      Monitoring the bot wallet for {money(Math.round(numeric))}.
                    </p>
                  </div>
                </div>
                <Btn size="sm" variant="primary" onClick={confirm}>
                  Deposit received
                </Btn>
              </div>
            ) : (
              <Btn
                variant="primary"
                disabled={!validAmount}
                onClick={() => setStage("waiting")}
                className="w-full justify-center"
              >
                I have sent the funds
              </Btn>
            )}

            <p className="flex items-start gap-2 text-[11px] leading-4 text-muted-foreground">
              <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                Security note: this is a hot wallet used for operating the bot. We do not have
                access to or control your deposited funds. You can withdraw your funds 24/7 at any
                time.
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
