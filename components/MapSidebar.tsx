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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  CalendarIcon,
  CalendarRange,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Download,
  Loader2,
  Leaf,
  CloudRain,
  Droplets,
  Map,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type UserRole = "public" | "registered" | "verified" | "admin";
type SidebarMode = "search" | "results";
type BoundaryMode = "GADM" | "TAMSAT" | "SHAMBA";

interface BoundaryLevelOption {
  id: string;
  name: string;
}

interface ResultItem {
  id: string;
  name: string;
  type: string;
  category: string;
  subcategory: string;
  sensor: string | null;
  boundaryType: string;
  size: string;
}

// Full dataset descriptor returned by /api/datasets
interface DatasetItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  sensor: string | null;
  mask: string; // 'none' | 'cropland' | 'forage'
  frequency: string | null;
  type: string;
  boundary_type: string;
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
  recordCounts: Record<
    string,
    {
      count: number;
      filtered: boolean;
      scope: "complete" | "country" | "filtered";
    }
  >;
  activeLayerIds: string[];
  onToggleLayer: (id: string) => void;
  onDownload: (id: string) => void;
  onRequest: (id: string) => void;

  // Lifted state (owned by MapCanvas)
  dateFrom: Date | undefined;
  dateUntil: Date | undefined;
  onDateFromChange: (d: Date | undefined) => void;
  onDateUntilChange: (d: Date | undefined) => void;
  boundaryMode: BoundaryMode;
  onBoundaryModeChange: (mode: BoundaryMode) => void;

  // Dataset selection (lifted — drives polygon-click chart default)
  allDatasets: DatasetItem[];
  selectedDatasetIds: string[];
  onDatasetSelectionChange: (ids: string[]) => void;

  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

// ── Display maps ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  vegetation: "Vegetation",
  climate: "Climate",
  hydrology: "Hydrology",
  land: "Land",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  vegetation: <Leaf className="h-3.5 w-3.5 text-green-500" />,
  climate: <CloudRain className="h-3.5 w-3.5 text-sky-400" />,
  hydrology: <Droplets className="h-3.5 w-3.5 text-blue-400" />,
  land: <Map className="h-3.5 w-3.5 text-amber-500" />,
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  ndvi: "NDVI",
  lai: "LAI",
  bai: "BAI",
  vhi: "VHI",
  rainfall: "Rainfall",
  lst: "LST",
  wind: "Wind",
  soil_moisture: "Soil Moisture",
  et: "Evapotranspiration",
  land_cover: "Land Cover",
  soil_map: "Soil Map",
};

const BOUNDARY_LABELS: Record<string, string> = {
  GADM: "GADM (Ward)",
  TAMSAT: "TAMSAT (Grid)",
  SHAMBA: "SHAMBA (Farm)",
};

const MASK_LABELS: Record<string, string> = {
  none: "No Mask",
  cropland: "Cropland Mask",
  forage: "Forage Mask",
};

// Dot colors used in the tree next to mask rows — mirrors ChartPanel colors
const MASK_COLORS: Record<string, string> = {
  none: "bg-indigo-400",
  cropland: "bg-green-400",
  forage: "bg-yellow-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

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
  recordCounts,
  activeLayerIds,
  onToggleLayer,
  onDownload,
  onRequest,

  dateFrom,
  dateUntil,
  onDateFromChange,
  onDateUntilChange,
  boundaryMode,
  onBoundaryModeChange,

  allDatasets,
  selectedDatasetIds,
  onDatasetSelectionChange,

  isSidebarOpen,
  onToggleSidebar,
}: MapSidebarProps) {
  const [fromView, setFromView] = useState<Date>(dateFrom ?? new Date());
  const [untilView, setUntilView] = useState<Date>(dateUntil ?? new Date());
  const [activeCalendar, setActiveCalendar] = useState<"from" | "until" | null>(
    null,
  );
  const [expandedNodes, setExpandedNodes] = useState<string[]>(["vegetation"]);

  const toggleNode = (key: string) =>
    setExpandedNodes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  // ── Checked-state helpers ──────────────────────────────────────────────────

  const checkedState = (datasets: DatasetItem[]): "all" | "some" | "none" => {
    const n = datasets.filter((d) => selectedDatasetIds.includes(d.id)).length;
    if (n === datasets.length) return "all";
    if (n > 0) return "some";
    return "none";
  };

  const toggleSet = (datasets: DatasetItem[]) => {
    const ids = datasets.map((d) => d.id);
    const allOn = ids.every((id) => selectedDatasetIds.includes(id));
    const next = allOn
      ? selectedDatasetIds.filter((id) => !ids.includes(id))
      : [...new Set([...selectedDatasetIds, ...ids])];
    onDatasetSelectionChange(next);
  };

  const toggleOne = (id: string) => {
    const next = selectedDatasetIds.includes(id)
      ? selectedDatasetIds.filter((x) => x !== id)
      : [...selectedDatasetIds, id];
    onDatasetSelectionChange(next);
  };

  // ── Group datasets: category → subcategory → boundary_type → mask → items ──
  //
  // Structure: grouped[cat][sub][btype][mask] = DatasetItem[]

  type MaskGroup = Record<string, DatasetItem[]>;
  type BtypeGroup = Record<string, MaskGroup>;
  type SubGroup = Record<string, BtypeGroup>;
  type CatGroup = Record<string, SubGroup>;

  const grouped = allDatasets.reduce<CatGroup>((acc, ds) => {
    const { category: cat, subcategory: sub, boundary_type: bt, mask } = ds;
    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][sub]) acc[cat][sub] = {};
    if (!acc[cat][sub][bt]) acc[cat][sub][bt] = {};
    if (!acc[cat][sub][bt][mask]) acc[cat][sub][bt][mask] = [];
    acc[cat][sub][bt][mask].push(ds);
    return acc;
  }, {});

  // ── RBAC ──────────────────────────────────────────────────────────────────
  const canView = true;
  const canRequest =
    userRole === "registered" ||
    userRole === "verified" ||
    userRole === "admin";
  const canDownload = userRole === "admin";

  // ── Boundary tooltip ───────────────────────────────────────────────────────
  const boundaryModeTooltips = {
    GADM: "Official administrative boundaries (Country → County → Subcounty → Ward)",
    TAMSAT: "4km climate grid cells linked to administrative boundaries",
    SHAMBA: "Farm polygons linked to administrative boundaries",
  };

  // ── Calendar helpers (unchanged) ───────────────────────────────────────────

  const renderCalendarHeader = (
    viewDate: Date,
    setViewDate: (d: Date) => void,
  ) => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    return (
      <div className="flex justify-between items-center px-2 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="h-6 w-6 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent/20 rounded-md inline-flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-primary min-w-[72px] text-center">
            {format(viewDate, "MMMM")}
          </span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="h-6 w-6 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent/20 rounded-md inline-flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year - 1, month, 1))}
            className="h-6 w-6 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent/20 rounded-md inline-flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-primary min-w-[48px] text-center">
            {year}
          </span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year + 1, month, 1))}
            className="h-6 w-6 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent/20 rounded-md inline-flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderCalendarBox = (
    selectedDate: Date | undefined,
    setSelectedDate: (d: Date | undefined) => void,
    viewDate: Date,
    setViewDate: (d: Date) => void,
  ) => (
    <div className="border border-accent/30 rounded-lg bg-card shadow-lg overflow-hidden">
      {renderCalendarHeader(viewDate, setViewDate)}
      <CalendarComponent
        mode="single"
        selected={selectedDate}
        onSelect={(d) => setSelectedDate(d)}
        month={viewDate}
        onMonthChange={setViewDate}
        captionLayout="label"
        hideNavigation
        disabled={(date) => date > new Date()}
        classNames={{
          caption_label: "text-primary text-xs font-semibold text-center mb-1",
          months: "flex w-full",
          month: "w-full p-3 pt-0",
          table: "w-full border-collapse border-spacing-0",
          head_row: "flex w-full mb-1",
          head_cell:
            "text-muted-foreground flex-1 font-normal text-[0.65rem] text-center",
          row: "flex w-full",
          day: "flex-1 text-center text-xs p-1 relative",
          day_button:
            "h-4 w-4 p-0 font-normal hover:bg-accent/40 rounded-full transition-colors text-xs inline-flex items-center justify-center",
          selected:
            "bg-accent text-primary hover:bg-accent/90 focus:bg-accent font-semibold",
          today: "bg-muted text-accent font-semibold",
          outside: "text-muted-foreground/40",
          disabled:
            "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent",
          hidden: "invisible",
        }}
      />
    </div>
  );

  // ── Checkbox render helper ─────────────────────────────────────────────────

  const Checkbox = ({
    state,
    onChange,
    onClick,
    className = "h-3 w-3",
  }: {
    state: "all" | "some" | "none" | boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
  }) => {
    const checked = state === "all" || state === true;
    const indeterminate = state === "some";
    return (
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        onChange={onChange}
        onClick={onClick}
        className={`${className} rounded accent-primary cursor-pointer shrink-0`}
      />
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-[80vh] overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-border relative">
        <div className="grid grid-cols-2">
          {(["search", "results"] as SidebarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`py-3 px-4 text-sm font-semibold uppercase tracking-wide transition-all border-b-2 ${
                mode === m
                  ? "border-accent bg-primary text-accent"
                  : "border-transparent bg-accent/40 text-primary hover:bg-muted"
              }`}
            >
              {m === "search" ? "Search" : "Results"}
            </button>
          ))}
        </div>
        {isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-[12px] bg-accent shadow-md hover:bg-accent/80 z-10"
            onClick={onToggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ── SEARCH mode ─────────────────────────────────────────────────── */}
      {mode === "search" ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 border border-border rounded-lg mt-4 space-y-4">
            {/* Data Sources — 5-level tree */}
            <div className="overflow-hidden">
              <Accordion type="multiple" defaultValue={["sources"]}>
                <AccordionItem value="sources" className="border-none">
                  <AccordionTrigger className="py-2 px-1 text-sm font-medium text-primary bg-accent/20 hover:bg-accent/80 [&>svg]:hidden justify-start gap-2 no-underline hover:no-underline">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-accent/0 hover:bg-accent/0"
                    >
                      <Database className="h-3 w-3 mr-1" />
                      <span>Data Sources</span>
                    </Button>
                  </AccordionTrigger>

                  <AccordionContent className="px-2 pb-4 pt-2 space-y-1">
                    {Object.keys(grouped).length === 0 && (
                      <p className="text-[10px] text-muted-foreground px-2 py-1">
                        Click Search to load datasets
                      </p>
                    )}

                    {/* Level 1 — Category */}
                    {Object.entries(grouped).map(([cat, subcats]) => {
                      const catDatasets = Object.values(subcats).flatMap((bt) =>
                        Object.values(bt).flatMap((m) =>
                          Object.values(m).flat(),
                        ),
                      );
                      const catState = checkedState(catDatasets);
                      const catOpen = expandedNodes.includes(cat);

                      return (
                        <div key={cat} className="space-y-0.5">
                          {/* Category row */}
                          <div
                            className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-accent/20 cursor-pointer select-none"
                            onClick={() => toggleNode(cat)}
                          >
                            <Checkbox
                              state={catState}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSet(catDatasets);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-3.5 w-3.5"
                            />
                            <span className="text-xs font-semibold text-muted-foreground flex-1 flex items-center gap-1.5">
                              {CATEGORY_ICONS[cat] ?? (
                                <Database className="h-3.5 w-3.5" />
                              )}
                              {CATEGORY_LABELS[cat] ?? cat}
                            </span>
                            <ChevronDown
                              className={`h-3 w-3 text-white transition-transform ${catOpen ? "rotate-180" : ""}`}
                            />
                          </div>

                          {/* Level 2 — Subcategory */}
                          {catOpen &&
                            Object.entries(subcats).map(([sub, btypes]) => {
                              const subDatasets = Object.values(btypes).flatMap(
                                (m) => Object.values(m).flat(),
                              );
                              const subState = checkedState(subDatasets);
                              const subKey = `${cat}:${sub}`;
                              const subOpen = expandedNodes.includes(subKey);

                              return (
                                <div key={sub} className="ml-3 space-y-0.5">
                                  {/* Subcategory row */}
                                  <div
                                    className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-accent/10 cursor-pointer select-none"
                                    onClick={() => toggleNode(subKey)}
                                  >
                                    <Checkbox
                                      state={subState}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleSet(subDatasets);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-[11px] font-medium text-primary/80 flex-1">
                                      {SUBCATEGORY_LABELS[sub] ?? sub}
                                    </span>
                                    <ChevronDown
                                      className={`h-3 w-3 text-white transition-transform ${subOpen ? "rotate-180" : ""}`}
                                    />
                                  </div>

                                  {/* Level 3 — Boundary type */}
                                  {subOpen &&
                                    Object.entries(btypes).map(
                                      ([bt, masks]) => {
                                        const btDatasets =
                                          Object.values(masks).flat();
                                        const btState =
                                          checkedState(btDatasets);
                                        const btKey = `${subKey}:${bt}`;
                                        const btOpen =
                                          expandedNodes.includes(btKey);

                                        return (
                                          <div
                                            key={bt}
                                            className="ml-3 space-y-0.5"
                                          >
                                            {/* Boundary type row */}
                                            <div
                                              className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-accent/10 cursor-pointer select-none"
                                              onClick={() => toggleNode(btKey)}
                                            >
                                              <Checkbox
                                                state={btState}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  toggleSet(btDatasets);
                                                }}
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              />
                                              <span className="text-[10px] font-medium text-muted-foreground/80 flex-1 uppercase tracking-wide">
                                                {BOUNDARY_LABELS[bt] ?? bt}
                                              </span>
                                              <ChevronDown
                                                className={`h-3 w-3 text-white/60 transition-transform ${btOpen ? "rotate-180" : ""}`}
                                              />
                                            </div>

                                            {/* Level 4 — Mask */}
                                            {btOpen &&
                                              Object.entries(masks).map(
                                                ([mask, datasets]) => {
                                                  const maskState =
                                                    checkedState(datasets);
                                                  const maskKey = `${btKey}:${mask}`;
                                                  const maskOpen =
                                                    expandedNodes.includes(
                                                      maskKey,
                                                    );

                                                  return (
                                                    <div
                                                      key={mask}
                                                      className="ml-3 space-y-0.5"
                                                    >
                                                      {/* Mask row */}
                                                      <div
                                                        className="flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-accent/10 cursor-pointer select-none"
                                                        onClick={() =>
                                                          toggleNode(maskKey)
                                                        }
                                                      >
                                                        <Checkbox
                                                          state={maskState}
                                                          onChange={(e) => {
                                                            e.stopPropagation();
                                                            toggleSet(datasets);
                                                          }}
                                                          onClick={(e) =>
                                                            e.stopPropagation()
                                                          }
                                                        />
                                                        <span
                                                          className={`inline-block h-2 w-2 rounded-full shrink-0 ${MASK_COLORS[mask] ?? "bg-gray-400"}`}
                                                        />
                                                        <span className="text-[10px] text-muted-foreground/70 flex-1">
                                                          {MASK_LABELS[mask] ??
                                                            mask}
                                                        </span>
                                                        <ChevronDown
                                                          className={`h-3 w-3 text-white/50 transition-transform ${maskOpen ? "rotate-180" : ""}`}
                                                        />
                                                      </div>

                                                      {/* Level 5 — Individual datasets (sensor + frequency) */}
                                                      {maskOpen &&
                                                        datasets.map((ds) => (
                                                          <div
                                                            key={ds.id}
                                                            className="ml-4 flex items-start gap-1.5 py-0.5 px-1 rounded hover:bg-accent/10 cursor-pointer"
                                                            onClick={() =>
                                                              toggleOne(ds.id)
                                                            }
                                                          >
                                                            <Checkbox
                                                              state={selectedDatasetIds.includes(
                                                                ds.id,
                                                              )}
                                                              onChange={() =>
                                                                toggleOne(ds.id)
                                                              }
                                                              onClick={(e) =>
                                                                e.stopPropagation()
                                                              }
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                              <span className="text-[10px] text-muted-foreground leading-snug block">
                                                                {ds.name}
                                                              </span>
                                                              {(ds.sensor ||
                                                                ds.frequency) && (
                                                                <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">
                                                                  {[
                                                                    ds.sensor,
                                                                    ds.frequency,
                                                                  ]
                                                                    .filter(
                                                                      Boolean,
                                                                    )
                                                                    .join(
                                                                      " · ",
                                                                    )}
                                                                </span>
                                                              )}
                                                            </div>
                                                          </div>
                                                        ))}
                                                    </div>
                                                  );
                                                },
                                              )}
                                          </div>
                                        );
                                      },
                                    )}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Time Range */}
            <div className="overflow-hidden">
              <Accordion type="single" collapsible defaultValue="time">
                <AccordionItem value="time" className="border-none">
                  <AccordionTrigger className="py-2 px-1 text-sm font-medium text-primary bg-accent/20 hover:bg-accent/80 [&>svg]:hidden justify-start gap-2 no-underline hover:no-underline">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-accent/0 hover:bg-accent/0"
                    >
                      <CalendarRange className="h-3 w-3 mr-1" />
                      <span>Time Range</span>
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-3 space-y-3">
                    {/* From */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        From
                      </Label>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left text-xs font-normal border-accent/30 hover:border-accent hover:bg-accent/10 hover:text-primary/80 transition-colors h-9",
                          !dateFrom && "text-muted-foreground",
                          activeCalendar === "from" &&
                            "bg-accent/20 border-accent",
                        )}
                        onClick={() =>
                          setActiveCalendar(
                            activeCalendar === "from" ? null : "from",
                          )
                        }
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-accent" />
                        {dateFrom ? (
                          <span className="text-primary">
                            {format(dateFrom, "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </div>
                    {/* Until */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Until
                      </Label>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left text-xs font-normal border-accent/30 hover:border-accent hover:bg-accent/10 hover:text-primary/80 transition-colors h-9",
                          !dateUntil && "text-muted-foreground",
                          activeCalendar === "until" &&
                            "bg-accent/20 border-accent",
                        )}
                        onClick={() =>
                          setActiveCalendar(
                            activeCalendar === "until" ? null : "until",
                          )
                        }
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-accent" />
                        {dateUntil ? (
                          <span className="text-primary">
                            {format(dateUntil, "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </div>
                    {activeCalendar === "from" &&
                      renderCalendarBox(
                        dateFrom,
                        onDateFromChange,
                        fromView,
                        setFromView,
                      )}
                    {activeCalendar === "until" &&
                      renderCalendarBox(
                        dateUntil,
                        onDateUntilChange,
                        untilView,
                        setUntilView,
                      )}
                    <div className="bg-primary/5 border border-accent/20 rounded-lg p-2.5">
                      <div className="text-xs text-muted-foreground mb-1">
                        Selected Range:
                      </div>
                      <div className="text-xs font-medium text-accent">
                        {dateFrom && dateUntil
                          ? `${format(dateFrom, "MMM d, yyyy")} - ${format(dateUntil, "MMM d, yyyy")}`
                          : "No range selected"}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Boundary Selection */}
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
                    {/* Mode toggle */}
                    <div className="border-b border-border mb-3">
                      <div className="grid grid-cols-3">
                        {(["GADM", "TAMSAT", "SHAMBA"] as BoundaryMode[]).map(
                          (m) => (
                            <button
                              key={m}
                              onClick={() => onBoundaryModeChange(m)}
                              className={`py-2 px-3 text-xs font-semibold uppercase tracking-wide transition-all border-b-2 ${
                                boundaryMode === m
                                  ? "border-accent text-accent"
                                  : "border-transparent text-muted-foreground hover:text-primary"
                              }`}
                              title={boundaryModeTooltips[m]}
                            >
                              {m}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 mb-3">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {boundaryModeTooltips[boundaryMode]}
                      </p>
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

          {/* Search button */}
          <div className="pt-2 pb-1 px-1">
            <Button
              className="w-full h-10 text-sm font-semibold"
              onClick={onSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading results…
                </span>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </>
      ) : (
        /* ── RESULTS mode ───────────────────────────────────────────────── */
        <>
          <div className="border-b border-border p-2 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs hover:text-primary bg-primary/30"
              onClick={onBackToSearch}
            >
              ← Back to Search
            </Button>
            <div className="text-right">
              <div className="text-xs">
                Showing {results.length} dataset
                {results.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="text-xs text-muted-foreground">No results found.</p>
            ) : (
              <div className="space-y-3">
                {results.map((result) => {
                  const isActive = activeLayerIds.includes(result.id);
                  const rc = recordCounts[result.id];
                  return (
                    <div
                      key={result.id}
                      className="p-2 border border-border rounded-lg bg-card hover:bg-muted/50"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-medium text-accent leading-snug">
                          {result.name}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[9px] text-primary shrink-0 ml-1"
                        >
                          {result.type}
                        </Badge>
                      </div>

                      <div className="text-[10px] text-muted-foreground space-y-0.5 mb-2 border-l-2 border-accent/30 pl-2">
                        <div className="capitalize flex items-center gap-1 flex-wrap">
                          <span>{result.category}</span>
                          <span className="text-muted-foreground/40">·</span>
                          {rc &&
                            (rc.scope === "filtered" ? (
                              <span className="text-accent/70 font-medium">
                                {rc.count.toLocaleString()} records
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60 italic">
                                complete record
                              </span>
                            ))}
                        </div>
                        {(dateFrom || dateUntil) && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarRange className="h-3 w-3 shrink-0 text-primary" />
                            {dateFrom ? format(dateFrom, "MMM yyyy") : "–"} →{" "}
                            {dateUntil ? format(dateUntil, "MMM yyyy") : "–"}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[10px] text-muted-foreground"
                          onClick={() => onToggleLayer(result.id)}
                          disabled={!canView}
                        >
                          <Eye
                            className={`h-3 w-3 mr-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                          />
                          {isActive ? "Hide" : "View"}
                        </Button>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[10px] text-primary"
                          onClick={() => {
                            if (!canDownload) {
                              alert(
                                "Direct download requires admin privileges.",
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
