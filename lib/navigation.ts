// lib/navigation.ts
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: ("admin" | "researcher" | "guest")[];
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
    roles: ["admin", "researcher", "guest"],
  },
  {
    title: "Data Catalog",
    href: "/catalog",
    icon: Database,
    roles: ["admin", "researcher"],
  },
  {
    title: "Map Explorer",
    href: "/map",
    icon: MapPin,
    roles: ["admin", "researcher"],
  },
  { title: "Requests", href: "/requests", icon: FileCheck, roles: ["admin"] },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageCircle,
    roles: ["admin", "researcher"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["admin", "researcher", "guest"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: ["admin", "researcher", "guest"],
  },
  { title: "Admin Panel", href: "/admin", icon: ShieldCheck, roles: ["admin"] },
];
