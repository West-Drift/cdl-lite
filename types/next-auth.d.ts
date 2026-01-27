// types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "REGISTERED" | "VERIFIED" | "ADMIN";
    image?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "REGISTERED" | "VERIFIED" | "ADMIN";
      image?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "REGISTERED" | "VERIFIED" | "ADMIN";
    image?: string;
  }
}
