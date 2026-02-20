"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { MapSidebar } from "./MapSidebar";
import { ChartPanel, DatasetSelection } from "./ChartPanel";
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

// ---------------------------------------------------------------------------
// BOUNDARY_MODE_FOR_DATASET
//
// Maps dataset id → which boundary polygon type it uses on the map.
// Update this whenever you add new dataset ids to the `datasets` table.
//
// Pattern:  <subcategory>_<boundary>_<sensor>_<mask>
//   *_ward_*   → GADM   (ward-level admin polygons)
//   *_grid_*   → TAMSAT (4km grid cells)
//   *_farm_*   → SHAMBA (farm polygons)
//
// Your existing data (renamed to new ids):
//   old "ndvi_ward"  → was MODIS, cropland mask → new id: ndvi_ward_modis_crop
//   old "ndvi_grid"  → was MODIS, cropland mask → new id: ndvi_grid_modis_crop
//   old "ndvi_farm"  → was Sentinel-2, no mask   → new id: ndvi_farm_s2_none
//
// If you still have rows in timeseries_data under the OLD ids, you can either:
//   1. UPDATE timeseries_data SET dataset_type = 'ndvi_ward_modis_crop'
//      WHERE dataset_type = 'ndvi_ward';                    ← recommended
//   2. Or keep the old ids as aliases by adding them below while you migrate.
// ---------------------------------------------------------------------------
const BOUNDARY_MODE_FOR_DATASET: Record<string, BoundaryMode> = {
  // ── GADM (ward-level) ────────────────────────────────────────────────────
  // NDVI
  ndvi_ward_s2_none: "GADM",
  ndvi_ward_s2_crop: "GADM",
  ndvi_ward_s2_forage: "GADM",
  ndvi_ward_modis_none: "GADM",
  ndvi_ward_modis_crop: "GADM", // ← your old "ndvi_ward" data lives here
  ndvi_ward_modis_forage: "GADM",
  ndvi_ward_viirs_none: "GADM",
  ndvi_ward_viirs_crop: "GADM",
  ndvi_ward_viirs_forage: "GADM",
  // LAI
  lai_ward_modis_none: "GADM",
  lai_ward_modis_crop: "GADM",
  lai_ward_modis_forage: "GADM",
  // BAI
  bai_ward_modis_none: "GADM",
  bai_ward_modis_crop: "GADM",
  bai_ward_modis_forage: "GADM",
  // Climate / LST / Wind
  lst_ward_modis_none: "GADM",
  wind_speed_ward: "GADM",
  wind_gust_ward: "GADM",
  // Rainfall
  rainfall_ward_chirps: "GADM",
  rainfall_ward_imerg: "GADM",
  // Hydrology / Land
  soil_moisture_ward: "GADM",
  et_ward: "GADM",
  land_cover_esa: "GADM",
  soil_map: "GADM",

  // ── TAMSAT (grid-level) ──────────────────────────────────────────────────
  ndvi_grid_s2_none: "TAMSAT",
  ndvi_grid_s2_crop: "TAMSAT",
  ndvi_grid_s2_forage: "TAMSAT",
  ndvi_grid_modis_none: "TAMSAT",
  ndvi_grid_modis_crop: "TAMSAT", // ← your old "ndvi_grid" data lives here
  ndvi_grid_viirs_none: "TAMSAT",
  lai_grid_modis_none: "TAMSAT",
  lai_grid_modis_crop: "TAMSAT",
  bai_grid_modis_none: "TAMSAT",
  rainfall_grid_chirps: "TAMSAT",
  rainfall_grid_imerg: "TAMSAT",
  lst_grid_modis_none: "TAMSAT",

  // ── SHAMBA (farm-level) ──────────────────────────────────────────────────
  ndvi_farm_s2_none: "SHAMBA", // ← your old "ndvi_farm" data lives here
  ndvi_farm_s2_crop: "SHAMBA",
  ndvi_farm_s2_forage: "SHAMBA",
  ndvi_farm_modis_none: "SHAMBA",
  lai_farm_modis_none: "SHAMBA",
  lai_farm_modis_crop: "SHAMBA",
  bai_farm_modis_none: "SHAMBA",

  // ── Legacy ids — keep during migration, remove once timeseries_data updated ──
  ndvi_ward: "GADM",
  ndvi_grid: "TAMSAT",
  ndvi_farm: "SHAMBA",
  rainfall_chirps: "GADM",
};

// Fallback dataset id to show on polygon click when nothing is checked
const FALLBACK_ID: Record<BoundaryMode, string> = {
  GADM: "ndvi_ward_modis_crop",
  TAMSAT: "ndvi_grid_modis_crop",
  SHAMBA: "ndvi_farm_s2_none",
};
// Keep legacy fallbacks so the chart still opens before you migrate data
const FALLBACK_ID_LEGACY: Record<BoundaryMode, string> = {
  GADM: "ndvi_ward",
  TAMSAT: "ndvi_grid",
  SHAMBA: "ndvi_farm",
};

// ---------------------------------------------------------------------------

interface BoundaryLevelOption {
  id: string;
  name: string;
}

// Updated to include mask + frequency from the new datasets schema
interface DatasetItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  sensor: string | null;
  mask: string; // 'none' | 'cropland' | 'forage'
  frequency: string | null;
  type: string;
  boundary_type: string; // 'GADM' | 'TAMSAT' | 'SHAMBA'
}

interface ResultItem {
  id: string;
  name: string;
  type: string;
  category: string;
  subcategory: string;
  sensor: string | null;
  boundaryType: BoundaryMode;
  size: string;
}

export function MapCanvas() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const highlightedLayerRef = useRef<L.Path | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mode, setMode] = useState<SidebarMode>("search");

  const [isLayerToolExpanded, setIsLayerToolExpanded] = useState(false);
  const [isBoundaryToolExpanded, setIsBoundaryToolExpanded] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

  const { user } = useAuth();
  const userRole = (user?.role ?? "public") as UserRole;

  // ── Boundary selections ──────────────────────────────────────────────────
  const [country, setCountry] = useState<string | null>(null);
  const [admin1, setAdmin1] = useState<string | null>(null);
  const [admin2, setAdmin2] = useState<string | null>(null);
  const [admin3, setAdmin3] = useState<string | null>(null);

  const [boundaryMode, setBoundaryMode] = useState<BoundaryMode>("GADM");

  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateUntil, setDateUntil] = useState<Date | undefined>(undefined);

  const [countries] = useState<BoundaryLevelOption[]>([
    { id: "KEN", name: "Kenya" },
    { id: "TZA", name: "Tanzania" },
    { id: "ZMB", name: "Zambia" },
  ]);
  const [admin1Options, setAdmin1Options] = useState<BoundaryLevelOption[]>([]);
  const [admin2Options, setAdmin2Options] = useState<BoundaryLevelOption[]>([]);
  const [admin3Options, setAdmin3Options] = useState<BoundaryLevelOption[]>([]);

  // Dataset tree state
  const [allDatasets, setAllDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);

  // Results
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>([]);
  const [recordCounts, setRecordCounts] = useState<
    Record<
      string,
      {
        count: number;
        filtered: boolean;
        scope: "complete" | "country" | "filtered";
      }
    >
  >({});

  // ── Chart state ──────────────────────────────────────────────────────────
  // Instead of a single activeChartId we store the full selections array
  // so ChartPanel can render one line per selected dataset.
  const [chartSelections, setChartSelections] = useState<DatasetSelection[]>(
    [],
  );
  const [activeChartLocationId, setActiveChartLocationId] =
    useState<string>("");

  const [searchTerm, setSearchTerm] = useState<string>("");

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Convert checked dataset ids + allDatasets into DatasetSelection[] for ChartPanel */
  function buildSelections(
    checkedIds: string[],
    datasets: DatasetItem[],
    forMode: BoundaryMode,
  ): DatasetSelection[] {
    // Only include datasets that match the current boundary mode
    return checkedIds
      .map((id) => datasets.find((d) => d.id === id))
      .filter((d): d is DatasetItem => !!d && d.boundary_type === forMode)
      .map((d) => ({
        datasetId: d.id,
        datasetName: d.name,
        mask: d.mask ?? "none",
        sensor: d.sensor ?? null,
        frequency: d.frequency ?? null,
      }));
  }

  /** Build fallback selections when nothing relevant is checked */
  function buildFallbackSelections(
    forMode: BoundaryMode,
    datasets: DatasetItem[],
  ): DatasetSelection[] {
    // Try new-style id first, then legacy
    const preferredId = FALLBACK_ID[forMode];
    const legacyId = FALLBACK_ID_LEGACY[forMode];
    const ds =
      datasets.find((d) => d.id === preferredId) ??
      datasets.find((d) => d.id === legacyId);
    if (!ds) {
      // Absolute last resort — just name the id, ChartPanel will show "no data" if absent
      return [
        {
          datasetId: preferredId,
          datasetName: preferredId,
          mask: "none",
          sensor: null,
          frequency: null,
        },
      ];
    }
    return [
      {
        datasetId: ds.id,
        datasetName: ds.name,
        mask: ds.mask ?? "none",
        sensor: ds.sensor ?? null,
        frequency: ds.frequency ?? null,
      },
    ];
  }

  // ── Map init ─────────────────────────────────────────────────────────────
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

  // Auto-load datasets on mount — includes mask + frequency columns
  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => r.json())
      .then(({ datasets }) => {
        const rows: DatasetItem[] = (datasets ?? []).map((d: any) => ({
          ...d,
          mask: d.mask ?? "none",
          frequency: d.frequency ?? null,
        }));
        setAllDatasets(rows);
        // Default selection: prefer new id, fall back to legacy
        setSelectedDatasetIds((prev) => {
          if (prev.length > 0) return prev;
          const pref =
            rows.find((d) => d.id === "ndvi_ward_modis_crop") ??
            rows.find((d) => d.id === "ndvi_ward");
          return pref ? [pref.id] : rows.length > 0 ? [rows[0].id] : [];
        });
      })
      .catch((e) => console.error("Dataset auto-load error:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Base layer ────────────────────────────────────────────────────────────
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

  // ── Layer helpers ─────────────────────────────────────────────────────────
  function clearBoundaryLayers() {
    if (geojsonLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }
  }

  /**
   * On polygon click: open the chart for all checked datasets that match
   * the current boundary mode. If nothing checked, fall back to a sensible default.
   */
  function openChartForFeature(
    featureProps: Record<string, string>,
    mode: BoundaryMode,
    currentDatasets: DatasetItem[],
    checkedIds: string[],
  ) {
    const locationId = featureProps.location_id ?? featureProps.id ?? "";

    const sels = buildSelections(checkedIds, currentDatasets, mode);
    const finalSels =
      sels.length > 0 ? sels : buildFallbackSelections(mode, currentDatasets);

    setChartSelections(finalSels);
    setActiveChartLocationId(locationId);
  }

  /** Render a GeoJSON layer with click-to-chart interaction */
  function renderGeoJSON(
    geojson: GeoJSON.FeatureCollection,
    styleOpts: L.PathOptions,
    mode: BoundaryMode,
    currentDatasets: DatasetItem[],
    checkedIds: string[],
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
          if (highlightedLayerRef.current) {
            layer.resetStyle(highlightedLayerRef.current);
          }
          (featureLayer as L.Path).setStyle({
            fillOpacity: 0.2,
            weight: 3,
            color: "#F59E0B",
          });
          (featureLayer as L.Path).bringToFront();
          highlightedLayerRef.current = featureLayer as L.Path;

          openChartForFeature(props, mode, currentDatasets, checkedIds);
        });
      },
    }).addTo(mapInstanceRef.current!);

    geojsonLayerRef.current = layer;
    mapInstanceRef.current!.fitBounds(layer.getBounds());
  }

  // ── Core boundary loaders ─────────────────────────────────────────────────

  async function loadGadmLayer(
    countryVal: string,
    a1: string | null,
    a2: string | null,
    datasets: DatasetItem[],
    checkedIds: string[],
  ) {
    clearBoundaryLayers();
    const params: Record<string, string> = { country: countryVal };
    if (a1) params.admin1 = a1;
    if (a2) params.admin2 = a2;
    try {
      const res = await fetch(
        `/api/boundaries/geojson?${new URLSearchParams(params)}`,
      );
      if (!res.ok) throw new Error(res.statusText);
      const geojson: GeoJSON.FeatureCollection = await res.json();
      renderGeoJSON(
        geojson,
        { color: "#05487f", weight: 2, fillColor: "#05487f", fillOpacity: 0.1 },
        "GADM",
        datasets,
        checkedIds,
      );
    } catch (e) {
      console.error("loadGadmLayer error:", e);
    }
  }

  async function loadTamsatLayer(
    countryVal: string,
    a1: string | null,
    a2: string | null,
    datasets: DatasetItem[],
    checkedIds: string[],
  ) {
    clearBoundaryLayers();
    const params: Record<string, string> = {
      mode: "TAMSAT",
      country: countryVal,
    };
    if (a1) params.admin1 = a1;
    if (a2) params.admin2 = a2;
    try {
      const res = await fetch(
        `/api/boundaries/geojson?${new URLSearchParams(params)}`,
      );
      if (!res.ok) throw new Error(res.statusText);
      const geojson: GeoJSON.FeatureCollection = await res.json();
      renderGeoJSON(
        geojson,
        { color: "#10B981", weight: 1, fillColor: "#10B981", fillOpacity: 0.1 },
        "TAMSAT",
        datasets,
        checkedIds,
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
    datasets: DatasetItem[],
    checkedIds: string[],
  ) {
    clearBoundaryLayers();
    const params: Record<string, string> = {
      mode: "SHAMBA",
      country: countryVal,
    };
    if (a1) params.admin1 = a1;
    if (a2) params.admin2 = a2;
    if (a3) params.admin3 = a3;
    try {
      const res = await fetch(
        `/api/boundaries/geojson?${new URLSearchParams(params)}`,
      );
      if (!res.ok) throw new Error(res.statusText);
      const geojson: GeoJSON.FeatureCollection = await res.json();
      renderGeoJSON(
        geojson,
        {
          color: "#F59E0B",
          weight: 1.5,
          fillColor: "#F59E0B",
          fillOpacity: 0.1,
        },
        "SHAMBA",
        datasets,
        checkedIds,
      );
    } catch (e) {
      console.error("loadShambaLayer error:", e);
    }
  }

  async function refreshMap(
    bMode: BoundaryMode,
    c: string | null,
    a1: string | null,
    a2: string | null,
    a3: string | null,
    datasets: DatasetItem[],
    checkedIds: string[],
  ) {
    if (!c) {
      clearBoundaryLayers();
      return;
    }
    if (bMode === "TAMSAT") {
      await loadTamsatLayer(c, a1, a2, datasets, checkedIds);
      return;
    }
    if (bMode === "SHAMBA") {
      await loadShambaLayer(c, a1, a2, a3, datasets, checkedIds);
      return;
    }
    await loadGadmLayer(c, a1, a2, datasets, checkedIds);
  }

  // ── Boundary dropdown handlers ────────────────────────────────────────────

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
    await refreshMap(
      boundaryMode,
      value,
      null,
      null,
      null,
      allDatasets,
      selectedDatasetIds,
    );
  }

  async function handleAdmin1Change(id: string) {
    const value = id || null;
    setAdmin1(value);
    setAdmin2(null);
    setAdmin3(null);
    setAdmin2Options([]);
    setAdmin3Options([]);
    if (!value) {
      await refreshMap(
        boundaryMode,
        country,
        null,
        null,
        null,
        allDatasets,
        selectedDatasetIds,
      );
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
    await refreshMap(
      boundaryMode,
      country,
      value,
      null,
      null,
      allDatasets,
      selectedDatasetIds,
    );
  }

  async function handleAdmin2Change(id: string) {
    const value = id || null;
    setAdmin2(value);
    setAdmin3(null);
    setAdmin3Options([]);
    if (!value) {
      await refreshMap(
        boundaryMode,
        country,
        admin1,
        null,
        null,
        allDatasets,
        selectedDatasetIds,
      );
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
    await refreshMap(
      boundaryMode,
      country,
      admin1,
      value,
      null,
      allDatasets,
      selectedDatasetIds,
    );
  }

  async function handleAdmin3Change(id: string) {
    const value = id || null;
    setAdmin3(value);
    await refreshMap(
      boundaryMode,
      country,
      admin1,
      admin2,
      value,
      allDatasets,
      selectedDatasetIds,
    );
  }

  async function handleBoundaryModeChange(newMode: BoundaryMode) {
    setBoundaryMode(newMode);
    // Close any open chart since the location_id format differs per mode
    setChartSelections([]);
    setActiveChartLocationId("");
    await refreshMap(
      newMode,
      country,
      admin1,
      admin2,
      admin3,
      allDatasets,
      selectedDatasetIds,
    );
  }

  // ── Search ────────────────────────────────────────────────────────────────
  async function handleSearch() {
    setIsSearching(true);

    const source: ResultItem[] = allDatasets.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type === "raster" ? "Raster" : "Tabular",
      category: d.category,
      subcategory: d.subcategory,
      sensor: d.sensor,
      boundaryType: (d.boundary_type as BoundaryMode) ?? "GADM",
      size: "–",
    }));

    const filtered =
      selectedDatasetIds.length > 0
        ? source.filter((r) => selectedDatasetIds.includes(r.id))
        : source;

    setResults(filtered);
    setTotalCount(filtered.length);
    setActiveLayerIds([]);

    const hasSubRegion = !!(admin1 || admin2 || admin3);
    const hasDateFilter = !!(dateFrom || dateUntil);
    const searchScope: "complete" | "country" | "filtered" =
      hasSubRegion || hasDateFilter
        ? "filtered"
        : country
          ? "country"
          : "complete";

    const baseParams = new URLSearchParams();
    if (country) baseParams.set("country", country);
    if (admin1) baseParams.set("admin1", admin1);
    if (admin2) baseParams.set("admin2", admin2);
    if (admin3) baseParams.set("admin3", admin3);
    if (dateFrom) baseParams.set("start", dateFrom.toISOString().split("T")[0]);
    if (dateUntil) baseParams.set("end", dateUntil.toISOString().split("T")[0]);

    const countResults = await Promise.all(
      filtered.map(async (r) => {
        try {
          const p = new URLSearchParams(baseParams);
          p.set("dataset_type", r.id);
          p.set("boundary_type", r.boundaryType);
          const res = await fetch(`/api/data/count?${p.toString()}`);
          const data = await res.json();
          return [
            r.id,
            {
              count: data.count ?? 0,
              filtered: data.filtered ?? false,
              scope: searchScope,
            },
          ] as const;
        } catch {
          return [
            r.id,
            { count: 0, filtered: false, scope: searchScope },
          ] as const;
        }
      }),
    );
    setRecordCounts(Object.fromEntries(countResults));
    setIsSearching(false);
    setMode("results");
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

  function handleCloseChart() {
    setChartSelections([]);
    setActiveChartLocationId("");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[80vh] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 shrink-0 ${isSidebarOpen ? "w-80" : "w-0"} overflow-hidden`}
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
          // Dataset tree
          allDatasets={allDatasets}
          selectedDatasetIds={selectedDatasetIds}
          onDatasetSelectionChange={setSelectedDatasetIds}
          // Results
          results={results}
          totalCount={totalCount}
          recordCounts={recordCounts}
          activeLayerIds={activeLayerIds}
          onToggleLayer={handleToggleLayer}
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
                  className={`h-8 px-3 text-xs bg-primary/10 ${baseLayer === "map" ? "bg-primary text-accent" : "hover:bg-accent/80"}`}
                >
                  Map
                </Button>
                <Button
                  size="sm"
                  variant={baseLayer === "satellite" ? "default" : "ghost"}
                  onClick={() => handleBaseLayerChange("satellite")}
                  className={`h-8 px-3 text-xs bg-primary/10 ${baseLayer === "satellite" ? "bg-primary text-accent" : "hover:bg-accent/80"}`}
                >
                  Satellite
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsLayerToolExpanded(!isLayerToolExpanded)}
              className={`h-8 w-8 ${isLayerToolExpanded ? "bg-accent text-accent-foreground" : "hover:bg-accent/80"}`}
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
                  className={`h-8 w-8 bg-primary/10 ${selectionMode === "rectangle" ? "bg-primary text-accent" : "hover:bg-accent/80"}`}
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
                  className={`h-8 w-8 bg-primary/10 ${selectionMode === "click" ? "bg-primary text-accent" : "hover:bg-accent/80"}`}
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
              className={`h-8 w-8 ${isBoundaryToolExpanded ? "bg-accent text-accent-foreground" : "hover:bg-accent/80"}`}
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

        {/* Chart Panel — only renders when a polygon has been clicked */}
        {chartSelections.length > 0 && activeChartLocationId && (
          <ChartPanel
            selections={chartSelections}
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
