// components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { navItems } from "@/lib/navigation";
import { useAuth } from "@/components/AuthProvider";
import logoImage from "@/public/assets/acre_logo.png";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <div
      className={`bg-[var(--sidebar)] h-screen border-r border-[var(--sidebar-border)] flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-48"
      }`}
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center"
            aria-label="Go to homepage"
          >
            <Image
              src={logoImage}
              alt="ClimateDB"
              height={48} // adjust based on your design (e.g., 28px tall)
              className="object-contain"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="px-2 py-4 space-y-1 flex-1">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
              } ${collapsed ? "justify-center" : "justify-start"}`}
            >
              <Icon
                className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`}
                aria-hidden="true"
              />
              {!collapsed && item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 text-xs text-[var(--sidebar-foreground)] border-t border-[var(--sidebar-border)]">
          © 2025 Climate Data Library
        </div>
      )}
    </div>
  );
}
