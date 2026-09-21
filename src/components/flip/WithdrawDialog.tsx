import { useState } from "react";
import { AlertTriangle } from "lucide-react";
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
import { useBot } from "@/lib/bot";

export function WithdrawDialog({
  open,
  onOpenChange,
  available = 0,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  available?: number;
}) {
  const { withdraw } = useBot();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [asset, setAsset] = useState<"USDC" | "SOL">("USDC");
  const [submitted, setSubmitted] = useState(false);

  const numeric = Number(amount);
  const invalidAmount = amount !== "" && (!Number.isFinite(numeric) || numeric <= 0);
  const overBalance = Number.isFinite(numeric) && numeric > available;
  const canSubmit =
    !invalidAmount && numeric > 0 && !overBalance && address.trim().length >= 32;

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setSubmitted(false);
      setAmount("");
      setAddress("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Withdraw funds</DialogTitle>
          <DialogDescription>
            Withdrawals are sent on the Solana network only, as USDC or SOL.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="rounded-md border border-success/20 bg-success/10 p-4 text-sm text-success">
              Withdrawal of {numeric.toLocaleString()} {asset} queued to{" "}
              <span className="break-all font-medium">{address}</span>. It will settle after
              network confirmation.
            </div>
            <div className="flex justify-end">
              <Btn variant="secondary" onClick={() => close(false)}>
                Done
              </Btn>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="label-xs">Asset</Label>
              <div className="flex gap-2">
                {(["USDC", "SOL"] as const).map((a) => (
                  <Btn
                    key={a}
                    size="sm"
                    variant={asset === a ? "primary" : "secondary"}
                    onClick={() => setAsset(a)}
                  >
                    {a}
                  </Btn>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="label-xs" htmlFor="wd-amount">
                Amount ({asset})
              </Label>
              <Input
                id="wd-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Available: ${available.toLocaleString()}</span>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setAmount(String(Math.max(0, available)))}
                >
                  Max
                </button>
              </div>
              {invalidAmount && (
                <p className="text-xs text-danger">Enter a valid amount.</p>
              )}
              {!invalidAmount && overBalance && (
                <p className="text-xs text-danger">Amount exceeds available balance.</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="label-xs" htmlFor="wd-address">
                Solana withdrawal address
              </Label>
              <Input
                id="wd-address"
                placeholder="e.g. 8QXEUP9Fxnoyt…"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-medium"
              />
              <p className="text-xs text-muted-foreground">
                Must be a Solana (SPL) address. USDC and SOL are sent on the Solana network —
                sending to an address on any other network will result in permanent loss.
              </p>
            </div>

            <div className="flex gap-3 rounded-md border border-warning/20 bg-warning/10 p-3.5 text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm text-warning/90">
                Double-check the address. On-chain transfers cannot be reversed once broadcast.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Btn variant="secondary" onClick={() => close(false)}>
                Cancel
              </Btn>
              <Btn
                variant="primary"
                disabled={!canSubmit}
                onClick={() => {
                  withdraw(numeric);
                  setSubmitted(true);
                }}
              >
                Withdraw
              </Btn>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
