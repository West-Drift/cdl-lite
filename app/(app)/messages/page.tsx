"use client";

import { useState, useRef } from "react";
import {
  Search,
  Send,
  MessageSquare,
  User,
  Shield,
  FileText,
  X,
  Paperclip,
  Inbox,
  Flag,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";

type UserRole = "public" | "registered" | "verified" | "admin";
type MessageSender = "user" | "admin";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: MessageSender;
  senderName: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
  requestId: string;
}

interface MessageThread {
  requestId: string;
  requestName: string;
  participant: {
    name: string;
    email: string;
    role: UserRole;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "active" | "resolved";
  priority: "normal" | "urgent";
}

// Mock data
const mockThreads: MessageThread[] = [
  {
    requestId: "REQ-2025-001",
    requestName: "Kenya Climate Data Request",
    participant: {
      name: "Admin Team",
      email: "support@climatedb.org",
      role: "admin",
    },
    lastMessage:
      "Your data is ready for download. Let me know if you need any clarification.",
    lastMessageTime: "2025-11-24T09:00:00Z",
    unreadCount: 0,
    status: "active",
    priority: "urgent",
  },
  {
    requestId: "REQ-2025-002",
    requestName: "East Africa Soil Analysis",
    participant: {
      name: "Data Team",
      email: "datateam@climatedb.org",
      role: "admin",
    },
    lastMessage:
      "We're processing your custom shapefile and will have results soon.",
    lastMessageTime: "2025-11-22T11:30:00Z",
    unreadCount: 2,
    status: "active",
    priority: "normal",
  },
  {
    requestId: "REQ-2025-005",
    requestName: "Malawi Flood Risk Assessment",
    participant: {
      name: "Dr. Jane Smith",
      email: "jane@university.edu",
      role: "verified",
    },
    lastMessage:
      "Unfortunately, the requested data is not available for that time period.",
    lastMessageTime: "2025-11-22T11:17:00Z",
    unreadCount: 0,
    status: "resolved",
    priority: "urgent",
  },
];

const mockMessages: Record<string, Message[]> = {
  "REQ-2025-001": [
    {
      id: "msg-1",
      content:
        "Hello, I submitted a request for Kenya climate data. Can you provide an update on the status?",
      timestamp: "2025-11-22T09:00:00Z",
      sender: "user",
      senderName: "John Doe",
      requestId: "REQ-2025-001",
    },
    {
      id: "msg-2",
      content:
        "Your data is ready for download. Let me know if you need any clarification.",
      timestamp: "2025-11-24T09:00:00Z",
      sender: "admin",
      senderName: "Admin Team",
      attachments: [
        {
          name: "kenya_climate_data.zip",
          size: "2.4 MB",
          type: "application/zip",
        },
      ],
      requestId: "REQ-2025-001",
    },
  ],
  "REQ-2025-002": [
    {
      id: "msg-3",
      content:
        "Thank you for your patience. I can see your request has been received and is currently being processed by our team.",
      timestamp: "2025-11-22T11:15:00Z",
      sender: "admin",
      senderName: "Data Team",
      requestId: "REQ-2025-002",
    },
    {
      id: "msg-4",
      content:
        "That's great! Thank you for the quick response. I'll wait for the notification.",
      timestamp: "2025-11-22T11:30:00Z",
      sender: "user",
      senderName: "John Doe",
      requestId: "REQ-2025-002",
    },
  ],
};

export default function MessagesPage() {
  const { user, status } = useAuth();
  const userRole = user.role as UserRole;

  const [selectedThread, setSelectedThread] = useState<string>(
    mockThreads[0]?.requestId || "",
  );
  const [newMessage, setNewMessage] = useState("");
  const [threads, setThreads] = useState(mockThreads);
  const [messages, setMessages] = useState(mockMessages);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "urgent">(
    "all",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (status === "loading") {
    return (
      <div className="p-6 max-w-[90%] mx-auto text-sm text-muted-foreground">
        Loading messages…
      </div>
    );
  }

  const isUrgentThread = (t: MessageThread) =>
    t.participant.role === "verified" || t.participant.role === "admin";

  const sendMessage = () => {
    if (!newMessage.trim() && attachedFiles.length === 0) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: userRole === "admin" ? "admin" : "user",
      senderName: userRole === "admin" ? "Admin Team" : "You",
      requestId: selectedThread,
      attachments: attachedFiles.map((file) => ({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type,
      })),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedThread]: [...(prev[selectedThread] || []), message],
    }));

    setThreads((prev) =>
      prev.map((t) =>
        t.requestId === selectedThread
          ? {
              ...t,
              lastMessage:
                newMessage ||
                `[${attachedFiles.length} file${
                  attachedFiles.length > 1 ? "s" : ""
                }]`,
              lastMessageTime: message.timestamp,
              unreadCount: 0,
            }
          : t,
      ),
    );

    setNewMessage("");
    setAttachedFiles([]);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 3);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (userRole !== "admin") {
      return true;
    }

    if (activeFilter === "all") return true;
    if (activeFilter === "active") {
      return t.unreadCount > 0;
    }
    if (activeFilter === "urgent") {
      return isUrgentThread(t);
    }
    return true;
  });

  const allUrgentCount =
    userRole === "admin" ? threads.filter((t) => isUrgentThread(t)).length : 0;
  const allActiveCount =
    userRole === "admin" ? threads.filter((t) => t.unreadCount > 0).length : 0;

  const currentThread =
    filteredThreads.find((t) => t.requestId === selectedThread) ||
    filteredThreads[0];
  const currentMessages = currentThread
    ? messages[currentThread.requestId] || []
    : [];

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      {userRole === "public" && (
        <div className="text-center py-24 px-6 bg-card border border-border rounded-xl">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Sign in to access messages
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Messaging is only available to registered users to discuss your data
            requests.
          </p>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Sign In
          </Button>
        </div>
      )}

      {userRole !== "public" && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <p className="text-muted-foreground">
              {userRole === "admin"
                ? "Communicate with data requesters"
                : "Discuss your data requests with administrators"}
            </p>

            <Badge
              variant="secondary"
              className="bg-accent text-accent-foreground p-1"
            >
              <MessageSquare className="h-3 w-3 mr-1 text-primary" />
              {threads.filter((t) => t.unreadCount > 0).length} unread
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {userRole === "admin" && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                {
                  value: "all" as const,
                  label: "All",
                  count: threads.length,
                },
                {
                  value: "active" as const,
                  label: "Active",
                  count: allActiveCount,
                },
                {
                  value: "urgent" as const,
                  label: "Urgent",
                  count: allUrgentCount,
                },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() =>
                    setActiveFilter(tab.value as typeof activeFilter)
                  }
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
          )}

          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredThreads.length} of {threads.length} conversations
          </div>

          {filteredThreads.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No conversations found
              </h3>
              <p className="text-muted-foreground">
                {userRole === "admin"
                  ? "No requests to respond to yet."
                  : "No ongoing discussions."}
              </p>
            </div>
          )}

          {filteredThreads.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[650px]">
                    <div className="divide-y divide-border">
                      {filteredThreads.map((thread) => (
                        <button
                          key={thread.requestId}
                          onClick={() => setSelectedThread(thread.requestId)}
                          className={`w-full text-left p-4 transition-colors ${
                            currentThread?.requestId === thread.requestId
                              ? "bg-muted border-l-4 border-l-accent"
                              : "hover:bg-muted/50 border-l-4 border-l-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback
                                className={
                                  thread.participant.role === "admin"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-accent/10 text-accent"
                                }
                              >
                                {thread.participant.role === "admin" ? (
                                  <Shield className="h-4 w-4" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1 mr-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {thread.participant.name}
                                </p>
                                {thread.unreadCount > 0 && (
                                  <Badge
                                    variant="default"
                                    className="bg-accent text-accent-foreground text-xs h-5 w-5 flex items-center justify-center rounded-full"
                                  >
                                    {thread.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {thread.requestName}
                              </p>
                              {/* Message preview removed to save space */}
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(thread.lastMessageTime)}
                                </p>
                                {userRole === "admin" &&
                                  isUrgentThread(thread) && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-accent/0 text-accent-foreground"
                                    >
                                      <Flag className="h-3 w-3 text-primary" />
                                    </Badge>
                                  )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-card border border-border">
                {currentThread ? (
                  <>
                    <CardHeader className="border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            className={
                              currentThread.participant.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : "bg-accent/10 text-accent"
                            }
                          >
                            {currentThread.participant.role === "admin" ? (
                              <Shield className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-foreground">
                            {currentThread.participant.name}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {currentThread.requestName}
                          </CardDescription>
                        </div>
                        {userRole === "admin" &&
                          isUrgentThread(currentThread) && (
                            <Badge
                              variant="secondary"
                              className="bg-accent p-1 text-accent-foreground"
                            >
                              <Flag className="h-3 w-3 mr-1 text-primary" />
                              Urgent
                            </Badge>
                          )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px] p-6">
                        <div className="space-y-4">
                          {currentMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.sender ===
                                (userRole === "admin" ? "admin" : "user")
                                  ? "flex-row-reverse"
                                  : "flex-row"
                              }`}
                            >
                              <Avatar className="flex-shrink-0 h-8 w-8">
                                <AvatarFallback
                                  className={
                                    message.sender === "admin"
                                      ? "bg-primary/10 text-primary"
                                      : "bg-accent/10 text-accent"
                                  }
                                >
                                  {getInitials(message.senderName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 max-w-[75%]">
                                <div
                                  className={`flex items-center gap-2 mb-1 ${
                                    message.sender ===
                                    (userRole === "admin" ? "admin" : "user")
                                      ? "justify-end"
                                      : ""
                                  }`}
                                >
                                  <p className="text-xs text-muted-foreground">
                                    {formatTime(message.timestamp)}
                                  </p>
                                </div>
                                <div
                                  className={`rounded-lg p-3 ${
                                    message.sender ===
                                    (userRole === "admin" ? "admin" : "user")
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-foreground"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  {message.attachments &&
                                    message.attachments.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {message.attachments.map((att, idx) => (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-1.5 text-xs opacity-90"
                                          >
                                            <FileText className="h-3 w-3" />
                                            <span>{att.name}</span>
                                            <span className="text-muted-foreground">
                                              ({att.size})
                                            </span>
                                            <button
                                              onClick={() => {
                                                if (att.url) {
                                                  window.open(
                                                    att.url,
                                                    "_blank",
                                                  );
                                                }
                                              }}
                                              className="ml-2 text-accent hover:text-accent-foreground"
                                            >
                                              <Download className="h-3 w-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="border-t border-border p-4">
                        {attachedFiles.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {attachedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-input-background border border-border rounded-lg px-3 py-2 text-xs"
                              >
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-foreground">{file.name}</p>
                                  <p className="text-muted-foreground">
                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeAttachedFile(index)}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-accent hover:text-accent-foreground"
                            title="Attach file"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileAttach}
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt,.geojson,.shp"
                          />
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button
                            size="sm"
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                            onClick={sendMessage}
                            disabled={
                              !newMessage.trim() && attachedFiles.length === 0
                            }
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-16 text-center">
                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-muted-foreground">
                      Select a conversation from the list to start messaging.
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
