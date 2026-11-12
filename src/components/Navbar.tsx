"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Sun,
  Moon,
  Github,
  Search,
  Cpu,
  BookOpen,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
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
  const { theme, toggleTheme } = useTheme();

  const triggerSearchFocus = () => {
    window.dispatchEvent(new CustomEvent("focus-blog-search"));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-cyan-500/30 bg-white/85 dark:bg-[#060911]/90 backdrop-blur-md transition-colors dark:shadow-[0_4px_25px_-5px_rgba(0,243,255,0.2)]">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle + Brand & System Status */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="사이드바 메뉴 열기"
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/15 text-slate-700 dark:text-neon-cyan border border-slate-200 dark:border-cyan-500/30 dark:hover:shadow-neon-cyan transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/15 text-slate-700 dark:text-neon-cyan border border-slate-200 dark:border-cyan-500/40 dark:hover:shadow-neon-cyan transition-all cursor-pointer text-xs font-mono"
          >
            {isSidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-neon-cyan animate-pulse" />
                <span>SIDEBAR</span>
              </>
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Brand Logo with Neon Sign Effect */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-mono font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white"
          >
            <span className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/30 dark:border-cyan-400/60 flex items-center justify-center text-cyan-600 dark:text-neon-cyan group-hover:shadow-neon-cyan group-hover:scale-105 transition-all">
              <Terminal className="w-4 h-4" />
            </span>
            <span className="flex items-center gap-1.5">
              <span className="dark:text-white dark:group-hover:text-neon-cyan dark:group-hover:drop-shadow-[0_0_12px_#00f3ff] transition-all">
                {siteConfig.author}
              </span>
              <span className="text-cyan-500 dark:text-neon-cyan animate-pulse font-black">
                ::
              </span>
              <span className="text-xs sm:text-sm px-2 py-0.5 rounded-md font-mono font-black uppercase tracking-wider bg-slate-100 dark:bg-pink-500/10 text-slate-700 dark:text-neon-pink border border-slate-200 dark:border-pink-500/50 dark:shadow-[0_0_12px_rgba(255,0,127,0.35)] group-hover:dark:shadow-[0_0_18px_rgba(255,0,127,0.6)] transition-all">
                LOG
              </span>
            </span>
          </Link>

          {/* Live HUD Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-700 dark:text-neon-green dark:shadow-[0_0_10px_rgba(0,255,157,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-neon-green animate-ping" />
            <span>{siteConfig.statusText}</span>
          </div>
        </div>

        {/* Center / Right Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <nav className="hidden sm:flex items-center gap-1 font-mono text-xs sm:text-sm mr-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                pathname === "/"
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-neon-cyan border border-cyan-500/50 dark:shadow-neon-cyan font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-cyan-500/20"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/#posts"
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-cyan-500/20 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-neon-pink" />
              <span>Posts</span>
            </Link>
            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                pathname?.startsWith("/about")
                  ? "bg-pink-500/15 text-pink-700 dark:text-neon-pink border border-pink-500/50 dark:shadow-neon-pink font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-pink-500/20"
              }`}
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>About</span>
            </Link>
          </nav>

          <button
            type="button"
            onClick={triggerSearchFocus}
            title="포스트 빠른 검색 (Ctrl + K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-100 dark:bg-black/50 hover:bg-slate-200/70 dark:hover:bg-cyan-500/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-cyan-500/30 dark:hover:border-neon-cyan dark:hover:shadow-neon-cyan transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-neon-cyan" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/30">
              Ctrl K
            </kbd>
          </button>

          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 dark:hover:shadow-neon-purple transition-all"
          >
            <Github className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="테마 전환"
            title={theme === "dark" ? "라이트 모드로 전환" : "사이버펑크 네온 다크 모드로 전환"}
            className="p-2 rounded-xl bg-slate-100 dark:bg-cyan-500/10 hover:bg-cyan-500/20 text-slate-700 dark:text-neon-cyan border border-slate-200 dark:border-cyan-500/40 hover:shadow-neon-cyan transition-all cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-neon-amber animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
