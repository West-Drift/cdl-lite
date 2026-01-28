"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Layers,
  Globe,
  ChevronDown,
  Eye,
  BarChart3,
  FileText,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface MapSidebarProps {
  userRole: UserRole;
  mode: SidebarMode;
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
  onDownload: (id: string) => void;
  onRequest: (id: string) => void;
}

export function MapSidebar({
  userRole,
  mode,
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
  onDownload,
  onRequest,
}: MapSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState({
    from: "2020-01-01",
    until: "2024-12-31",
  });
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);

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

  const canDownloadOrRequest = userRole !== "public";

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Top search bar */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-input-background border-border"
        />
      </div>

      {mode === "search" ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Data Sources */}
            <Accordion type="multiple" defaultValue={["sources"]}>
              <AccordionItem value="sources">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  <Layers className="h-4 w-4 mr-2" />
                  Data Sources
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3">
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

            {/* Time Range */}
            <Accordion type="single" collapsible defaultValue="time">
              <AccordionItem value="time">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-2" />
                  Time Range
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Input
                      type="date"
                      value={timeRange.from}
                      onChange={(e) =>
                        setTimeRange({ ...timeRange, from: e.target.value })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Until</Label>
                    <Input
                      type="date"
                      value={timeRange.until}
                      onChange={(e) =>
                        setTimeRange({ ...timeRange, until: e.target.value })
                      }
                      className="bg-input-background border-border"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Boundary Selection – cascading */}
            <Accordion type="single" collapsible defaultValue="boundaries">
              <AccordionItem value="boundaries">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  <Globe className="h-4 w-4 mr-2" />
                  Boundary Selection
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Country → Admin 1 → Admin 2 → Admin 3 → Admin 4
                  </p>

                  <div className="space-y-2">
                    <Label className="text-xs">Country</Label>
                    <select
                      className="w-full border border-border rounded px-2 py-1 text-xs bg-input-background"
                      value={selectedCountry ?? ""}
                      onChange={(e) => onCountryChange(e.target.value)}
                    >
                      <option value="">Select country</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Admin 1</Label>
                    <select
                      className="w-full border border-border rounded px-2 py-1 text-xs bg-input-background"
                      value={selectedAdmin1 ?? ""}
                      onChange={(e) => onAdmin1Change(e.target.value)}
                      disabled={!selectedCountry}
                    >
                      <option value="">Select Admin 1</option>
                      {admin1Options.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Admin 2</Label>
                    <select
                      className="w-full border border-border rounded px-2 py-1 text-xs bg-input-background"
                      value={selectedAdmin2 ?? ""}
                      onChange={(e) => onAdmin2Change(e.target.value)}
                      disabled={!selectedAdmin1}
                    >
                      <option value="">Select Admin 2</option>
                      {admin2Options.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Admin 3</Label>
                    <select
                      className="w-full border border-border rounded px-2 py-1 text-xs bg-input-background"
                      value={selectedAdmin3 ?? ""}
                      onChange={(e) => onAdmin3Change(e.target.value)}
                      disabled={!selectedAdmin2}
                    >
                      <option value="">Select Admin 3</option>
                      {admin3Options.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Admin 4</Label>
                    <select
                      className="w-full border border-border rounded px-2 py-1 text-xs bg-input-background"
                      value={selectedAdmin4 ?? ""}
                      onChange={(e) => onAdmin4Change(e.target.value)}
                      disabled={!selectedAdmin3}
                    >
                      <option value="">Select Admin 4</option>
                      {admin4Options.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="border-t border-border p-4">
            <Button
              className="w-full"
              onClick={onSearch}
              disabled={isSearching}
            >
              {isSearching ? "Searching…" : "Search"}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Results header */}
          <div className="border-b border-border p-4 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onBackToSearch}
            >
              {/* Chevron left */}
              <ChevronDown className="-rotate-270 h-4 w-4" />
            </Button>
            <div>
              <div className="text-xs">Showing {results.length} datasets</div>
            </div>
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto p-4">
            {results.length === 0 ? (
              <p className="text-xs text-muted-foreground">No results found.</p>
            ) : (
              <div className="space-y-3">
                {results.map((result) => {
                  const isActive = activeLayerIds.includes(result.id);
                  return (
                    <div
                      key={result.id}
                      className="p-3 border border-border rounded-lg bg-card hover:bg-muted/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium">{result.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {result.category} • {result.size}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => onToggleLayer(result.id)}
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
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => onRequest(result.id)}
                          disabled={!canDownloadOrRequest}
                        >
                          <FileText className="h-3 w-3 mr-1" /> Request
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => onDownload(result.id)}
                          disabled={!canDownloadOrRequest}
                        >
                          <Download className="h-3 w-3 mr-1" /> Download
                        </Button>
                      </div>
                      {!canDownloadOrRequest && (
                        <p className="mt-2 text-[10px] text-amber-600">
                          Sign in to request or download this dataset.
                        </p>
                      )}
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
