// app/(app)/catalog/page.tsx
"use client";

import { useState } from "react";
import {
  Search,
  Bookmark,
  Download,
  FileText,
  Grid,
  List,
  Calendar,
  Clock,
  MapPin,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatasetDownloadModal } from "@/components/ui/dataset-download-modal";
import { DatasetUpdateModal } from "@/components/ui/dataset-update-modal";
import { useAuth } from "@/components/AuthProvider";

interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  size: string;
  records: string;
  formats: string[];
  isBookmarked: boolean;
  lastUpdated: string;
  timeline: string;
}

const mockDatasets: Dataset[] = [
  {
    id: "DS-001",
    title: "Kenya_Nairobi_County_2024_Precipitation",
    description:
      "Monthly precipitation data derived from satellite observations and ground stations. High-resolution spatial coverage with daily temporal resolution.",
    category: "Precipitation",
    location: "Nairobi County, Kenya",
    size: "45.2 MB",
    records: "125,430",
    formats: ["CSV", "GeoTIFF", "NetCDF"],
    isBookmarked: false,
    lastUpdated: "2024-12-15",
    timeline: "Jan 2024 - Dec 2024",
  },
  {
    id: "DS-002",
    title: "Kenya_2024_NDVI",
    description:
      "Normalized Difference Vegetation Index data showing vegetation health and coverage. 16-day composite intervals for consistent analysis.",
    category: "NDVI",
    location: "National - Kenya",
    size: "128.5 MB",
    records: "89,234",
    formats: ["GeoTIFF", "GeoJSON"],
    isBookmarked: true,
    lastUpdated: "2024-12-18",
    timeline: "Jan 2024 - Dec 2024",
  },
  {
    id: "DS-003",
    title: "Tanzania_2024_Soil_Moisture",
    description:
      "Soil moisture content measurements at various depths, essential for agricultural planning and drought monitoring. Derived from SAR and radiometer data.",
    category: "Soil Moisture",
    location: "National - Tanzania",
    size: "256.8 MB",
    records: "342,567",
    formats: ["CSV", "GeoTIFF", "NetCDF"],
    isBookmarked: false,
    lastUpdated: "2024-11-28",
    timeline: "Jan 2022 - Nov 2024",
  },
  {
    id: "DS-004",
    title: "Uganda_2024_Land_Surface_Temperature",
    description:
      "Day and night land surface temperature measurements from thermal satellite sensors. Includes emissivity corrections and cloud masking.",
    category: "Land Surface Temperature",
    location: "National - Uganda",
    size: "189.4 MB",
    records: "156,789",
    formats: ["GeoTIFF", "NetCDF"],
    isBookmarked: true,
    lastUpdated: "2024-12-20",
    timeline: "Jan 2024 - Dec 2024",
  },
  {
    id: "DS-005",
    title: "Ethiopia_2024_Wind_Speed",
    description:
      "Wind speed data at 10m height derived from meteorological stations and reanalysis models. Hourly measurements with quality control applied.",
    category: "Wind Speed",
    location: "National - Ethiopia",
    size: "67.3 MB",
    records: "54,321",
    formats: ["CSV", "NetCDF"],
    isBookmarked: false,
    lastUpdated: "2024-12-10",
    timeline: "Jan 2020 - Dec 2024",
  },
  {
    id: "DS-006",
    title: "Kenya_2024_Relative_Humidity",
    description:
      "Relative humidity measurements showing moisture content in the atmosphere, critical for weather forecasting and climate modeling.",
    category: "Relative Humidity",
    location: "National - Kenya",
    size: "98.7 MB",
    records: "234,567",
    formats: ["CSV", "NetCDF", "GeoJSON"],
    isBookmarked: false,
    lastUpdated: "2024-12-05",
    timeline: "Jan 2010 - Dec 2024",
  },
];

export default function DataCatalogPage() {
  const { user, status } = useAuth();
  const userRole = user.role; // "public" | "registered" | "verified" | "admin"

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All Categories");
  const [selectedFormat, setSelectedFormat] = useState<string>("All Formats");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "popular" | "alphabetical" | "bookmarked"
  >("newest");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  if (status === "loading") {
    return (
      <div className="p-6 max-w-[90%] mx-auto text-sm text-muted-foreground">
        Loading catalog…
      </div>
    );
  }

  // Filter datasets
  const filteredDatasets = mockDatasets.filter((dataset) => {
    const matchesSearch =
      !searchQuery ||
      dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" ||
      dataset.category === selectedCategory;

    const matchesFormat =
      selectedFormat === "All Formats" ||
      dataset.formats.some((f) => f === selectedFormat);

    const matchesBookmark = !bookmarkedOnly || dataset.isBookmarked;

    return matchesSearch && matchesCategory && matchesFormat && matchesBookmark;
  });

  // Sort datasets
  const sortedDatasets = [...filteredDatasets].sort((a, b) => {
    if (sortOrder === "newest") {
      return (
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    } else if (sortOrder === "popular") {
      return (
        parseInt(b.records.replace(/,/g, "")) -
        parseInt(a.records.replace(/,/g, ""))
      );
    } else if (sortOrder === "alphabetical") {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === "bookmarked") {
      const aScore = a.isBookmarked ? 1 : 0;
      const bScore = b.isBookmarked ? 1 : 0;
      if (bScore !== aScore) return bScore - aScore;
      return (
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    }
    return 0;
  });

  const handleBookmarkToggle = (id: string) => {
    if (userRole === "public") return;
    alert(`Dataset ${id} bookmarked`);
  };

  const handleRequestClick = (id: string) => {
    if (userRole === "public") {
      alert("Sign in or create an account to request access.");
      return;
    }
    alert(`Request submitted for dataset ${id}`);
  };

  const handleDownloadClick = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setDownloadModalOpen(true);
  };

  const handleUpdateClick = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setUpdateModalOpen(true);
  };

  const handleDownload = (datasetId: string) => {
    alert(`Download started for dataset ${datasetId}`);
  };

  const handleUpdate = (updatedDataset: Dataset) => {
    alert(`Dataset ${updatedDataset.id} updated successfully`);
  };

  return (
    <div className="p-6 max-w-[90%] mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col gap-6 mb-6">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search datasets by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger className="w-[180px] bg-input-background border-border">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              {Array.from(new Set(mockDatasets.map((d) => d.category))).map(
                (category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={selectedFormat}
            onValueChange={(val) => setSelectedFormat(val)}
          >
            <SelectTrigger className="w-[180px] bg-input-background border-border">
              <SelectValue placeholder="All Formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Formats">All Formats</SelectItem>
              {Array.from(new Set(mockDatasets.flatMap((d) => d.formats))).map(
                (format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value) =>
              setSortOrder(
                value as "newest" | "popular" | "alphabetical" | "bookmarked",
              )
            }
          >
            <SelectTrigger className="w-[190px] bg-input-background border-border">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Recently Updated</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              {userRole !== "public" && (
                <SelectItem value="bookmarked">Bookmarked first</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Results & View + bookmarked chip */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedDatasets.length} of {mockDatasets.length} datasets
          </p>
          <div className="flex items-center gap-3">
            {userRole !== "public" && (
              <button
                type="button"
                onClick={() => setBookmarkedOnly((v) => !v)}
                className={`text-xs px-3 py-2 rounded-sm border transition-colors ${
                  bookmarkedOnly
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-input-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                Bookmarked only
              </button>
            )}

            <span className="text-sm text-muted-foreground">View:</span>
            <div className="flex bg-input-background rounded-sm border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Public user hint */}
      {userRole === "public" && (
        <div className="mb-4 rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Request and download workflows are available for signed‑in users.
          <span className="ml-1">
            Please{" "}
            <a
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              sign in
            </a>{" "}
            or{" "}
            <a
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              create an account
            </a>{" "}
            to unlock full access.
          </span>
        </div>
      )}

      {/* Dataset Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-accent/40 transition-all duration-200 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded">
                  {dataset.category}
                </span>
                {userRole !== "public" && (
                  <button
                    onClick={() => handleBookmarkToggle(dataset.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      dataset.isBookmarked
                        ? "text-accent bg-accent/10"
                        : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                    }`}
                  >
                    <Bookmark size={16} />
                  </button>
                )}
              </div>

              <h3 className="font-semibold text-lg mb-3 leading-tight text-foreground">
                {dataset.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                {dataset.description}
              </p>

              <div className="space-y-2 mb-5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} />
                  <span>{dataset.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span>{dataset.timeline}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Database size={14} />
                  <span>
                    {dataset.size} • {dataset.records} records
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} />
                  <span>Updated {dataset.lastUpdated}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {dataset.formats.map((format) => (
                  <span
                    key={format}
                    className="px-2.5 py-1 text-xs bg-input-background border border-border rounded-md text-muted-foreground font-mono hover:border-accent hover:text-accent transition-colors"
                  >
                    {format}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 mt-auto">
                {userRole === "admin" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateClick(dataset)}
                      className="flex-1 hover:bg-accent hover:border-accent hover:text-accent-foreground"
                    >
                      <FileText size={14} className="mr-1.5" />
                      Update
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => handleDownloadClick(dataset)}
                    >
                      <Download size={14} className="mr-1.5" />
                      Download
                    </Button>
                  </>
                ) : userRole === "registered" || userRole === "verified" ? (
                  <Button
                    size="sm"
                    className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleRequestClick(dataset.id)}
                  >
                    <FileText size={14} className="mr-1.5" />
                    Request Access
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full cursor-not-allowed opacity-70"
                    disabled
                  >
                    <FileText size={14} className="mr-1.5" />
                    Request Access (sign in)
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dataset List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {sortedDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-card border border-border rounded-lg p-5 hover:shadow-md hover:border-accent/40 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded">
                          {dataset.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Updated {dataset.lastUpdated}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {dataset.title}
                      </h3>
                    </div>
                    {userRole !== "public" && (
                      <button
                        onClick={() => handleBookmarkToggle(dataset.id)}
                        className={`p-2 rounded-lg transition-all duration-200 mt-1 ${
                          dataset.isBookmarked
                            ? "text-accent bg-accent/10"
                            : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                        }`}
                      >
                        <Bookmark size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {dataset.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{dataset.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{dataset.timeline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Database size={14} />
                      <span>{dataset.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{dataset.records} records</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-64">
                  <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                    {dataset.formats.map((format) => (
                      <span
                        key={format}
                        className="px-2.5 py-1 text-xs bg-input-background border border-border rounded-md text-muted-foreground font-mono hover:border-accent hover:text-accent transition-colors"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {userRole === "admin" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateClick(dataset)}
                          className="flex-1 hover:bg-accent hover:border-accent hover:text-accent-foreground"
                        >
                          <FileText size={14} className="mr-1.5" />
                          Update
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => handleDownloadClick(dataset)}
                        >
                          <Download size={14} className="mr-1.5" />
                          Download
                        </Button>
                      </>
                    ) : userRole === "registered" || userRole === "verified" ? (
                      <Button
                        size="sm"
                        className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => handleRequestClick(dataset.id)}
                      >
                        <FileText size={14} className="mr-1.5" />
                        Request Access
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full cursor-not-allowed opacity-70"
                        disabled
                      >
                        <FileText size={14} className="mr-1.5" />
                        Request Access (sign in)
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedDatasets.length === 0 && (
        <div className="text-center py-16 bg-card border border-border rounded-lg mt-6">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No datasets found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Modals */}
      <DatasetDownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        datasetId={selectedDataset?.id || ""}
        datasetTitle={selectedDataset?.title || ""}
        onDownload={handleDownload}
      />

      <DatasetUpdateModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        dataset={selectedDataset || mockDatasets[0]}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
