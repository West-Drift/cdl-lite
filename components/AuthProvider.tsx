// components/AuthProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";

type User = { role: "admin" | "researcher" | "guest" };
type AuthContextType = { user: User };

const AuthContext = createContext<AuthContextType>({ user: { role: "guest" } });

// 🔧 Replace this with real auth later
const mockUser: User = { role: "admin" }; // ← change to test roles

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: mockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
