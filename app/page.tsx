// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import Image from "next/image";
import {
  Database,
  Map,
  Download,
  Shield,
  ArrowRight,
  User,
} from "lucide-react";
import logoImage from "@/public/assets/acre_logo.png";

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Database,
      title: "Comprehensive Data Library",
      description:
        "Access extensive climate and environmental datasets covering Africa",
    },
    {
      icon: Map,
      title: "Interactive Selection",
      description:
        "Choose from pre-defined boundaries or upload custom shapefiles",
    },
    {
      icon: Download,
      title: "On-Demand Processing",
      description: "Request and download data tailored to your specific needs",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control",
    },
  ];

  const dataCategories = [
    "Precipitation",
    "NDVI",
    "Soil Moisture",
    "Land Surface Temperature",
    "Wind Speed",
    "Wind Gust",
    "Relative Humidity",
    "Evapotranspiration",
    "VHI",
    "LAI",
    "Fire",
  ];

  const stats = [
    { value: "247+", label: "Datasets" },
    { value: "42", label: "Coverage Areas" },
    { value: "15K+", label: "Downloads" },
    { value: "143", label: "Active Users" },
  ];

  const handleSignIn = () => {
    // Later: router.push('/auth/signin')
    alert("Sign In (UI only)");
  };

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  const handleBrowseCatalog = () => {
    router.push("/catalog");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#05487f] to-[#033a66] border-b border-[#05487f] sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={logoImage}
                alt="ACRE Africa"
                height={48}
                className="rounded"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-accent flex items-center gap-2"
              onClick={handleSignIn}
            >
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#05487f] to-[#033a66] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <Badge className="bg-[#eb9c5a] text-white border-none mb-4 p-1.5">
                  Geospatial Data Platform
                </Badge>
                <h1 className="text-5xl text-white mb-4 font-bold leading-tight">
                  Access Africa&apos;s Premier Geospatial Data Library
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl">
                  Comprehensive climate and environmental datasets for research,
                  planning, and decision-making across Africa.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-[#eb9c5a] hover:bg-[#d88a4a] text-white shadow-md"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-black hover:bg-white/10"
                  onClick={handleBrowseCatalog}
                >
                  Browse Catalog
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-blue-200">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Stacked Images */}
            <div className="relative h-[500px] hidden lg:block">
              <div className="absolute top-0 right-0 w-72 h-72 transform rotate-6 transition-transform hover:rotate-3 duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576768199624-133c63936c46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRlbGxpdGUlMjBlYXJ0aCUyMGFmcmljYXxlbnwxfHx8fDE3NjM5NzE3ODd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Satellite view of Africa"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
              <div className="absolute top-32 right-24 w-64 h-64 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1754341669902-4808578cada0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9zcGF0aWFsJTIwZGF0YSUyMHZpc3VhbGl6YXRpb258ZW58MXx8fHwxNzYzOTcxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Geospatial data visualization"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
              <div className="absolute bottom-0 right-8 w-56 h-56 transform rotate-12 transition-transform hover:rotate-6 duration-300">
                <ImageWithFallback
                  src="https://plus.unsplash.com/premium_photo-1713084033448-7c1ad938c675?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1631016800670-e8245c0833d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFwJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjM5NzE3ODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Digital mapping technology"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#eb9c5a] text-white border-none mb-4 p-1.5">
              Features
            </Badge>
            <h2 className="text-4xl text-gray-900 mb-4">
              Why Choose Acre Africa?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed for researchers, planners, and
              decision-makers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-[#eb9c5a] transition-colors"
              >
                <CardContent className="p-6">
                  <div className="bg-[#05487f] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#eb9c5a] text-white border-none mb-4 p-1.5">
              Data Categories
            </Badge>
            <h2 className="text-4xl text-gray-900 mb-4">
              Available Dataset Types
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access a wide range of climate and environmental data
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {dataCategories.map((category, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-6 py-3 text-base hover:bg-[#05487f] hover:text-white transition-colors cursor-pointer"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#eb9c5a] text-white border-none mb-4 p-1.5">
              How It Works
            </Badge>
            <h2 className="text-4xl text-gray-900 mb-4">
              Simple Data Request Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Browse Catalog",
                desc: "Explore available datasets",
              },
              {
                step: "2",
                title: "Select Boundaries",
                desc: "Choose regions or upload custom shapefiles",
              },
              {
                step: "3",
                title: "Submit Request",
                desc: "Request data processing",
              },
              {
                step: "4",
                title: "Download Data",
                desc: "Get your tailored datasets",
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-[#05487f] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 text-[#eb9c5a] size-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#05487f] to-[#033a66]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl text-white mb-6">
            Ready to Access Geospatial Data?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join researchers and organizations using our platform for
            data-driven decisions
          </p>
          <Button
            size="lg"
            className="bg-[#eb9c5a] hover:bg-[#d88a4a] text-white"
            onClick={handleSignIn}
          >
            Sign In for More Features
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
