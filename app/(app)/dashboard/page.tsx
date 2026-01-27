// app/(app)/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
} from "recharts";

import { StatCard } from "@/components/ui/stat-card";
import { NewsItem } from "@/components/ui/news-item";
import { ChartContainer } from "@/components/ui/chart-container";
import { RoleSection } from "@/components/ui/role-section";

import {
  Database,
  Globe,
  Clock,
  Download,
  List,
  Eye,
  FileText,
  TrendingUp,
  User,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

// Mock data (replace with API calls later)
const quickStats = [
  {
    title: "Total Datasets",
    value: "1,248",
    icon: Database,
    color: "bg-primary",
  },
  {
    title: "Countries Covered",
    value: "24",
    icon: Globe,
    color: "bg-accent",
  },
  {
    title: "Last Updated",
    value: "Nov 25, 2025",
    icon: Clock,
    color: "bg-muted",
  },
  {
    title: "Total Downloads",
    value: "8,942",
    icon: Download,
    color: "bg-secondary",
  },
  {
    title: "Active Requests",
    value: "23",
    icon: List,
    color: "bg-accent",
  },
];

const categories = [
  { name: "Climate", count: 342 },
  { name: "Agriculture", count: 289 },
  { name: "Hydrology", count: 215 },
  { name: "Demographics", count: 187 },
  { name: "Land Use", count: 156 },
  { name: "Energy", count: 89 },
  { name: "Disaster Risk", count: 70 },
];

const downloadTrendData = [
  { date: "Nov 1", downloads: 120 },
  { date: "Nov 5", downloads: 185 },
  { date: "Nov 10", downloads: 210 },
  { date: "Nov 15", downloads: 342 },
  { date: "Nov 20", downloads: 289 },
  { date: "Nov 25", downloads: 315 },
];

const newsItems = [
  {
    title: "Kenya 2025 Rainfall Projections",
    description: "High-resolution seasonal forecasts added",
    timeAgo: "2 days ago",
  },
  {
    title: "Ethiopia Soil Moisture 2024",
    description: "Dataset refreshed with latest satellite data",
    timeAgo: "4 days ago",
  },
  {
    title: "New Shapefile Upload Feature",
    description: "Upload custom boundaries for data requests",
    timeAgo: "1 week ago",
  },
];

const recentViews = [
  "Nairobi Precipitation 2024",
  "Lake Victoria Water Levels",
  "Kenya Admin Boundaries (GADM v4.1)",
];

const requestStatus = { pending: 1, ready: 2, completed: 5 };

const adminMetrics = {
  pendingRequests: 12,
  urgentRequests: 3,
  newUserCount: 15,
  latestUser: {
    name: "Jane Smith",
    org: "University of Nairobi",
    time: "2 hours ago",
  },
};

export default function DashboardPage() {
  const { user, status } = useAuth();
  const userRole = user.role; // "public" | "registered" | "verified" | "admin"

  useEffect(() => {
    // placeholder if you want side-effects when role changes later
  }, [userRole]);

  if (status === "loading") {
    return (
      <div className="p-6 max-w-[90%] mx-auto text-sm text-muted-foreground">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {quickStats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Datasets by Category */}
        <ChartContainer title="Datasets by Category">
          <div className="h-64 bg-card border border-border rounded-lg hover:shadow-md hover:border-accent/40 transition-all duration-200">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categories}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    return (
                      <div
                        className="bg-popover border border-border rounded-lg p-2 shadow-lg"
                        style={{
                          backgroundColor: "var(--popover)",
                          borderColor: "var(--border)",
                          color: "var(--popover-foreground)",
                          borderRadius: "var(--radius-md)",
                          padding: "6px 10px",
                          fontSize: "12px",
                        }}
                      >
                        <p className="text-sm">{payload[0]?.value} datasets</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[0, 10, 10, 0]}
                  isAnimationActive={false}
                  background={{ fill: "var(--muted)" }}
                  activeBar={{
                    fill: "var(--accent)",
                    stroke: "var(--primary)",
                    strokeWidth: 2,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Download Trends */}
        <ChartContainer title="Download Trends (Last 30 Days)">
          <div className="h-64 bg-card border border-border rounded-lg hover:shadow-md hover:border-accent/40 transition-all duration-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downloadTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;
                    return (
                      <div
                        className="bg-popover border border-border rounded-lg p-2 shadow-lg"
                        style={{
                          backgroundColor: "var(--popover)",
                          borderColor: "var(--border)",
                          color: "var(--popover-foreground)",
                          borderRadius: "var(--radius-md)",
                          padding: "6px 10px",
                          fontSize: "12px",
                        }}
                      >
                        <p className="text-sm">{label}</p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--accent)" }}
                        >
                          {payload[0]?.value} downloads
                        </p>
                      </div>
                    );
                  }}
                  cursor={{ stroke: "var(--primary)", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.1}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{
                    stroke: "var(--chart-2)",
                    strokeWidth: 2,
                    r: 4,
                    fill: "var(--background)",
                  }}
                  activeDot={{ r: 6, stroke: "var(--chart-2)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Recent Activity / News */}
      <ChartContainer title="Recent Activity" className="mb-8">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {newsItems.map((item, i) => (
            <NewsItem
              key={i}
              title={item.title}
              description={item.description}
              timeAgo={item.timeAgo}
            />
          ))}
        </div>
        <button className="mt-4 text-sm text-primary hover:underline">
          View All Updates →
        </button>
      </ChartContainer>

      {/* Role-Specific Section: Registered & Verified */}
      <RoleSection roles={["registered", "verified"]} userRole={userRole}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-md hover:border-accent/40 transition-all duration-200">
            <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
              <Eye className="text-primary h-5 w-5" />
              Your Recent Views
            </h3>
            <ul className="space-y-2">
              {recentViews.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground flex items-start"
                >
                  <span className="mr-2">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-md hover:border-accent/40 transition-all duration-200">
            <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
              <FileText className="text-accent h-5 w-5" />
              Request Status Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {requestStatus.pending}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {requestStatus.ready}
                </div>
                <div className="text-xs text-muted-foreground">Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {requestStatus.completed}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </RoleSection>

      {/* Role-Specific Section: Admin */}
      <RoleSection roles={["admin"]} userRole={userRole}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-md hover:border-accent/40 transition-all duration-200">
            <h3 className="font-medium text-lg mb-3 flex items-center gap-2 text-destructive">
              <List className="h-5 w-5" />
              Pending Requests
            </h3>
            <p className="text-3xl font-bold">{adminMetrics.pendingRequests}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {adminMetrics.urgentRequests} urgent
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-md hover:border-accent/40 transition-all duration-200">
            <h3 className="font-medium text-lg mb-3 flex items-center gap-2 text-accent">
              <TrendingUp className="h-5 w-5" />
              User Growth
            </h3>
            <p className="text-3xl font-bold text-accent">
              +{adminMetrics.newUserCount}
            </p>
            <p className="text-sm text-muted-foreground mt-1">this week</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-md hover:border-accent/40 transition-all duration-200">
            <h3 className="font-medium text-lg mb-3 flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              New User Info
            </h3>
            <p className="font-medium">{adminMetrics.latestUser.name}</p>
            <p className="text-sm text-muted-foreground">
              {adminMetrics.latestUser.org}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {adminMetrics.latestUser.time}
            </p>
          </div>
        </div>
      </RoleSection>
    </div>
  );
}
