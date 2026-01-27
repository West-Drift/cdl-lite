// app/(app)/requests/page.tsx
"use client";

import { useState } from "react";
import {
  Search,
  Download,
  FileText,
  Plus,
  Clock,
  MapPin,
  Database,
  XCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Inbox,
  UserPlus,
  Trash,
  RotateCw,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

type RequestStatus =
  | "pending"
  | "processing"
  | "ready"
  | "completed"
  | "rejected";
type RequestType = "standard" | "custom";

interface RequestItem {
  id: string;
  title: string;
  status: RequestStatus;
  type: RequestType;
  boundary: string;
  datasetCount: number;
  submittedDate: string;
  completedDate?: string;
  fileUrl?: string;
  notes?: string;
}

const mockRequests: RequestItem[] = [
  {
    id: "REQ-2025-001",
    title: "Kenya Climate Data Request",
    status: "ready",
    type: "standard",
    boundary: "Nairobi County",
    datasetCount: 2,
    submittedDate: "2025-11-22",
    fileUrl: "/download/req-001",
    notes: "Need rainfall and temperature data for Q4 2024",
  },
  {
    id: "REQ-2025-002",
    title: "East Africa Soil Analysis",
    status: "processing",
    type: "custom",
    boundary: "Custom Shapefile",
    datasetCount: 1,
    submittedDate: "2025-11-20",
    notes: "Processing road network data for urban areas.",
  },
  {
    id: "REQ-2025-003",
    title: "Uganda Crop Yield Data",
    status: "pending",
    type: "standard",
    boundary: "Central Region",
    datasetCount: 2,
    submittedDate: "2025-11-23",
    notes: "Agricultural planning dataset request",
  },
  {
    id: "REQ-2025-004",
    title: "Tanzania Land Classification",
    status: "completed",
    type: "standard",
    boundary: "Dar es Salaam",
    datasetCount: 1,
    submittedDate: "2025-11-15",
    completedDate: "2025-11-18",
    fileUrl: "/download/req-004",
    notes: "Land use classification for urban development study",
  },
  {
    id: "REQ-2025-005",
    title: "Malawi Flood Risk Assessment",
    status: "rejected",
    type: "custom",
    boundary: "Southern Region",
    datasetCount: 2,
    submittedDate: "2025-11-10",
    notes: "Custom shapefile upload for flood modeling",
  },
];

const statusConfig: Record<
  RequestStatus,
  {
    icon: typeof Clock;
    label: string;
    className: string;
  }
> = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-muted text-muted-foreground border-border",
  },
  processing: {
    icon: AlertCircle,
    label: "Processing",
    className:
      "bg-amber-50/80 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800",
  },
  ready: {
    icon: CheckCircle,
    label: "Ready",
    className:
      "bg-accent/20 text-accent border-accent/40 dark:bg-accent/25 dark:text-accent-foreground dark:border-accent/60",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    className:
      "bg-primary/15 text-primary border-primary/40 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/60",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className:
      "bg-destructive/10 text-destructive border-destructive/40 dark:bg-destructive/20 dark:text-destructive-foreground dark:border-destructive/60",
  },
};

export default function RequestsPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const userRole = user.role as "public" | "registered" | "verified" | "admin";

  const [activeFilter, setActiveFilter] = useState<"all" | RequestStatus>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  if (status === "loading") {
    return (
      <div className="p-6 max-w-[90%] mx-auto text-sm text-muted-foreground">
        Loading requests…
      </div>
    );
  }

  const filteredRequests = mockRequests.filter((req) => {
    const matchesFilter = activeFilter === "all" || req.status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.boundary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: RequestStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${config.className}`}
      >
        <Icon size={12} />
        <span>{config.label}</span>
      </div>
    );
  };

  const handleNewRequest = () => {
    router.push("/catalog");
  };

  const handleDownload = (id: string) => {
    alert(`Download files for request ${id}`);
  };

  const handleResubmit = (id: string) => {
    alert(`Resubmit request ${id}`);
  };

  const handleDelete = (id: string) => {
    alert(`Delete request ${id}`);
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  // Simple totals; in a real app you would scope to user for non-admin
  const counts = {
    pending: mockRequests.filter((r) => r.status === "pending").length,
    processing: mockRequests.filter((r) => r.status === "processing").length,
    ready: mockRequests.filter((r) => r.status === "ready").length,
    completed: mockRequests.filter((r) => r.status === "completed").length,
    rejected: mockRequests.filter((r) => r.status === "rejected").length,
  };
  const totalCount =
    counts.pending +
    counts.processing +
    counts.ready +
    counts.completed +
    counts.rejected;

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      {/* Public User View */}
      {userRole === "public" && (
        <div className="text-center py-24 px-6 bg-card border border-border rounded-xl">
          <UserPlus className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Sign in to make requests
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            You need a registered account to request datasets and track their
            status.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleSignIn}
          >
            Sign In
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={handleSignUp}
            >
              Register here
            </button>
          </div>
        </div>
      )}

      {/* Logged-in User View */}
      {userRole !== "public" && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleNewRequest}
            >
              <Plus size={16} className="mr-1.5" />
              New Request
            </Button>

            <div className="text-sm text-muted-foreground">
              {userRole === "admin" && (
                <span className="text-primary font-medium mr-1">
                  Admin view •
                </span>
              )}
              <span>
                {userRole === "admin"
                  ? `Total Requests: ${mockRequests.length}`
                  : `Your Requests: ${totalCount}`}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search requests (ID, title, or boundary)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { value: "all", label: "All", count: totalCount },
              { value: "pending", label: "Pending", count: counts.pending },
              {
                value: "processing",
                label: "Processing",
                count: counts.processing,
              },
              { value: "ready", label: "Ready", count: counts.ready },
              {
                value: "completed",
                label: "Completed",
                count: counts.completed,
              },
              { value: "rejected", label: "Rejected", count: counts.rejected },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tab.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-input-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredRequests.length} of {totalCount} requests
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No requests found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || activeFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "You have not made any requests yet."}
              </p>
              {!searchQuery && activeFilter === "all" && (
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleNewRequest}
                >
                  Browse catalog to request data
                </Button>
              )}
            </div>
          )}

          {/* Request Cards */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-accent/40 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  {/* Left: Request Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {request.title}
                          </h3>
                          {getStatusBadge(request.status)}
                          {request.type === "custom" && (
                            <span className="px-2 py-1 text-xs bg-accent/20 text-accent border border-accent/40 rounded-md font-medium">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <FileText size={14} />
                            <span>Request ID: {request.id}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>Boundary: {request.boundary}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Database size={14} />
                            <span>{request.datasetCount} datasets</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Submitted: {request.submittedDate}</span>
                          </div>
                          {request.completedDate && (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle size={14} />
                              <span>Completed: {request.completedDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-muted-foreground mt-3">
                        {request.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-3 py-4 lg:py-6 px-0 lg:px-10 lg:w-64">
                    {request.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(request.id)}
                        className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                      >
                        <Trash size={14} className="mr-1.5" />
                        Delete
                      </Button>
                    )}

                    {request.status === "ready" && (
                      <Button
                        size="sm"
                        className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={() => handleDownload(request.id)}
                      >
                        <Download size={14} className="mr-1.5" />
                        Download
                      </Button>
                    )}

                    {request.status === "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResubmit(request.id)}
                        className="flex-1 hover:bg-accent hover:border-accent hover:text-accent-foreground"
                      >
                        <RotateCw size={14} className="mr-1.5" />
                        Resubmit
                      </Button>
                    )}

                    {(request.status === "processing" ||
                      request.status === "completed") && (
                      <div className="h-10 flex items-center justify-center text-sm text-muted-foreground">
                        No action
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
