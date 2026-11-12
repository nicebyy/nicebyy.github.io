"use client";

import React, { useEffect, useState } from "react";
import { Eye, Users, Radio } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  fetchVisitorStats,
  formatCompactCount,
  VisitorStats,
} from "@/lib/visitor";

export type VisitorCounterVariant = "sidebar" | "telemetry" | "inline";

interface VisitorCounterProps {
  variant?: VisitorCounterVariant;
  collapsed?: boolean;
  className?: string;
}

function useAnimatedNumber(target: number, active: boolean): number {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (target <= 0) {
      setDisplay(0);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplay(target);
      return;
    }

    let rafId = 0;
    const duration = 450;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, active]);

  return display;
}

export function VisitorCounter({
  variant = "sidebar",
  collapsed = false,
  className = "",
}: VisitorCounterProps) {
  const config = siteConfig.visitorCounter;
  const [stats, setStats] = useState<VisitorStats | null>(null);

  useEffect(() => {
    if (!config?.enabled) return;
    let mounted = true;
    fetchVisitorStats(config.targetUrl).then((res) => {
      if (mounted) {
        setStats(res);
      }
    });
    return () => {
      mounted = false;
    };
  }, [config?.enabled, config?.targetUrl]);

  const legacyTotal = config?.legacyTotalHits ?? 0;
  const legacyLabel = config?.legacySourceName ?? "Tistory";
  const isLoaded = stats !== null;
  const isError = stats?.source === "error";
  const combinedTotal = legacyTotal + (stats?.totalHits ?? 0);
  const animatedToday = useAnimatedNumber(stats?.todayHits ?? 0, isLoaded && !isError);
  const animatedTotal = useAnimatedNumber(
    combinedTotal,
    isLoaded && (!isError || legacyTotal > 0)
  );

  if (!config?.enabled) return null;

  const todayDisplay = !isLoaded
    ? "..."
    : isError
    ? "--"
    : animatedToday.toLocaleString("en-US");
  const totalDisplay = !isLoaded
    ? "..."
    : isError
    ? legacyTotal > 0
      ? `${animatedTotal.toLocaleString("en-US")}+`
      : "--"
    : animatedTotal.toLocaleString("en-US");

  const statusLabel = !isLoaded
    ? "SYNC"
    : stats.source === "error"
    ? "OFFLINE"
    : stats.source === "cached"
    ? "CACHED"
    : stats.isLocalPreview
    ? "READ"
    : "LIVE";

  const statusDotClass = !isLoaded
    ? "bg-amber-400 animate-pulse"
    : stats.source === "error"
    ? "bg-slate-500"
    : stats.source === "cached"
    ? "bg-amber-400"
    : "bg-neon-green animate-pulse shadow-[0_0_6px_#00ff9d]";

  const tooltipText =
    isLoaded && !isError
      ? `방문자 수 — TODAY: ${stats.todayHits.toLocaleString("en-US")} / TOTAL: ${combinedTotal.toLocaleString("en-US")}${
          legacyTotal > 0
            ? ` (이전 ${legacyLabel} ${legacyTotal.toLocaleString("en-US")} + GitHub Pages ${stats.totalHits.toLocaleString("en-US")})`
            : ""
        }${stats.isLocalPreview ? " · 로컬 조회 전용" : ""}`
      : isError && legacyTotal > 0
      ? `방문자 수 — 이전 ${legacyLabel} 누적 ${legacyTotal.toLocaleString("en-US")}명 (실시간 통계 오프라인)`
      : "블로그 방문자 수 텔레메트리";

  if (variant === "sidebar") {
    if (collapsed) {
      return (
        <div
          title={tooltipText}
          aria-label={tooltipText}
          className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl bg-black/50 border border-cyan-500/30 hover:border-neon-cyan hover:shadow-neon-cyan transition-all ${className}`}
        >
          <Eye className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="text-[9px] font-orbitron font-bold text-neon-pink tabular-nums leading-none">
            {!isLoaded
              ? "··"
              : isError
              ? legacyTotal > 0
                ? formatCompactCount(legacyTotal)
                : "--"
              : formatCompactCount(combinedTotal)}
          </span>
        </div>
      );
    }

    return (
      <div
        title={tooltipText}
        className={`rounded-xl bg-black/55 border border-cyan-500/25 hover:border-cyan-500/50 p-2.5 space-y-2 transition-all ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neon-cyan/80">
            <Users className="w-3 h-3 text-neon-cyan shrink-0" />
            <span>// VISITORS</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-orbitron tracking-widest text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
            <span>{statusLabel}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg bg-slate-950/80 border border-cyan-500/25 px-2 py-1.5 min-w-0">
            <p className="text-[9px] font-orbitron tracking-wider text-slate-400">
              TODAY
            </p>
            <p
              className={`mt-0.5 text-xs font-orbitron font-black tabular-nums truncate ${
                !isLoaded
                  ? "text-slate-500 animate-pulse"
                  : "text-neon-cyan drop-shadow-[0_0_6px_rgba(0,243,255,0.5)]"
              }`}
            >
              {todayDisplay}
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-pink-500/25 px-2 py-1.5 min-w-0">
            <p className="text-[9px] font-orbitron tracking-wider text-slate-400">
              TOTAL
            </p>
            <p
              className={`mt-0.5 text-xs font-orbitron font-black tabular-nums truncate ${
                !isLoaded
                  ? "text-slate-500 animate-pulse"
                  : "text-neon-pink drop-shadow-[0_0_6px_rgba(255,0,127,0.5)]"
              }`}
            >
              {totalDisplay}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "telemetry") {
    return (
      <div
        title={tooltipText}
        className={`rounded-xl px-3 py-2.5 bg-black/55 border border-purple-500/40 hover:border-neon-cyan/70 hover:shadow-[0_0_14px_rgba(0,243,255,0.2)] transition-all flex flex-wrap items-center justify-between gap-2 ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-orbitron tracking-wider text-slate-300 font-bold">
              VISITORS
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-orbitron tracking-wider text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
              <span>{statusLabel}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[9px] sm:text-[10px] font-orbitron tracking-wider text-slate-400">
              TODAY
            </span>
            <span
              className={`text-sm sm:text-base font-orbitron font-black tabular-nums ${
                !isLoaded
                  ? "text-slate-500 animate-pulse"
                  : "text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]"
              }`}
            >
              {todayDisplay}
            </span>
          </div>
          <span className="h-3.5 w-px bg-white/15" aria-hidden="true" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-[9px] sm:text-[10px] font-orbitron tracking-wider text-slate-400">
              TOTAL
            </span>
            <span
              className={`text-sm sm:text-base font-orbitron font-black tabular-nums ${
                !isLoaded
                  ? "text-slate-500 animate-pulse"
                  : "text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]"
              }`}
            >
              {totalDisplay}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div
      title={tooltipText}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-black/40 text-[10px] font-mono text-slate-300 ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
      <span className="text-slate-400">TODAY</span>
      <span className="font-orbitron font-bold text-neon-cyan tabular-nums">
        {todayDisplay}
      </span>
      <span className="text-slate-600">/</span>
      <span className="text-slate-400">TOTAL</span>
      <span className="font-orbitron font-bold text-neon-pink tabular-nums">
        {totalDisplay}
      </span>
    </div>
  );
}
