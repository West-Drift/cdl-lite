"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // Core layout (MapSidebar uses these)
        months: "flex w-full",
        month: "w-full p-3 pt-0",
        table: "w-full border-collapse border-spacing-0",

        // Subheader "January 2026" (MapSidebar overrides caption_label, so keep it generic)
        caption: "flex justify-center relative items-center w-full",
        caption_label: "text-sm font-medium",

        // Weekday headings - YOU SAID THIS IS IMPORTANT
        weekday: "text-muted-foreground font-semibold text-md",

        // Week rows + equal columns
        head_row: "flex w-full mb-1",
        row: "flex w-full",

        // Cells
        cell: "relative p-0 text-center text-sm",

        // Day (default from shadcn)
        day: "size-8 p-0 font-normal aria-selected:opacity-100",

        // Modifiers (MapSidebar uses selected/today/outside/disabled/hidden)
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
        day_today: "bg-accent text-accent-foreground font-semibold",
        day_outside: "text-muted-foreground/40",
        day_disabled: "text-muted-foreground/40",
        day_hidden: "invisible",

        // Preserve ability to override
        ...classNames,
      }}
      // Fix TS: DayPicker v9 components
      components={{
        PreviousMonthButton: (props) => (
          <button {...props} className="p-0 opacity-0 pointer-events-none" />
        ),
        NextMonthButton: (props) => (
          <button {...props} className="p-0 opacity-0 pointer-events-none" />
        ),
        Chevron: () => <></>,
      }}
      {...props}
    />
  );
}

export { Calendar };
