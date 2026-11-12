"use client";

import React, { useEffect, useRef, useState } from "react";

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  isPink: boolean;
}

interface AirMote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  isCyan: boolean;
}

const IDLE_TIMEOUT_MS = 18000;

export function IsolatedAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rainEnabled, setRainEnabled] = useState(true);
  const [isIdle, setIsIdle] = useState(false);

  // Sync rain visual preference & listen for toggle events
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kimgatta_rain_visual");
      if (saved === "off") {
        setRainEnabled(false);
      }
    } catch {
      // ignore
    }

    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent<boolean | undefined>;
      setRainEnabled((prev) => {
        const next = typeof custom.detail === "boolean" ? custom.detail : !prev;
        try {
          localStorage.setItem("kimgatta_rain_visual", next ? "on" : "off");
        } catch {
          // ignore
        }
        return next;
      });
    };

    window.addEventListener("toggle-rain-visual", handleToggle);
    return () => {
      window.removeEventListener("toggle-rain-visual", handleToggle);
    };
  }, []);

  // Track idle isolation state (when user stares into the silent dark terminal)
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const resetIdle = () => {
      setIsIdle((prev) => (prev ? false : prev));
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!document.hidden) {
          setIsIdle(true);
        }
      }, IDLE_TIMEOUT_MS);
    };

    resetIdle();

    window.addEventListener("pointermove", resetIdle, { passive: true });
    window.addEventListener("keydown", resetIdle, { passive: true });
    window.addEventListener("scroll", resetIdle, { passive: true });
    window.addEventListener("touchstart", resetIdle, { passive: true });

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("pointermove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("scroll", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, []);

  // Lightweight pre-allocated Canvas for Neon Rain & Floating Dust Motes
  useEffect(() => {
    if (!rainEnabled) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const dropCount = isMobile ? 26 : 48;
    const moteCount = isMobile ? 10 : 22;

    // Pre-allocated pools to guarantee 0 GC allocation inside render loop
    const drops: RainDrop[] = Array.from({ length: dropCount }, () => ({
      x: Math.random() * (width + 180) - 90,
      y: Math.random() * height,
      len: 14 + Math.random() * 22,
      speed: 240 + Math.random() * 210, // px per second
      alpha: 0.08 + Math.random() * 0.16,
      isPink: Math.random() < 0.14,
    }));

    const motes: AirMote[] = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 1.3,
      vx: (Math.random() - 0.5) * 14,
      vy: -6 - Math.random() * 12,
      phase: Math.random() * Math.PI * 2,
      isCyan: Math.random() < 0.72,
    }));

    let resizeRaf: number | null = null;
    const handleResize = () => {
      if (resizeRaf !== null) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });

    let rafId: number | null = null;
    let lastTime = performance.now();
    // Subtle slant vector (rain falling gently right-to-left or left-to-right)
    const slantRatio = -0.14;

    const renderFrame = (now: number) => {
      if (document.hidden) {
        rafId = null;
        return;
      }

      // Clamp delta time so tab switch doesn't cause particles to jump
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw slanted neon acid-rain streaks
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      // Batch cyan/cool rain strokes separately from rare pink strokes
      ctx.beginPath();
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.speed * dt;
        d.x += d.speed * slantRatio * dt;

        if (d.y - d.len > height) {
          d.y = -d.len - Math.random() * 60;
          d.x = Math.random() * (width + 200) - 50;
        } else if (d.x < -60) {
          d.x = width + 40;
        }

        if (!d.isPink) {
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.len * slantRatio, d.y + d.len);
        }
      }
      ctx.strokeStyle = "rgba(0, 243, 255, 0.14)";
      ctx.stroke();

      // Rare pink neon reflections in the rain
      ctx.beginPath();
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        if (d.isPink) {
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.len * slantRatio, d.y + d.len);
        }
      }
      ctx.strokeStyle = "rgba(255, 0, 127, 0.15)";
      ctx.stroke();

      // 2. Draw slow floating city ash / data dust motes
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.phase += dt * 1.4;
        m.x += (m.vx + Math.sin(m.phase) * 8) * dt;
        m.y += m.vy * dt;

        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const twinkle = 0.18 + 0.16 * Math.sin(m.phase * 1.7);
        ctx.fillStyle = m.isCyan
          ? `rgba(0, 243, 255, ${twinkle})`
          : `rgba(255, 0, 127, ${twinkle * 0.85})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (rafId === null && !document.hidden) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else {
        startLoop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    startLoop();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [rainEnabled]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden select-none transform-gpu [contain:strict]"
      style={{ transform: "translateZ(0)" }}
    >
      {/* Neon Acid Rain & Drifting City Dust Canvas */}
      {rainEnabled && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            isIdle ? "opacity-90" : "opacity-65"
          }`}
        />
      )}

      {/* CRT Monitor Visor Vignette (Darkens periphery like a lone dark terminal) */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isIdle ? "cyber-crt-vignette-idle opacity-100" : "cyber-crt-vignette opacity-90"
        }`}
      />

      {/* Descending Subtle CRT Signal Beam */}
      <div className="absolute inset-x-0 top-0 cyber-crt-beam" />

      {/* Idle Isolation Atmospheric Whisper */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
          isIdle ? "opacity-75 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="px-3.5 py-1 rounded-full border border-cyan-500/25 bg-[#050811]/85 backdrop-blur-md text-[10px] font-mono tracking-[0.18em] text-cyan-300/80 shadow-[0_0_16px_rgba(0,243,255,0.18)] whitespace-nowrap flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-ping" />
          <span>IDLE_SIGNAL // 0 PEERS NEARBY · ALONE IN SECTOR_09</span>
        </div>
      </div>
    </div>
  );
}
