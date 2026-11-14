"use client";

import React, { useState, useEffect } from "react";

export interface CyberCountUpProps {
  end: number;
  start?: number;
  duration?: number; // ms, default 750
  delay?: number; // ms, default 0
  decimals?: number; // default 0
  prefix?: string;
  suffix?: string;
  className?: string;
  onEnd?: () => void;
}

/**
 * useCyberCountUp: A high-performance requestAnimationFrame hook for sequential
 * cyber-themed numerical counting with quartic ease-out deceleration.
 */
export function useCyberCountUp({
  end,
  start = 0,
  duration = 750,
  delay = 0,
  decimals = 0,
  onEnd,
}: {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  onEnd?: () => void;
}) {
  const [current, setCurrent] = useState(start);
  const [isCounting, setIsCounting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Immediate display if prefers-reduced-motion is active
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setCurrent(end);
      setIsFinished(true);
      onEnd?.();
      return;
    }

    if (end === start) {
      setCurrent(end);
      setIsFinished(true);
      onEnd?.();
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let rafId: number | null = null;

    timeoutId = setTimeout(() => {
      setIsCounting(true);
      const startTime = performance.now();
      const diff = end - start;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / Math.max(duration, 1), 1);

        // Quartic ease-out: snappy initial surge with silky-smooth cyber deceleration
        const eased = 1 - Math.pow(1 - progress, 4);
        const val = start + diff * eased;

        setCurrent(val);

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          setCurrent(end);
          setIsCounting(false);
          setIsFinished(true);
          onEnd?.();
        }
      };

      rafId = requestAnimationFrame(step);
    }, Math.max(delay, 0));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [end, start, duration, delay, onEnd]);

  const factor = Math.pow(10, decimals);
  const rounded = Math.round(current * factor) / factor;

  return {
    value: rounded,
    isCounting,
    isFinished,
  };
}

/**
 * CyberCountUp: Renders numbers that count up smoothly with cyber telemetry aesthetics.
 */
export function CyberCountUp({
  end,
  start = 0,
  duration = 750,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  onEnd,
}: CyberCountUpProps) {
  const { value, isFinished, isCounting } = useCyberCountUp({
    end,
    start,
    duration,
    delay,
    decimals,
    onEnd,
  });

  const formattedValue =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.floor(value).toLocaleString("en-US");

  return (
    <span
      className={`tabular-nums transition-all ${
        isCounting ? "opacity-95" : ""
      } ${isFinished ? "animate-in fade-in duration-300" : ""} ${className}`}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
