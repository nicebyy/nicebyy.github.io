"use client";

import React, { useEffect, useState, useRef } from "react";

interface ClickRipple {
  id: number;
  x: number;
  y: number;
  color: "cyan" | "pink";
}

export function CyberCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === "undefined") return;
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      ("ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches);

    if (isTouchDevice) {
      return;
    }

    setIsEnabled(true);
    document.body.classList.add("cyber-cursor-active");

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    const onMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      const isTargetInteractive = Boolean(
        (e.target as HTMLElement)?.closest(
          'a, button, input, textarea, select, [role="button"], .cursor-pointer, [data-cyber-hover]'
        )
      );

      const newRipple: ClickRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        color: isTargetInteractive ? "pink" : "cyan",
      };

      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    const onMouseUp = () => setIsClicking(false);

    // Interactive target detection
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const textElement = target.closest("input, textarea, [contenteditable='true']");
      if (textElement) {
        setIsText(true);
        setIsHovered(false);
        return;
      }
      setIsText(false);

      const clickable = target.closest(
        'a, button, [role="button"], .cursor-pointer, [data-cyber-hover], summary, input[type="submit"], input[type="button"]'
      );
      setIsHovered(Boolean(clickable));
    };

    // Smooth lerp loop for the cyber HUD ring
    const renderLoop = () => {
      const lerpFactor = 0.22;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", onMouseOver, { passive: true });

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      document.body.classList.remove("cyber-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", onMouseOver);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isVisible]);

  // Clean up ripples after animation duration
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (!isEnabled) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[999999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* 1. Immediate Center Pointer (Sharp Cyber Diamond) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 will-change-transform transition-[width,height,background-color,box-shadow] duration-150 ease-out"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        {isText ? (
          // Text input mode: vertical neon beam
          <div className="w-0.5 h-4 -mt-1 bg-neon-cyan shadow-[0_0_8px_#00f3ff] animate-pulse" />
        ) : (
          // Standard / Hover mode: Cyber Diamond
          <div
            className={`w-2.5 h-2.5 rotate-45 transition-all duration-200 ${
              isClicking
                ? "scale-150 bg-white shadow-[0_0_15px_#fff]"
                : isHovered
                ? "scale-125 bg-neon-pink shadow-[0_0_12px_#ff007f]"
                : "bg-neon-cyan shadow-[0_0_10px_#00f3ff]"
            }`}
          >
            {/* Center core pixel */}
            <div className="w-1 h-1 bg-white mx-auto my-auto mt-[2px] rounded-full" />
          </div>
        )}
      </div>

      {/* 2. Smooth Lerp Outer Cyber HUD Reticle */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 will-change-transform transition-[opacity] duration-200"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        {!isText && (
          <div
            className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
              isClicking
                ? "-ml-3 -mt-3 w-6 h-6 scale-90"
                : isHovered
                ? "-ml-6 -mt-6 w-12 h-12 scale-110"
                : "-ml-4 -mt-4 w-8 h-8 scale-100"
            }`}
          >
            {/* Rotating Outer Ring with Dashes */}
            <div
              className={`absolute inset-0 rounded-full border border-dashed transition-colors duration-300 ${
                isHovered
                  ? "border-pink-400/80 animate-[spin_4s_linear_infinite] shadow-[0_0_15px_rgba(255,0,127,0.4)]"
                  : "border-cyan-400/50 animate-[spin_10s_linear_infinite] shadow-[0_0_10px_rgba(0,243,255,0.25)]"
              }`}
            />

            {/* 4 Corner HUD Crosshair Ticks */}
            <div
              className={`absolute -top-1 w-1.5 h-0.5 transition-colors duration-200 ${
                isHovered ? "bg-neon-pink shadow-[0_0_6px_#ff007f]" : "bg-neon-cyan"
              }`}
            />
            <div
              className={`absolute -bottom-1 w-1.5 h-0.5 transition-colors duration-200 ${
                isHovered ? "bg-neon-pink shadow-[0_0_6px_#ff007f]" : "bg-neon-cyan"
              }`}
            />
            <div
              className={`absolute -left-1 w-0.5 h-1.5 transition-colors duration-200 ${
                isHovered ? "bg-neon-pink shadow-[0_0_6px_#ff007f]" : "bg-neon-cyan"
              }`}
            />
            <div
              className={`absolute -right-1 w-0.5 h-1.5 transition-colors duration-200 ${
                isHovered ? "bg-neon-pink shadow-[0_0_6px_#ff007f]" : "bg-neon-cyan"
              }`}
            />

            {/* Hover Mode Tech Corners (Lock-on target brackets) */}
            {isHovered && (
              <div className="absolute inset-[-4px] pointer-events-none animate-pulse">
                <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-neon-pink" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-neon-pink" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-neon-pink" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-neon-pink" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Click Shockwave Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none will-change-transform"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Shockwave expanding ring */}
          <div
            className={`w-4 h-4 rounded-full border-2 animate-ping ${
              ripple.color === "pink"
                ? "border-neon-pink shadow-[0_0_20px_#ff007f]"
                : "border-neon-cyan shadow-[0_0_20px_#00f3ff]"
            }`}
            style={{ animationDuration: "500ms", animationIterationCount: 1 }}
          />
          {/* Central quick burst diamond */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border ${
              ripple.color === "pink"
                ? "border-pink-300 bg-pink-500/30"
                : "border-cyan-300 bg-cyan-500/30"
            } animate-pulse`}
          />
        </div>
      ))}
    </div>
  );
}
