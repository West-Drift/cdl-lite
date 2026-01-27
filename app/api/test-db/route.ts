// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, count });
  } catch (e: any) {
    console.error("DB test error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
