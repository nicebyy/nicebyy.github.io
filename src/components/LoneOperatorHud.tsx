"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CloudRain,
  Volume2,
  VolumeX,
  Radio,
  ChevronUp,
  Sparkles,
} from "lucide-react";

/**
 * Procedural Web Audio API Cyberpunk Rain & Room Drone Synthesizer (0 KB asset payload)
 */
class ProceduralRainEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private lfoGain: GainNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    if (typeof window === "undefined") return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    const ctx = this.ctx;

    // Master Gain Node with gentle smooth fade-in
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    // 1. Create seamless 4-second stereo rain bed with realistic droplet patters
    const duration = 4;
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;

      // Base pink noise filter (continuous gentle rainfall bed)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.075;
        b6 = white * 0.115926;
        output[i] = pink;
      }

      // Add realistic microscopic raindrop impacts (토독토독 창문/포장도로 타격음)
      const numDroplets = Math.floor(bufferSize * 0.0009); // ~40 droplets per sec
      for (let d = 0; d < numDroplets; d++) {
        const startIdx = Math.floor(Math.random() * (bufferSize - 1000));
        const dropletFreq = 2800 + Math.random() * 3400; // 2.8kHz ~ 6.2kHz water drop resonance
        const decaySeconds = 0.003 + Math.random() * 0.006; // 3ms - 9ms fast impact
        const amplitude = 0.06 + Math.random() * 0.14;
        const decaySamples = Math.floor(decaySeconds * ctx.sampleRate);

        for (let s = 0; s < decaySamples; s++) {
          const t = s / ctx.sampleRate;
          const envelope = Math.exp(-s / (decaySamples * 0.32));
          const wave = Math.sin(2 * Math.PI * dropletFreq * t) * envelope * amplitude;
          output[startIdx + s] += wave;
        }
      }

      // Clamp buffer to prevent any digital clipping
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.max(-0.95, Math.min(0.95, output[i]));
      }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Highpass Filter: 1,200 Hz (Completely cuts 100~800Hz low wind whoosh / typhoon rumble)
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(1200, ctx.currentTime);
    highpass.Q.setValueAtTime(0.7, ctx.currentTime);

    // Lowpass Filter: 6,800 Hz (Allows crisp, soothing water sizzle through without harshness)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(6800, ctx.currentTime);
    lowpass.Q.setValueAtTime(0.5, ctx.currentTime);

    // Peaking EQ: 3,500 Hz (Accentuates delicate glass/pavement droplet pitter-patter)
    const presence = ctx.createBiquadFilter();
    presence.type = "peaking";
    presence.frequency.setValueAtTime(3500, ctx.currentTime);
    presence.gain.setValueAtTime(3.0, ctx.currentTime);
    presence.Q.setValueAtTime(1.2, ctx.currentTime);

    // Subtle Natural Rain Breathing Swell (LFO at 0.12 Hz)
    const lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfoOsc.type = "sine";
    lfoOsc.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec breathing cycle
    lfoGain.gain.setValueAtTime(0.08, ctx.currentTime); // ±8% volume drift
    lfoOsc.connect(lfoGain);

    // Audio Graph Routing:
    // Source -> Highpass(1.2kHz) -> Presence(3.5kHz) -> Lowpass(6.8kHz) -> MasterGain -> Destination
    noiseSource.connect(highpass);
    highpass.connect(presence);
    presence.connect(lowpass);
    lowpass.connect(masterGain);

    lfoGain.connect(masterGain.gain);

    lfoOsc.start();
    noiseSource.start();

    this.noiseSource = noiseSource;
    this.lfoOsc = lfoOsc;
    this.lfoGain = lfoGain;
    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(
        Math.max(0.0001, this.masterGain.gain.value),
        now
      );
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    } catch {
      // ignore
    }

    const src = this.noiseSource;
    const lfo = this.lfoOsc;
    const lfoG = this.lfoGain;
    this.noiseSource = null;
    this.lfoOsc = null;
    this.lfoGain = null;
    this.isRunning = false;

    setTimeout(() => {
      try {
        src?.stop();
        src?.disconnect();
        lfo?.stop();
        lfo?.disconnect();
        lfoG?.disconnect();
      } catch {
        // ignore
      }
    }, 550);
  }

  dispose() {
    this.stop();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export function LoneOperatorHud() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [rainVisual, setRainVisual] = useState(true);
  const [rainAudio, setRainAudio] = useState(false);
  const [uptimeSec, setUptimeSec] = useState(0);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const rainEngineRef = useRef<ProceduralRainEngine | null>(null);

  useEffect(() => {
    rainEngineRef.current = new ProceduralRainEngine();

    try {
      const savedRainVisual = localStorage.getItem("kimgatta_rain_visual");
      if (savedRainVisual === "off") {
        setRainVisual(false);
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
      rainEngineRef.current?.start();
    } else {
      rainEngineRef.current?.stop();
    }
    window.dispatchEvent(
      new CustomEvent("rain-audio-state", { detail: enable })
    );
  }, []);

  // Listen to global toggles (from Terminal CLI `$rain` or Footer button)
  useEffect(() => {
    const onToggleAudio = (e: Event) => {
      const custom = e as CustomEvent<boolean | undefined>;
      setRainAudio((prev) => {
        const next = typeof custom.detail === "boolean" ? custom.detail : !prev;
        if (next) {
          rainEngineRef.current?.start();
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

    window.addEventListener("toggle-rain-audio", onToggleAudio);
    window.addEventListener("toggle-rain-visual", onToggleVisual);
    return () => {
      window.removeEventListener("toggle-rain-audio", onToggleAudio);
      window.removeEventListener("toggle-rain-visual", onToggleVisual);
    };
  }, []);

  const toggleRainVisual = () => {
    const next = !rainVisual;
    setRainVisual(next);
    window.dispatchEvent(new CustomEvent("toggle-rain-visual", { detail: next }));
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
              <span className="text-[11px] font-chakra tracking-widest text-neon-cyan font-bold uppercase truncate cyber-signal-flicker">
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

          {/* Ambience Controls (Rain FX + Procedural Rain Audio) */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
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
        </div>
      )}
    </div>
  );
}
