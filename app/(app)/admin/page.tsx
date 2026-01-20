// app/(app)/admin/page.tsx
"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  MessageSquare,
  Clock,
  User,
  Shield,
  Trash,
  Check,
  Inbox,
  Search,
  Filter,
  AlertTriangle,
  Activity,
  Database,
  Users,
  BarChart3,
  Upload,
  Eye,
  Mail,
  ShieldCheck,
  UserCheck,
  UserX,
  Settings,
  TrendingUp,
  Calendar,
  MapPin,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AdminRole = "admin" | "moderator" | "staff";
type RequestStatus = "pending" | "approved" | "rejected" | "processed";
type UserRole = "public" | "registered" | "verified" | "admin";

interface AdminRequest {
  id: string;
  title: string;
  status: RequestStatus;
  user: {
    name: string;
    email: string;
    organization: string;
    role: "registered" | "verified";
  };
  boundary: string;
  datasetCount: number;
  submittedDate: string;
  completedDate?: string;
  notes?: string;
  priority: "normal" | "urgent";
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: "registered" | "verified" | "admin";
  joinDate: string;
  lastActive: string;
  requestCount: number;
}

// ✅ Mock data - same structure as your existing data
const mockRequests: AdminRequest[] = [
  {
    id: "REQ-2025-001",
    title: "Kenya Climate Data Request",
    status: "pending",
    user: {
      name: "Dr. Alice Mwangi",
      email: "alice@research.edu",
      organization: "University of Nairobi",
      role: "verified",
    },
    boundary: "Nairobi County",
    datasetCount: 2,
    submittedDate: "2025-12-01",
    notes: "Need rainfall and temperature data for Q4 2024",
    priority: "normal",
  },
  {
    id: "REQ-2025-002",
    title: "East Africa Soil Analysis",
    status: "approved",
    user: {
      name: "John Malek",
      email: "jmalek@ngo.org",
      organization: "Humanitarian Relief NGO",
      role: "registered",
    },
    boundary: "Custom Shapefile",
    datasetCount: 1,
    submittedDate: "2025-11-28",
    completedDate: "2025-12-02",
    notes: "Processing road network data for urban areas.",
    priority: "urgent",
  },
  {
    id: "REQ-2025-003",
    title: "Uganda Crop Yield Data",
    status: "rejected",
    user: {
      name: "Sarah Lemma",
      email: "s.lemma@agri.gov.ug",
      organization: "Ugandan Ministry of Agriculture",
      role: "verified",
    },
    boundary: "Central Region",
    datasetCount: 2,
    submittedDate: "2025-11-23",
    notes: "Insufficient metadata provided",
    priority: "normal",
  },
  {
    id: "REQ-2025-004",
    title: "Tanzania Land Classification",
    status: "processed",
    user: {
      name: "Pierre Kambale",
      email: "pk@mining-corp.tz",
      organization: "Mining Corporation Ltd",
      role: "verified",
    },
    boundary: "Dar es Salaam",
    datasetCount: 1,
    submittedDate: "2025-11-15",
    completedDate: "2025-11-18",
    notes: "Data ready for download",
    priority: "normal",
  },
];

const mockUsers: AdminUser[] = [
  {
    id: "USR-2025-001",
    name: "Dr. Alice Mwangi",
    email: "alice@research.edu",
    organization: "University of Nairobi",
    role: "verified",
    joinDate: "2024-01-15",
    lastActive: "2025-12-01",
    requestCount: 12,
  },
  {
    id: "USR-2025-002",
    name: "John Malek",
    email: "jmalek@ngo.org",
    organization: "Humanitarian Relief NGO",
    role: "registered",
    joinDate: "2024-03-22",
    lastActive: "2025-11-28",
    requestCount: 8,
  },
  {
    id: "USR-2025-003",
    name: "Sarah Lemma",
    email: "s.lemma@agri.gov.ug",
    organization: "Ugandan Ministry of Agriculture",
    role: "verified",
    joinDate: "2024-02-10",
    lastActive: "2025-11-30",
    requestCount: 15,
  },
  {
    id: "USR-2025-004",
    name: "Pierre Kambale",
    email: "pk@mining-corp.tz",
    organization: "Mining Corporation Ltd",
    role: "admin",
    joinDate: "2023-11-05",
    lastActive: "2025-12-02",
    requestCount: 23,
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  approved: {
    icon: CheckCircle,
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-300",
  },
  processed: {
    icon: CheckCircle,
    label: "Processed",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
};

export default function AdminPanelPage() {
  const [userRole, setUserRole] = useState<AdminRole>("admin");
  const [activeTab, setActiveTab] = useState<"requests" | "users">("requests");
  const [requestFilter, setRequestFilter] = useState<RequestStatus | "all">(
    "all"
  );
  const [userFilter, setUserFilter] = useState<UserRole | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Stats calculations
  const totalPending = mockRequests.filter(
    (r) => r.status === "pending"
  ).length;
  const totalApproved = mockRequests.filter(
    (r) => r.status === "approved"
  ).length;
  const totalProcessed = mockRequests.filter(
    (r) => r.status === "processed"
  ).length;
  const totalUsers = mockUsers.length;

  // ✅ Filter requests
  const filteredRequests = mockRequests.filter((req) => {
    const matchesStatus =
      requestFilter === "all" || req.status === requestFilter;
    const matchesSearch =
      !searchQuery ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ✅ Filter users
  const filteredUsers = mockUsers.filter((user) => {
    const matchesRole = userFilter === "all" || user.role === userFilter;
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getStatusBadge = (status: RequestStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getUserRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary"
          >
            Admin
          </Badge>
        );
      case "verified":
        return (
          <Badge
            variant="outline"
            className="border-accent/30 bg-accent/10 text-accent"
          >
            Verified
          </Badge>
        );
      case "registered":
        return (
          <Badge
            variant="outline"
            className="border-muted-foreground/30 bg-muted text-muted-foreground"
          >
            Registered
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-border text-muted-foreground"
          >
            Public
          </Badge>
        );
    }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
        <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-foreground">
                {totalApproved}
              </p>
              <div className="bg-accent p-2 rounded-sm">
                <Clock className="h-5 w-5 text-gray-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Approved Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-foreground">
                {totalApproved}
              </p>
              <div className="bg-muted p-2 rounded-sm">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Processed Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-foreground">
                {totalProcessed}
              </p>
              <div className="bg-muted p-2 rounded-sm">
                <Download className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              <div className="bg-primary p-2 rounded-sm">
                <Users className="h-5 w-5 text-gray-50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">
            Admin Dashboard
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage user requests and platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="border-b border-border mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "requests"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Request Management
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                User Management
              </button>
            </nav>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search requests or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            {activeTab === "requests" ? (
              <Select
                value={requestFilter}
                onValueChange={(v) => setRequestFilter(v as any)}
              >
                <SelectTrigger className="w-[180px] bg-input-background border-border">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={userFilter}
                onValueChange={(v) => setUserFilter(v as any)}
              >
                <SelectTrigger className="w-[180px] bg-input-background border-border">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="overflow-x-auto bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-accent/40 transition-all duration-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Boundary</TableHead>
                    <TableHead>Datasets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.id}
                      </TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>
                        <div>
                          <p>{request.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.user.organization}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{request.boundary}</TableCell>
                      <TableCell>{request.datasetCount}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {new Date(request.submittedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            {request.status === "pending" && (
                              <>
                                <DropdownMenuItem>
                                  Approve Request
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Reject Request
                                </DropdownMenuItem>
                              </>
                            )}
                            {request.status === "approved" && (
                              <DropdownMenuItem>Upload Data</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              Delete Request
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No requests found</p>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.organization}</TableCell>
                      <TableCell>
                        {getUserRoleBadge(user.role as UserRole)}
                      </TableCell>
                      <TableCell>
                        {new Date(user.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{user.requestCount}</TableCell>
                      <TableCell>
                        {new Date(user.lastActive).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Assign Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Suspend User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
