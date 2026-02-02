"use client";

import { useEffect, useRef, useState } from "react";
import { X, Minimize2, Maximize2 } from "lucide-react";
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

// Register Chart.js components
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
  datasetId: string;
  datasetName: string;
  onClose: () => void;
}

export function ChartPanel({
  datasetId,
  datasetName,
  onClose,
}: ChartPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Mock precipitation data
  const generateMockData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Generate realistic precipitation data (mm)
    const precipitationData = [45, 38, 62, 85, 120, 95, 78, 68, 55, 72, 88, 52];

    return {
      labels: months,
      datasets: [
        {
          label: "Precipitation (mm)",
          data: precipitationData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const chartData = generateMockData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#888",
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: true,
        text: datasetName,
        color: "#333",
        font: {
          size: 13,
          weight: "bold" as const,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 8,
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 11,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#666",
          font: {
            size: 10,
          },
        },
        title: {
          display: true,
          text: "Precipitation (mm)",
          color: "#666",
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#666",
          font: {
            size: 10,
          },
        },
      },
    },
  };

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
      <div className="p-3 h-[calc(100%-44px)]">
        {chartType === "line" ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-accent/5 border-t border-border rounded-b-lg">
        <p className="text-[10px] text-muted-foreground">
          Dataset ID: {datasetId} • Type: Precipitation • Period: 2024
        </p>
      </div>
    </div>
  );
}
