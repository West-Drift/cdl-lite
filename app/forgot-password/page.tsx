// app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AuthBackground } from "@/components/ui/auth-background";
import { X } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle URL success message
  if (typeof window !== "undefined" && !success) {
    const url = new URL(window.location.href);
    if (url.searchParams.get("sent")) {
      setSuccess(
        "If your email is registered, you'll receive a reset link shortly.",
      );
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(
          "If your email is registered, you'll receive a reset link shortly.",
        );
      } else {
        setError("An error occurred. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <>
      <AuthBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="relative mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                <button
                  onClick={() => setError("")}
                  className="absolute right-2 top-2 p-0.5 text-destructive hover:text-destructive/70"
                >
                  <X className="h-3 w-3" />
                </button>
                {error}
              </div>
            )}
            {success && (
              <div className="relative mb-4 p-3 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <button
                  onClick={() => setSuccess("")}
                  className="absolute right-2 top-2 p-0.5 text-emerald-300 hover:text-emerald-100"
                >
                  <X className="h-3 w-3" />
                </button>
                {success}
              </div>
            )}

            <p className="text-muted-foreground mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input-background border-border"
                  placeholder="your@email.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-accent"
              >
                Send Reset Link
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login" className="text-accent hover:underline">
                ← Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
