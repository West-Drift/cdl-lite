// app/(app)/notifications/page.tsx
"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  MessageSquare,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";

type NotificationType =
  | "request_submitted"
  | "request_approved"
  | "request_rejected"
  | "data_ready"
  | "new_message";
type UserRole = "public" | "registered" | "verified" | "admin";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
  userId?: string;
  userName?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "request_submitted",
    title: "New Data Request",
    message:
      "Dr. Alice Mwangi submitted request REQ-2025-006 for Rwanda Urban Heat Island Analysis",
    timestamp: "2025-12-01T10:30:00Z",
    read: false,
    requestId: "REQ-2025-006",
    userId: "user-abc123",
    userName: "Dr. Alice Mwangi",
  },
  {
    id: "notif-002",
    type: "new_message",
    title: "New Message",
    message:
      "John Malek: 'Urgent: Need flood data ASAP for emergency response'",
    timestamp: "2025-11-28T14:15:00Z",
    read: false,
    requestId: "REQ-2025-007",
    userId: "user-def456",
    userName: "John Malek",
  },
  {
    id: "notif-003",
    type: "request_approved",
    title: "Request Approved",
    message:
      "Your request for Kenya Climate Data (REQ-2025-001) has been approved and is being processed",
    timestamp: "2025-11-25T09:00:00Z",
    read: true,
    requestId: "REQ-2025-001",
  },
  {
    id: "notif-004",
    type: "data_ready",
    title: "Data Ready for Download",
    message:
      "Your requested dataset for DRC Mining Site is now ready for download",
    timestamp: "2025-12-02T11:20:00Z",
    read: false,
    requestId: "REQ-2025-009",
  },
  {
    id: "notif-005",
    type: "request_rejected",
    title: "Request Rejected",
    message:
      "Your request REQ-2025-005 was rejected: Data not available for requested time period",
    timestamp: "2025-11-10T16:45:00Z",
    read: true,
    requestId: "REQ-2025-005",
  },
];

const notificationConfig = {
  request_submitted: {
    icon: FileText,
    iconClass: "bg-primary/10 text-primary",
  },
  request_approved: {
    icon: CheckCircle,
    iconClass:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  request_rejected: {
    icon: XCircle,
    iconClass:
      "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground",
  },
  data_ready: {
    icon: Download,
    iconClass:
      "bg-accent/20 text-accent dark:bg-accent/25 dark:text-accent-foreground",
  },
  new_message: {
    icon: MessageSquare,
    iconClass: "bg-primary/10 text-primary",
  },
};

export default function NotificationsPage() {
  const { user, status } = useAuth();
  const userRole = user.role as UserRole;

  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>(
    "all",
  );

  if (status === "loading") {
    return (
      <div className="p-6 max-w-[90%] mx-auto text-sm text-muted-foreground">
        Loading notifications…
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter !== "all") return n.type === filter;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    const config = notificationConfig[type];
    const Icon = config.icon;
    return (
      <div
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${config.iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getAvailableFilters = () => {
    const baseFilters = [
      { value: "all" as const, label: "All" },
      { value: "unread" as const, label: "Unread" },
    ];

    if (userRole === "admin") {
      return [
        ...baseFilters,
        { value: "request_submitted" as const, label: "New Requests" },
        { value: "new_message" as const, label: "Messages" },
      ];
    } else {
      return [
        ...baseFilters,
        { value: "request_approved" as const, label: "Approvals" },
        { value: "request_rejected" as const, label: "Rejections" },
        { value: "data_ready" as const, label: "Data Ready" },
        { value: "new_message" as const, label: "Messages" },
      ];
    }
  };

  const getFilterCount = (value: "all" | "unread" | NotificationType) => {
    if (value === "all") return notifications.length;
    if (value === "unread") return unreadCount;
    return notifications.filter((n) => n.type === value).length;
  };

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      {/* Public User View */}
      {userRole === "public" && (
        <div className="text-center py-24 px-6 bg-card border border-border rounded-xl">
          <Bell className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Sign in to access notifications
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Notifications are only available to registered users to keep you
            updated on your data requests.
          </p>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Sign In
          </Button>
        </div>
      )}

      {/* Logged-in User View */}
      {userRole !== "public" && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <p className="text-muted-foreground">
              {userRole === "admin"
                ? "Track user requests and messages"
                : "Stay updated on your data requests"}
            </p>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                className="hover:bg-accent hover:text-accent-foreground"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>

          {/* Filter Tabs – same pattern as Requests */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {getAvailableFilters().map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-input-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label} ({getFilterCount(tab.value)})
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent activity</span>
                <span className="text-sm text-muted-foreground font-normal">
                  {filteredNotifications.length} notifications
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 p-5 hover:bg-muted/50 transition-colors ${
                        !notification.read
                          ? "bg-muted/30 border-l-2 border-l-accent"
                          : ""
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-accent text-accent-foreground text-xs"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTime(notification.timestamp)}</span>
                          <button
                            type="button"
                            className="hover:text-accent"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </button>
                          <button
                            type="button"
                            className="hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No notifications
                  </h3>
                  <p className="text-muted-foreground">
                    {filter === "unread"
                      ? "You are all caught up!"
                      : "Notifications will appear here."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
