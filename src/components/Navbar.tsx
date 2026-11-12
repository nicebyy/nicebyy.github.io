"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Github,
  Search,
  Cpu,
  BookOpen,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface NavbarProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
}

export function Navbar({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: NavbarProps) {
  const pathname = usePathname();

  const triggerSearchFocus = () => {
    window.dispatchEvent(new CustomEvent("focus-blog-search"));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/30 bg-[#060911]/90 backdrop-blur-md transition-colors shadow-[0_4px_25px_-5px_rgba(0,243,255,0.2)]">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle + Brand & System Status */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="사이드바 메뉴 열기"
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-cyan-500/15 text-neon-cyan border border-cyan-500/30 hover:shadow-neon-cyan transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/50 hover:bg-cyan-500/15 text-neon-cyan border border-cyan-500/40 hover:shadow-neon-cyan transition-all cursor-pointer text-xs font-mono"
          >
            {isSidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-neon-cyan animate-pulse" />
                <span className="font-chakra tracking-wider">SIDEBAR</span>
              </>
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Brand Logo with Orbitron Font & Neon Sign */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-bold text-base sm:text-lg tracking-tight text-white"
          >
            <span className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/60 flex items-center justify-center text-neon-cyan group-hover:shadow-neon-cyan group-hover:scale-105 transition-all">
              <Terminal className="w-4 h-4" />
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-orbitron tracking-wider text-white group-hover:text-neon-cyan group-hover:drop-shadow-[0_0_12px_#00f3ff] transition-all">
                {siteConfig.author}
              </span>
              <span className="text-neon-cyan animate-pulse font-black font-mono">
                ::
              </span>
              <span className="font-orbitron text-xs sm:text-sm px-2 py-0.5 rounded-md font-black uppercase tracking-widest bg-pink-500/10 text-neon-pink border border-pink-500/50 shadow-[0_0_12px_rgba(255,0,127,0.35)] group-hover:shadow-[0_0_18px_rgba(255,0,127,0.6)] transition-all">
                LOG
              </span>
            </span>
          </Link>

          {/* Live HUD Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-chakra tracking-wider text-neon-green shadow-[0_0_10px_rgba(0,255,157,0.2)]">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
            <span>{siteConfig.statusText}</span>
          </div>
        </div>

        {/* Center / Right Navigation */}
        <div className="flex items-center gap-2">
          <nav className="hidden sm:flex items-center gap-1.5 font-chakra text-xs sm:text-sm mr-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                pathname === "/"
                  ? "bg-cyan-500/15 text-neon-cyan border border-cyan-500/50 shadow-neon-cyan font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-neon-cyan" />
              <span>DASHBOARD</span>
            </Link>
            <Link
              href="/#posts"
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20 transition-all tracking-wider"
            >
              <BookOpen className="w-3.5 h-3.5 text-neon-pink" />
              <span>POSTS</span>
            </Link>
            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                pathname?.startsWith("/about")
                  ? "bg-pink-500/15 text-neon-pink border border-pink-500/50 shadow-neon-pink font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-pink-500/20"
              }`}
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>ABOUT</span>
            </Link>
          </nav>

          {/* Desktop Search Button */}
          <button
            type="button"
            onClick={triggerSearchFocus}
            title="포스트 빠른 검색 (Ctrl + K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-black/60 hover:bg-cyan-500/10 text-slate-400 hover:text-slate-200 border border-cyan-500/30 hover:border-neon-cyan hover:shadow-neon-cyan transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="font-chakra tracking-wider">SEARCH...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Ctrl K
            </kbd>
          </button>

          {/* Mobile Quick Search Button */}
          <button
            type="button"
            onClick={triggerSearchFocus}
            aria-label="포스트 검색"
            className="sm:hidden p-2 rounded-xl bg-white/5 hover:bg-cyan-500/15 text-neon-cyan border border-cyan-500/30 hover:shadow-neon-cyan transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-neon-cyan hover:shadow-neon-cyan transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
