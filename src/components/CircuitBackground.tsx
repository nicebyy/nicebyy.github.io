"use client";

import React from "react";

export function CircuitBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-40 dark:opacity-65 transition-opacity transform-gpu [contain:strict]"
      style={{ transform: "translateZ(0)" }}
    >
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Neon Glow Filters for Electric Sparks */}
          <filter id="circuit-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="circuit-glow-pink" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="circuit-glow-green" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Linear Gradients for Electric Current Pulse Heads */}
          <linearGradient id="cyan-pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f3ff" stopOpacity="0" />
            <stop offset="60%" stopColor="#00f3ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="pink-pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff007f" stopOpacity="0" />
            <stop offset="60%" stopColor="#ff007f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="green-pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff9d" stopOpacity="0" />
            <stop offset="70%" stopColor="#00ff9d" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* =========================================================================
            LAYER 1: Static Circuit Board Traces (기본 회로 기판 트랙)
            ========================================================================= */}
        <g stroke="rgba(0, 243, 255, 0.12)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Top Left Main Bus */}
          <path d="M 0 120 L 280 120 L 360 200 L 700 200 L 740 240 L 960 240" />
          <path d="M 0 150 L 260 150 L 340 230 L 520 230" />

          {/* Top Right High Voltage Bus */}
          <path d="M 820 0 L 820 100 L 920 200 L 1400 200 L 1460 140 L 1920 140" />
          <path d="M 1200 0 L 1200 80 L 1300 180 L 1650 180 L 1710 120 L 1920 120" />

          {/* Left Vertical Power Spine */}
          <path d="M 80 0 L 80 380 L 160 460 L 160 760 L 80 840 L 80 1080" />

          {/* Right Vertical Power Spine */}
          <path d="M 1840 0 L 1840 380 L 1760 460 L 1760 760 L 1840 840 L 1840 1080" />

          {/* Center Interconnect Crossway */}
          <path d="M 380 340 L 500 460 L 840 460 L 890 510 L 1180 510 L 1250 440 L 1540 440" />
          <path d="M 320 0 L 320 90 L 430 200 L 610 200 L 670 260 L 670 480" />

          {/* Bottom Left Sensor Net */}
          <path d="M 140 1080 L 140 860 L 260 740 L 580 740 L 640 800 L 640 920 L 780 1060" />
          <path d="M 0 680 L 220 680 L 280 740 L 440 740" />

          {/* Bottom Right Auxiliary Grid */}
          <path d="M 1920 840 L 1660 840 L 1540 960 L 1160 960 L 1070 870 L 1070 730 L 940 600 L 740 600" />
          <path d="M 1600 1080 L 1600 930 L 1490 820 L 1290 820 L 1230 760 L 1230 540" />

          {/* Micro Geometric Branchlets */}
          <path d="M 700 200 L 730 170 L 840 170" />
          <path d="M 1400 200 L 1430 230 L 1560 230" />
          <path d="M 580 740 L 610 710 L 720 710" />
          <path d="M 1160 960 L 1130 990 L 1000 990" />
        </g>

        {/* =========================================================================
            LAYER 2: Circuit Terminals & Micro Pads (원형 노드 & 비아)
            ========================================================================= */}
        <g fill="#070b14" stroke="rgba(0, 243, 255, 0.4)" strokeWidth="1.5">
          {/* Top Section Nodes */}
          <circle cx="280" cy="120" r="3.5" />
          <circle cx="360" cy="200" r="3.5" />
          <circle cx="700" cy="200" r="3.5" />
          <circle cx="960" cy="240" r="4" fill="rgba(0, 243, 255, 0.2)" />
          <circle cx="820" cy="100" r="3.5" />
          <circle cx="920" cy="200" r="3.5" />
          <circle cx="1400" cy="200" r="3.5" />
          <circle cx="1460" cy="140" r="3.5" />

          {/* Center Nodes */}
          <circle cx="500" cy="460" r="3.5" />
          <circle cx="840" cy="460" r="3.5" />
          <circle cx="1180" cy="510" r="3.5" />
          <circle cx="1250" cy="440" r="3.5" />
          <circle cx="670" cy="480" r="4" fill="rgba(255, 0, 127, 0.2)" />
          <circle cx="1230" cy="540" r="4" fill="rgba(255, 0, 127, 0.2)" />

          {/* Vertical Spine Nodes */}
          <circle cx="160" cy="460" r="3.5" />
          <circle cx="160" cy="760" r="3.5" />
          <circle cx="1760" cy="460" r="3.5" />
          <circle cx="1760" cy="760" r="3.5" />

          {/* Bottom Nodes */}
          <circle cx="260" cy="740" r="3.5" />
          <circle cx="580" cy="740" r="3.5" />
          <circle cx="780" cy="1060" r="4" />
          <circle cx="1660" cy="840" r="3.5" />
          <circle cx="1540" cy="960" r="3.5" />
          <circle cx="1160" cy="960" r="3.5" />
          <circle cx="740" cy="600" r="4" fill="rgba(0, 255, 157, 0.2)" />
        </g>

        {/* =========================================================================
            LAYER 3: Pulsing / Sparking Indicator Nodes (주기적으로 번쩍이는 전원 LED 노드)
            ========================================================================= */}
        <g>
          {/* Cyan Spark Nodes */}
          <circle cx="960" cy="240" r="3" fill="#00f3ff" className="circuit-spark-cyan" />
          <circle cx="700" cy="200" r="2.5" fill="#00f3ff" className="circuit-spark-cyan-delay1" />
          <circle cx="1400" cy="200" r="2.5" fill="#00f3ff" className="circuit-spark-cyan-delay2" />
          <circle cx="160" cy="460" r="2.5" fill="#00f3ff" className="circuit-spark-cyan-delay3" />
          <circle cx="1760" cy="760" r="2.5" fill="#00f3ff" className="circuit-spark-cyan-delay1" />

          {/* Pink Spark Nodes */}
          <circle cx="670" cy="480" r="3" fill="#ff007f" className="circuit-spark-pink" />
          <circle cx="1230" cy="540" r="3" fill="#ff007f" className="circuit-spark-pink-delay2" />
          <circle cx="1540" cy="960" r="2.5" fill="#ff007f" className="circuit-spark-pink-delay1" />

          {/* Green Micro Signal Nodes */}
          <circle cx="740" cy="600" r="3" fill="#00ff9d" className="circuit-spark-green" />
          <circle cx="840" cy="170" r="2.5" fill="#00ff9d" className="circuit-spark-green-delay2" />
        </g>

        {/* =========================================================================
            LAYER 4: Live Electric Current Pulses (회로를 따라 질주하는 전기 펄스 전류)
            ========================================================================= */}
        {/* Cyan Electric Currents */}
        <g stroke="#00f3ff" strokeWidth="2.5" strokeLinecap="round" filter="url(#circuit-glow-cyan)">
          {/* Pulse 1: Top Left to Center */}
          <path
            d="M 0 120 L 280 120 L 360 200 L 700 200 L 740 240 L 960 240"
            className="electric-pulse-fast"
            style={{ strokeDasharray: "100 800" }}
          />

          {/* Pulse 2: Top Right High Voltage */}
          <path
            d="M 820 0 L 820 100 L 920 200 L 1400 200 L 1460 140 L 1920 140"
            className="electric-pulse-normal"
            style={{ strokeDasharray: "120 950", animationDelay: "-2.2s" }}
          />

          {/* Pulse 3: Left Vertical Power Line */}
          <path
            d="M 80 0 L 80 380 L 160 460 L 160 760 L 80 840 L 80 1080"
            className="electric-pulse-slow"
            style={{ strokeDasharray: "90 750", animationDelay: "-4.5s" }}
          />

          {/* Pulse 4: Bottom Right Grid */}
          <path
            d="M 1920 840 L 1660 840 L 1540 960 L 1160 960 L 1070 870 L 1070 730 L 940 600 L 740 600"
            className="electric-pulse-reverse"
            style={{ strokeDasharray: "140 1100", animationDelay: "-1.8s" }}
          />

          {/* Pulse 5: Center Interconnect */}
          <path
            d="M 380 340 L 500 460 L 840 460 L 890 510 L 1180 510 L 1250 440 L 1540 440"
            className="electric-pulse-medium"
            style={{ strokeDasharray: "110 900", animationDelay: "-3.6s" }}
          />
        </g>

        {/* Hot Pink Electric Currents */}
        <g stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" filter="url(#circuit-glow-pink)">
          {/* Pink Pulse 1: Vertical Microbus */}
          <path
            d="M 320 0 L 320 90 L 430 200 L 610 200 L 670 260 L 670 480"
            className="electric-pulse-fast"
            style={{ strokeDasharray: "80 650", animationDelay: "-1.1s" }}
          />

          {/* Pink Pulse 2: Bottom Diagonal Feed */}
          <path
            d="M 1600 1080 L 1600 930 L 1490 820 L 1290 820 L 1230 760 L 1230 540"
            className="electric-pulse-reverse"
            style={{ strokeDasharray: "90 750", animationDelay: "-3.2s" }}
          />

          {/* Pink Pulse 3: Right Vertical Spine */}
          <path
            d="M 1840 0 L 1840 380 L 1760 460 L 1760 760 L 1840 840 L 1840 1080"
            className="electric-pulse-slow"
            style={{ strokeDasharray: "110 850", animationDelay: "-2.8s" }}
          />
        </g>

        {/* Emerald Green Sensor Currents */}
        <g stroke="#00ff9d" strokeWidth="2" strokeLinecap="round" filter="url(#circuit-glow-green)">
          {/* Green Pulse 1: Bottom Left Sensor Net */}
          <path
            d="M 140 1080 L 140 860 L 260 740 L 580 740 L 640 800 L 640 920 L 780 1060"
            className="electric-pulse-normal"
            style={{ strokeDasharray: "90 700", animationDelay: "-0.7s" }}
          />

          {/* Green Pulse 2: Micro Substation Branch */}
          <path
            d="M 1200 0 L 1200 80 L 1300 180 L 1650 180 L 1710 120 L 1920 120"
            className="electric-pulse-fast"
            style={{ strokeDasharray: "70 600", animationDelay: "-4.1s" }}
          />
        </g>
      </svg>
    </div>
  );
}
