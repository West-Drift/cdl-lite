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
  Calendar,
  CalendarIcon,
  Layers,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
  FileText,
  Download,
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

  // Lifted state (owned by MapCanvas)
  dateFrom: Date | undefined;
  dateUntil: Date | undefined;
  onDateFromChange: (d: Date | undefined) => void;
  onDateUntilChange: (d: Date | undefined) => void;
  boundaryMode: BoundaryMode;
  onBoundaryModeChange: (mode: BoundaryMode) => void;

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
  activeLayerIds,
  onToggleLayer,
  onChart,
  onDownload,
  onRequest,

  dateFrom,
  dateUntil,
  onDateFromChange,
  onDateUntilChange,
  boundaryMode,
  onBoundaryModeChange,

  isSidebarOpen,
  onToggleSidebar,
}: MapSidebarProps) {
  // Independent month/year browsing views
  const [fromView, setFromView] = useState<Date>(dateFrom ?? new Date());
  const [untilView, setUntilView] = useState<Date>(dateUntil ?? new Date());

  // Which popover calendar is open
  const [activeCalendar, setActiveCalendar] = useState<"from" | "until" | null>(
    null,
  );

  // Expandable data sources
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

  // RBAC
  const canView = true;
  const canChart =
    userRole === "registered" ||
    userRole === "verified" ||
    userRole === "admin";
  const canRequest =
    userRole === "registered" ||
    userRole === "verified" ||
    userRole === "admin";
  const canDownload = userRole === "admin";

  // Boundary tooltips
  const boundaryModeTooltips = {
    GADM: "Official administrative boundaries (Country → County → Subcounty → Ward → Village)",
    TAMSAT: "4km climate grid cells linked to administrative boundaries",
    SHAMBA: "Farm polygons linked to administrative boundaries",
  };

  /**
   * Custom header with 4 arrows (Month ‹/› on left, Year ‹/› on right).
   * This is rendered OUTSIDE the DayPicker to avoid interfering with your existing styles.
   */
  const renderCalendarHeader = (
    viewDate: Date,
    setViewDate: (d: Date) => void,
  ) => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();

    return (
      <div className="flex justify-between items-center px-2 py-2">
        {/* Month controls */}
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

        {/* Year controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year - 1, month, 1))}
            className="h-6 w-6 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent/20 rounded-md inline-flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-primary min-w-12 text-center">
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

  /**
   * Reusable calendar popover box for both "From" and "Until".
   * - Independent month/year browsing (viewDate)
   * - Subheader (caption) kept and styled as text-primary
   * - Even 7-column layout with centered days
   */
  const renderCalendarBox = (
    selectedDate: Date | undefined,
    setSelectedDate: (d: Date | undefined) => void,
    viewDate: Date,
    setViewDate: (d: Date) => void,
  ) => {
    return (
      <div className="border border-accent/30 rounded-lg bg-card shadow-lg overflow-hidden">
        {renderCalendarHeader(viewDate, setViewDate)}

        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={(d) => setSelectedDate(d)}
          month={viewDate}
          onMonthChange={setViewDate}
          captionLayout="label" // keep label for subheader (February 2026)
          hideNavigation // remove DayPicker's own arrows
          disabled={(date) => date > new Date()}
          classNames={{
            // Subheader "February 2026"
            caption_label:
              "text-primary text-xs font-semibold text-center mb-1",

            // Make weekday header compact and centered across 7 equal columns
            months: "flex w-full",
            month: "w-full p-3 pt-0",
            table: "w-full border-collapse border-spacing-0",
            head_row: "flex w-full mb-1",
            head_cell:
              "text-muted-foreground flex-1 font-normal text-[0.65rem] text-center",

            // Even 7-column grid for day rows
            row: "flex w-full",

            // Each day cell expands evenly and centers its content
            day: "flex-1 text-center text-xs p-1 relative",

            // Clickable button inside the cell (Roomier height and perfect centering)
            day_button:
              "h-4 w-4 p-0 font-normal hover:bg-accent/40 rounded-full transition-colors text-xs inline-flex items-center justify-center",

            // Modifiers
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
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-[80vh] overflow-hidden">
      {/* Sidebar Quick Tabs (unchanged) */}
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
            {/* Data Sources */}
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
                      <Calendar className="h-3 w-3 mr-1" />
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
                          "w-full justify-start text-left text-xs font-normal border-accent/30 hover:border-accent hover:bg-accent/10 transition-colors h-9",
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
                          "w-full justify-start text-left text-xs font-normal border-accent/30 hover:border-accent hover:bg-accent/10 transition-colors h-9",
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

                    {/* Popover calendar (From / Until) */}
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

                    {/* Selected Range */}
                    <div className="bg-primary/5 border border-accent/20 rounded-lg p-2.5">
                      <div className="text-xs text-muted-foreground mb-1">
                        Selected Range:
                      </div>
                      <div className="text-xs font-medium text-accent">
                        {dateFrom && dateUntil
                          ? `${format(dateFrom, "MMM d, yyyy")} - ${format(
                              dateUntil,
                              "MMM d, yyyy",
                            )}`
                          : "No range selected"}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Boundary Selection (unchanged) */}
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
                    {/* Toggle: GADM | TAMSAT | SHAMBA */}
                    <div className="border-b border-border mb-3">
                      <div className="grid grid-cols-3">
                        <button
                          onClick={() => onBoundaryModeChange("GADM")}
                          className={`py-2 px-3 text-xs font-semibold uppercase tracking-wide transition-all border-b-2 ${
                            boundaryMode === "GADM"
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:text-primary"
                          }`}
                          title={boundaryModeTooltips.GADM}
                        >
                          GADM
                        </button>
                        <button
                          onClick={() => onBoundaryModeChange("TAMSAT")}
                          className={`py-2 px-3 text-xs font-semibold uppercase tracking-wide transition-all border-b-2 ${
                            boundaryMode === "TAMSAT"
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:text-primary"
                          }`}
                          title={boundaryModeTooltips.TAMSAT}
                        >
                          TAMSAT
                        </button>
                        <button
                          onClick={() => onBoundaryModeChange("SHAMBA")}
                          className={`py-2 px-3 text-xs font-semibold uppercase tracking-wide transition-all border-b-2 ${
                            boundaryMode === "SHAMBA"
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:text-primary"
                          }`}
                          title={boundaryModeTooltips.SHAMBA}
                        >
                          SHAMBA
                        </button>
                      </div>
                    </div>

                    {/* Mode Description */}
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

          {/* Search Button (unchanged) */}
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
          {/* Results header (unchanged) */}
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

          {/* Results list (unchanged) */}
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

                      {/* Action Buttons with RBAC (unchanged) */}
                      <div className="flex gap-1 flex-wrap">
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
