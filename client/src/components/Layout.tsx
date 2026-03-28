import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Target, Users, Sun, Moon, Menu, X, ChevronDown, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/org", label: "Organization", icon: Building2 },
];

function Logo() {
  return (
    <svg
      aria-label="KPI Tracker"
      viewBox="0 0 32 32"
      fill="none"
      className="w-8 h-8 flex-shrink-0"
    >
      {/* Diamond/target mark */}
      <rect x="4" y="14" width="10" height="10" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="18" y="8" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="8" y="4" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="16" y="20" width="12" height="8" rx="2" fill="currentColor" />
      <path d="M6 20 L10 14 L16 18 L22 8 L28 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-56 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
          <div className="text-primary">
            <Logo />
          </div>
          <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">KPI Tracker</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Phase 2 Demo</span>
          <button
            onClick={() => setDark(!dark)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-56 min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-background flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <div className="text-primary flex items-center gap-2">
            <Logo />
            <span className="font-semibold text-sm">KPI Tracker</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
