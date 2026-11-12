"use client";

import React, { useEffect, useState, useRef } from "react";

type CursorType = "default" | "pointer" | "text" | "col-resize";

export function CyberCursor() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorMode, setCursorMode] = useState<"cyber" | "native">("cyber");
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

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

    const updatePosition = (clientX: number, clientY: number) => {
      mousePos.current.x = clientX;
      mousePos.current.y = clientY;

      if (!isVisible) {
        setIsVisible(true);
        trailPos.current.x = clientX;
        trailPos.current.y = clientY;
      }

      // Synchronous DOM transform for zero input latency
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
    };

    // Use { capture: true } so events are intercepted even during pointer capture / dragging
    const onPointerMove = (e: PointerEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Detect target cursor type
    const evaluateTarget = (target: HTMLElement | null) => {
      if (document.body.classList.contains("is-resizing-sidebar")) {
        setCursorType("col-resize");
        return;
      }

      if (!target) return;

      const isSeparator = target.closest(
        '[role="separator"], .cursor-col-resize, [data-cursor="col-resize"]'
      );
      if (isSeparator) {
        setCursorType("col-resize");
        return;
      }

      const textElement = target.closest("input, textarea, [contenteditable='true']");
      if (textElement) {
        setCursorType("text");
        return;
      }

      const clickable = target.closest(
        'a, button, [role="button"], .cursor-pointer, [data-cyber-hover], summary, input[type="submit"], input[type="button"]'
      );
      if (clickable) {
        setCursorType("pointer");
        return;
      }

      setCursorType("default");
    };

    const onPointerOver = (e: PointerEvent) => {
      evaluateTarget(e.target as HTMLElement | null);
    };

    // Fast micro-trail lerp loop (35% lerp factor, ultra-lightweight)
    const renderLoop = () => {
      if (document.body.classList.contains("is-resizing-sidebar")) {
        setCursorType("col-resize");
      }

      const lerp = 0.35;
      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * lerp;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * lerp;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0)`;
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
  );
}
