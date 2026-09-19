import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Compass,
  Globe,
  Sparkles,
  Bot,
  BarChart3,
  Wallet,
  ArrowLeftRight,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBot } from "@/lib/bot";
import { useAuth } from "@/lib/auth";

type Item = { to: string; label: string; icon: React.ElementType };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Main",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/discover", label: "Discover", icon: Compass },
    ],
  },
  {
    label: "Portfolio",
    items: [{ to: "/my-domains", label: "My Domains", icon: Globe }],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/insights", label: "AI Insights", icon: Sparkles },
      { to: "/autopilot", label: "Autopilot", icon: Bot },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/wallet", label: "Wallet", icon: Wallet },
      { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    ],
  },
];

function NavLink({ item, onNavigate }: { item: Item; onNavigate?: (() => void) | undefined }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.to === "/" }}
      className="group flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-foreground"
      activeProps={{
        className: "!bg-sidebar-accent !text-foreground font-medium",
      }}
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
          <span>{item.label}</span>
        </>
      )}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const { snapshot: bot } = useBot();
  const { user, displayName, signOut } = useAuth();
  const name = displayName || user?.email?.split("@")[0] || "Account";
  const initials = name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-14 items-center border-b border-sidebar-border px-5">
        <Link to="/" onClick={onNavigate} className="text-[15px] font-semibold tracking-[0.18em]">
          FLIP<span className="text-primary">MAIN</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="label-xs px-2.5 pb-1.5">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((i) => (
                <NavLink key={i.to} item={i} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <NavLink item={{ to: "/settings", label: "Settings", icon: Settings }} onNavigate={onNavigate} />
        <div className="mt-2 flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-secondary text-[11px] font-semibold">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{name}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{user?.email ?? ""}</span>
          </span>
          <button
            aria-label="Sign out"
            title="Sign out"
            onClick={async () => {
              onNavigate?.();
              await signOut();
            }}
            className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-sidebar-border px-5 py-3">
        <span className="relative flex h-1.5 w-1.5">
          {bot.running ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          ) : null}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", bot.running ? "bg-success" : "bg-muted-foreground")} />
        </span>
        <span className="text-[11px] text-muted-foreground">
          {bot.running ? "Flipmain is hunting" : "Flipmain is idle"}
        </span>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const isAuthRoute = pathname.startsWith("/auth");
  const current =
    groups.flatMap((g) => g.items).find((i) => i.to !== "/" && pathname.startsWith(i.to))?.label ??
    "Dashboard";

  useEffect(() => {
    if (!loading && !session && !isAuthRoute) navigate({ to: "/auth", replace: true });
  }, [loading, session, isAuthRoute, navigate]);

  if (isAuthRoute) return <>{children}</>;

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-[13px] text-muted-foreground">Loading…</span>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <span className="text-[15px] font-semibold tracking-[0.18em]">
          FLIP<span className="text-primary">MAIN</span>
        </span>
        <span className="text-[13px] text-muted-foreground">{current}</span>
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 z-10 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="lg:pl-60">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
