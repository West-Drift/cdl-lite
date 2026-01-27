// lib/navigation.ts
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: ("public" | "registered" | "verified" | "admin")[];
  // optional badge flag (dot only)
  hasActivity?: boolean;
};

import {
  LayoutDashboard,
  Database,
  MapPin,
  FileCheck,
  MessageCircle,
  Bell,
  User,
  ShieldCheck,
} from "lucide-react";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["public", "registered", "verified", "admin"],
  },
  {
    title: "Data Catalog",
    href: "/catalog",
    icon: Database,
    roles: ["public", "registered", "verified", "admin"],
  },
  {
    title: "Map Explorer",
    href: "/map",
    icon: MapPin,
    roles: ["public", "registered", "verified", "admin"],
  },
  {
    title: "Requests",
    href: "/requests",
    icon: FileCheck,
    roles: ["registered", "verified", "admin"],
    // later: drive this from real data
    hasActivity: true, // temporary to see the green dot
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageCircle,
    roles: ["registered", "verified", "admin"],
    // later: drive this from real data
    hasActivity: true, // temporary to see the green dot
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["registered", "verified", "admin"],
    // later: drive this from real data
    hasActivity: true, // temporary to see the green dot
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: ["registered", "verified", "admin"],
  },
  {
    title: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["admin"],
  },
];
