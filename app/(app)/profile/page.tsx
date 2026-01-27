// app/(app)/profile/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  User,
  MapPin,
  Calendar,
  Shield,
  Key,
  Activity,
  ArrowRight,
  UserPlus,
  Clock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleSection } from "@/components/ui/role-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthProvider";

type UserRole = "public" | "registered" | "verified" | "admin";

type ProfileResponse = {
  id: string;
  name: string | null;
  email: string;
  organization: string | null;
  country: string | null;
  phone: string | null;
  role: "REGISTERED" | "VERIFIED" | "ADMIN";
  joinDate: string; // ISO from createdAt
};

export default function ProfilePage() {
  const { user, status } = useAuth();

  const userRole: UserRole =
    (user.role?.toLowerCase?.() as UserRole) ?? "public";

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local editable state for personal info
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Personal info feedback
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setError(null);
      const res = await fetch("/api/profile/me");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch profile");
      }
      const data: ProfileResponse = await res.json();
      setProfile(data);
      setName(data.name ?? "");
      setOrganization(data.organization ?? "");
      setCountry(data.country ?? "");
      setPhone(data.phone ?? "");
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  if (status === "loading" || loadingProfile) {
    return (
      <div className="p-6 max-w-[90%] mx-auto text-sm text-muted-foreground">
        Loading your profile…
      </div>
    );
  }

  // Public user view
  if (userRole === "public" || !profile) {
    return (
      <div className="p-6 max-w-[90%] mx-auto">
        <div className="text-center py-24 px-6 bg-card border border-border rounded-xl">
          <UserPlus className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Sign In to Access Profile
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            You need to be a registered user to view your profile and manage
            your account settings.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => (window.location.href = "/login")}
          >
            Sign In
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span
              className="text-accent cursor-pointer hover:underline"
              onClick={() => (window.location.href = "/register")}
            >
              Register here
            </span>
          </div>
        </div>
      </div>
    );
  }

  const getTierBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-primary text-primary-foreground">
            Administrator
          </Badge>
        );
      case "verified":
        return (
          <Badge className="bg-accent text-accent-foreground">
            Verified User
          </Badge>
        );
      case "registered":
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            Registered User
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Public User
          </Badge>
        );
    }
  };

  const getTierFeatures = (role: UserRole) => {
    switch (role) {
      case "admin":
        return [
          "Full platform access and configuration",
          "Manage all user requests and data uploads",
          "Upload and manage dataset library",
          "User role management and verification",
          "View platform analytics and usage metrics",
          "Bulk operations and system monitoring",
        ];
      case "verified":
        return [
          "Submit standard boundary data requests",
          "Upload custom shapefiles for processing",
          "Track real-time request status",
          "Download approved datasets with retention",
          "Direct messaging with admin team",
          "Access restricted/premium datasets",
          "Priority processing queue",
        ];
      case "registered":
        return [
          "Browse and search full data catalog",
          "Submit standard boundary requests",
          "Track request status dashboard",
          "Download approved datasets",
          "Receive email notifications",
          "Access to public datasets only",
        ];
      default:
        return [
          "Browse public data catalog",
          "View dataset metadata and descriptions",
          "Explore interactive map boundaries",
          "Read platform documentation",
        ];
    }
  };

  const activityLog = [
    {
      date: "2025-03-20",
      action: "Downloaded dataset: Kenya Precipitation 2024",
      type: "download",
    },
    {
      date: "2025-03-18",
      action: "Submitted request: Rwanda Urban Heat Analysis",
      type: "request",
    },
    {
      date: "2025-03-15",
      action: "Uploaded custom shapefile for processing",
      type: "upload",
    },
    {
      date: "2025-03-12",
      action: "Completed request: Tanzania Land Classification",
      type: "completion",
    },
  ];

  const stats = {
    totalRequests: userRole === "admin" ? 156 : 12,
    downloads: userRole === "admin" ? 342 : 8,
    uploads: userRole === "admin" ? 89 : 3,
    messages: userRole === "admin" ? 1247 : 45,
  };

  const handleSaveProfile = async () => {
    try {
      setInfoError(null);
      setInfoSuccess(null);
      setInfoSaving(true);

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          organization,
          country,
          phone,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to update profile");
      }

      setInfoSuccess("Your profile information has been updated.");
      // Optionally sync profile state too
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: name || null,
              organization: organization || null,
              country: country || null,
              phone: phone || null,
            }
          : prev,
      );

      setTimeout(() => setInfoSuccess(null), 5000);
    } catch (err: any) {
      setInfoError(err.message || "Failed to update profile.");
      setTimeout(() => setInfoError(null), 5000);
    } finally {
      setInfoSaving(false);
    }
  };

  const joinDateLabel = new Date(profile.joinDate).toLocaleDateString();

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <Card className="mb-6 hover:shadow-md transition-shadow bg-card border-border">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <Avatar className="h-18 w-18 border-2 border-accent">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {(profile.name || profile.email)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 w-full">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-xl font-semibold text-foreground truncate">
                  {profile.name || profile.email}
                </h3>
                <div className="ml-2 flex-shrink-0">
                  {getTierBadge(userRole)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1 truncate">
                {profile.email}
              </p>
              {profile.organization && (
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {profile.organization}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {profile.country && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{profile.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {joinDateLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-input-background border border-border p-0.5 rounded-xl">
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            <User className="h-4 w-4 mr-1.5" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            <Shield className="h-4 w-4 mr-1.5" />
            Account
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            <Activity className="h-4 w-4 mr-1.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="info" className="space-y-6">
          <Card id="personal-info-section" className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Personal Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {infoError && (
                <div className="relative mt-1 mb-2 text-xs text-red-500 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setInfoError(null)}
                    className="absolute right-1.5 top-1.5 p-0.5 text-red-400 hover:text-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {infoError}
                </div>
              )}
              {infoSuccess && (
                <div className="relative mt-1 mb-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-md px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setInfoSuccess(null)}
                    className="absolute right-1.5 top-1.5 p-0.5 text-emerald-300 hover:text-emerald-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {infoSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 mt-2">
                  <Label htmlFor="name" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2 mt-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-input-background border-border opacity-70 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-foreground">
                    Organization
                  </Label>
                  <Input
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-foreground">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-input-background border-border"
                  />
                </div>
              </div>
              <Button
                onClick={async () => {
                  try {
                    setInfoError(null);
                    setInfoSuccess(null);
                    setInfoSaving(true);

                    const res = await fetch("/api/profile/update", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        organization,
                        country,
                        phone,
                      }),
                    });

                    const body = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      throw new Error(body.error || "Failed to update profile");
                    }

                    setInfoSuccess(
                      "Your profile information has been updated.",
                    );
                    // Sync profile snapshot
                    setProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: name || null,
                            organization: organization || null,
                            country: country || null,
                            phone: phone || null,
                          }
                        : prev,
                    );

                    setTimeout(() => setInfoSuccess(null), 5000);
                  } catch (err: any) {
                    setInfoError(err.message || "Failed to update profile.");
                    setTimeout(() => setInfoError(null), 5000);
                  } finally {
                    setInfoSaving(false);
                  }
                }}
                disabled={infoSaving}
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-70"
              >
                {infoSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Account Tier</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your current access level and available features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-accent/40 transition-colors">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Tier
                  </p>
                  {getTierBadge(userRole)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Your Features
                </h4>
                <ul className="space-y-2">
                  {getTierFeatures(userRole).map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Shield className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Security: wire to change-password API */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Security</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="relative mt-1 text-xs text-red-500 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setPasswordError(null)}
                    className="absolute right-1.5 top-1.5 p-0.5 text-red-400 hover:text-red-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="relative mt-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-md px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setPasswordSuccess(null)}
                    className="absolute right-1.5 top-1.5 p-0.5 text-emerald-300 hover:text-emerald-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-foreground">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-input-background border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-input-background border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-input-background border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                onClick={async () => {
                  setPasswordError(null);
                  setPasswordSuccess(null);

                  if (!currentPassword || !newPassword || !confirmPassword) {
                    setPasswordError("Please fill in all password fields.");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordError(
                      "New password and confirmation do not match.",
                    );
                    return;
                  }

                  try {
                    setPasswordLoading(true);
                    const res = await fetch("/api/profile/change-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ currentPassword, newPassword }),
                    });

                    const body = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      throw new Error(
                        body.error || "Failed to change password",
                      );
                    }

                    setPasswordSuccess(
                      "Your password has been updated successfully.",
                    );
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");

                    // Auto-hide success after 5 seconds
                    setTimeout(() => {
                      setPasswordSuccess(null);
                    }, 5000);
                  } catch (err: any) {
                    setPasswordError(
                      err.message || "Failed to change password.",
                    );
                    // Auto-hide error after 5 seconds
                    setTimeout(() => {
                      setPasswordError(null);
                    }, 5000);
                  } finally {
                    setPasswordLoading(false);
                  }
                }}
                disabled={passwordLoading}
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-70"
              >
                <Key className="h-4 w-4 mr-1.5" />
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your recent actions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {activityLog.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 mb-4 border-b border-border last:border-b-0 last:mb-0 last:pb-0 hover:bg-muted/50 rounded-lg p-3 transition-colors"
                  >
                    <div className="bg-primary p-2 rounded-lg flex-shrink-0">
                      <Clock className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {log.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Usage Statistics
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your platform usage overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg border border-border hover:border-accent/40 transition-colors">
                  <p className="text-2xl font-bold text-primary mb-1">
                    {stats.totalRequests}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Requests
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg border border-border hover:border-accent/40 transition-colors">
                  <p className="text-2xl font-bold text-accent mb-1">
                    {stats.downloads}
                  </p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg border border-border hover:border-accent/40 transition-colors">
                  <p className="text-2xl font-bold text-primary mb-1">
                    {stats.uploads}
                  </p>
                  <p className="text-xs text-muted-foreground">Uploads</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg border border-border hover:border-accent/40 transition-colors">
                  <p className="text-2xl font-bold text-accent mb-1">
                    {stats.messages}
                  </p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Registered/Verified extras */}
      <RoleSection roles={["registered", "verified"]} userRole={userRole}>
        <Card className="mt-6 border-l-4 border-l-accent bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Shield className="h-5 w-5" />
              Premium Features
            </CardTitle>
            <CardDescription>
              Advanced capabilities available to your tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h4 className="font-medium text-foreground mb-2">
                  Priority Processing
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your requests are processed faster than standard users
                </p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h4 className="font-medium text-foreground mb-2">
                  Custom Shapefile Upload
                </h4>
                <p className="text-sm text-muted-foreground">
                  Upload your own boundaries for precise data extraction
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RoleSection>
    </div>
  );
}
