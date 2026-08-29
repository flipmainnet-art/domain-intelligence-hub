import { useState } from "react";
import { AlertTriangle, Copy } from "lucide-react";
import { Btn } from "@/components/flip/kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const DEPOSIT_ADDRESS = "8QXEUP9FxnoytAkTiGRm1sBP2DGbD8kEqSevM22jrNWf";

export function DepositDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(DEPOSIT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback is manual selection; the address is already visible.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Btn variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Btn>
        </div>
      </DialogContent>
    </Dialog>
  );
}
