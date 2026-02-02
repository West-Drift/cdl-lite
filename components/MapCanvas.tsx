"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { MapSidebar } from "./MapSidebar";
import {
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Menu,
  Layers,
  Pentagon,
  Square,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type UserRole = "public" | "registered" | "verified" | "admin";

type SidebarMode = "search" | "results";

type BaseLayer = "map" | "satellite";

type SelectionMode = null | "rectangle" | "click";

interface BoundaryLevelOption {
  id: string;
  name: string;
}

interface ResultItem {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
}

export function MapCanvas() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mode, setMode] = useState<SidebarMode>("search");
  const [isSearching, setIsSearching] = useState(false);

  // Map tools state
  const [isLayerToolExpanded, setIsLayerToolExpanded] = useState(false);
  const [isBoundaryToolExpanded, setIsBoundaryToolExpanded] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  const { user } = useAuth();
  const userRole = (user?.role ?? "public") as UserRole;

  // Boundary selections
  const [country, setCountry] = useState<string | null>(null);
  const [admin1, setAdmin1] = useState<string | null>(null);
  const [admin2, setAdmin2] = useState<string | null>(null);
  const [admin3, setAdmin3] = useState<string | null>(null);
  const [admin4, setAdmin4] = useState<string | null>(null);

  // Options – currently mocked, later from DB
  const [countries, setCountries] = useState<BoundaryLevelOption[]>([
    { id: "ke", name: "Kenya" },
    { id: "tz", name: "Tanzania" },
    { id: "ug", name: "Uganda" },
  ]);
  const [admin1Options, setAdmin1Options] = useState<BoundaryLevelOption[]>([]);
  const [admin2Options, setAdmin2Options] = useState<BoundaryLevelOption[]>([]);
  const [admin3Options, setAdmin3Options] = useState<BoundaryLevelOption[]>([]);
  const [admin4Options, setAdmin4Options] = useState<BoundaryLevelOption[]>([]);

  // Results + RBAC
  const [results, setResults] = useState<ResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]);

  // Map setup
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      preferCanvas: true,
    }).setView([-1.2921, 36.8219], 6);

    const satelliteTileLayer = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      {
        attribution: "© Acre Africa © Google Maps",
        maxZoom: 20,
      },
    ).addTo(map);

    currentTileLayerRef.current = satelliteTileLayer;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size when sidebar toggles
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Wait for CSS transition to complete (300ms from transition-all duration-300)
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  // Handle base layer switching
  function handleBaseLayerChange(layer: BaseLayer) {
    if (!mapInstanceRef.current || !currentTileLayerRef.current) return;

    const map = mapInstanceRef.current;

    // Remove current tile layer
    map.removeLayer(currentTileLayerRef.current);

    // Add new tile layer
    let newTileLayer: L.TileLayer;
    if (layer === "map") {
      newTileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        },
      ).addTo(map);
    } else {
      newTileLayer = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          attribution: "© Acre Africa © Google Maps",
          maxZoom: 20,
        },
      ).addTo(map);
    }

    currentTileLayerRef.current = newTileLayer;
    setBaseLayer(layer);
  }

  // Handle selection mode changes
  function handleSelectionModeChange(newMode: SelectionMode) {
    setSelectionMode(newMode);
    // TODO: Enable/disable drawing tools on map based on mode
    if (newMode === "rectangle") {
      console.log("Rectangle selection mode activated");
    } else if (newMode === "click") {
      console.log("Click selection mode activated");
    } else {
      console.log("Selection mode deactivated");
    }
  }

  // Helpers to show a polygon on map (mocked)
  function showGeometryOnMap(label: string) {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Mock: just fly to a fixed bbox depending on label.
    if (label.startsWith("ke")) {
      map.flyTo([-1.2921, 36.8219], 7); // Kenya
    } else if (label.startsWith("tz")) {
      map.flyTo([-6.7924, 39.2083], 7); // Tanzania
    } else if (label.startsWith("ug")) {
      map.flyTo([0.3476, 32.5825], 7); // Uganda
    }
    // TODO: replace with real geometry: add/remove L.GeoJSON layers per id
  }

  // Cascading boundary level handlers (mocked, ready for DB)
  async function handleCountryChange(id: string) {
    const value = id || null;
    setCountry(value);
    setAdmin1(null);
    setAdmin2(null);
    setAdmin3(null);
    setAdmin4(null);

    if (!value) {
      setAdmin1Options([]);
      setAdmin2Options([]);
      setAdmin3Options([]);
      setAdmin4Options([]);
      return;
    }

    // TODO: fetch admin1 list from DB for this country
    if (value === "ke") {
      setAdmin1Options([
        { id: "ke-nairobi", name: "Nairobi County" },
        { id: "ke-mombasa", name: "Mombasa County" },
      ]);
    } else {
      setAdmin1Options([
        { id: `${value}-admin1-a`, name: "Admin1 A" },
        { id: `${value}-admin1-b`, name: "Admin1 B" },
      ]);
    }
    setAdmin2Options([]);
    setAdmin3Options([]);
    setAdmin4Options([]);

    showGeometryOnMap(value);
  }

  async function handleAdmin1Change(id: string) {
    const value = id || null;
    setAdmin1(value);
    setAdmin2(null);
    setAdmin3(null);
    setAdmin4(null);

    if (!value) {
      setAdmin2Options([]);
      setAdmin3Options([]);
      setAdmin4Options([]);
      return;
    }

    // TODO: fetch admin2 list from DB for this admin1
    setAdmin2Options([
      { id: `${value}-sub1`, name: "Subregion 1" },
      { id: `${value}-sub2`, name: "Subregion 2" },
    ]);
    setAdmin3Options([]);
    setAdmin4Options([]);

    showGeometryOnMap(value);
  }

  async function handleAdmin2Change(id: string) {
    const value = id || null;
    setAdmin2(value);
    setAdmin3(null);
    setAdmin4(null);

    if (!value) {
      setAdmin3Options([]);
      setAdmin4Options([]);
      return;
    }

    // TODO: fetch admin3 list from DB
    setAdmin3Options([
      { id: `${value}-subsub1`, name: "Sub-subregion 1" },
      { id: `${value}-subsub2`, name: "Sub-subregion 2" },
    ]);
    setAdmin4Options([]);

    showGeometryOnMap(value);
  }

  async function handleAdmin3Change(id: string) {
    const value = id || null;
    setAdmin3(value);
    setAdmin4(null);

    if (!value) {
      setAdmin4Options([]);
      return;
    }

    // TODO: fetch admin4 list from DB
    setAdmin4Options([
      { id: `${value}-area1`, name: "Area 1" },
      { id: `${value}-area2`, name: "Area 2" },
    ]);

    showGeometryOnMap(value);
  }

  async function handleAdmin4Change(id: string) {
    const value = id || null;
    setAdmin4(value);

    if (value) {
      showGeometryOnMap(value);
    }
  }

  // Mock search results
  async function handleSearch() {
    setIsSearching(true);

    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock dataset names
    const mockDatasets = [
      "Precipitation Monthly (CHIRPS)",
      "Temperature Daily (ERA5)",
      "NDVI 16-day (MODIS)",
      "Soil Moisture Weekly (SMAP)",
      "Land Cover Annual (ESA CCI)",
    ];

    const mapped: ResultItem[] = mockDatasets.map((name, idx) => ({
      id: `mock-${idx}`,
      name,
      type: "GeoTIFF",
      category: "Climate",
      size: "50 MB",
    }));

    setResults(mapped);
    setTotalCount(mapped.length);
    setActiveLayerIds([]);
    setIsSearching(false);
    setMode("results");
  }

  function handleToggleLayer(id: string) {
    setActiveLayerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

    // TODO: add/remove corresponding Leaflet layer for this dataset
  }

  function handleDownload(id: string) {
    if (userRole !== "admin") {
      alert("Access denied: Admin privileges required for direct download");
      return;
    }
    // TODO: Call backend API with auth
    alert(`Download started for dataset: ${id}`);
  }

  function handleRequest(id: string) {
    if (userRole === "public") {
      alert("Please sign in to submit download requests");
      return;
    }
    // TODO: Call backend API to create download request
    alert(`Download request submitted for dataset: ${id}`);
  }

  function handleChart(id: string) {
    if (userRole === "public") {
      alert("Please sign in to view charts");
      return;
    }
    // TODO: Implement chart visualization
    alert(`Opening chart for dataset: ${id}`);
  }

  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* Sidebar with fixed width transition */}
      <div
        className={`transition-all duration-300 shrink-0 ${
          isSidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <MapSidebar
          userRole={userRole}
          mode={mode}
          onModeChange={setMode}
          onBackToSearch={() => setMode("search")}
          onSearch={handleSearch}
          isSearching={isSearching}
          countries={countries}
          admin1Options={admin1Options}
          admin2Options={admin2Options}
          admin3Options={admin3Options}
          admin4Options={admin4Options}
          selectedCountry={country}
          selectedAdmin1={admin1}
          selectedAdmin2={admin2}
          selectedAdmin3={admin3}
          selectedAdmin4={admin4}
          onCountryChange={handleCountryChange}
          onAdmin1Change={handleAdmin1Change}
          onAdmin2Change={handleAdmin2Change}
          onAdmin3Change={handleAdmin3Change}
          onAdmin4Change={handleAdmin4Change}
          results={results}
          totalCount={totalCount}
          activeLayerIds={activeLayerIds}
          onToggleLayer={handleToggleLayer}
          onChart={handleChart}
          onDownload={handleDownload}
          onRequest={handleRequest}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Map Area - Takes remaining space */}
      <div className="relative flex-1 h-[80vh]">
        <div ref={mapRef} className="w-full h-[80vh]" />

        {/* Top Right Tools Container */}
        <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2 items-end">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search locations on map..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[280px] px-4 py-2 border border-border rounded-3xl bg-input-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
          />

          {/* Map Layer Toggle Tool */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-md shadow-sm">
            {isLayerToolExpanded && (
              <>
                <div className="h-6 w-px bg-border" />
                <Button
                  size="sm"
                  variant={baseLayer === "map" ? "default" : "ghost"}
                  onClick={() => handleBaseLayerChange("map")}
                  className={`h-8 px-3 text-xs bg-primary/10 ${
                    baseLayer === "map"
                      ? "bg-primary text-accent"
                      : "hover:bg-accent/80"
                  }`}
                >
                  Map
                </Button>
                <Button
                  size="sm"
                  variant={baseLayer === "satellite" ? "default" : "ghost"}
                  onClick={() => handleBaseLayerChange("satellite")}
                  className={`h-8 px-3 text-xs bg-primary/10 ${
                    baseLayer === "satellite"
                      ? "bg-primary text-accent"
                      : "hover:bg-accent/80"
                  }`}
                >
                  Satellite
                </Button>
              </>
            )}{" "}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsLayerToolExpanded(!isLayerToolExpanded)}
              className={`h-8 w-8 ${
                isLayerToolExpanded
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/80"
              }`}
            >
              <Layers className="h-3 w-3" />
            </Button>
          </div>

          {/* Boundary Selection Tool */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-md shadow-sm">
            {isBoundaryToolExpanded && (
              <>
                <div className="h-6 w-px bg-border" />
                <Button
                  size="icon"
                  variant={selectionMode === "rectangle" ? "default" : "ghost"}
                  onClick={() =>
                    handleSelectionModeChange(
                      selectionMode === "rectangle" ? null : "rectangle",
                    )
                  }
                  className={`h-8 w-8 bg-primary/10 ${
                    selectionMode === "rectangle"
                      ? "bg-primary text-accent"
                      : "hover:bg-accent/80"
                  }`}
                  title="Draw to select polygons"
                >
                  <Square className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant={selectionMode === "click" ? "default" : "ghost"}
                  onClick={() =>
                    handleSelectionModeChange(
                      selectionMode === "click" ? null : "click",
                    )
                  }
                  className={`h-8 w-8 bg-primary/10 ${
                    selectionMode === "click"
                      ? "bg-primary text-accent"
                      : "hover:bg-accent/80"
                  }`}
                  title="Click to select polygons"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsBoundaryToolExpanded(!isBoundaryToolExpanded);
                if (isBoundaryToolExpanded) {
                  handleSelectionModeChange(null);
                }
              }}
              className={`h-8 w-8 ${
                isBoundaryToolExpanded
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/80"
              }`}
            >
              <Pentagon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Toggle Sidebar Button - Only shows when sidebar is collapsed */}
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 z-1000 h-8 w-8 bg-accent rounded-full"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-3 w-3" />
          </Button>
        )}

        {/* Map Tools (Bottom Right) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-1000">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 bg-card hover:bg-accent/80"
            onClick={() => mapInstanceRef.current?.locate({ setView: true })}
          >
            <LocateFixed className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 bg-card hover:bg-accent/80"
            onClick={() => mapInstanceRef.current?.zoomIn()}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 mb-4 bg-card hover:bg-accent/80"
            onClick={() => mapInstanceRef.current?.zoomOut()}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
