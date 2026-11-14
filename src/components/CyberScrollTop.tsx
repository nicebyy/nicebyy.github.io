"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ChevronUp } from "lucide-react";

export function CyberScrollTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;

        // Show button after scrolling past 320px
        setIsVisible(scrollTop > 320);

        if (docHeight > 0) {
          const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
          setScrollProgress(pct);
        } else {
          setScrollProgress(0);
        }

        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // SVG circular circumference: 2 * PI * 18 ≈ 113.1
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-30 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="맨 위로 스크롤"
        title={`맨 위로 스크롤 (${Math.round(scrollProgress)}%)`}
        className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#060a14]/92 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-neon-cyan hover:text-white shadow-[0_0_15px_rgba(0,243,255,0.25)] hover:shadow-[0_0_24px_rgba(0,243,255,0.5)] active:scale-95 transition-all cursor-pointer"
      >
        {/* SVG Circular Scroll Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 44 44"
        >
          <defs>
            <linearGradient id="cyber-scroll-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="100%" stopColor="#ff007f" />
            </linearGradient>
          </defs>
          {/* Subtle Track */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="rgba(0, 243, 255, 0.12)"
            strokeWidth="2.5"
          />
          {/* Progress Arc */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="url(#cyber-scroll-grad)"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />
        </svg>

        {/* Upward Chevron Icon with Hover Lift */}
        <ChevronUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_#00f3ff]" />

        {/* Desktop Hover Tooltip / Telemetry readout */}
        <div className="hidden sm:group-hover:flex absolute right-full mr-2.5 top-1/2 -translate-y-1/2 items-center gap-1.5 px-2 py-1 rounded-lg bg-[#070c17]/95 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,243,255,0.3)] text-[10px] font-mono whitespace-nowrap text-neon-cyan animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <span className="font-bold tracking-wider">TOP</span>
          <span className="text-slate-400">//</span>
          <span className="text-white font-bold tabular-nums">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </button>
    </div>
  );
}
