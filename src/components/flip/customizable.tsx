import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Btn, Metric } from "@/components/flip/kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PREFIX = "flipmain.custom.";

/** Reads/writes a persisted override without ever hinting at it in the UI. */
export function useOverride<T>(id: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFIX + id);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
  }, [id]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(PREFIX + id, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [id],
  );

  const reset = useCallback(() => {
    setValue(initial);
    try {
      localStorage.removeItem(PREFIX + id);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { value, save, reset };
}

/** Fires only after 5 clicks in a row within a short window. Invisible otherwise. */
export function useSecretUnlock(onUnlock: () => void, clicks = 5, windowMs = 1400) {
  const count = useRef(0);
  const last = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    count.current = now - last.current > windowMs ? 1 : count.current + 1;
    last.current = now;
    if (count.current >= clicks) {
      count.current = 0;
      onUnlock();
    }
  }, [onUnlock, clicks, windowMs]);
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="label-xs">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground outline-none focus:border-border-strong"
      />
    </label>
  );
}

export type MetricData = {
  label: string;
  value: string;
  delta?: string;
};

export function EditableMetric({
  id,
  tone = "default",
  ...defaults
}: MetricData & { id: string; tone?: "default" | "success" | "primary" }) {
  const { value: data, save, reset } = useOverride<MetricData>(id, defaults);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MetricData>(defaults);

  const onClick = useSecretUnlock(() => {
    setDraft(data);
    setOpen(true);
  });

  return (
    <>
      <div onClick={onClick} className="cursor-default select-none">
        <Metric label={data.label} value={data.value} delta={data.delta} tone={tone} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit metric</DialogTitle>
            <DialogDescription>Values are stored on this device only.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-1">
            <Field label="Label" value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} />
            <Field label="Value" value={draft.value} onChange={(v) => setDraft({ ...draft, value: v })} />
            <Field
              label="Sub-label"
              value={draft.delta ?? ""}
              onChange={(v) => setDraft({ ...draft, delta: v })}
            />
          </div>
          <div className="flex justify-between">
            <Btn
              variant="ghost"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Reset
            </Btn>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  save(draft);
                  setOpen(false);
                }}
              >
                Save
              </Btn>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Inline editable text (e.g. a balance figure). Looks completely static. */
export function EditableText({
  id,
  initial,
  className,
  title = "Edit value",
}: {
  id: string;
  initial: string;
  className?: string;
  title?: string;
}) {
  const { value, save, reset } = useOverride<string>(id, initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(initial);

  const onClick = useSecretUnlock(() => {
    setDraft(value);
    setOpen(true);
  });

  return (
    <>
      <span onClick={onClick} className={cn("cursor-default select-none", className)}>
        {value}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">{title}</DialogTitle>
            <DialogDescription>Stored on this device only.</DialogDescription>
          </DialogHeader>
          <Field label="Value" value={draft} onChange={setDraft} />
          <div className="flex justify-between">
            <Btn
              variant="ghost"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Reset
            </Btn>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  save(draft);
                  setOpen(false);
                }}
              >
                Save
              </Btn>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type SeriesPoint = { t: string; value: number; cost: number };

/** Wraps a chart: 5 clicks on the chart body opens a point editor. */
export function EditableSeries({
  id,
  initial,
  children,
}: {
  id: string;
  initial: SeriesPoint[];
  children: (data: SeriesPoint[]) => ReactNode;
}) {
  const { value: data, save, reset } = useOverride<SeriesPoint[]>(id, initial);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SeriesPoint[]>(initial);

  const onClick = useSecretUnlock(() => {
    setDraft(data.map((d) => ({ ...d })));
    setOpen(true);
  });

  const setPoint = (i: number, patch: Partial<SeriesPoint>) =>
    setDraft(draft.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  return (
    <>
      <div onClick={onClick}>{children(data)}</div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit performance series</DialogTitle>
            <DialogDescription>Stored on this device only.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-1">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
              <span className="label-xs">Period</span>
              <span className="label-xs">Est. value</span>
              <span className="label-xs">Cost basis</span>
              <span />
            </div>
            {draft.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                <input
                  value={p.t}
                  onChange={(e) => setPoint(i, { t: e.target.value })}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-border-strong"
                />
                <input
                  type="number"
                  value={p.value}
                  onChange={(e) => setPoint(i, { value: Number(e.target.value) })}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs tabular text-foreground outline-none focus:border-border-strong"
                />
                <input
                  type="number"
                  value={p.cost}
                  onChange={(e) => setPoint(i, { cost: Number(e.target.value) })}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs tabular text-foreground outline-none focus:border-border-strong"
                />
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => setDraft(draft.filter((_, idx) => idx !== i))}
                >
                  ✕
                </Btn>
              </div>
            ))}
            <Btn
              size="sm"
              variant="outline"
              className="self-start"
              onClick={() =>
                setDraft([
                  ...draft,
                  { t: "New", value: draft.at(-1)?.value ?? 0, cost: draft.at(-1)?.cost ?? 0 },
                ])
              }
            >
              Add point
            </Btn>
          </div>

          <div className="flex justify-between">
            <Btn
              variant="ghost"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Reset
            </Btn>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  save(draft);
                  setOpen(false);
                }}
              >
                Save
              </Btn>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
