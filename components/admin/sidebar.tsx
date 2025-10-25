"use client";

import { cn } from "@/lib/utils/tw";
import { BarChart3, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
      <div className="text-sm font-semibold uppercase tracking-wide text-text/70">Admin console</div>
      <nav className="mt-6 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active ? "bg-primary/10 text-primary" : "text-text/70 hover:bg-background"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-dashed border-border px-3 py-4 text-xs text-text/60">
        Data updates propagate instantly via Socket.io. Keep this console open for real-time collaboration.
      </div>
    </aside>
  );
};

export default Sidebar;
