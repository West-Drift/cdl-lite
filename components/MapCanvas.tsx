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
  Ruler,
  BarChart3,
  Menu,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type UserRole = "public" | "registered" | "verified" | "admin";

type SidebarMode = "search" | "results";

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mode, setMode] = useState<SidebarMode>("search");
  const [isSearching, setIsSearching] = useState(false);

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

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Acre Africa © Esri",
        maxZoom: 18,
      },
    ).addTo(map);

    mapInstanceRef.current = map;
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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
      { id: `${value}-ward1`, name: "Ward 1" },
      { id: `${value}-ward2`, name: "Ward 2" },
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
      { id: `${value}-village1`, name: "Village 1" },
      { id: `${value}-village2`, name: "Village 2" },
    ]);

    showGeometryOnMap(value);
  }

  function handleAdmin4Change(id: string) {
    const value = id || null;
    setAdmin4(value);

    if (value) {
      showGeometryOnMap(value);
    }
  }

  // Mock datasets for search results
  const mockDatasets = [
    "Kenya_Nairobi_County_24_Precipitation",
    "Kenya_2024_NDVI",
    "Kenya_2024_Soil_Moisture",
    "Tanzania_2024_Land_Surface_Temperature",
    "Uganda_2024_Wind_Speed",
  ];

  async function handleSearch() {
    setIsSearching(true);

    // TODO: call API with {country, admin1..4, timeRange, dataSources}
    // For now, return all mock datasets; in real use, filter on AOI.
    const mapped: ResultItem[] = mockDatasets.map((name, idx) => ({
      id: `mock-${idx}`,
      name,
      type: "Raster",
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
    if (userRole === "public") {
      alert("Sign in to download data.");
      return;
    }
    alert(`Download started for dataset: ${id}`);
  }

  function handleRequest(id: string) {
    if (userRole === "public") {
      alert("Sign in to submit requests.");
      return;
    }
    alert(`Request submitted for dataset: ${id}`);
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <MapSidebar
          userRole={userRole}
          mode={mode}
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
          onDownload={handleDownload}
          onRequest={handleRequest}
        />
      </div>

      {/* Map Area */}
      <div className="relative flex-1">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-1000 bg-accent"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-3 w-3" />
        </Button>

        {/* Map Tools (Bottom Right) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-1000">
          <Button size="icon" variant="outline" className="h-8 w-8">
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <LocateFixed className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <Ruler className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => {
              alert("Show Chart Popup");
            }}
          >
            <BarChart3 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
