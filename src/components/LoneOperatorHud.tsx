"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CloudRain,
  Volume2,
  VolumeX,
  Radio,
  ChevronUp,
  Sparkles,
  Zap,
} from "lucide-react";

// Gentle ambient rain volume (8%) so BGM (12%~20%) remains clearly audible
const DEFAULT_RAIN_VOLUME = 0.08;

/**
 * Procedural Web Audio API Cyberpunk Rain & Room Drone Synthesizer (0 KB asset payload)
 */
class ProceduralRainEngine {
  private audioEl: HTMLAudioElement | null = null;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;
  private targetVolume = DEFAULT_RAIN_VOLUME;

  setTargetVolume(vol: number) {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (this.isRunning && this.audioEl && !this.fadeInterval) {
      this.audioEl.volume = this.targetVolume;
    }
  }

  start(volume?: number) {
    if (typeof volume === "number") {
      this.targetVolume = Math.max(0, Math.min(1, volume));
    }
    if (this.isRunning) {
      if (this.audioEl) {
        this.audioEl.volume = this.targetVolume;
      }
      return;
    }
    if (typeof window === "undefined") return;

    if (!this.audioEl) {
      const audio = new Audio("/audio/night-city-rain.mp3");
      audio.loop = true;
      audio.preload = "auto";
      this.audioEl = audio;
    }

    const audio = this.audioEl;
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    audio.volume = 0;
    audio
      .play()
      .then(() => {
        this.isRunning = true;
        const target = this.targetVolume;
        const step = Math.max(0.005, target / 15);
        this.fadeInterval = setInterval(() => {
          if (!this.audioEl) return;
          if (this.audioEl.volume < target - step) {
            this.audioEl.volume = Math.min(1, this.audioEl.volume + step);
          } else {
            this.audioEl.volume = target;
            if (this.fadeInterval) clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
        }, 40);
      })
      .catch(() => {
        // Autoplay policy fallback
      });
  }

  stop() {
    if (!this.isRunning || !this.audioEl) return;
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    const step = 0.02;
    this.fadeInterval = setInterval(() => {
      if (!this.audioEl) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        return;
      }
      if (this.audioEl.volume > step) {
        this.audioEl.volume = Math.max(0, this.audioEl.volume - step);
      } else {
        this.audioEl.volume = 0;
        this.audioEl.pause();
        this.isRunning = false;
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 40);
  }

  dispose() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = "";
      this.audioEl = null;
    }
    this.isRunning = false;
  }
}

export function LoneOperatorHud() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [rainVisual, setRainVisual] = useState(true);
  const [rainAudio, setRainAudio] = useState(false);
  const [rainVolume, setRainVolume] = useState(DEFAULT_RAIN_VOLUME);
  const [bootGlitch, setBootGlitch] = useState(true);
  const [uptimeSec, setUptimeSec] = useState(0);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const rainEngineRef = useRef<ProceduralRainEngine | null>(null);
  const rainVolumeRef = useRef(DEFAULT_RAIN_VOLUME);

  useEffect(() => {
    rainVolumeRef.current = rainVolume;
  }, [rainVolume]);

  useEffect(() => {
    rainEngineRef.current = new ProceduralRainEngine();

    try {
      const savedRainVisual = localStorage.getItem("kimgatta_rain_visual");
      if (savedRainVisual === "off") {
        setRainVisual(false);
      }
      const savedBootGlitch = localStorage.getItem("kimgatta_boot_glitch");
      if (savedBootGlitch === "off") {
        setBootGlitch(false);
      }
      const savedRainVol = localStorage.getItem("kimgatta_rain_volume");
      if (savedRainVol) {
        const parsed = parseFloat(savedRainVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setRainVolume(parsed);
          rainVolumeRef.current = parsed;
          rainEngineRef.current?.setTargetVolume(parsed);
        }
      }
    } catch {
      // ignore
    }

    return () => {
      rainEngineRef.current?.dispose();
    };
  }, []);

  // Live session timer (pauses cleanly when tab is hidden)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) {
        setUptimeSec((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle outside click & ESC to close popover panel
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPanelOpen]);

  const applyRainAudio = useCallback((enable: boolean) => {
    setRainAudio(enable);
    if (enable) {
      rainEngineRef.current?.start(rainVolumeRef.current);
    } else {
      rainEngineRef.current?.stop();
    }
    window.dispatchEvent(
      new CustomEvent("rain-audio-state", { detail: enable })
    );
  }, []);

  const handleRainVolumeChange = (newVol: number) => {
    const clamped = Math.max(0.01, Math.min(0.4, newVol));
    setRainVolume(clamped);
    rainVolumeRef.current = clamped;
    rainEngineRef.current?.setTargetVolume(clamped);
    try {
      localStorage.setItem("kimgatta_rain_volume", String(clamped));
    } catch {
      // ignore
    }
  };

  // Listen to global toggles (from Terminal CLI `$rain` or Footer button)
  useEffect(() => {
    const onToggleAudio = (e: Event) => {
      const custom = e as CustomEvent<boolean | undefined>;
      setRainAudio((prev) => {
        const next = typeof custom.detail === "boolean" ? custom.detail : !prev;
        if (next) {
          rainEngineRef.current?.start(rainVolumeRef.current);
        } else {
          rainEngineRef.current?.stop();
        }
        window.dispatchEvent(
          new CustomEvent("rain-audio-state", { detail: next })
        );
        return next;
      });
    };

    const onToggleVisual = (e: Event) => {
      const custom = e as CustomEvent<boolean | undefined>;
      if (typeof custom.detail === "boolean") {
        setRainAudio((curr) => curr);
        setRainVisual(custom.detail);
      }
    };

    const onToggleBoot = (e: Event) => {
      const custom = e as CustomEvent<boolean | undefined>;
      setBootGlitch((prev) => {
        const next = typeof custom.detail === "boolean" ? custom.detail : !prev;
        try {
          localStorage.setItem("kimgatta_boot_glitch", next ? "on" : "off");
        } catch {
          // ignore
        }
        return next;
      });
    };

    window.addEventListener("toggle-rain-audio", onToggleAudio);
    window.addEventListener("toggle-rain-visual", onToggleVisual);
    window.addEventListener("toggle-boot-glitch", onToggleBoot);
    return () => {
      window.removeEventListener("toggle-rain-audio", onToggleAudio);
      window.removeEventListener("toggle-rain-visual", onToggleVisual);
      window.removeEventListener("toggle-boot-glitch", onToggleBoot);
    };
  }, []);

  const toggleRainVisual = () => {
    const next = !rainVisual;
    setRainVisual(next);
    window.dispatchEvent(new CustomEvent("toggle-rain-visual", { detail: next }));
  };

  const toggleBootGlitch = () => {
    const next = !bootGlitch;
    setBootGlitch(next);
    try {
      localStorage.setItem("kimgatta_boot_glitch", next ? "on" : "off");
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("toggle-boot-glitch", { detail: next }));
  };

  const triggerBootReplay = () => {
    window.dispatchEvent(new CustomEvent("trigger-boot-glitch"));
  };

  const formatUptime = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  return (
    <div ref={panelRef} className="relative inline-flex items-center">
      {/* Main Navbar Trigger Button (Styled alongside CyberBgmPlayer) */}
      <div
        className={`inline-flex items-center rounded-xl border transition-all ${
          rainAudio || isPanelOpen
            ? "border-pink-500/60 bg-pink-950/30 shadow-[0_0_12px_rgba(255,0,127,0.3)]"
            : "border-cyan-500/30 bg-black/50 hover:border-cyan-400 hover:bg-cyan-500/10"
        }`}
      >
        {/* Quick Rain Sound Toggle / Status */}
        <button
          type="button"
          onClick={() => applyRainAudio(!rainAudio)}
          title={
            rainAudio
              ? "Night City 빗소리 끄기"
              : "Night City 빗소리 켜기 (고립 앰비언스)"
          }
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-mono transition-colors cursor-pointer group"
        >
          <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-pink" />
          </span>

          <CloudRain
            className={`w-3.5 h-3.5 transition-colors shrink-0 ${
              rainAudio
                ? "text-neon-pink animate-pulse"
                : rainVisual
                ? "text-neon-cyan group-hover:drop-shadow-[0_0_6px_#00f3ff]"
                : "text-slate-500"
            }`}
          />

          <span className="hidden 2xl:inline-flex items-center gap-1 text-[11px] font-chakra tracking-wider text-slate-300 group-hover:text-white whitespace-nowrap">
            <span
              className={
                rainAudio ? "text-neon-pink font-bold" : "text-neon-cyan font-bold"
              }
            >
              SOLO
            </span>
            <span className="text-slate-400 text-[10px]">
              {rainAudio ? "// RAIN" : "// S-09"}
            </span>
          </span>
        </button>

        {/* Popover Toggle Chevron */}
        <button
          type="button"
          onClick={() => setIsPanelOpen((prev) => !prev)}
          title="고립 오퍼레이터 레이더 & 환경 설정 열기"
          aria-expanded={isPanelOpen}
          className="px-1.5 py-1.5 border-l border-cyan-500/20 text-slate-400 hover:text-neon-cyan transition-colors cursor-pointer"
        >
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isPanelOpen ? "rotate-180 text-neon-cyan" : ""
            }`}
          />
        </button>
      </div>

      {/* Cyberpunk SOLO_NODE Popover Panel */}
      {isPanelOpen && (
        <div className="fixed right-3 top-[4.25rem] sm:absolute sm:top-full sm:right-0 sm:mt-2 w-[calc(100vw-1.5rem)] max-w-[19rem] sm:w-76 rounded-2xl border border-cyan-500/50 bg-[#070b14]/95 backdrop-blur-xl p-4 shadow-[0_0_25px_rgba(0,243,255,0.35)] z-50 space-y-3 font-mono animate-in fade-in zoom-in-95 duration-150">
          {/* Header with Cyber Status */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Radio className="w-4 h-4 text-neon-pink animate-pulse shrink-0" />
              <span className="text-[11px] font-chakra tracking-wider text-neon-cyan font-bold uppercase truncate whitespace-nowrap cyber-signal-flicker">
                // SOLO_NODE // S-09
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border bg-pink-500/15 text-neon-pink border-pink-500/45 shadow-[0_0_8px_rgba(255,0,127,0.3)] shrink-0">
              ISOLATED
            </span>
          </div>

          {/* Radar & Telemetry Body */}
          <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-black/60 p-3">
            {/* Circular Isolated Subnet Radar */}
            <div
              title="반경 내 활성 오퍼레이터: 0명 (고독한 단독 접속)"
              className="relative w-14 h-14 rounded-full border border-cyan-500/40 bg-black/80 shrink-0 flex items-center justify-center overflow-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.22)]"
            >
              <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-4 rounded-full border border-cyan-500/15" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/15" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/15" />

              {/* Rotating Conic Radar Sweep */}
              <div
                className="absolute inset-0 rounded-full cyber-radar-beam"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(0, 243, 255, 0.38) 0deg, rgba(0, 243, 255, 0.05) 45deg, transparent 70deg)",
                }}
              />

              {/* Center Solo Operator Dot */}
              <span className="relative z-10 w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_8px_#ff007f]" />
            </div>

            {/* Isolation Readouts */}
            <div className="flex-1 min-w-0 space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">PEERS</span>
                <span className="text-neon-pink font-bold tabular-nums whitespace-nowrap">
                  0000 (ALONE)
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">SIGNAL</span>
                <span className="text-amber-300 font-semibold whitespace-nowrap">
                  SECTOR_09
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">UPTIME</span>
                <span className="text-neon-cyan tabular-nums font-bold whitespace-nowrap">
                  {formatUptime(uptimeSec)}
                </span>
              </div>
            </div>
          </div>

          {/* Ambience & Boot Glitch Controls */}
          <div className="space-y-2 pt-0.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleRainVisual}
                title="사이버 빗줄기 이펙트 토글"
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] border transition-all cursor-pointer active:scale-95 ${
                  rainVisual
                    ? "bg-cyan-500/15 text-neon-cyan border-cyan-500/45 shadow-[0_0_10px_rgba(0,243,255,0.2)] font-bold"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>RAIN FX: {rainVisual ? "ON" : "OFF"}</span>
              </button>

              <button
                type="button"
                onClick={() => applyRainAudio(!rainAudio)}
                title="Night City 빗소리 앰비언스 사운드 토글"
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] border transition-all cursor-pointer active:scale-95 ${
                  rainAudio
                    ? "bg-pink-500/20 text-neon-pink border-pink-500/55 shadow-[0_0_12px_rgba(255,0,127,0.3)] font-bold"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                {rainAudio ? (
                  <Volume2 className="w-3.5 h-3.5 animate-pulse shrink-0" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>SOUND: {rainAudio ? "ON" : "OFF"}</span>
              </button>
            </div>

            {/* Rain Audio Volume Slider */}
            {rainAudio && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/60 border border-pink-500/30 text-[10px] font-mono animate-in fade-in duration-150">
                <CloudRain className="w-3.5 h-3.5 text-neon-pink shrink-0" />
                <span className="text-slate-400 text-[9px] uppercase tracking-wider shrink-0">
                  RAIN VOL
                </span>
                <input
                  type="range"
                  min="0.01"
                  max="0.30"
                  step="0.01"
                  value={rainVolume}
                  onChange={(e) => handleRainVolumeChange(parseFloat(e.target.value))}
                  title="Night City 빗소리 음량 조절 (기본 8%)"
                  className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <span className="w-7 text-right tabular-nums text-neon-pink text-[10px] font-bold">
                  {Math.round(rainVolume * 100)}%
                </span>
              </div>
            )}

            {/* CRT Boot Glitch Option & Preview Row */}
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-cyan-500/20 text-[10px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Zap className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span className="text-slate-300 font-medium truncate">BOOT GLITCH</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleBootGlitch}
                  title="새로고침 / 첫 접속 시 치지직 CRT 부팅 효과 켜기/끄기"
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer active:scale-95 ${
                    bootGlitch
                      ? "bg-cyan-500/20 text-neon-cyan border-cyan-500/50 shadow-[0_0_8px_rgba(0,243,255,0.25)]"
                      : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  {bootGlitch ? "ON" : "OFF"}
                </button>
                <button
                  type="button"
                  onClick={triggerBootReplay}
                  title="치지직 CRT 부팅 효과 즉시 미리보기"
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-neon-pink bg-pink-500/10 border border-pink-500/35 hover:bg-pink-500/20 hover:border-pink-500/60 shadow-[0_0_6px_rgba(255,0,127,0.2)] transition-all cursor-pointer active:scale-95"
                >
                  PREVIEW ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
