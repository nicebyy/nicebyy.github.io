"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { PostMeta } from "@/lib/posts";
import { siteConfig } from "@/config/site";

const CyberCursor = dynamic(
  () => import("./CyberCursor").then((mod) => mod.CyberCursor),
  { ssr: false }
);

const IsolatedAtmosphere = dynamic(
  () => import("./IsolatedAtmosphere").then((mod) => mod.IsolatedAtmosphere),
  { ssr: false }
);

export type NavSection = "dashboard" | "posts" | "about";

export function AppShell({
  posts,
  children,
}: {
  posts: PostMeta[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [cursorMode, setCursorMode] = useState<"cyber" | "native">("cyber");
  const [rainAudio, setRainAudio] = useState(false);

  // Sync procedural rain audio state across footer / HUD / terminal CLI
  useEffect(() => {
    const handleRainState = (e: Event) => {
      const custom = e as CustomEvent<boolean>;
      if (typeof custom.detail === "boolean") {
        setRainAudio(custom.detail);
      }
    };
    window.addEventListener("rain-audio-state", handleRainState);
    return () => {
      window.removeEventListener("rain-audio-state", handleRainState);
    };
  }, []);

  const toggleRainAudio = () => {
    window.dispatchEvent(new CustomEvent("toggle-rain-audio"));
  };

  // Performance: Pause CSS animations across the blog when browser tab is inactive (0% idle CPU)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.documentElement.classList.add("tab-inactive");
      } else {
        document.documentElement.classList.remove("tab-inactive");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("kimgatta_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
    const savedCursor = localStorage.getItem("kimgatta_cursor_mode");
    if (savedCursor === "native") {
      setCursorMode("native");
    }
  }, []);

  const toggleCursorMode = () => {
    const next = cursorMode === "cyber" ? "native" : "cyber";
    setCursorMode(next);
    try {
      localStorage.setItem("kimgatta_cursor_mode", next);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("toggle-cursor-mode", { detail: next }));
  };

  // Update activeSection on pathname changes and on scroll with RAF throttling
  useEffect(() => {
    if (pathname.startsWith("/about")) {
      setActiveSection("about");
      return;
    }
    if (pathname.startsWith("/posts/")) {
      setActiveSection("posts");
      return;
    }

    if (pathname === "/") {
      if (typeof window !== "undefined" && window.location.hash === "#posts") {
        setActiveSection("posts");
      } else {
        setActiveSection("dashboard");
      }

      let scrollRaf: number | null = null;
      const handleScroll = () => {
        if (scrollRaf !== null) return;
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = null;
          const postsEl = document.getElementById("posts");
          if (!postsEl) return;
          const rect = postsEl.getBoundingClientRect();
          // When posts section top reaches upper half of viewport
          if (rect.top <= 250) {
            setActiveSection("posts");
          } else {
            setActiveSection("dashboard");
          }
        });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollRaf !== null) {
          cancelAnimationFrame(scrollRaf);
        }
      };
    }
  }, [pathname]);

  const setCollapsedState = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem("kimgatta_sidebar_collapsed", String(collapsed));
    } catch {
      // ignore
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("kimgatta_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col relative overflow-x-clip">
      <IsolatedAtmosphere />
      <CyberCursor />
      <Navbar
        isSidebarCollapsed={isCollapsed}
        onToggleSidebar={toggleCollapse}
        onOpenMobileSidebar={() => setIsMobileOpen(true)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      <div className="flex-1 w-full max-w-full min-w-0 flex relative z-10">
        <Sidebar
          posts={posts}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onSetCollapsed={setCollapsedState}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="flex-1 max-w-6xl w-full min-w-0 mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </main>

          <footer className="border-t border-cyan-500/20 bg-[#060911]/90 backdrop-blur-md py-6 mt-8 sm:mt-12">
            <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-chakra tracking-wider text-slate-400">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-center sm:text-left">
                <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f3ff] shrink-0" />
                <span>
                  © {new Date().getFullYear()} {siteConfig.author} (@
                  {siteConfig.githubUsername}). POWERED BY NEXT.JS & GITHUB PAGES.
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                <button
                  type="button"
                  onClick={toggleRainAudio}
                  title="사이버펑크 빗소리 앰비언스 전환"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono transition-all cursor-pointer active:scale-95 ${
                    rainAudio
                      ? "border-pink-500/50 bg-pink-500/15 text-neon-pink shadow-[0_0_10px_rgba(255,0,127,0.25)]"
                      : "border-cyan-500/30 bg-black/40 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-neon-cyan"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      rainAudio
                        ? "bg-neon-pink shadow-[0_0_6px_#ff007f] animate-pulse"
                        : "bg-slate-500"
                    }`}
                  />
                  <span>RAIN: {rainAudio ? "ON" : "OFF"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleCursorMode}
                  title="마우스 커서 스타일 전환 (사이버펑크 / 시스템 기본)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-black/40 hover:bg-cyan-500/10 hover:border-cyan-400 text-[10px] font-mono text-slate-300 hover:text-neon-cyan transition-all cursor-pointer active:scale-95"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      cursorMode === "cyber"
                        ? "bg-neon-cyan shadow-[0_0_6px_#00f3ff]"
                        : "bg-slate-500"
                    }`}
                  />
                  <span>CURSOR: {cursorMode === "cyber" ? "CYBER" : "SYSTEM"}</span>
                </button>

                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon-cyan drop-shadow-[0_0_8px_#00f3ff] transition-colors"
                >
                  GITHUB // @{siteConfig.githubUsername}
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
