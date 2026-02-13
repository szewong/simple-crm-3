"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  Briefcase,
  Building2,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Deals", href: "/deals", icon: Briefcase },
  { label: "Activities", href: "/activities", icon: Activity },
];

const bottomNavItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  user: {
    full_name: string;
    email: string;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-16 px-5 border-b border-slate-800 justify-between">
        {!collapsed && (
          <span className="text-lg font-semibold text-white">Simple CRM</span>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-sm font-bold text-white">S</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors",
            collapsed && "mx-auto mt-2"
          )}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Main
          </p>
        )}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 h-10 rounded-lg transition-colors duration-150",
              collapsed ? "justify-center w-10 mx-auto" : "px-3",
              isActive(item.href)
                ? "bg-slate-800 text-white font-medium"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}

        {!collapsed && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Settings
            </p>
          </div>
        )}
        {collapsed && <div className="pt-4" />}
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 h-10 rounded-lg transition-colors duration-150",
              collapsed ? "justify-center w-10 mx-auto" : "px-3",
              isActive(item.href)
                ? "bg-slate-800 text-white font-medium"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-medium text-white shrink-0">
              {user?.full_name
                ? user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </aside>
  );
}
