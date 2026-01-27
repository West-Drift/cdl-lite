import { Database, Map, Download, Shield, Sparkles } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";

const FeaturesSection = () => {
  const features = [
    {
      icon: Database,
      title: "Comprehensive Data Library",
      description:
        "Access extensive climate and environmental datasets covering all 54 African nations with historical and real-time data.",
    },
    {
      icon: Map,
      title: "Interactive Selection",
      description:
        "Choose from pre-defined administrative boundaries or upload custom shapefiles for precise area selection.",
    },
    {
      icon: Download,
      title: "On-Demand Processing",
      description:
        "Request custom data processing and download datasets tailored to your specific research needs.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security with role-based access control and 99.9% uptime guarantee.",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
              Why CDLite
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6  dark:text-white">
            Built for{" "}
            <span className="relative">
              <span className="text-accent">Insurance Excellence</span>
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A comprehensive platform designed for insurers, environmental
            planners, researchers and policy makers who need reliable index
            data.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Bottom decorative element */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-border" />
            <div className="w-2 h-2 rounded-full bg-primary/50" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-border" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
