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
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.emailVerified) {
      // Prevent enumeration: return success regardless
      return NextResponse.json({ success: true });
    }

    // Delete old tokens
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
      // For /api/auth/resend-verification/route.ts
      html: `
        <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 72, 127, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #05487f; font-size: 24px; margin: 0 0 8px 0;">Verify Your Email</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            We’ve resent your verification link.
            </p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0; color: #1f2937;">
            Click below to activate your CDLite account:
            </p>
            <a href="${verifyLink}" 
            style="display: inline-block; background: #05487f; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s;">
            ✅ Verify Now
            </a>
            <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">
            Link expires in 1 hour.
            </p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
            <p>Need help? Contact support@cdlite.org</p>
            <p style="margin-top: 12px;">
            CDLite • Climate Data Library for Africa<br/>
            <a href="https://cdlite.org" style="color: #05487f; text-decoration: none;">cdlite.org</a>
            </p>
        </div>
        </div>
        `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend verification failed:", err);
    return NextResponse.json({ error: "Failed to resend" }, { status: 500 });
  }
}
