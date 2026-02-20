"use client";

import { useEffect, useState } from "react";
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

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DatasetSelection {
  datasetId: string; // datasets.id = timeseries_data.dataset_type
  datasetName: string; // human label for legend
  mask: string; // 'none' | 'cropland' | 'forage'
  sensor: string | null;
  frequency: string | null;
}

interface ChartPanelProps {
  /** One or more datasets to plot — each becomes one chart line */
  selections: DatasetSelection[];
  locationId: string;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

interface TimeseriesPoint {
  date: string;
  value: number | null;
}

// ── Visual constants ───────────────────────────────────────────────────────────

// Line color by mask
const MASK_COLORS: Record<string, string> = {
  none: "rgb(99,102,241)", // indigo
  cropland: "rgb(34,197,94)", // green
  forage: "rgb(234,179,8)", // amber
};

// Line dash by sensor (to distinguish same-mask different-sensor)
const SENSOR_DASH: Record<string, number[]> = {
  "Sentinel-2": [], // solid
  MODIS: [6, 3], // dashed
  VIIRS: [2, 2], // dotted
  CHIRPS: [8, 4],
  IMERG: [4, 2, 1, 2],
};

// Unit by subcategory keyword in dataset id
function unitForDataset(id: string): string {
  if (id.startsWith("ndvi")) return "NDVI";
  if (id.startsWith("lai")) return "LAI";
  if (id.startsWith("bai")) return "BAI";
  if (id.startsWith("vhi")) return "VHI";
  if (id.startsWith("lst")) return "°C";
  if (id.startsWith("rainfall")) return "mm";
  if (id.startsWith("et")) return "mm";
  if (id.startsWith("soil")) return "m³/m³";
  if (id.startsWith("wind")) return "m/s";
  return "value";
}

function labelForSelection(sel: DatasetSelection): string {
  const parts: string[] = [sel.datasetName];
  if (sel.mask && sel.mask !== "none") {
    const m: Record<string, string> = {
      cropland: "Cropland",
      forage: "Forage",
    };
    parts.push(m[sel.mask] ?? sel.mask);
  }
  return parts.join(" · ");
}

function colorForSelection(sel: DatasetSelection, index: number): string {
  // If mask distinguishes the color — great. Otherwise fall back to a palette.
  const base = MASK_COLORS[sel.mask] ?? MASK_COLORS["none"];
  // If multiple selections share the same mask, shift hue via index offset
  if (index === 0) return base;
  const fallback = [
    "rgb(239,68,68)",
    "rgb(249,115,22)",
    "rgb(168,85,247)",
    "rgb(20,184,166)",
  ];
  return fallback[(index - 1) % fallback.length];
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ChartPanel({
  selections,
  locationId,
  startDate,
  endDate,
  onClose,
}: ChartPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // One series per selection
  const [seriesData, setSeriesData] = useState<(TimeseriesPoint[] | null)[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<(string | null)[]>([]);

  // Shared x-axis labels derived from the union of all dates
  const allDates = Array.from(
    new Set(seriesData.flatMap((s) => s?.map((p) => p.date) ?? [])),
  ).sort();

  // Stringify selections once to use in dependency array
  const selectionsKey = JSON.stringify(selections);

  useEffect(() => {
    if (!locationId || selections.length === 0) return;

    const fetches = selections.map((sel) => {
      const params = new URLSearchParams({
        location_id: locationId,
        dataset_type: sel.datasetId,
      });
      if (startDate) params.set("start", startDate);
      if (endDate) params.set("end", endDate);
      return fetch(`/api/data?${params.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json() as Promise<TimeseriesPoint[]>;
        })
        .catch(() => null);
    });

    Promise.all(fetches).then((results) => {
      setSeriesData(results);
      setErrors(results.map((r) => (r === null ? "Failed to load" : null)));
      setIsLoading(false);
    });
  }, [locationId, selectionsKey, startDate, endDate]);

  // Build chart.js datasets array
  const chartDatasets = selections.map((sel, i) => {
    const series = seriesData[i];
    const color = colorForSelection(sel, i);
    const dash = SENSOR_DASH[sel.sensor ?? ""] ?? [];
    const pointMap = new Map(series?.map((p) => [p.date, p.value]) ?? []);
    return {
      label: labelForSelection(sel),
      data: allDates.map((d) => pointMap.get(d) ?? null),
      borderColor: color,
      backgroundColor: color.replace("rgb(", "rgba(").replace(")", ", 0.08)"),
      borderDash: dash,
      fill: i === 0, // only fill under first series to avoid visual clutter
      tension: 0.4,
      pointRadius: allDates.length > 60 ? 0 : 3,
      spanGaps: true,
    };
  });

  const chartData = {
    labels: allDates.map((d) => {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
      });
    }),
    datasets: chartDatasets,
  };

  // Shared unit (use first selection)
  const unit =
    selections.length > 0 ? unitForDataset(selections[0].datasetId) : "value";

  // Period span across all series
  const period =
    allDates.length > 0
      ? `${allDates[0]} → ${allDates[allDates.length - 1]}`
      : "–";

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: selections.length > 1,
        position: "top" as const,
        labels: { color: "#888", font: { size: 10 }, boxWidth: 20 },
      },
      title: {
        display: true,
        text: locationId,
        color: "#333",
        font: { size: 12, weight: "bold" as const },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: 8,
        titleFont: { size: 11 },
        bodyFont: { size: 10 },
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(3) : "N/A"} ${unit}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: selections[0]?.datasetId.startsWith("rainfall") ?? false,
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "#666", font: { size: 10 } },
        title: { display: true, text: unit, color: "#666", font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#666", font: { size: 10 }, maxTicksLimit: 12 },
      },
    },
  };

  const hasData = seriesData.some((s) => s && s.length > 0);
  const allFailed = errors.every((e) => e !== null) && errors.length > 0;

  return (
    <div
      className={`absolute bottom-4 left-4 z-1001 bg-card border border-border rounded-lg shadow-xl transition-all duration-300 ${
        isExpanded ? "w-[560px] h-[420px]" : "w-[400px] h-[290px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-accent/10">
        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex gap-1">
            {(["line", "bar"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-2 py-1 text-xs rounded transition-colors capitalize ${
                  chartType === t
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Active series indicators */}
          <div className="flex gap-1 items-center">
            {selections.map((sel, i) => (
              <span
                key={sel.datasetId}
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: colorForSelection(sel, i) }}
                title={labelForSelection(sel)}
              />
            ))}
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
            <Loader2 className="h-4 w-4 animate-spin" /> Loading data…
          </div>
        ) : allFailed ? (
          <div className="flex items-center justify-center h-full text-destructive text-sm">
            Failed to load data.
          </div>
        ) : !hasData ? (
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
          {locationId} &bull; {unit} &bull; {period}
          {selections.length > 1 && (
            <span className="ml-1 text-accent/60">
              ({selections.length} series)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
