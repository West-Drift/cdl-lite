// auth.config.ts

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        // if (!user.emailVerified) {
        //   console.log("User not verified:", user.email);
        //   return null; // ← This blocks login until email is verified
        // }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash, // safe: Prisma schema makes it non-nullable
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role, // ✅ Now typed as "REGISTERED" | "VERIFIED" | "ADMIN"
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // ✅ Safe
        token.image = user.image; // ✅ Safe
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as "REGISTERED" | "VERIFIED" | "ADMIN"; // ✅ Explicit cast
        session.user.image = token.image ?? undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
