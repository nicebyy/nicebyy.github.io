"use client";

import React, { useEffect, useState, useRef } from "react";

interface CircuitBranch {
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  isPink: boolean;
}

interface TrailSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  age: number;
  maxAge: number;
  branch?: CircuitBranch;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rgb: string; // e.g. "0, 243, 255"
}

interface CircuitTraceLine {
  angle: number;
  len1: number;
  len2: number;
  bendAngle: number;
  rgb: string;
}

interface ClickBurst {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  isInteractive: boolean;
  traces: CircuitTraceLine[];
  sparks: SparkParticle[];
}

export function CyberCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorMode, setCursorMode] = useState<"cyber" | "native">("cyber");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animFrameId = useRef<number | null>(null);
  const isLoopRunning = useRef(false);

  const prevMousePos = useRef({ x: -1, y: -1 });
  const trailSegments = useRef<TrailSegment[]>([]);
  const clickBursts = useRef<ClickBurst[]>([]);
  const lastEmitDist = useRef(0);

  // Restore cursor mode from localStorage on mount & listen to toggle events
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kimgatta_cursor_mode");
      if (saved === "native") {
        setCursorMode("native");
      }
    } catch {
      // ignore
    }

    const handleToggleEvent = (e: Event) => {
      const custom = e as CustomEvent<"cyber" | "native">;
      if (custom.detail) {
        setCursorMode(custom.detail);
      } else {
        setCursorMode((prev) => (prev === "cyber" ? "native" : "cyber"));
      }
    };

    window.addEventListener("toggle-cursor-mode", handleToggleEvent);
    return () => {
      window.removeEventListener("toggle-cursor-mode", handleToggleEvent);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("kimgatta_cursor_mode", cursorMode);
    } catch {
      // ignore
    }
  }, [cursorMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      ("ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches);

    if (isTouchDevice || cursorMode === "native") {
      setIsEnabled(false);
      document.body.classList.remove("cyber-cursor-active");
      return;
    }

    setIsEnabled(true);
    document.body.classList.add("cyber-cursor-active");

    const syncCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctxRef.current = canvas.getContext("2d", { alpha: true });
    };

    // Sync once after React commits the <canvas> element
    const initTimer = requestAnimationFrame(syncCanvasSize);
    window.addEventListener("resize", syncCanvasSize, { passive: true });

    // On-Demand Render Loop: automatically stops when no animations remain
    const renderLoop = () => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) {
        isLoopRunning.current = false;
        return;
      }

      if (canvasEl.width !== window.innerWidth || canvasEl.height !== window.innerHeight) {
        canvasEl.width = window.innerWidth;
        canvasEl.height = window.innerHeight;
        ctxRef.current = canvasEl.getContext("2d", { alpha: true });
      }

      const ctx = ctxRef.current || canvasEl.getContext("2d", { alpha: true });
      if (!ctx) {
        isLoopRunning.current = false;
        return;
      }
      ctxRef.current = ctx;

      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      // 1. DRAW CIRCUIT ELECTRIC TRAIL (Blur-free dual-stroke neon for 144fps performance)
      const segments = trailSegments.current;
      if (segments.length > 0) {
        ctx.lineCap = "round";
        ctx.lineJoin = "miter";

        for (let i = segments.length - 1; i >= 0; i--) {
          const seg = segments[i];
          seg.age++;
          if (seg.age >= seg.maxAge) {
            segments.splice(i, 1);
            continue;
          }

          const alpha = 1 - seg.age / seg.maxAge;

          // Subtle electric arc vibration
          const jx = (Math.random() - 0.5) * 1.2 * alpha;
          const jy = (Math.random() - 0.5) * 1.2 * alpha;

          // Outer Soft Cyan Glow Stroke (No expensive shadowBlur)
          ctx.strokeStyle = `rgba(0, 243, 255, ${0.22 * alpha})`;
          ctx.lineWidth = 4.5 * alpha;
          ctx.beginPath();
          ctx.moveTo(seg.x1 + jx, seg.y1 + jy);
          ctx.lineTo(seg.x2 + jx, seg.y2 + jy);
          ctx.stroke();

          // Sharp Inner Neon Cyan Core
          ctx.strokeStyle = `rgba(0, 243, 255, ${0.85 * alpha})`;
          ctx.lineWidth = 1.4 * alpha;
          ctx.stroke();

          // Micro Joint Node
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * alpha})`;
          ctx.beginPath();
          ctx.arc(seg.x2, seg.y2, 1.1 * alpha, 0, Math.PI * 2);
          ctx.fill();

          // Orthogonal/45-deg PCB Branch
          if (seg.branch) {
            const b = seg.branch;
            ctx.strokeStyle = b.isPink
              ? `rgba(255, 0, 127, ${0.55 * alpha})`
              : `rgba(0, 243, 255, ${0.55 * alpha})`;
            ctx.lineWidth = 1.1 * alpha;
            ctx.beginPath();
            ctx.moveTo(seg.x2, seg.y2);
            ctx.lineTo(b.midX, b.midY);
            ctx.lineTo(b.endX, b.endY);
            ctx.stroke();

            ctx.fillStyle = b.isPink
              ? `rgba(255, 0, 127, ${0.85 * alpha})`
              : `rgba(0, 243, 255, ${0.85 * alpha})`;
            ctx.beginPath();
            ctx.arc(b.endX, b.endY, 1.5 * alpha, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 2. DRAW CLICK BURSTS (EMPTY SPACE EMP vs INTERACTIVE LOCK-ON SPARK)
      const bursts = clickBursts.current;
      if (bursts.length > 0) {
        for (let i = bursts.length - 1; i >= 0; i--) {
          const burst = bursts[i];
          burst.age++;
          if (burst.age >= burst.maxAge) {
            bursts.splice(i, 1);
            continue;
          }

          const progress = burst.age / burst.maxAge;
          const alpha = 1 - progress;
          const easeOut = 1 - Math.pow(1 - progress, 3);

          if (!burst.isInteractive) {
            // --- EMPTY SPACE CLICK: EMP CIRCUIT DISCHARGE ---
            const ringRadius = easeOut * 72;

            // Outer Glow Ring + Crisp Core Ring
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.25 * alpha})`;
            ctx.lineWidth = 5 * alpha;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(0, 243, 255, ${0.85 * alpha})`;
            ctx.lineWidth = 1.6 * alpha;
            ctx.stroke();

            // Inner Rotating/Expanding Pink Diamond
            const dSize = easeOut * 24;
            ctx.strokeStyle = `rgba(255, 0, 127, ${0.75 * alpha})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(burst.x, burst.y - dSize);
            ctx.lineTo(burst.x + dSize, burst.y);
            ctx.lineTo(burst.x, burst.y + dSize);
            ctx.lineTo(burst.x - dSize, burst.y);
            ctx.closePath();
            ctx.stroke();

            // 8-Directional Branching PCB Circuit Lines
            for (let t = 0; t < burst.traces.length; t++) {
              const trace = burst.traces[t];
              const len1 = trace.len1 * Math.min(1, easeOut * 1.5);
              const midX = burst.x + Math.cos(trace.angle) * len1;
              const midY = burst.y + Math.sin(trace.angle) * len1;

              ctx.strokeStyle = `rgba(${trace.rgb}, ${0.85 * alpha})`;
              ctx.lineWidth = 1.5 * (1 - progress * 0.6);

              ctx.beginPath();
              ctx.moveTo(burst.x, burst.y);
              ctx.lineTo(midX, midY);

              if (easeOut > 0.35) {
                const legProgress = Math.min(1, (easeOut - 0.35) / 0.65);
                const len2 = trace.len2 * legProgress;
                const endX = midX + Math.cos(trace.bendAngle) * len2;
                const endY = midY + Math.sin(trace.bendAngle) * len2;

                ctx.lineTo(endX, endY);
                ctx.stroke();

                ctx.fillStyle = `rgba(${trace.rgb}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(endX, endY, 2 * alpha, 0, Math.PI * 2);
                ctx.fill();
              } else {
                ctx.stroke();
              }
            }
          } else {
            // --- INTERACTIVE TARGET CLICK: FOCUSED PINK LOCK-ON RING ---
            const targetRadius = easeOut * 28;
            ctx.strokeStyle = `rgba(255, 0, 127, ${0.28 * alpha})`;
            ctx.lineWidth = 4 * alpha;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, targetRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = `rgba(255, 0, 127, ${0.9 * alpha})`;
            ctx.lineWidth = 1.6 * alpha;
            ctx.stroke();
          }

          // Sparks
          for (let s = 0; s < burst.sparks.length; s++) {
            const spark = burst.sparks[s];
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.vx *= 0.93;
            spark.vy *= 0.93;
            spark.life++;

            const sAlpha = Math.max(0, 1 - spark.life / spark.maxLife);
            if (sAlpha <= 0) continue;

            ctx.fillStyle = `rgba(${spark.rgb}, ${sAlpha})`;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.size * sAlpha, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Keep running only while active effects exist (0% idle CPU usage)
      if (trailSegments.current.length > 0 || clickBursts.current.length > 0) {
        animFrameId.current = requestAnimationFrame(renderLoop);
      } else {
        isLoopRunning.current = false;
        animFrameId.current = null;
      }
    };

    const startLoop = () => {
      if (!isLoopRunning.current) {
        isLoopRunning.current = true;
        animFrameId.current = requestAnimationFrame(renderLoop);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const cx = e.clientX;
      const cy = e.clientY;
      const px = prevMousePos.current.x;
      const py = prevMousePos.current.y;

      if (px >= 0 && py >= 0) {
        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.hypot(dx, dy);
        lastEmitDist.current += dist;

        if (lastEmitDist.current >= 14 && dist > 1) {
          lastEmitDist.current = 0;

          let branch: CircuitBranch | undefined;
          if (Math.random() < 0.4) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const branchAngle = Math.atan2(dy, dx) + (side * Math.PI) / 3;
            const bLen1 = 8 + Math.random() * 10;
            const bLen2 = 5 + Math.random() * 9;
            const midX = cx + Math.cos(branchAngle) * bLen1;
            const midY = cy + Math.sin(branchAngle) * bLen1;
            const bendAngle = branchAngle + (side * Math.PI) / 2;

            branch = {
              midX,
              midY,
              endX: midX + Math.cos(bendAngle) * bLen2,
              endY: midY + Math.sin(bendAngle) * bLen2,
              isPink: Math.random() < 0.35,
            };
          }

          trailSegments.current.push({
            x1: px,
            y1: py,
            x2: cx,
            y2: cy,
            age: 0,
            maxAge: 20,
            branch,
          });

          if (trailSegments.current.length > 36) {
            trailSegments.current.shift();
          }

          startLoop();
        }
      }

      prevMousePos.current.x = cx;
      prevMousePos.current.y = cy;
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const isInteractive = Boolean(
        target?.closest?.(
          'a, button, [role="button"], .cursor-pointer, [data-cyber-hover], summary, input, select, textarea'
        )
      );

      const x = e.clientX;
      const y = e.clientY;
      const sparks: SparkParticle[] = [];
      const traces: CircuitTraceLine[] = [];

      if (!isInteractive) {
        const traceCount = 8;
        for (let i = 0; i < traceCount; i++) {
          const baseAngle = (i * (Math.PI * 2)) / traceCount + (Math.random() - 0.5) * 0.2;
          const bendSide = Math.random() < 0.5 ? 1 : -1;
          traces.push({
            angle: baseAngle,
            len1: 22 + Math.random() * 26,
            len2: 16 + Math.random() * 22,
            bendAngle: baseAngle + (bendSide * Math.PI) / 4,
            rgb: i % 2 === 0 ? "0, 243, 255" : "255, 0, 127",
          });
        }

        for (let i = 0; i < 14; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 4;
          sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 22 + Math.floor(Math.random() * 10),
            size: 1.4 + Math.random() * 1.4,
            rgb: Math.random() < 0.6 ? "0, 243, 255" : Math.random() < 0.85 ? "255, 0, 127" : "0, 255, 157",
          });
        }
      } else {
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 2.5;
          sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 16 + Math.floor(Math.random() * 6),
            size: 1.2 + Math.random() * 1.2,
            rgb: "255, 0, 127",
          });
        }
      }

      clickBursts.current.push({
        x,
        y,
        age: 0,
        maxAge: isInteractive ? 18 : 32,
        isInteractive,
        traces,
        sparks,
      });

      if (clickBursts.current.length > 6) {
        clickBursts.current.shift();
      }

      startLoop();
    };

    const onMouseLeave = () => {
      prevMousePos.current.x = -1;
      prevMousePos.current.y = -1;
    };

    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });
    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      document.body.classList.remove("cyber-cursor-active");
      cancelAnimationFrame(initTimer);
      window.removeEventListener("resize", syncCanvasSize);
      window.removeEventListener("pointermove", onPointerMove, { capture: true });
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("mouseleave", onMouseLeave);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      isLoopRunning.current = false;
    };
  }, [cursorMode]);

  if (!isEnabled || cursorMode === "native") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[999998]"
      aria-hidden="true"
    />
  );
}
