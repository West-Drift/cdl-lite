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

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-muted text-muted-foreground border-muted",
  },
  processing: {
    icon: AlertCircle,
    label: "Processing",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  ready: {
    icon: CheckCircle,
    label: "Ready",
    className: "bg-accent/20 text-accent border-accent/30",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

export default function RequestsPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<
    "public" | "registered" | "verified" | "admin"
  >("registered");
  const [activeFilter, setActiveFilter] = useState<"all" | RequestStatus>(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

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

  // Calculate role-specific stats
  const roleStats = {
    pending: mockRequests.filter(
      (r) => r.status === "pending" && userRole !== "public"
    ).length,
    processing: mockRequests.filter(
      (r) => r.status === "processing" && userRole !== "public"
    ).length,
    ready: mockRequests.filter(
      (r) => r.status === "ready" && userRole !== "public"
    ).length,
    completed: mockRequests.filter(
      (r) => r.status === "completed" && userRole !== "public"
    ).length,
    rejected: mockRequests.filter(
      (r) => r.status === "rejected" && userRole !== "public"
    ).length,
  };

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

      {/* Public User View */}
      {userRole === "public" && (
        <div className="text-center py-24 px-6 bg-card border border-border rounded-xl">
          <UserPlus className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Sign In to Make Requests
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            You need to be a registered user to request datasets and track your
            requests.
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
                <span className="text-primary">Admin View • </span>
              )}
              {userRole === "admin" ? (
                <span>Total Requests: {mockRequests.length}</span>
              ) : (
                <span>
                  Your Requests:{" "}
                  {roleStats.pending +
                    roleStats.processing +
                    roleStats.ready +
                    roleStats.completed +
                    roleStats.rejected}
                </span>
              )}
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
              {
                value: "all",
                label: "All",
                count:
                  userRole === "admin"
                    ? mockRequests.length
                    : roleStats.pending +
                      roleStats.processing +
                      roleStats.ready +
                      roleStats.completed +
                      roleStats.rejected,
              },
              {
                value: "pending",
                label: "Pending",
                count:
                  userRole === "admin"
                    ? mockRequests.filter((r) => r.status === "pending").length
                    : roleStats.pending,
              },
              {
                value: "processing",
                label: "Processing",
                count:
                  userRole === "admin"
                    ? mockRequests.filter((r) => r.status === "processing")
                        .length
                    : roleStats.processing,
              },
              {
                value: "ready",
                label: "Ready",
                count:
                  userRole === "admin"
                    ? mockRequests.filter((r) => r.status === "ready").length
                    : roleStats.ready,
              },
              {
                value: "completed",
                label: "Completed",
                count:
                  userRole === "admin"
                    ? mockRequests.filter((r) => r.status === "completed")
                        .length
                    : roleStats.completed,
              },
              {
                value: "rejected",
                label: "Rejected",
                count:
                  userRole === "admin"
                    ? mockRequests.filter((r) => r.status === "rejected").length
                    : roleStats.rejected,
              },
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
            Showing {filteredRequests.length} of{" "}
            {userRole === "admin"
              ? mockRequests.length
              : roleStats.pending +
                roleStats.processing +
                roleStats.ready +
                roleStats.completed +
                roleStats.rejected}{" "}
            requests
          </div>

          {/* Empty State for No Requests */}
          {filteredRequests.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No requests found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || activeFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "You haven't made any requests yet."}
              </p>
              {!searchQuery && activeFilter === "all" && (
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleNewRequest}
                >
                  Browse Catalog to Request Data
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
                            <span className="px-2 py-1 text-xs bg-accent/20 text-accent border border-accent/30 rounded-md font-medium">
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

                  {/* Right: Actions - ✅ Only 3 buttons as specified */}
                  <div className="flex flex-col gap-3 py-7 px-10 lg:w-64">
                    {/* ✅ Pending: Delete button */}
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

                    {/* ✅ Ready: Download button */}
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

                    {/* ✅ Rejected: Resubmit button */}
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

                    {/* ✅ Processing/Completed: No button */}
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
