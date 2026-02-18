"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { MapSidebar } from "./MapSidebar";
import { ChartPanel } from "./ChartPanel";
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
export type BoundaryMode = "GADM" | "TAMSAT" | "SHAMBA";

// Which boundary mode each dataset_type uses
const BOUNDARY_MODE_FOR_DATASET: Record<string, BoundaryMode> = {
  ndvi_ward: "GADM",
  rainfall_chirps: "GADM",
  ndvi_grid: "TAMSAT",
  ndvi_farm: "SHAMBA",
};

interface BoundaryLevelOption {
  id: string;
  name: string;
}

interface ResultItem {
  id: string; // dataset_type key e.g. "ndvi_ward"
  name: string;
  type: string;
  category: string;
  size: string;
  boundaryType: BoundaryMode;
}

export function MapCanvas() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mode, setMode] = useState<SidebarMode>("search");
  const [isSearching, setIsSearching] = useState(false);

  // Map tool toggles
  const [isLayerToolExpanded, setIsLayerToolExpanded] = useState(false);
  const [isBoundaryToolExpanded, setIsBoundaryToolExpanded] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  const { user } = useAuth();
  const userRole = (user?.role ?? "public") as UserRole;

  // ---------- Boundary selections (GADM cascade) ----------
  const [country, setCountry] = useState<string | null>(null);
  const [admin1, setAdmin1] = useState<string | null>(null);
  const [admin2, setAdmin2] = useState<string | null>(null);
  const [admin3, setAdmin3] = useState<string | null>(null);

  // Lifted from MapSidebar so MapCanvas reacts to it
  const [boundaryMode, setBoundaryMode] = useState<BoundaryMode>("GADM");

  // Date range lifted from MapSidebar so ChartPanel can consume it
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    new Date(2020, 0, 1),
  );
  const [dateUntil, setDateUntil] = useState<Date | undefined>(
    new Date(2024, 11, 31),
  );

  // Dropdown options
  const [countries] = useState<BoundaryLevelOption[]>([
    { id: "KEN", name: "Kenya" },
    { id: "TZA", name: "Tanzania" },
    { id: "ZMB", name: "Zambia" },
  ]);
  const [admin1Options, setAdmin1Options] = useState<BoundaryLevelOption[]>([]);
  const [admin2Options, setAdmin2Options] = useState<BoundaryLevelOption[]>([]);
  const [admin3Options, setAdmin3Options] = useState<BoundaryLevelOption[]>([]);

  // Results + RBAC
  const [results, setResults] = useState<ResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]);

  // Chart state
  const [activeChartId, setActiveChartId] = useState<string | null>(null);
  const [activeChartName, setActiveChartName] = useState<string>("");
  const [activeChartLocationId, setActiveChartLocationId] =
    useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");

  // ---------- Map init ----------
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      preferCanvas: true,
    }).setView([-1.2921, 36.8219], 6);

    const satelliteTileLayer = L.tileLayer(
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      { attribution: "© Acre Africa © Google Maps", maxZoom: 20 },
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

  // Resize after sidebar transition
  useEffect(() => {
    if (mapInstanceRef.current) {
      const t = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 350);
      return () => clearTimeout(t);
    }
  }, [isSidebarOpen]);

  // ---------- Base layer ----------
  function handleBaseLayerChange(layer: BaseLayer) {
    if (!mapInstanceRef.current || !currentTileLayerRef.current) return;
    const map = mapInstanceRef.current;
    map.removeLayer(currentTileLayerRef.current);
    const next =
      layer === "map"
        ? L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
          }).addTo(map)
        : L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
            attribution: "© Acre Africa © Google Maps",
            maxZoom: 20,
          }).addTo(map);
    currentTileLayerRef.current = next;
    setBaseLayer(layer);
  }

  function handleSelectionModeChange(newMode: SelectionMode) {
    setSelectionMode(newMode);
  }

  // ---------- Layer helpers ----------
  function clearBoundaryLayers() {
    if (geojsonLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }
  }

  /** Open chart for a clicked feature */
  function openChartForFeature(
    featureProps: Record<string, string>,
    mode: BoundaryMode,
    currentResults: ResultItem[],
  ) {
    // Prefer a result matching this boundary mode, fallback to sensible default
    const match = currentResults.find(
      (r) => BOUNDARY_MODE_FOR_DATASET[r.id] === mode,
    );
    const chartId =
      match?.id ??
      (mode === "TAMSAT"
        ? "ndvi_grid"
        : mode === "SHAMBA"
          ? "ndvi_farm"
          : "ndvi_ward");
    const chartName = match?.name ?? chartId;
    // Use the location_id property set by the API (name-based for GADM, farm_id for SHAMBA, grid_id for TAMSAT)
    const locationId = featureProps.location_id ?? featureProps.id ?? "";

    setActiveChartId(chartId);
    setActiveChartName(chartName);
    setActiveChartLocationId(locationId);
  }

  /** Render a GeoJSON layer with click-to-chart interaction */
  function renderGeoJSON(
    geojson: GeoJSON.FeatureCollection,
    styleOpts: L.PathOptions,
    mode: BoundaryMode,
    currentResults: ResultItem[],
  ) {
    if (!mapInstanceRef.current || !geojson?.features?.length) return;

    const layer = L.geoJSON(geojson, {
      style: styleOpts,
      onEachFeature: (feature, featureLayer) => {
        const props = (feature.properties ?? {}) as Record<string, string>;
        featureLayer.bindTooltip(props.name ?? props.id ?? "", {
          permanent: false,
          direction: "top",
        });

        featureLayer.on("click", () => {
          (featureLayer as L.Path).setStyle({
            fillOpacity: 0.45,
            weight: 3,
            color: "#F59E0B",
          });
          openChartForFeature(props, mode, currentResults);
        });
        featureLayer.on("mouseout", () =>
          layer.resetStyle(featureLayer as L.Path),
        );
      },
    }).addTo(mapInstanceRef.current!);

    geojsonLayerRef.current = layer;
    mapInstanceRef.current!.fitBounds(layer.getBounds());
  }

  // ---------- Core boundary loaders ----------

  /** GADM: load polygons one level deeper than current selection */
  async function loadGadmLayer(
    countryVal: string,
    a1: string | null,
    a2: string | null,
    currentResults: ResultItem[],
  ) {
    clearBoundaryLayers();
    const params: Record<string, string> = { country: countryVal };
    if (a1) params.admin1 = a1;
    if (a2) params.admin2 = a2;
    const qs = new URLSearchParams(params).toString();

    try {
      const res = await fetch(`/api/boundaries/geojson?${qs}`);
      if (!res.ok) throw new Error(res.statusText);
      const geojson: GeoJSON.FeatureCollection = await res.json();
      renderGeoJSON(
        geojson,
        {
          color: "#3B82F6",
          weight: 2,
          fillColor: "#3B82F6",
          fillOpacity: 0.15,
        },
        "GADM",
        currentResults,
      );
    } catch (e) {
      console.error("loadGadmLayer error:", e);
    }
  }

  async function loadTamsatLayer(
    countryVal: string,
    a1: string | null,
    a2: string | null,
    currentResults: ResultItem[],
  ) {
    clearBoundaryLayers();
    const params: Record<string, string> = {
      mode: "TAMSAT",
      country: countryVal,
    };
    if (a1) params.admin1 = a1;
    if (a2) params.admin2 = a2;
    const qs = new URLSearchParams(params).toString();

    try {
      const res = await fetch(`/api/boundaries/geojson?${qs}`);
      if (!res.ok) throw new Error(res.statusText);
      const geojson: GeoJSON.FeatureCollection = await res.json();
      renderGeoJSON(
        geojson,
        { color: "#10B981", weight: 1, fillColor: "#10B981", fillOpacity: 0.1 },
        "TAMSAT",
        currentResults,
      );
    } catch (e) {
      console.error("loadTamsatLayer error:", e);
    }
  }

  async function loadShambaLayer(
    countryVal: string,
    a1: string | null,
    a2: string | null,
    a3: string | null,
    currentResults: ResultItem[],
  ) {
    clearBoundaryLayers();
    const params: Record<string, string> = {
      mode: "SHAMBA",
      country: countryVal,
    };
    if (a1) params.admin1 = a1;
    if (a2) params.admin2 = a2;
    if (a3) params.admin3 = a3;
    const qs = new URLSearchParams(params).toString();

    try {
      const res = await fetch(`/api/boundaries/geojson?${qs}`);
      if (!res.ok) throw new Error(res.statusText);
      const geojson: GeoJSON.FeatureCollection = await res.json();
      renderGeoJSON(
        geojson,
        {
          color: "#F59E0B",
          weight: 1.5,
          fillColor: "#F59E0B",
          fillOpacity: 0.15,
        },
        "SHAMBA",
        currentResults,
      );
    } catch (e) {
      console.error("loadShambaLayer error:", e);
    }
  }

  /** Single entry-point — called whenever selection or mode changes */
  async function refreshMap(
    bMode: BoundaryMode,
    c: string | null,
    a1: string | null,
    a2: string | null,
    a3: string | null,
    currentResults: ResultItem[],
  ) {
    if (!c) {
      clearBoundaryLayers();
      return;
    }
    if (bMode === "TAMSAT") {
      await loadTamsatLayer(c, a1, a2, currentResults);
      return;
    }
    if (bMode === "SHAMBA") {
      await loadShambaLayer(c, a1, a2, a3, currentResults);
      return;
    }
    await loadGadmLayer(c, a1, a2, currentResults);
  }

  // ---------- Boundary dropdown handlers ----------
  async function handleCountryChange(id: string) {
    const value = id || null;
    setCountry(value);
    setAdmin1(null);
    setAdmin2(null);
    setAdmin3(null);
    setAdmin1Options([]);
    setAdmin2Options([]);
    setAdmin3Options([]);

    if (!value) {
      clearBoundaryLayers();
      return;
    }

    try {
      const res = await fetch(
        `/api/boundaries?mode=GADM&level=admin1&country=${value}`,
      );
      const { options } = await res.json();
      setAdmin1Options(options ?? []);
    } catch (e) {
      console.error(e);
    }

    await refreshMap(boundaryMode, value, null, null, null, results);
  }

  async function handleAdmin1Change(id: string) {
    const value = id || null;
    setAdmin1(value);
    setAdmin2(null);
    setAdmin3(null);
    setAdmin2Options([]);
    setAdmin3Options([]);

    if (!value) {
      await refreshMap(boundaryMode, country, null, null, null, results);
      return;
    }

    try {
      const res = await fetch(
        `/api/boundaries?mode=GADM&level=admin2&country=${country}&admin1=${value}`,
      );
      const { options } = await res.json();
      setAdmin2Options(options ?? []);
    } catch (e) {
      console.error(e);
    }

    await refreshMap(boundaryMode, country, value, null, null, results);
  }

  async function handleAdmin2Change(id: string) {
    const value = id || null;
    setAdmin2(value);
    setAdmin3(null);
    setAdmin3Options([]);

    if (!value) {
      await refreshMap(boundaryMode, country, admin1, null, null, results);
      return;
    }

    try {
      const res = await fetch(
        `/api/boundaries?mode=GADM&level=admin3&country=${country}&admin1=${admin1}&admin2=${value}`,
      );
      const { options } = await res.json();
      setAdmin3Options(options ?? []);
    } catch (e) {
      console.error(e);
    }

    await refreshMap(boundaryMode, country, admin1, value, null, results);
  }

  async function handleAdmin3Change(id: string) {
    const value = id || null;
    setAdmin3(value);
    await refreshMap(boundaryMode, country, admin1, admin2, value, results);
  }

  async function handleBoundaryModeChange(newMode: BoundaryMode) {
    setBoundaryMode(newMode);
    await refreshMap(newMode, country, admin1, admin2, admin3, results);
  }

  // ---------- Search: real /api/datasets ----------
  async function handleSearch() {
    setIsSearching(true);
    try {
      const res = await fetch("/api/datasets");
      const { datasets } = await res.json();

      const mapped: ResultItem[] = (datasets ?? []).map(
        (d: {
          id: string;
          name: string;
          type: string;
          category: string;
          boundary_type: string;
        }) => ({
          id: d.id,
          name: d.name,
          type: d.type === "raster" ? "Raster" : "Tabular",
          category: d.category,
          size: "–",
          boundaryType: (d.boundary_type as BoundaryMode) ?? "GADM",
        }),
      );

      setResults(mapped);
      setTotalCount(mapped.length);
      setActiveLayerIds([]);
      setMode("results");
    } catch (e) {
      console.error("handleSearch error:", e);
    } finally {
      setIsSearching(false);
    }
  }

  function handleToggleLayer(id: string) {
    setActiveLayerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleDownload(id: string) {
    if (userRole !== "admin") {
      alert("Access denied: Admin privileges required for direct download");
      return;
    }
    alert(`Download started for dataset: ${id}`);
  }

  function handleRequest(id: string) {
    if (userRole === "public") {
      alert("Please sign in to submit download requests");
      return;
    }
    alert(`Download request submitted for dataset: ${id}`);
  }

  function handleChart(id: string) {
    if (userRole === "public") {
      alert("Please sign in to view charts");
      return;
    }
    const result = results.find((r) => r.id === id);
    const chartName = result?.name ?? "Dataset Chart";
    // Use deepest selected GADM code as the location_id seed
    const locationId = admin3 ?? admin2 ?? admin1 ?? country ?? "";

    setActiveChartId(id);
    setActiveChartName(chartName);
    setActiveChartLocationId(locationId);
  }

  function handleCloseChart() {
    setActiveChartId(null);
    setActiveChartName("");
    setActiveChartLocationId("");
  }

  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* Sidebar */}
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
          admin4Options={[]}
          selectedCountry={country}
          selectedAdmin1={admin1}
          selectedAdmin2={admin2}
          selectedAdmin3={admin3}
          selectedAdmin4={null}
          onCountryChange={handleCountryChange}
          onAdmin1Change={handleAdmin1Change}
          onAdmin2Change={handleAdmin2Change}
          onAdmin3Change={handleAdmin3Change}
          onAdmin4Change={() => {}}
          // Lifted state
          dateFrom={dateFrom}
          dateUntil={dateUntil}
          onDateFromChange={setDateFrom}
          onDateUntilChange={setDateUntil}
          boundaryMode={boundaryMode}
          onBoundaryModeChange={handleBoundaryModeChange}
          // Results
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

      {/* Map Area */}
      <div className="relative flex-1 h-[80vh]">
        <div ref={mapRef} className="w-full h-[80vh]" />

        {/* Top Right Tools */}
        <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2 items-end">
          <input
            type="text"
            placeholder="Search locations on map..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[280px] px-4 py-2 border border-border rounded-3xl bg-input-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
          />

          {/* Base Layer Toggle */}
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
                if (isBoundaryToolExpanded) handleSelectionModeChange(null);
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

        {/* Toggle Sidebar Button */}
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

        {/* Chart Panel */}
        {activeChartId && (
          <ChartPanel
            datasetId={activeChartId}
            datasetName={activeChartName}
            locationId={activeChartLocationId}
            startDate={dateFrom?.toISOString().split("T")[0]}
            endDate={dateUntil?.toISOString().split("T")[0]}
            onClose={handleCloseChart}
          />
        )}
      </div>
    </div>
  );
}
