// components/ui/stat-card.tsx
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon; // ✅ type-safe Lucide icon
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  colorClass = "bg-muted",
}: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center text-${
            colorClass.split("-")[1]
          }-foreground ${colorClass}`}
        >
          <Icon className="h-5 w-5" /> {/* ✅ consistent sizing */}
        </div>
      </div>
    </div>
  );
}
