// components/Sidebar.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { navItems } from "@/lib/navigation";
import { useAuth } from "@/components/AuthProvider";
import logoImage from "@/public/assets/acre_logo.png";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, status } = useAuth();

  // Always call hooks before any early returns
  const visibleNav = useMemo(
    () =>
      navItems.filter((item) => !item.roles || item.roles.includes(user.role)),
    [user.role],
  );

  const initials = useMemo(
    () =>
      user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [user.name],
  );

  // Loading skeleton AFTER hooks
  if (status === "loading") {
    return (
      <div className="h-screen w-48 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]" />
    );
  }

  return (
    <div
      className={`bg-[var(--sidebar)] h-screen border-r border-[var(--sidebar-border)] flex flex-col transition-all duration-300 ${
        collapsed ? "w-18" : "w-54"
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
              height={40}
              className="object-contain"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
      {/* Nav Links */}
      <nav className="px-2 py-4 space-y-1 flex-1 overflow-y-auto">
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
              <div
                className={`relative flex items-center ${collapsed ? "" : "mr-3"}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.hasActivity && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full border border-[var(--sidebar)] ${
                      isActive ? "bg-emerald-400" : "bg-emerald-500"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
              {!collapsed && item.title}
            </Link>
          );
        })}
      </nav>
      {/* User footer with avatar */}
      <div className="p-3">
        <Link
          href={user.role === "public" ? "/login" : "/profile"}
          className={`flex items-center gap-3 rounded px-2 py-2 hover:bg-[var(--sidebar-accent)] transition-colors ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
          )}

          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">
                {user.name}
              </span>
              <span className="text-xs text-[var(--sidebar-foreground)]/70 capitalize">
                {user.role}
              </span>
            </div>
          )}
        </Link>
      </div>
      {/* Footer copyright, only when expanded */}
      {!collapsed && (
        <div className="mt-1 px-4 pt-2 pb-2 border-t border-[var(--sidebar-border)] text-[0.7rem] text-[var(--sidebar-foreground)]/70">
          © 2026 Climate Data Library
        </div>
      )}
    </div>
  );
}
