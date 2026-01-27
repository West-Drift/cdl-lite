// app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { generatePasswordResetToken } from "@/lib/tokens";

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

    if (user) {
      const token = generatePasswordResetToken();
      const expires = new Date(Date.now() + 3600000); // 1 hour

      // Store token (for MVP, store in VerificationToken table)
      await prisma.verificationToken.deleteMany({
        where: { email: email.toLowerCase() },
      });

      await prisma.verificationToken.create({
        data: {
          email: email.toLowerCase(),
          token,
          expires,
        },
      });

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "🔑 Reset your password",
        // Replace current html in forgot-password/route.ts
        html: `
        <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 72, 127, 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #05487f; font-size: 24px; margin: 0 0 8px 0;">Reset Your Password</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              You requested to reset your CDLite account password.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0; color: #1f2937;">
              Click the button below to set a new password:
            </p>
            <a href="${NEXTAUTH_URL}/reset-password?token=${token}" 
              style="display: inline-block; background: #05487f; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s;">
              🔑 Reset Password
            </a>
            <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">
              This link expires in 1 hour.
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
            <p>If you didn’t request this, please ignore this email.</p>
            <p style="margin-top: 12px;">
              CDLite • Climate Data Library for Africa<br/>
              <a href="https://cdlite.org" style="color: #05487f; text-decoration: none;">cdlite.org</a>
            </p>
          </div>
        </div>
        `,
      });
    }

    // Prevent email enumeration
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
