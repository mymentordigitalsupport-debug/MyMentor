"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PageLoaderProps {
  imageSrc: string;
  children: React.ReactNode;
}

export function PageLoader({ imageSrc, children }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Minimum loading time of 500ms for smooth transition
    const minLoadTime = setTimeout(() => {
      if (imageLoaded) {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(minLoadTime);
  }, [imageLoaded]);

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  const text = "TOGETHER";
  const letters = text.split("");

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-sand flex items-center justify-center transition-opacity duration-500">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <Image
                src="/assets/branding/logo.png"
                alt="My Mentor Logo"
                width={300}
                height={300}
                className="w-75 h-75 object-contain"
                priority
              />
            </div>
            
            {/* Scrolling Text Animation */}
            <div className="relative min-h-12 min-w-80 text-3xl overflow-hidden font-mono text-forest">
              <div 
                className="absolute inset-0"
                style={{
                  maskImage: "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0))",
                  WebkitMaskImage: "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0))"
                }}
              >
                {letters.map((letter, index) => (
                  <span
                    key={index}
                    className="absolute top-1/2 -translate-y-1/2 animate-scroll"
                    style={{
                      width: "1ch",
                      left: "100%",
                      animationDelay: `calc(3.5s / ${letters.length} * (${letters.length} - ${index + 1}) * -1)`
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preload Image */}
      <div className="hidden">
        <Image
          src={imageSrc}
          alt="Preload"
          width={1920}
          height={1080}
          onLoad={() => setImageLoaded(true)}
          priority
        />
      </div>

      {/* Actual Content */}
      <div className={`transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}>
        {children}
      </div>

      <style jsx>{`
        @keyframes scroll {
          to {
            left: -1ch;
          }
        }
        
        .animate-scroll {
          animation: scroll 3.5s linear infinite;
        }
      `}</style>
    </>
  );
}
