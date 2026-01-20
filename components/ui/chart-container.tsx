// components/ui/chart-container.tsx
import { ReactNode } from "react";

export function ChartContainer({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <h3 className="font-medium text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}
