"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";

/**
 * Procedural Web Audio API CRT Static & Capacitor Charge Sound (0 KB asset)
 * Emits a crisp, authentic analog "치직-" click/chirp when booted or previewed.
 */
function playBootStaticSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const duration = 0.14; // 140ms
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Filtered static noise with exponential capacitor decay
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.035));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter centered at 1.8kHz for vintage CRT raster resonance
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    // Subtle volume envelope (gentle and pleasant, not startling)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration + 0.02);

    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // ignore
      }
    }, (duration + 0.1) * 1000);
  } catch {
    // Autoplay restrictions or unsupported AudioContext
  }
}

type BootPhase = "inactive" | "power-on" | "glitch" | "fadeout";

export function CyberBootSequence() {
  const [phase, setPhase] = useState<BootPhase>("inactive");
  const [telemetryStep, setTelemetryStep] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const runSequence = useCallback(
    (playSound = false) => {
      clearAllTimers();

      if (playSound) {
        playBootStaticSound();
      }

      // Step 1: CRT Power-On beam (0ms)
      setPhase("power-on");
      setTelemetryStep(1);

      // Step 2: "치지직" Static Glitch Jitter & Chromatic Aberration (200ms)
      const t1 = setTimeout(() => {
        setPhase("glitch");
        setTelemetryStep(2);
      }, 200);

      // Step 3: Telemetry lock (360ms)
      const t2 = setTimeout(() => {
        setTelemetryStep(3);
      }, 360);

      // Step 4: Smooth Fade-out to reveal the site (520ms)
      const t3 = setTimeout(() => {
        setPhase("fadeout");
      }, 520);

      // Step 5: Finish and unmount overlay (780ms)
      const t4 = setTimeout(() => {
        setPhase("inactive");
      }, 780);

      timersRef.current = [t1, t2, t3, t4];
    },
    [clearAllTimers]
  );

  // Initial mount trigger (on first entry or browser refresh)
  useEffect(() => {
    try {
      const savedPref = localStorage.getItem("kimgatta_boot_glitch");
      if (savedPref === "off") {
        return;
      }
    } catch {
      // ignore
    }

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Run the CRT boot sequence with smooth entrance
    runSequence(false);

    return () => {
      clearAllTimers();
    };
  }, [runSequence, clearAllTimers]);

  // Global event listener to manually trigger preview or toggle
  useEffect(() => {
    const handleTrigger = () => {
      runSequence(true);
    };

    window.addEventListener("trigger-boot-glitch", handleTrigger);
    return () => {
      window.removeEventListener("trigger-boot-glitch", handleTrigger);
    };
  }, [runSequence]);

  // Escape key or click skips immediately
  useEffect(() => {
    if (phase === "inactive") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearAllTimers();
        setPhase("inactive");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, clearAllTimers]);

  if (phase === "inactive") return null;

  return (
    <div
      aria-hidden="true"
      onClick={() => {
        clearAllTimers();
        setPhase("inactive");
      }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none pointer-events-none transition-opacity duration-260 ease-out ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Deep Cyber Dark Backdrop with CRT Vignette */}
      <div className="absolute inset-0 bg-[#03060c]/92 backdrop-blur-[2px]" />

      {/* CRT Phosphor Scanline Overlay */}
      <div className="absolute inset-0 cyber-boot-scanlines opacity-80" />

      {/* Radial CRT Visor Vignette (Curve Shadow) */}
      <div className="absolute inset-0 cyber-crt-vignette opacity-70" />

      {/* Fast Sweeping Signal Glitch Bar */}
      {phase === "glitch" && (
        <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent cyber-signal-scan-fast pointer-events-none" />
      )}

      {/* Main CRT Content Container with Power-On Expansion & Glitch Jitter */}
      <div
        className={`relative z-10 max-w-lg w-[90vw] mx-auto ${
          phase === "power-on"
            ? "cyber-crt-turn-on"
            : phase === "glitch"
            ? "cyber-boot-chizizik"
            : ""
        }`}
      >
        {/* CRT Horizontal Phosphor Slit Beam during initial expansion */}
        {phase === "power-on" && (
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-white shadow-[0_0_20px_#00f3ff,0_0_40px_#00f3ff] rounded-full z-20 pointer-events-none" />
        )}

        {/* Cyberpunk Telemetry Signal Card */}
        <div className="relative rounded-2xl border border-cyan-500/50 bg-[#070c17]/95 p-4 sm:p-6 shadow-[0_0_35px_rgba(0,243,255,0.35)] backdrop-blur-xl space-y-3 font-mono">
          {/* Corner HUD Brackets */}
          <span className="cyber-corner-bracket-tl" />
          <span className="cyber-corner-bracket-tr" />
          <span className="cyber-corner-bracket-bl" />
          <span className="cyber-corner-bracket-br" />

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
              </span>
              <span className="text-xs font-chakra tracking-widest text-neon-cyan font-bold uppercase truncate">
                // SYSTEM_BOOT // KIMKKATTA_KERNEL
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border bg-cyan-500/15 text-neon-cyan border-cyan-500/40 shadow-[0_0_8px_rgba(0,243,255,0.3)] shrink-0">
              {telemetryStep >= 3 ? "LOCKED" : "SYNCING"}
            </span>
          </div>

          {/* Telemetry Readout Body */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
              <span className="text-slate-400">SIGNAL_UPLINK:</span>
              <span className="text-neon-pink font-bold tracking-wider">
                SECTOR_09 // ISOLATED
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
              <span className="text-slate-400">DISPLAY_BUFFER:</span>
              <span className="text-emerald-400 font-semibold">
                CRT_RASTER_ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-neon-cyan font-bold tabular-nums">
                {telemetryStep === 1
                  ? "INIT [034%]"
                  : telemetryStep === 2
                  ? "DECODING [078%]"
                  : "SYNCHRONIZED [100%]"}
              </span>
            </div>
          </div>

          {/* Cyber Progress Indicator Bar */}
          <div className="relative h-1.5 w-full rounded-full bg-black/60 overflow-hidden border border-cyan-500/30">
            <div
              className="h-full bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-cyan transition-all duration-300 ease-out shadow-[0_0_10px_#00f3ff]"
              style={{
                width:
                  telemetryStep === 1
                    ? "35%"
                    : telemetryStep === 2
                    ? "78%"
                    : "100%",
              }}
            />
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-chakra pt-0.5">
            <span>PRESS ESC TO SKIP</span>
            <span className="text-neon-cyan">v2.6.0-PROD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
