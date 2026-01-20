// components/MapCanvas.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UserRole } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";

interface MapCanvasProps {
  userRole: UserRole;
}

export function MapCanvas({ userRole }: MapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoundaries, setSelectedBoundaries] = useState<string[]>([]);
  const [availableDatasets, setAvailableDatasets] = useState<string[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  // Mock data
  const mockBoundaries = [
    { id: "ke", name: "Kenya", type: "country" },
    { id: "ke-nairobi", name: "Nairobi County", type: "state" },
    { id: "ke-mombasa", name: "Mombasa County", type: "state" },
    { id: "ke-kisumu", name: "Kisumu County", type: "state" },
  ];

  const mockDatasets = [
    "Kenya_Nairobi_County_2024_Precipitation",
    "Kenya_2024_NDVI",
    "Kenya_2024_Soil_Moisture",
    "Tanzania_2024_Land_Surface_Temperature",
    "Uganda_2024_Wind_Speed",
  ];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      preferCanvas: true,
    }).setView([-1.2921, 36.8219], 6);

    // Add ESRI satellite base layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "© Acre Africa © RCMRD © Esri, Maxar, Earthstar Geographics, GIS User Community",
        maxZoom: 20,
      }
    ).addTo(map);

    // Handle polygon selection (mock for now)
    map.on("click", (e) => {
      // Mock: select a boundary based on click location
      const clickedBoundary =
        mockBoundaries[Math.floor(Math.random() * mockBoundaries.length)];

      // Toggle boundary selection
      setSelectedBoundaries((prev) =>
        prev.includes(clickedBoundary.id)
          ? prev.filter((id) => id !== clickedBoundary.id)
          : [...prev, clickedBoundary.id]
      );
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Filter datasets based on selected boundaries
  useEffect(() => {
    if (selectedBoundaries.length === 0) {
      setAvailableDatasets([]);
      return;
    }

    // Mock filtering logic: match dataset names with selected boundary names
    const filtered = mockDatasets.filter((dataset) =>
      selectedBoundaries.some((boundaryId) =>
        dataset.toLowerCase().includes(boundaryId.toLowerCase())
      )
    );

    setAvailableDatasets(filtered);
    // Reset selected datasets when boundaries change
    setSelectedDatasets([]);
  }, [selectedBoundaries]);

  const handleDatasetSelect = (dataset: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(dataset)
        ? prev.filter((d) => d !== dataset)
        : [...prev, dataset]
    );
  };

  const handleSubmitRequest = () => {
    if (selectedDatasets.length === 0) {
      alert("Please select at least one dataset");
      return;
    }

    alert(`Request submitted for:\n${selectedDatasets.join("\n")}`);
    // In prod: API call to submit request
  };

  return (
    <div className="space-y-6">
      {/* Map Canvas - Full Height & Width */}
      <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300 h-[calc(100vh-200px)] relative">
        {/* Map Container */}
        <div ref={mapRef} className="absolute inset-0"></div>

        {/* Search Bar - Top Right */}
        <div className="absolute top-8 right-8 z-1000 w-[300px]">
          <input
            type="text"
            placeholder="Search locations on map..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-3xl bg-input-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
        </div>

        {/* Selected Boundaries Indicator */}
        {selectedBoundaries.length > 0 && (
          <div className="absolute top-8 left-8 z-50 bg-white/90 backdrop-blur-sm rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700">
              Selected Boundaries ({selectedBoundaries.length})
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedBoundaries.map((id) => {
                const boundary = mockBoundaries.find((b) => b.id === id);
                return (
                  <span
                    key={id}
                    className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded"
                  >
                    {boundary?.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Available Datasets - Below Map */}
      {availableDatasets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-3">Available Datasets</h3>
            <div className="space-y-3">
              {availableDatasets.map((dataset) => (
                <div
                  key={dataset}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
                    selectedDatasets.includes(dataset)
                      ? "border-accent bg-accent/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedDatasets.includes(dataset)}
                      onCheckedChange={() => handleDatasetSelect(dataset)}
                    />
                    <div>
                      <p className="text-gray-900">{dataset}</p>
                      <p className="text-sm text-gray-500">
                        Climate • Raster • Monthly
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 1000)} MB
                  </span>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex justify-end">
              <Button
                className="bg-[#05487f] hover:bg-[#044170]"
                onClick={handleSubmitRequest}
                disabled={
                  selectedDatasets.length === 0 || userRole === "public"
                }
              >
                <Download className="size-4 mr-2" />
                Submit Request ({selectedDatasets.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedBoundaries.length > 0 && availableDatasets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              No datasets available for the selected boundaries
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
