// components/ui/auth-background.tsx

"use client";

import { useEffect, useState } from "react";

const images = [
  "https://plus.unsplash.com/premium_photo-1713084033448-7c1ad938c675?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1536430291604-5e07b05f0592?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1723067950251-af96d68b9c1e?auto=format&fit=crop&w=1920&q=80",
  "https://plus.unsplash.com/premium_photo-1712489841639-417b916594b5?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1713084034024-68f629763ea9?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export function AuthBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload all images
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 2000); // Match duration-2000
    }, 8000);

    return () => clearInterval(interval);
  }, [nextIndex]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Current image (base layer) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-2000"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          opacity: isTransitioning ? 0.4 : 0.4,
        }}
      />

      {/* Next image (overlay during transition) */}
      {isTransitioning && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-2000"
          style={{
            backgroundImage: `url(${images[nextIndex]})`,
            opacity: 0.4,
          }}
        />
      )}

      {/* Blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05487f]/10 to-white/20" />
    </div>
  );
}
