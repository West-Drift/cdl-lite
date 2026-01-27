// app/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthBackground } from "@/components/ui/auth-background";
import { Eye, EyeOff, X, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const initializeMessages = () => {
      // Check for verification success
      if (searchParams.get("verified") === "true") {
        setSuccess("Email verified successfully! You can now log in.");
      }

      // Check for verification errors
      const verifyError = searchParams.get("error");
      if (verifyError === "invalid_token") {
        setError("Invalid verification link. Please try signing up again.");
      } else if (verifyError === "expired_token") {
        setError("Verification link expired. Please request a new one.");
      } else if (verifyError === "verification_failed") {
        setError("Verification failed. Please try again or contact support.");
      }
    };

    initializeMessages();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (result?.error) {
      // More specific error message for unverified emails
      setError(
        "Invalid email or password. If you just signed up, please verify your email first.",
      );
    } else {
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => router.push(callbackUrl), 1000);
    }
  };

  return (
    <>
      <AuthBackground />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              Sign in to CDLite
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="relative mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
                {error.includes("verify your email") && (
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      if (res.ok) {
                        setSuccess(
                          "Verification link resent! Check your inbox.",
                        );
                        setError("");
                      }
                    }}
                    className="mt-2 text-accent hover:underline text-sm"
                  >
                    → Resend verification email
                  </button>
                )}
              </div>
            )}
            {success && (
              <div className="relative mb-4 p-3 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{success}</span>
                <button
                  onClick={() => setSuccess("")}
                  className="p-0.5 text-emerald-300 hover:text-emerald-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input-background border-border pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Remember me
                </label>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-accent"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              <p>
                Don&apos; have an account?{" "}
                <Link
                  href="/signup"
                  className="text-accent hover:underline font-medium"
                >
                  Register here
                </Link>
              </p>
              <p className="text-muted-foreground">
                <Link href="/forgot-password" className="hover:underline">
                  Forgot password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
