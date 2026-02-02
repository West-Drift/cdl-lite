"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Layers,
  Globe,
  ChevronDown,
  ChevronLeft,
  Eye,
  BarChart3,
  FileText,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type UserRole = "public" | "registered" | "verified" | "admin";
type SidebarMode = "search" | "results";
type BoundaryMode = "GADM" | "TAMSAT";

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

interface MapSidebarProps {
  userRole: UserRole;
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  onBackToSearch: () => void;
  onSearch: () => void;
  isSearching: boolean;

  countries: BoundaryLevelOption[];
  admin1Options: BoundaryLevelOption[];
  admin2Options: BoundaryLevelOption[];
  admin3Options: BoundaryLevelOption[];
  admin4Options: BoundaryLevelOption[];
  selectedCountry?: string | null;
  selectedAdmin1?: string | null;
  selectedAdmin2?: string | null;
  selectedAdmin3?: string | null;
  selectedAdmin4?: string | null;
  onCountryChange: (id: string) => void;
  onAdmin1Change: (id: string) => void;
  onAdmin2Change: (id: string) => void;
  onAdmin3Change: (id: string) => void;
  onAdmin4Change: (id: string) => void;

  results: ResultItem[];
  totalCount: number;
  activeLayerIds: string[];
  onToggleLayer: (id: string) => void;
  onChart: (id: string) => void;
  onDownload: (id: string) => void;
  onRequest: (id: string) => void;

  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function MapSidebar({
  userRole,
  mode,
  onModeChange,
  onBackToSearch,
  onSearch,
  isSearching,
  countries,
  admin1Options,
  admin2Options,
  admin3Options,
  admin4Options,
  selectedCountry,
  selectedAdmin1,
  selectedAdmin2,
  selectedAdmin3,
  selectedAdmin4,
  onCountryChange,
  onAdmin1Change,
  onAdmin2Change,
  onAdmin3Change,
  onAdmin4Change,
  results,
  totalCount,
  activeLayerIds,
  onToggleLayer,
  onChart,
  onDownload,
  onRequest,
  isSidebarOpen,
  onToggleSidebar,
}: MapSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState({
    from: "2020-01-01",
    until: "2024-12-31",
  });
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
  const [boundaryMode, setBoundaryMode] = useState<BoundaryMode>("GADM");

  const dataSources = [
    {
      id: "climate",
      name: "Climate",
      subcategories: ["Precipitation", "Temperature", "Humidity"],
    },
    {
      id: "land",
      name: "Land Use",
      subcategories: ["NDVI", "LAI", "Land Cover"],
    },
    {
      id: "hydrology",
      name: "Hydrology",
      subcategories: ["Soil Moisture", "Evapotranspiration"],
    },
  ];

  const toggleFilter = (id: string) => {
    setExpandedFilters((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // ========================================
  // RBAC PERMISSIONS - GRANULAR CONTROL
  // ========================================

  // View/Hide: Everyone can view data on canvas
  const canView = true;

  // Chart: Only registered users and above
  const canChart =
    userRole === "registered" ||
    userRole === "verified" ||
    userRole === "admin";

  // Request: Only registered users and above (to request download)
  const canRequest =
    userRole === "registered" ||
    userRole === "verified" ||
    userRole === "admin";

  // Download: Only admins can directly download
  const canDownload = userRole === "admin";

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-[80vh] overflow-hidden">
      {/* Sidebar Quick Tabs */}
      <div className="border-b border-border relative">
        <div className="grid grid-cols-2">
          <button
            onClick={() => onModeChange("search")}
            className={`py-3 px-4 text-sm font-semibold uppercase tracking-wide transition-all border-b-2 ${
              mode === "search"
                ? "border-accent bg-primary text-accent"
                : "border-transparent bg-accent/40 text-primary hover:bg-muted"
            }`}
          >
            Search
          </button>
          <button
            onClick={() => onModeChange("results")}
            className={`py-3 px-4 text-sm font-semibold uppercase tracking-wide transition-all border-b-2 ${
              mode === "results"
                ? "border-accent bg-primary text-accent"
                : "border-transparent bg-accent/40 text-primary hover:bg-muted"
            }`}
          >
            Results
          </button>
        </div>

        {/* Collapse Chevron Button - Shows on right edge when sidebar is open */}
        {isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-[12px] bg-accent shadow-md hover:bg-accent/80 z-10 hover:shadow-lg"
            onClick={onToggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {mode === "search" ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 border border-border rounded-lg mt-4 space-y-4">
            {/* Data Sources - Bordered Container */}
            <div className="overflow-hidden">
              <Accordion type="multiple" defaultValue={["sources"]}>
                <AccordionItem value="sources" className="border-none">
                  <AccordionTrigger className="py-2 px-1 text-sm font-medium text-primary bg-accent/20 hover:bg-accent/80 [&>svg]:hidden justify-start gap-2 no-underline hover:no-underline">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-accent/0 hover:bg-accent/0"
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      <span>Data Sources</span>
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-3 space-y-3">
                    {dataSources.map((source) => (
                      <div key={source.id} className="space-y-2">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleFilter(source.id)}
                        >
                          <span className="text-sm font-medium">
                            {source.name}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedFilters.includes(source.id)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                        {expandedFilters.includes(source.id) && (
                          <div className="ml-4 space-y-1">
                            {source.subcategories.map((sub) => (
                              <div
                                key={sub}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  id={`${source.id}-${sub}`}
                                  className="rounded border-border text-primary focus:ring-primary"
                                />
                                <Label
                                  htmlFor={`${source.id}-${sub}`}
                                  className="text-xs"
                                >
                                  {sub}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Time Range - Bordered Container */}
            <div className="overflow-hidden">
              <Accordion type="single" collapsible defaultValue="time">
                <AccordionItem value="time" className="border-none">
                  <AccordionTrigger className="py-2 px-1 text-sm font-medium text-primary bg-accent/20 hover:bg-accent/80 [&>svg]:hidden justify-start gap-2 no-underline hover:no-underline">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-accent/0 hover:bg-accent/0"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Time Range</span>
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-3 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">From</Label>
                      <Input
                        type="date"
                        value={timeRange.from}
                        onChange={(e) =>
                          setTimeRange((prev) => ({
                            ...prev,
                            from: e.target.value,
                          }))
                        }
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Until</Label>
                      <Input
                        type="date"
                        value={timeRange.until}
                        onChange={(e) =>
                          setTimeRange((prev) => ({
                            ...prev,
                            until: e.target.value,
                          }))
                        }
                        className="text-xs"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Boundary Selection - Bordered Container */}
            <div className="overflow-hidden">
              <Accordion type="single" collapsible defaultValue="boundaries">
                <AccordionItem value="boundaries" className="border-none">
                  <AccordionTrigger className="py-2 px-1 text-sm font-medium text-primary bg-accent/20 hover:bg-accent/80 [&>svg]:hidden justify-start gap-2 no-underline hover:no-underline">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-accent/0 hover:bg-accent/0"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      <span>Boundary Selection</span>
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-3 space-y-3">
                    {/* GADM / TAMSAT Toggle */}
                    <div className="border-b border-border mb-3">
                      <div className="grid grid-cols-2">
                        <button
                          onClick={() => setBoundaryMode("GADM")}
                          className={`py-2 px-3 text-xs font-semibold uppercase tracking-wide transition-all border-b-2 ${
                            boundaryMode === "GADM"
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:text-primary"
                          }`}
                        >
                          GADM
                        </button>
                        <button
                          onClick={() => setBoundaryMode("TAMSAT")}
                          className={`py-2 px-3 text-xs font-semibold uppercase tracking-wide transition-all border-b-2 ${
                            boundaryMode === "TAMSAT"
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:text-primary"
                          }`}
                        >
                          TAMSAT
                        </button>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label className="text-xs">Country</Label>
                      <Select
                        value={selectedCountry ?? ""}
                        onValueChange={onCountryChange}
                      >
                        <SelectTrigger className="w-full text-xs border-border">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Admin 1 */}
                    <div className="space-y-2">
                      <Label className="text-xs">Admin 1</Label>
                      <Select
                        value={selectedAdmin1 ?? ""}
                        onValueChange={onAdmin1Change}
                        disabled={!selectedCountry}
                      >
                        <SelectTrigger className="w-full text-xs border-border">
                          <SelectValue placeholder="Select Admin 1" />
                        </SelectTrigger>
                        <SelectContent>
                          {admin1Options.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Admin 2 */}
                    <div className="space-y-2">
                      <Label className="text-xs">Admin 2</Label>
                      <Select
                        value={selectedAdmin2 ?? ""}
                        onValueChange={onAdmin2Change}
                        disabled={!selectedAdmin1}
                      >
                        <SelectTrigger className="w-full text-xs border-border">
                          <SelectValue placeholder="Select Admin 2" />
                        </SelectTrigger>
                        <SelectContent>
                          {admin2Options.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Admin 3 */}
                    <div className="space-y-2">
                      <Label className="text-xs">Admin 3</Label>
                      <Select
                        value={selectedAdmin3 ?? ""}
                        onValueChange={onAdmin3Change}
                        disabled={!selectedAdmin2}
                      >
                        <SelectTrigger className="w-full text-xs border-border">
                          <SelectValue placeholder="Select Admin 3" />
                        </SelectTrigger>
                        <SelectContent>
                          {admin3Options.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Admin 4 */}
                    <div className="space-y-2">
                      <Label className="text-xs">Admin 4</Label>
                      <Select
                        value={selectedAdmin4 ?? ""}
                        onValueChange={onAdmin4Change}
                        disabled={!selectedAdmin3}
                      >
                        <SelectTrigger className="w-full text-xs border-border">
                          <SelectValue placeholder="Select Admin 4" />
                        </SelectTrigger>
                        <SelectContent>
                          {admin4Options.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Search Button - Bordered Container */}
          <div className="mt-2">
            <div className="border border-border rounded-lg p-3">
              <Button
                className="w-full"
                onClick={onSearch}
                disabled={isSearching}
              >
                {isSearching ? "Searching…" : "Search"}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Results header */}
          <div className="border-b border-border p-2 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs hover:text-primary bg-primary/30"
              onClick={onBackToSearch}
            >
              ← Back to Search
            </Button>
            <div>
              <div className="text-xs">Showing {results.length} datasets</div>
            </div>
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="text-xs text-muted-foreground">No results found.</p>
            ) : (
              <div className="space-y-3">
                {results.map((result) => {
                  const isActive = activeLayerIds.includes(result.id);
                  return (
                    <div
                      key={result.id}
                      className="p-2 border border-border rounded-lg bg-card hover:bg-muted/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-medium text-accent">
                          {result.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] text-primary"
                        >
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {result.category} • {result.size}
                      </p>

                      {/* Action Buttons with RBAC */}
                      <div className="flex gap-1 flex-wrap">
                        {/* View/Hide - Everyone */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-1 text-[10px] text-muted-foreground"
                          onClick={() => onToggleLayer(result.id)}
                          disabled={!canView}
                        >
                          <Eye
                            className={`h-3 w-3 mr-1 ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          {isActive ? "Hide" : "View"}
                        </Button>

                        {/* Chart - Registered and above */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[10px] text-muted-foreground"
                          onClick={() => {
                            if (!canChart) {
                              alert("Please sign in to access charts");
                              return;
                            }
                            onChart(result.id);
                          }}
                        >
                          <BarChart3
                            className={`h-3 w-3 mr-1 ${
                              canChart && isActive
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          Chart
                        </Button>

                        {/* Request - Registered and above */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[10px] text-muted-foreground"
                          onClick={() => {
                            if (!canRequest) {
                              alert(
                                "Please sign in to submit download requests",
                              );
                              return;
                            }
                            onRequest(result.id);
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" /> Request
                        </Button>

                        {/* Download - Admin only */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[10px] text-primary"
                          onClick={() => {
                            if (!canDownload) {
                              alert(
                                "Direct download requires admin privileges. Please use Request to submit a download request.",
                              );
                              return;
                            }
                            onDownload(result.id);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
