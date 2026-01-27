import { useEffect, useRef } from "react";
import {
  CloudRain,
  Leaf,
  Droplets,
  Thermometer,
  Wind,
  CloudLightning,
  Cloud,
  Waves,
  Heart,
  Trees,
  Flame,
  type LucideIcon,
} from "lucide-react";

interface DataCategory {
  name: string;
  icon: LucideIcon;
}

const dataCategories: DataCategory[] = [
  { name: "Precipitation", icon: CloudRain },
  { name: "NDVI", icon: Leaf },
  { name: "Soil Moisture", icon: Droplets },
  { name: "Land Surface Temperature", icon: Thermometer },
  { name: "Wind Speed", icon: Wind },
  { name: "Wind Gust", icon: CloudLightning },
  { name: "Relative Humidity", icon: Cloud },
  { name: "Evapotranspiration", icon: Waves },
  { name: "VHI", icon: Heart },
  { name: "LAI", icon: Trees },
  { name: "Fire", icon: Flame },
];

const InfiniteSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Clone items for seamless loop
    const items = slider.querySelectorAll(".slider-item");
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      slider.appendChild(clone);
    });
  }, []);

  return (
    <section className="py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-primary to-primary dark:from-background dark:to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
            Data Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-accent/60 mb-4">
            Explore Our Library
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access comprehensive climate and environmental data spanning
            multiple categories
          </p>
        </div>
      </div>

      {/* Infinite scroll container */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-accent to-accent/90 z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-accent to-accent/90 z-10 pointer-events-none" />

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-6 animate-scroll-left hover:[animation-play-state:paused] py-4"
          style={{ width: "max-content" }}
        >
          {dataCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="slider-item group flex-shrink-0">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-accent transition-all duration-300 cursor-pointer group-hover:scale-110">
                  <div className="w-7 h-7 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <IconComponent className="w-5 h-5 text-accent dark:text-primary-light group-hover:text-accent transition-colors" />
                  </div>
                  <span className="font-medium text-foreground whitespace-nowrap">
                    {category.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InfiniteSlider;
