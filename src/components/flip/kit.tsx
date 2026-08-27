import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-md border border-border bg-card", className)}>
      {title || action ? (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "success" | "primary";
}) {
  return (
    <div className="rounded-md border border-border bg-card px-5 py-4 transition-colors duration-150 hover:border-border-strong">
      <p className="label-xs">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tabular tracking-tight",
          tone === "success" && "text-success",
          tone === "primary" && "text-primary",
        )}
      >
        {value}
      </p>
      {delta ? <p className="mt-1 text-xs text-muted-foreground tabular">{delta}</p> : null}
    </div>
  );
}

export function Score({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const tone =
    value >= 90 ? "text-primary" : value >= 80 ? "text-foreground" : "text-muted-foreground";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("font-semibold tabular", tone, size === "md" ? "text-sm" : "text-xs")}>
        {value}
      </span>
      <span className="hidden h-1 w-12 overflow-hidden rounded-full bg-secondary sm:block">
        <span
          className={cn("block h-full rounded-full", value >= 80 ? "bg-primary" : "bg-border-strong")}
          style={{ width: `${value}%` }}
        />
      </span>
    </span>
  );
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-md text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

export function Btn({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md";
}) {
  return (
    <button
      {...props}
      className={cn(
        btnBase,
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3.5",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary-hover",
        variant === "secondary" &&
          "border border-border bg-secondary text-foreground hover:border-border-strong hover:bg-elevated",
        variant === "outline" &&
          "border border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        className,
      )}
    />
  );
}

export function Tag({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium",
        tone === "default" && "border-border bg-secondary text-muted-foreground",
        tone === "primary" && "border-primary/30 bg-primary/10 text-primary",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
        tone === "danger" && "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </span>
  );
}

export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((h, i) => (
              <th
                key={h}
                className={cn(
                  "label-xs whitespace-nowrap px-5 py-2.5 font-medium",
                  i === 0 ? "text-left" : "text-left",
                  i === head.length - 1 && "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr
      className={cn(
        "border-b border-border/60 transition-colors duration-150 last:border-0 hover:bg-elevated",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Cell({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-5 py-3 text-[13px] text-foreground",
        align === "right" && "text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-ring/40 transition-colors duration-150",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-9 rounded-md border border-input bg-background px-2.5 text-[13px] text-foreground focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-ring/40 transition-colors duration-150",
        props.className,
      )}
    />
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-150",
        on ? "border-primary/40 bg-primary/80" : "border-border bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all duration-150",
          on ? "left-[18px] bg-primary-foreground" : "left-0.5 bg-muted-foreground",
        )}
      />
    </button>
  );
}
