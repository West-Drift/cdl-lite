// app/(app)/profile/page.tsx
"use client";

import { useState } from "react";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Key,
  Bell,
  CreditCard,
  Clock,
  Database,
  Download,
  FileText,
  Activity,
  ArrowRight,
  UserPlus,
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

type UserRole = "public" | "registered" | "verified" | "admin";

export default function ProfilePage() {
  const [userRole, setUserRole] = useState<UserRole>("verified"); // ✅ Changed to mutable state
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    organization: "Research Institute of Africa",
    country: "Kenya",
    phone: "+254 712 345 678",
    joinDate: "2024-01-15",
  });

  // ✅ Public user view - same as Requests/Notifications
  if (userRole === "public") {
    return (
      <div className="p-6 max-w-[90%] mx-auto">
        {/* Role Switcher (Dev Only) */}
        <div className="mb-6 p-3 bg-muted rounded-lg text-sm">
          <span className="font-medium">Dev Role Switcher:</span>
          {(["public", "registered", "verified", "admin"] as const).map(
            (role) => (
              <button
                key={role}
                onClick={() => setUserRole(role)}
                className={`ml-2 px-3 py-1 rounded ${
                  userRole === role
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {role}
              </button>
            )
          )}
        </div>

        {/* Public View - Same as Requests/Notifications */}
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
            onClick={() => alert("Navigate to sign in")}
          >
            Sign In
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span className="text-accent cursor-pointer hover:underline">
              Register here
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Logged-in user profile content
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

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      {/* Role Switcher (Dev Only) - Same as other pages */}
      <div className="mb-6 p-3 bg-muted rounded-lg text-sm">
        <span className="font-medium">Dev Role Switcher:</span>
        {(["public", "registered", "verified", "admin"] as const).map(
          (role) => (
            <button
              key={role}
              onClick={() => setUserRole(role)}
              className={`ml-2 px-3 py-1 rounded ${
                userRole === role
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {role}
            </button>
          )
        )}
      </div>

      {/* Profile Header */}
      <Card className="mb-6 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-accent">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {userInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-semibold text-foreground">
                  {userInfo.name}
                </h3>
                {getTierBadge(userRole)}
              </div>
              <p className="text-lg text-muted-foreground mb-1">
                {userInfo.email}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {userInfo.organization}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{userInfo.country}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(userInfo.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-input-background border border-border p-1 rounded-xl">
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

        {/* Personal Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">
                Personal Information
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, name: e.target.value })
                    }
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-foreground">
                    Organization
                  </Label>
                  <Input
                    id="organization"
                    value={userInfo.organization}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, organization: e.target.value })
                    }
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-foreground">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={userInfo.country}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, country: e.target.value })
                    }
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, phone: e.target.value })
                    }
                    className="bg-input-background border-border"
                  />
                </div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
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
                {userRole === "public" && (
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Upgrade Account
                  </Button>
                )}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Security</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-foreground">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="bg-input-background border-border"
                />
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Key className="h-4 w-4 mr-1.5" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "Email Notifications",
                  description: "Receive updates via email",
                  checked: true,
                },
                {
                  label: "Request Updates",
                  description: "Notify when requests are processed",
                  checked: true,
                },
                {
                  label: "New Messages",
                  description: "Alert for new messages from admin",
                  checked: true,
                },
                {
                  label: "Data Ready",
                  description: "Notify when data is available for download",
                  checked: true,
                },
              ].map((pref, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {pref.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pref.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={pref.checked}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
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

          <Card>
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

      {/* ✅ Role-Specific Sections - Enhanced */}

      {/* Registered/Verified User Section */}
      <RoleSection roles={["registered", "verified"]} userRole={userRole}>
        <Card className="mt-6 border-l-4 border-l-accent">
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
