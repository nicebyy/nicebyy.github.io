"use client";

import React, { useEffect, useState, useRef } from "react";

type CursorType = "default" | "pointer" | "text" | "col-resize";

interface CircuitBranch {
  midX: number;
  midY: number;
  endX: number;
  endY: number;
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
  color: string;
}

interface CircuitTraceLine {
  angle: number;
  len1: number;
  len2: number;
  bendAngle: number;
  color: string;
}

interface ClickBurst {
  id: number;
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
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const prevMousePos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);

  // Canvas effects state stored in refs for 60-120fps direct rendering
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
    // Only enable on desktop pointer fine devices and in cyber mode
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

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const updatePosition = (clientX: number, clientY: number) => {
      const px = mousePos.current.x;
      const py = mousePos.current.y;
      mousePos.current.x = clientX;
      mousePos.current.y = clientY;

      if (!isVisible) {
        setIsVisible(true);
        prevMousePos.current.x = clientX;
        prevMousePos.current.y = clientY;
        trailPos.current.x = clientX;
        trailPos.current.y = clientY;
      }

      // Synchronous DOM transform for zero input latency
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // Circuit trail generation when moving
      if (px > 0 && py > 0) {
        const dx = clientX - px;
        const dy = clientY - py;
        const dist = Math.hypot(dx, dy);

        lastEmitDist.current += dist;
        // Emit a circuit trace point every 8-12px of movement
        if (lastEmitDist.current >= 10 && dist > 1) {
          lastEmitDist.current = 0;

          // Occasionally sprout an orthogonal or 45-degree circuit branch
          let branch: CircuitBranch | undefined = undefined;
          if (Math.random() < 0.45) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const branchAngle = Math.atan2(dy, dx) + (side * Math.PI) / 3;
            const bLen1 = 8 + Math.random() * 12;
            const bLen2 = 6 + Math.random() * 10;
            const midX = clientX + Math.cos(branchAngle) * bLen1;
            const midY = clientY + Math.sin(branchAngle) * bLen1;
            // 90-degree bend for authentic PCB aesthetic
            const bendAngle = branchAngle + (side * Math.PI) / 2;
            const endX = midX + Math.cos(bendAngle) * bLen2;
            const endY = midY + Math.sin(bendAngle) * bLen2;

            branch = { midX, midY, endX, endY };
          }

          trailSegments.current.push({
            x1: px,
            y1: py,
            x2: clientX,
            y2: clientY,
            age: 0,
            maxAge: 22 + Math.floor(Math.random() * 8), // ~25-30 frames (~0.4s)
            branch,
          });

          // Limit trail segments count for maximum 120fps performance
          if (trailSegments.current.length > 50) {
            trailSegments.current.shift();
          }
        }
      }

      prevMousePos.current.x = clientX;
      prevMousePos.current.y = clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => {
      setIsVisible(false);
      trailSegments.current = [];
    };

    const onMouseDown = (e: MouseEvent) => {
      setIsClicking(true);

      const target = e.target as Element | null;
      const isInteractive = Boolean(
        target?.closest?.(
          'a, button, [role="button"], .cursor-pointer, [data-cyber-hover], summary, input, select, textarea'
        )
      );

      // Trigger Click Burst (Empty Space vs Interactive Target)
      createClickBurst(e.clientX, e.clientY, isInteractive);
    };

    const onMouseUp = () => setIsClicking(false);

    // Create Click Effect (Empty Space = EMP Circuit Discharge, Interactive = Focused Target Spark)
    const createClickBurst = (x: number, y: number, isInteractive: boolean) => {
      const sparks: SparkParticle[] = [];
      const traces: CircuitTraceLine[] = [];

      if (!isInteractive) {
        // --- 1. EMPTY SPACE CLICK: Massive EMP Circuit Board Discharge ---
        // 8-directional branching circuit traces
        const traceCount = 8;
        for (let i = 0; i < traceCount; i++) {
          const baseAngle = (i * (Math.PI * 2)) / traceCount + (Math.random() - 0.5) * 0.2;
          const bendSide = Math.random() < 0.5 ? 1 : -1;
          const bendAngle = baseAngle + (bendSide * Math.PI) / 4; // 45-deg or 90-deg bend

          traces.push({
            angle: baseAngle,
            len1: 25 + Math.random() * 30,
            len2: 20 + Math.random() * 25,
            bendAngle,
            color: i % 2 === 0 ? "#00f3ff" : "#ff007f",
          });
        }

        // 16 electric sparks bursting outwards
        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 4.5;
          sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 24 + Math.floor(Math.random() * 12),
            size: 1.5 + Math.random() * 1.5,
            color: Math.random() < 0.6 ? "#00f3ff" : Math.random() < 0.85 ? "#ff007f" : "#00ff9d",
          });
        }
      } else {
        // --- 2. INTERACTIVE TARGET CLICK: Lock-on Target Focus Burst ---
        // Fast concentrated pink/cyan sparks
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3;
          sparks.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 18 + Math.floor(Math.random() * 8),
            size: 1.2 + Math.random() * 1.5,
            color: "#ff007f",
          });
        }
      }

      clickBursts.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        age: 0,
        maxAge: isInteractive ? 20 : 36, // ~0.5s duration
        isInteractive,
        traces,
        sparks,
      });

      if (clickBursts.current.length > 8) {
        clickBursts.current.shift();
      }
    };

    // Detect target cursor type
    const evaluateTarget = (target: Element | null) => {
      if (document.body.classList.contains("is-resizing-sidebar")) {
        setCursorType("col-resize");
        return;
      }

      if (!target) return;

      const isSeparator = target.closest?.(
        '[role="separator"], .cursor-col-resize, [data-cursor="col-resize"]'
      );
      if (isSeparator) {
        setCursorType("col-resize");
        return;
      }

      const textElement = target.closest?.("input, textarea, [contenteditable='true']");
      if (textElement) {
        setCursorType("text");
        return;
      }

      const clickable = target.closest?.(
        'a, button, [role="button"], .cursor-pointer, [data-cyber-hover], summary, input[type="submit"], input[type="button"]'
      );
      if (clickable) {
        setCursorType("pointer");
        return;
      }

      setCursorType("default");
    };

    const onPointerOver = (e: PointerEvent) => {
      evaluateTarget(e.target as Element | null);
    };

    // Main 60-120fps Animation Loop (HTML5 Canvas + Lerp Trail)
    const renderLoop = () => {
      if (document.body.classList.contains("is-resizing-sidebar")) {
        setCursorType("col-resize");
      }

      // 1. Cursor micro-trail lerp
      const lerp = 0.35;
      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * lerp;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * lerp;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0)`;
      }

      // 2. Canvas Circuit & EMP Effects Rendering
      const canvasEl = canvasRef.current;
      if (canvasEl) {
        if (canvasEl.width !== window.innerWidth || canvasEl.height !== window.innerHeight) {
          canvasEl.width = window.innerWidth;
          canvasEl.height = window.innerHeight;
        }
        const ctx = canvasEl.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

          // --- DRAW CIRCUIT ELECTRIC TRAIL ---
          if (trailSegments.current.length > 0) {
            ctx.save();
            ctx.lineCap = "round";
            ctx.lineJoin = "miter";

            for (let i = trailSegments.current.length - 1; i >= 0; i--) {
              const seg = trailSegments.current[i];
              seg.age++;
              if (seg.age >= seg.maxAge) {
                trailSegments.current.splice(i, 1);
                continue;
              }

              const progress = seg.age / seg.maxAge;
              const alpha = Math.max(0, 1 - progress);

              // Electric jitter vibration for live electric wire feeling
              const jitterX = (Math.random() - 0.5) * 1.5 * alpha;
              const jitterY = (Math.random() - 0.5) * 1.5 * alpha;

              // Outer Cyan Neon Glow
              ctx.shadowColor = "#00f3ff";
              ctx.shadowBlur = 6 * alpha;
              ctx.strokeStyle = `rgba(0, 243, 255, ${0.75 * alpha})`;
              ctx.lineWidth = 1.8 * alpha;

              ctx.beginPath();
              ctx.moveTo(seg.x1 + jitterX, seg.y1 + jitterY);
              ctx.lineTo(seg.x2 + jitterX, seg.y2 + jitterY);
              ctx.stroke();

              // Inner White Core Arc
              ctx.shadowBlur = 2;
              ctx.shadowColor = "#ffffff";
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
              ctx.lineWidth = 0.8 * alpha;
              ctx.stroke();

              // Micro Circuit Node at segment joint
              ctx.fillStyle = `rgba(0, 243, 255, ${0.85 * alpha})`;
              ctx.beginPath();
              ctx.arc(seg.x2, seg.y2, 1.4 * alpha, 0, Math.PI * 2);
              ctx.fill();

              // Draw Circuit Branch if present
              if (seg.branch) {
                const b = seg.branch;
                ctx.shadowColor = Math.random() < 0.3 ? "#ff007f" : "#00f3ff";
                ctx.shadowBlur = 4 * alpha;
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.65 * alpha})`;
                ctx.lineWidth = 1.2 * alpha;

                ctx.beginPath();
                ctx.moveTo(seg.x2, seg.y2);
                ctx.lineTo(b.midX, b.midY);
                ctx.lineTo(b.endX, b.endY);
                ctx.stroke();

                // Branch Terminal Node dot
                ctx.fillStyle = `rgba(255, 0, 127, ${0.85 * alpha})`;
                ctx.beginPath();
                ctx.arc(b.endX, b.endY, 1.8 * alpha, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.restore();
          }

          // --- DRAW CLICK BURSTS (EMPTY SPACE EMP vs INTERACTIVE SPARK) ---
          if (clickBursts.current.length > 0) {
            ctx.save();

            for (let i = clickBursts.current.length - 1; i >= 0; i--) {
              const burst = clickBursts.current[i];
              burst.age++;
              if (burst.age >= burst.maxAge) {
                clickBursts.current.splice(i, 1);
                continue;
              }

              const progress = burst.age / burst.maxAge;
              const alpha = Math.max(0, 1 - progress);
              const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out

              if (!burst.isInteractive) {
                // ==========================================
                // EMPTY SPACE CLICK: EMP CIRCUIT EXPANSION
                // ==========================================

                // 1. Dual Shockwave Hexagon/Pulse Rings
                const ringRadius = easeOut * 75;
                ctx.shadowColor = "#00f3ff";
                ctx.shadowBlur = 10 * alpha;
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.8 * alpha})`;
                ctx.lineWidth = 2 * (1 - progress);

                // Outer Expanding Circle with dashes
                ctx.beginPath();
                ctx.arc(burst.x, burst.y, ringRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Inner Pulse Diamond
                const innerSize = easeOut * 25;
                ctx.strokeStyle = `rgba(255, 0, 127, ${0.7 * alpha})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(burst.x, burst.y - innerSize);
                ctx.lineTo(burst.x + innerSize, burst.y);
                ctx.lineTo(burst.x, burst.y + innerSize);
                ctx.lineTo(burst.x - innerSize, burst.y);
                ctx.closePath();
                ctx.stroke();

                // 2. 8-Directional Branching PCB Circuit Traces
                for (const trace of burst.traces) {
                  const currentLen1 = trace.len1 * Math.min(1, easeOut * 1.5);
                  const midX = burst.x + Math.cos(trace.angle) * currentLen1;
                  const midY = burst.y + Math.sin(trace.angle) * currentLen1;

                  ctx.shadowColor = trace.color;
                  ctx.shadowBlur = 8 * alpha;
                  ctx.strokeStyle = trace.color === "#ff007f"
                    ? `rgba(255, 0, 127, ${0.85 * alpha})`
                    : `rgba(0, 243, 255, ${0.85 * alpha})`;
                  ctx.lineWidth = 1.6 * (1 - progress * 0.7);

                  // Primary trace ray
                  ctx.beginPath();
                  ctx.moveTo(burst.x, burst.y);
                  ctx.lineTo(midX, midY);

                  // 45/90-deg angled continuation
                  if (easeOut > 0.4) {
                    const legProgress = Math.min(1, (easeOut - 0.4) / 0.6);
                    const currentLen2 = trace.len2 * legProgress;
                    const endX = midX + Math.cos(trace.bendAngle) * currentLen2;
                    const endY = midY + Math.sin(trace.bendAngle) * currentLen2;

                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    // Circuit Terminal Node (Circle Pad)
                    ctx.fillStyle = trace.color;
                    ctx.beginPath();
                    ctx.arc(endX, endY, 2.2 * alpha, 0, Math.PI * 2);
                    ctx.fill();
                  } else {
                    ctx.stroke();
                  }
                }
              } else {
                // ==========================================
                // INTERACTIVE TARGET CLICK: FOCUSED LOCK-ON RING
                // ==========================================
                const targetRadius = easeOut * 32;
                ctx.shadowColor = "#ff007f";
                ctx.shadowBlur = 12 * alpha;
                ctx.strokeStyle = `rgba(255, 0, 127, ${0.9 * alpha})`;
                ctx.lineWidth = 2 * (1 - progress);

                ctx.beginPath();
                ctx.arc(burst.x, burst.y, targetRadius, 0, Math.PI * 2);
                ctx.stroke();
              }

              // 3. Electric Spark Particles
              for (const spark of burst.sparks) {
                spark.x += spark.vx;
                spark.y += spark.vy;
                spark.vx *= 0.94; // Deceleration
                spark.vy *= 0.94;
                spark.life++;

                const sparkAlpha = Math.max(0, 1 - spark.life / spark.maxLife);
                if (sparkAlpha <= 0) continue;

                ctx.shadowColor = spark.color;
                ctx.shadowBlur = 6 * sparkAlpha;
                ctx.fillStyle = spark.color;
                ctx.beginPath();
                ctx.arc(spark.x, spark.y, spark.size * sparkAlpha, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.restore();
          }
        }
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });
    window.addEventListener("mousemove", onMouseMove, { capture: true, passive: true });
    window.addEventListener("pointerover", onPointerOver, { capture: true, passive: true });
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", onMouseDown, { capture: true });
    window.addEventListener("mouseup", onMouseUp, { capture: true });

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      document.body.classList.remove("cyber-cursor-active");
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", onPointerMove, { capture: true });
      window.removeEventListener("mousemove", onMouseMove, { capture: true });
      window.removeEventListener("pointerover", onPointerOver, { capture: true });
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", onMouseDown, { capture: true });
      window.removeEventListener("mouseup", onMouseUp, { capture: true });
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isVisible, cursorMode]);

  if (!isEnabled || cursorMode === "native") return null;

  return (
    <>
      {/* High-Performance Canvas for Circuit Electric Trails & EMP Bursts */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[999998]"
        aria-hidden="true"
      />

      <div
        className={`pointer-events-none fixed inset-0 z-[999999] overflow-hidden transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        {/* 1. Subtle Micro Laser Trail Dot */}
        {cursorType !== "col-resize" && cursorType !== "text" && (
          <div
            ref={trailRef}
            className="fixed top-0 left-0 -ml-[3px] -mt-[3px] will-change-transform pointer-events-none transition-opacity duration-150"
            style={{ transform: "translate3d(-100px, -100px, 0)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 shadow-[0_0_6px_#00f3ff]" />
          </div>
        )}

        {/* 2. Primary Cyber Pointer (Zero-latency direct transform) */}
        <div
          ref={cursorRef}
          className="fixed top-0 left-0 will-change-transform pointer-events-none"
          style={{ transform: "translate3d(-100px, -100px, 0)" }}
        >
          {/* Render contextual cursor shape */}
          {cursorType === "col-resize" ? (
            // Col-Resize: Neon Cyan Cyber Double-Arrow (Centered on cursor)
            <div className="relative -ml-[14px] -mt-[10px] w-7 h-5 flex items-center justify-center animate-pulse">
              <svg
                width="28"
                height="20"
                viewBox="0 0 28 20"
                fill="none"
                className="drop-shadow-[0_0_8px_#00f3ff]"
              >
                {/* Dark backplate */}
                <rect
                  x="1"
                  y="2"
                  width="26"
                  height="16"
                  rx="4"
                  fill="#05070e"
                  fillOpacity="0.9"
                  stroke="#00f3ff"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                />
                {/* Left Arrow */}
                <path
                  d="M7 6L3 10L7 14"
                  stroke="#00f3ff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Center Splitter Bars */}
                <line
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="15"
                  stroke="#00f3ff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="16"
                  y1="5"
                  x2="16"
                  y2="15"
                  stroke="#00f3ff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Right Arrow */}
                <path
                  d="M21 6L25 10L21 14"
                  stroke="#00f3ff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Center pink core dot */}
                <circle cx="14" cy="10" r="1.5" fill="#ff007f" />
              </svg>
            </div>
          ) : cursorType === "text" ? (
            // Text Caret Beam (Centered horizontally and vertically)
            <div className="relative -ml-[6px] -mt-[10px] w-3 h-5 flex items-center justify-center">
              <svg
                width="12"
                height="20"
                viewBox="0 0 12 20"
                fill="none"
                className="drop-shadow-[0_0_6px_#00f3ff]"
              >
                <line
                  x1="2"
                  y1="2"
                  x2="10"
                  y2="2"
                  stroke="#00f3ff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="6"
                  y1="2"
                  x2="6"
                  y2="18"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="2"
                  y1="18"
                  x2="10"
                  y2="18"
                  stroke="#00f3ff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : cursorType === "pointer" ? (
            // Interactive Hover: Hot Pink Cyber Stealth Arrow (Tip at 0, 0)
            <div
              className={`relative transition-transform duration-100 ease-out ${
                isClicking ? "scale-90" : "scale-105"
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                className="drop-shadow-[0_0_8px_#ff007f]"
              >
                {/* Dark Backing Arrow */}
                <path
                  d="M1 1L17 12L10 13.5L7.5 19.5L1 1Z"
                  fill="#05070e"
                  stroke="#ff007f"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Inner Hot-Pink Blade */}
                <path
                  d="M2.5 3.5L13.5 11L9 12.2L7 16.5L2.5 3.5Z"
                  fill="#ff007f"
                  fillOpacity="0.45"
                />
                {/* Sharp Tip Laser Pixel */}
                <circle cx="1.5" cy="1.5" r="1.2" fill="#ffffff" />
                {/* Tech Bracket */}
                <path
                  d="M14 18L18 18L18 14"
                  stroke="#ff007f"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
            </div>
          ) : (
            // Default: Sharp Neon Cyan Cyber Stealth Arrow (Tip at 0, 0)
            <div
              className={`relative transition-transform duration-100 ease-out ${
                isClicking ? "scale-90" : "scale-100"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="drop-shadow-[0_0_7px_#00f3ff]"
              >
                {/* Dark Backing Arrow */}
                <path
                  d="M1 1L16 11L9.5 12.5L7 18.5L1 1Z"
                  fill="#05070e"
                  stroke="#00f3ff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Inner Neon Cyan Blade */}
                <path
                  d="M2.5 3.5L12.5 10.5L8 11.5L6 16L2.5 3.5Z"
                  fill="#00f3ff"
                  fillOpacity="0.35"
                />
                {/* Sharp Tip Laser Pixel */}
                <circle cx="1.5" cy="1.5" r="1" fill="#ffffff" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
