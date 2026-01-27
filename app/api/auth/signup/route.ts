// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { generateVerificationToken } from "@/lib/tokens";

const resend = new Resend(process.env.RESEND_API_KEY);
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, organization, country } =
      await request.json();

    // Validate input
    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Valid email and password required" },
        { status: 400 },
      );
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // ⚠️ Same response as success to prevent email enumeration
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user WITHOUT email verification
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        organization: organization || null,
        country: country || null,
        phone: null,
        passwordHash: hashedPassword,
        role: "REGISTERED",
      },
    });

    // Generate and store verification token (expires in 1 hour)
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Send verification email
    try {
      const verifyLink = `${NEXTAUTH_URL}/verify-email?token=${token}`;

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "✅ Activate Your CDLite Account",
        // Replace current html in signup/route.ts
        html: `
        <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(5, 72, 127, 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #05487f; font-size: 24px; margin: 0 0 8px 0;">Welcome to CDLite</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Thank you for joining Africa’s premier climate data platform.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0; color: #1f2937;">
              Please verify your email address to activate your account:
            </p>
            <a href="${verifyLink}" 
              style="display: inline-block; background: #05487f; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.2s;">
              ✅ Verify Email Address
            </a>
            <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">
              This link expires in 1 hour.
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
            <p>If you didn’t create this account, please ignore this email.</p>
            <p style="margin-top: 12px;">
              CDLite • Climate Data Library for Africa<br/>
              <a href="https://cdlite.org" style="color: #05487f; text-decoration: none;">cdlite.org</a>
            </p>
          </div>
        </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't expose email errors to client
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      {
        success: true,
        message:
          "If your email is valid, you'll receive a verification link shortly.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
