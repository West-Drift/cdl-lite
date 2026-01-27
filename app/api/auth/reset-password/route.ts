// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { generateVerificationToken } from "@/lib/tokens";

const resend = new Resend(process.env.RESEND_API_KEY);
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true }); // prevent enumeration
    }

    await prisma.verificationToken.deleteMany({
      where: { email: email.toLowerCase() },
    });

    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 3600000);

    await prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      },
    });

    const verifyLink = `${NEXTAUTH_URL}/verify-email?token=${token}`;
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "✅ Resent: Verify Your CDLite Account",
      html: `...`, // ← paste refined HTML from above
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend verification failed:", err);
    return NextResponse.json({ error: "Failed to resend" }, { status: 500 });
  }
}
