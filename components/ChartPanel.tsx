"use client";

import { useEffect, useRef, useState } from "react";
import { X, Minimize2, Maximize2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ChartPanelProps {
  datasetId: string; // dataset_type e.g. "ndvi_ward"
  datasetName: string;
  locationId: string; // the location_id from timeseries_data
  startDate?: string; // ISO date string e.g. "2023-01-01"
  endDate?: string;
  onClose: () => void;
}

interface TimeseriesPoint {
  date: string;
  value: number | null;
}

// Colours & labels per dataset type
const DATASET_META: Record<
  string,
  { label: string; color: string; unit: string }
> = {
  ndvi_ward: { label: "NDVI (Ward)", color: "rgb(34, 197, 94)", unit: "NDVI" },
  ndvi_grid: { label: "NDVI (Grid)", color: "rgb(59, 130, 246)", unit: "NDVI" },
  ndvi_farm: { label: "NDVI (Farm)", color: "rgb(234, 179, 8)", unit: "NDVI" },
  rainfall_chirps: {
    label: "Rainfall (CHIRPS)",
    color: "rgb(59, 130, 246)",
    unit: "mm",
  },
};

export function ChartPanel({
  datasetId,
  datasetName,
  locationId,
  startDate,
  endDate,
  onClose,
}: ChartPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = DATASET_META[datasetId] ?? {
    label: datasetName,
    color: "rgb(99, 102, 241)",
    unit: "value",
  };

  // Fetch whenever key props change
  useEffect(() => {
    if (!locationId || !datasetId) return;

    const params = new URLSearchParams({
      location_id: locationId,
      dataset_type: datasetId,
    });
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);

    setIsLoading(true);
    setError(null);

    fetch(`/api/data?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.statusText}`);
        return res.json();
      })
      .then((data: TimeseriesPoint[]) => {
        setPoints(data);
      })
      .catch((err) => {
        console.error("ChartPanel fetch error:", err);
        setError("Failed to load data.");
      })
      .finally(() => setIsLoading(false));
  }, [locationId, datasetId, startDate, endDate]);

  // Build Chart.js dataset
  const chartData = {
    labels: points.map((p) => {
      const d = new Date(p.date);
      return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    }),
    datasets: [
      {
        label: meta.label,
        data: points.map((p) => p.value),
        borderColor: meta.color,
        backgroundColor: meta.color
          .replace("rgb(", "rgba(")
          .replace(")", ", 0.1)"),
        fill: true,
        tension: 0.4,
        pointRadius: points.length > 60 ? 0 : 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: { color: "#888", font: { size: 11 } },
      },
      title: {
        display: true,
        text: datasetName,
        color: "#333",
        font: { size: 13, weight: "bold" as const },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx: any) =>
            `${meta.label}: ${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(3) : "N/A"} ${meta.unit}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: datasetId.startsWith("rainfall"),
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#666", font: { size: 10 } },
        title: {
          display: true,
          text: meta.unit,
          color: "#666",
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: "#666",
          font: { size: 10 },
          maxTicksLimit: 12,
        },
      },
    },
  };

  // Derived period string for footer
  const period =
    points.length > 0
      ? `${points[0].date} → ${points[points.length - 1].date}`
      : "–";

  return (
    <div
      className={`absolute bottom-4 left-4 z-[1001] bg-card border border-border rounded-lg shadow-xl transition-all duration-300 ${
        isExpanded ? "w-[500px] h-[400px]" : "w-[380px] h-[280px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-accent/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setChartType("line")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                chartType === "line"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                chartType === "bar"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-3 h-[calc(100%-44px-28px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading data…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-destructive text-sm">
            {error}
          </div>
        ) : points.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No data available for this location.
          </div>
        ) : chartType === "line" ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-accent/5 border-t border-border rounded-b-lg">
        <p className="text-[10px] text-muted-foreground truncate">
          {locationId} &bull; {meta.unit} &bull; {period}
        </p>
      </div>
    </div>
  );
}
