// components/AuthProvider.tsx
"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

type AppRole = "public" | "registered" | "verified" | "admin";

type AppUser = {
  id: string;
  name: string;
  email?: string | null;
  role: AppRole;
  image?: string | null;
};

type AuthContextValue = {
  user: AppUser;
  status: "loading" | "authenticated" | "unauthenticated";
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const value = useMemo<AuthContextValue>(() => {
    // Map NextAuth session.user.role (REGISTERED/VERIFIED/ADMIN) -> app roles
    const sessionUser = session?.user as AppUser | undefined;

    if (status === "authenticated" && sessionUser) {
      const roleMap: Record<string, AppRole> = {
        REGISTERED: "registered",
        VERIFIED: "verified",
        ADMIN: "admin",
      };

      return {
        status,
        user: {
          id: sessionUser.id,
          name: sessionUser.name ?? "User",
          email: sessionUser.email,
          image: sessionUser.image,
          role: roleMap[sessionUser.role] ?? "registered",
        },
      };
    }

    // default public user when not logged in
    return {
      status,
      user: {
        id: "public",
        name: "Guest",
        role: "public",
        email: undefined,
        image: null,
      },
    };
  }, [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
