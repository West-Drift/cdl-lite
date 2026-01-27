// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/components/AuthProvider";
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
  LogOut,
  LayoutDashboard,
  Sparkles,
  Search,
  MousePointerClick,
  Layers,
  FileDown,
} from "lucide-react";
import logoImage from "@/public/assets/acre_logo.png";
import Footer from "@/components/Footer";
import InfiniteSlider from "@/components/InfiniteSlider";
import FeaturesSection from "@/components/FeatureSection";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

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

  const stats = [
    { value: "247+", label: "Datasets" },
    { value: "42", label: "Coverage Areas" },
    { value: "15K+", label: "Downloads" },
    { value: "143", label: "Active Users" },
  ];

  const handleSignIn = () => router.push("/login");
  const handleGetStarted = () => router.push("/dashboard");
  const handleBrowseCatalog = () => router.push("/catalog");

  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#05487f] to-[#033a66] border-b border-[#05487f] sticky top-0 z-50">
        <div className="max-w-10xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo only */}
            <div className="flex items-center">
              <Image
                src={logoImage}
                alt="ACRE Africa"
                height={40}
                className="rounded"
              />
            </div>

            {/* Right: auth actions */}
            {user.role === "public" ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-accent/80 hover:text-white rounded-2xl flex items-center gap-2"
                onClick={handleSignIn}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline italic">Sign in</span>
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-accent font-medium italic leading-tight">
                  Welcome, {firstName}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-500 hover:bg-primary/40 hover:text-accent/80 rounded-full"
                  aria-label="Sign out"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#05487f] to-[#033a66] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/20 text-accent-light font-medium text-sm backdrop-blur-sm border border-accent/20">
                    <span className="w-2 h-2 rounded-full bg-accent mr-2 animate-pulse" />
                    CDLite
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl text-white mb-4 font-bold leading-tight">
                  Access Premier
                  <br />
                  <span className="text-accent">Climate Data Library</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                  Comprehensive climate and environmental datasets for research,
                  planning, and decision-making.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-[#eb9c5a] hover:bg-[#d88a4a] text-white shadow-md rounded-full"
                  onClick={handleGetStarted}
                >
                  {user.role === "public"
                    ? "Explore for Free"
                    : "Open Dashboard"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-black hover:bg-white/10 rounded-full"
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
            <div className="relative h-[420px] sm:h-[480px] hidden lg:block">
              <div className="absolute top-0 right-0 w-72 h-72 transform rotate-6 transition-transform hover:rotate-3 duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576768199624-133c63936c46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Satellite view of Africa"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
              <div className="absolute top-32 right-24 w-64 h-64 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                <ImageWithFallback
                  src="https://plus.unsplash.com/premium_photo-1713084033448-7c1ad938c675?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="A satellite image of a mountain range with holes"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white"
                />
              </div>
              <div className="absolute bottom-0 right-8 w-56 h-56 transform rotate-12 transition-transform hover:rotate-6 duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1723067950251-af96d68b9c1e?auto=format&fit=crop&w=1920&q=80"
                  alt="An aerial view of a tree covered area"
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
      <section>
        <FeaturesSection />
      </section>

      {/* Data Categories */}
      <section>
        <InfiniteSlider />
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white dark:bg-slate-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-5xl mx-auto text-center mb-20">
          <Badge className="inline-flex items-center px-3 py-1 rounded-full bg-accent/20 text-accent font-medium text-sm mb-4 border border-accent/20">
            How It Works
          </Badge>
          <h2 className="text-4xl font-bold text-primary dark:text-white">
            Simple <span className="text-accent">Data Acquisition Process</span>
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-[#05487f] via-[#eb9c5a] to-[#05487f] opacity-20 -z-10"></div>

            {[
              {
                icon: Search,
                title: "Browse",
                desc: "Explore the catalog of available datasets.",
              },
              {
                icon: MousePointerClick,
                title: "Select",
                desc: "Choose regions or upload shapefiles.",
              },
              {
                icon: Layers,
                title: "Request",
                desc: "Submit your custom processing request.",
              },
              {
                icon: FileDown,
                title: "Download",
                desc: "Get your data in your preferred format.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-lg flex items-center justify-center mb-6 group-hover:border-[#eb9c5a] group-hover:text-[#eb9c5a] transition-colors z-10">
                  <step.icon className="w-7 h-7 text-[#05487f] dark:text-blue-400 group-hover:text-[#eb9c5a] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed px-4">
                  {step.desc}
                </p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 text-[#eb9c5a] size-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#05487f] to-[#033a66]">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/20 mb-8 text-accent">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Join 143+ Active Researchers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-accent/60 mb-4">
            Ready to Access Data?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            Join researchers and organizations using our platform for
            data-driven decisions.
          </p>
          <Button
            size="lg"
            className="bg-[#eb9c5a] hover:bg-[#d88a4a] text-white rounded-full"
            onClick={user.role === "public" ? handleSignIn : handleGetStarted}
          >
            {user.role === "public" ? "Get Started" : "Go to Dashboard"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
