// app/(app)/map/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MapSelector } from "@/components/MapSelector";

export default function MapExplorerPage() {
  const [userRole, setUserRole] = useState<
    "public" | "registered" | "verified" | "admin"
  >("registered");

  useEffect(() => {
    // In prod: const { role } = useAuth(); setUserRole(role);
  }, []);

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

      <MapSelector userRole={userRole} />
    </div>
  );
}
