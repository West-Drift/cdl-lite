import { type LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index = 0,
}: FeatureCardProps) => {
  return (
    <div
      className="group relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Main card */}
      <div className="relative h-full p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:border-primary/50 transition-all duration-500 overflow-hidden hover:shadow-md">
        {/* Gradient background on hover */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-accent/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon row */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-accent/60 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:shadow-primary/40 transition-all duration-300">
              <Icon
                className="w-7 h-7 text-primary-foreground"
                strokeWidth={1.5}
              />
            </div>

            {/* Arrow indicator */}
            <div className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-primary/50 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed flex-1">
            {description}
          </p>

          {/* Bottom accent line */}
          <div className="mt-6 h-1 w-12 rounded-full bg-linear-to-r from-primary to-accent group-hover:w-full transition-all duration-500" />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
