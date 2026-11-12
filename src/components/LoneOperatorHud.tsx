"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CloudRain,
  Volume2,
  VolumeX,
  Radio,
  Minimize2,
  Maximize2,
  Sparkles,
} from "lucide-react";

/**
 * Procedural Web Audio API Cyberpunk Rain & Room Drone Synthesizer (0 KB asset payload)
 */
class ProceduralRainEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private droneOsc: OscillatorNode | null = null;
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
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.9);
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    // 1. Create seamless 3-second pink/brown noise rain buffer
    const bufferSize = ctx.sampleRate * 3;
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
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;

        // Subtle random raindrop crackle modulation
        const droplet = Math.random() < 0.0025 ? (Math.random() - 0.5) * 0.32 : 0;
        output[i] = Math.max(-1, Math.min(1, pink + droplet));
      }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Warm indoor rain filter (sounds like rain outside a cyberpunk shelter window)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1050, ctx.currentTime);
    lowpass.Q.setValueAtTime(0.6, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(160, ctx.currentTime);

    noiseSource.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(masterGain);
    noiseSource.start();
    this.noiseSource = noiseSource;

    // 2. Ultra-subtle cyberpunk terminal shelter hum (58Hz sub-ambient drone)
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = "sine";
    droneOsc.frequency.setValueAtTime(58, ctx.currentTime);
    droneGain.gain.setValueAtTime(0.06, ctx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(masterGain);
    droneOsc.start();
    this.droneOsc = droneOsc;

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
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    } catch {
      // ignore
    }

    const src = this.noiseSource;
    const osc = this.droneOsc;
    this.noiseSource = null;
    this.droneOsc = null;
    this.isRunning = false;

    setTimeout(() => {
      try {
        src?.stop();
        src?.disconnect();
        osc?.stop();
        osc?.disconnect();
      } catch {
        // ignore
      }
    }, 500);
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [rainVisual, setRainVisual] = useState(true);
  const [rainAudio, setRainAudio] = useState(false);
  const [uptimeSec, setUptimeSec] = useState(0);
  const rainEngineRef = useRef<ProceduralRainEngine | null>(null);

  useEffect(() => {
    rainEngineRef.current = new ProceduralRainEngine();

    try {
      const savedCollapsed = localStorage.getItem("kimgatta_hud_collapsed");
      if (savedCollapsed === "true") {
        setIsCollapsed(true);
      }
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

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("kimgatta_hud_collapsed", String(next));
    } catch {
      // ignore
    }
  };

  const formatUptime = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  return (
    <aside
      aria-label="고립 오퍼레이터 HUD"
      className="fixed bottom-4 right-4 z-30 hidden lg:flex flex-col items-end font-mono select-none"
    >
      {isCollapsed ? (
        <button
          type="button"
          onClick={toggleCollapse}
          title="SOLO OPERATOR HUD 펼치기"
          className="group flex items-center gap-2 px-3 py-2 rounded-2xl border border-cyan-500/40 bg-[#060913]/90 backdrop-blur-xl text-[11px] text-slate-200 hover:text-neon-cyan hover:border-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all cursor-pointer active:scale-95"
        >
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-pink" />
          </span>
          <span className="font-orbitron tracking-wider text-[10px]">
            SOLO // 0 PEERS
          </span>
          {rainAudio && (
            <CloudRain className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
          )}
          <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-neon-cyan" />
        </button>
      ) : (
        <div className="w-64 rounded-2xl border border-cyan-500/35 bg-[#060913]/90 backdrop-blur-xl p-3.5 shadow-[0_0_28px_rgba(0,243,255,0.16)] space-y-3 cyber-corner relative overflow-hidden">
          <span className="cyber-corner-bracket-tl" />
          <span className="cyber-corner-bracket-tr" />
          <span className="cyber-corner-bracket-bl" />
          <span className="cyber-corner-bracket-br" />

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Radio className="w-3.5 h-3.5 text-neon-pink animate-pulse shrink-0" />
              <span className="text-[10px] font-orbitron tracking-widest text-neon-cyan font-bold truncate cyber-signal-flicker">
                SOLO_NODE // S-09
              </span>
            </div>
            <button
              type="button"
              onClick={toggleCollapse}
              title="HUD 접기"
              className="p-1 rounded-lg text-slate-400 hover:text-neon-cyan hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Radar & Telemetry Body */}
          <div className="flex items-center gap-3">
            {/* Circular Isolated Subnet Radar */}
            <div
              title="반경 내 활성 오퍼레이터: 0명 (고독한 단독 접속)"
              className="relative w-14 h-14 rounded-full border border-cyan-500/40 bg-black/70 shrink-0 flex items-center justify-center overflow-hidden shadow-[inset_0_0_12px_rgba(0,243,255,0.2)]"
            >
              {/* Concentric rings */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-4 rounded-full border border-cyan-500/15" />
              {/* Crosshairs */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/15" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/15" />

              {/* Rotating Conic Radar Sweep */}
              <div
                className="absolute inset-0 rounded-full cyber-radar-beam"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(0, 243, 255, 0.35) 0deg, rgba(0, 243, 255, 0.05) 45deg, transparent 70deg)",
                }}
              />

              {/* Center Solo Operator Dot */}
              <span className="relative z-10 w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_8px_#ff007f]" />
            </div>

            {/* Isolation Readouts */}
            <div className="flex-1 min-w-0 space-y-1 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PEERS</span>
                <span className="text-neon-pink font-bold tabular-nums">
                  0000 (ALONE)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SIGNAL</span>
                <span className="text-amber-300 font-semibold">ISOLATED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">UPTIME</span>
                <span className="text-neon-cyan tabular-nums font-bold">
                  {formatUptime(uptimeSec)}
                </span>
              </div>
            </div>
          </div>

          {/* Ambience Controls (Rain FX + Procedural Rain Audio) */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-cyan-500/15">
            <button
              type="button"
              onClick={toggleRainVisual}
              title="사이버 빗줄기 이펙트 토글"
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] border transition-all cursor-pointer active:scale-95 ${
                rainVisual
                  ? "bg-cyan-500/15 text-neon-cyan border-cyan-500/45 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>RAIN FX</span>
            </button>

            <button
              type="button"
              onClick={() => applyRainAudio(!rainAudio)}
              title="Night City 빗소리 앰비언스 사운드 토글"
              className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] border transition-all cursor-pointer active:scale-95 ${
                rainAudio
                  ? "bg-pink-500/20 text-neon-pink border-pink-500/55 shadow-[0_0_12px_rgba(255,0,127,0.3)]"
                  : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              {rainAudio ? (
                <Volume2 className="w-3 h-3 animate-pulse" />
              ) : (
                <VolumeX className="w-3 h-3" />
              )}
              <span>RAIN SND</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
