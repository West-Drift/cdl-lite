// app/(app)/map/page.tsx
"use client";

import { MapSelector } from "@/components/MapSelector";
import { useAuth } from "@/components/AuthProvider";

export default function MapExplorerPage() {
  const { user, status } = useAuth();
  const userRole = user.role; // "public" | "registered" | "verified" | "admin"

  if (status === "loading") {
    return (
      <div className="p-6 max-w-[90%] mx-auto text-sm text-muted-foreground">
        Loading map tools…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      <MapSelector userRole={userRole} />
    </div>
  );
}
