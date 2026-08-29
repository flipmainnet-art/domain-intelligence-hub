import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Field, Input, PageHeader, Panel, Select, Tag, Toggle } from "@/components/flip/kit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Flipmain" },
      { name: "description", content: "Manage your Flipmain profile, notifications, and acquisition preferences." },
      { property: "og:title", content: "Settings — Flipmain" },
      { property: "og:description", content: "Profile, alerts and automation preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [alerts, setAlerts] = useState({ score: true, auction: true, offers: true, weekly: false });
  const [autopilot, setAutopilot] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Profile, notifications and acquisition defaults." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Profile">
          <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
            <Field label="Full name">
              <Input defaultValue="Alex Rivera" />
            </Field>
            <Field label="Email">
              <Input defaultValue="alex@riveracapital.co" />
            </Field>
            <Field label="Company" hint="Optional — shown on outbound offers.">
              <Input defaultValue="Rivera Capital" />
            </Field>
            <Field label="Timezone">
              <Select defaultValue="pt">
                <option value="pt">Pacific Time (UTC-7)</option>
                <option value="et">Eastern Time (UTC-4)</option>
                <option value="utc">UTC</option>
                <option value="pkt">Pakistan (UTC+5)</option>
              </Select>
            </Field>
          </div>
          <div className="border-t border-border px-5 py-4">
            <Btn variant="primary" size="sm">Save profile</Btn>
          </div>
        </Panel>

        <Panel title="Notifications" action={<Tag tone="primary">Email + in-app</Tag>}>
          <div className="flex flex-col divide-y divide-border/60">
            {(
              [
                ["score", "Flip Score spikes", "When a watched domain's score moves 5+ points."],
                ["auction", "Auction endings", "15 minutes before tracked auctions close."],
                ["offers", "Inbound offers", "New offers and counter-offers on your listings."],
                ["weekly", "Weekly digest", "Portfolio performance summary every Monday."],
              ] as const
            ).map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Toggle
                  on={alerts[key]}
                  onChange={(v) => setAlerts((s) => ({ ...s, [key]: v }))}
                  label={title}
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Acquisition defaults">
          <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
            <Field label="Default max bid" hint="Applied to new watchlist and autopilot targets.">
              <Input defaultValue="$250" inputMode="numeric" />
            </Field>
            <Field label="Preferred TLDs">
              <Select defaultValue="com">
                <option value="com">.com only</option>
                <option value="com-io">.com + .io</option>
                <option value="com-io-ai">.com + .io + .ai</option>
                <option value="all">All TLDs</option>
              </Select>
            </Field>
            <Field label="Minimum Flip Score">
              <Select defaultValue="80">
                <option value="70">70+</option>
                <option value="80">80+</option>
                <option value="90">90+</option>
              </Select>
            </Field>
            <Field label="Listing markup" hint="Auto-suggested list price over estimated value.">
              <Select defaultValue="30">
                <option value="15">+15%</option>
                <option value="30">+30%</option>
                <option value="50">+50%</option>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel title="Autopilot">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[13px] font-medium text-foreground">Enable Autopilot</p>
              <p className="text-xs text-muted-foreground">
                Let Flipmain acquire domains matching your acquisition defaults.
              </p>
            </div>
            <Toggle on={autopilot} onChange={setAutopilot} label="Enable Autopilot" />
          </div>
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs text-muted-foreground">
              Autopilot runs against your wallet balance and never exceeds your configured max bid.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
