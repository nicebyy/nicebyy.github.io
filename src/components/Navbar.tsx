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
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const triggerSearchFocus = () => {
    window.dispatchEvent(new CustomEvent("focus-blog-search"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-cyan-500/20 bg-white/85 dark:bg-[#060911]/85 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & System Status */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-mono font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white"
          >
            <span className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/30 dark:border-cyan-400/40 flex items-center justify-center text-cyan-600 dark:text-neon-cyan group-hover:shadow-neon-cyan group-hover:scale-105 transition-all">
              <Terminal className="w-4 h-4" />
            </span>
            <span className="flex items-center gap-1">
              <span>{siteConfig.author}</span>
              <span className="text-cyan-600 dark:text-neon-cyan">::</span>
              <span className="text-xs sm:text-sm px-1.5 py-0.5 rounded bg-slate-100 dark:bg-cyan-500/10 text-slate-600 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/20">
                log
              </span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-700 dark:text-neon-green">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-neon-green animate-pulse" />
            <span>{siteConfig.statusText}</span>
          </div>
        </div>

        {/* Center / Right Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <nav className="flex items-center gap-1 font-mono text-xs sm:text-sm mr-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                pathname === "/"
                  ? "bg-cyan-500/10 text-cyan-700 dark:text-neon-cyan border border-cyan-500/30 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/#posts"
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Posts</span>
            </Link>
            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                pathname?.startsWith("/about")
                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>About</span>
            </Link>
          </nav>

          <button
            type="button"
            onClick={triggerSearchFocus}
            title="포스트 빠른 검색 (Ctrl + K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-cyan-500/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 dark:hover:border-cyan-500/30 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-neon-cyan" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white dark:bg-black/50 border border-slate-300 dark:border-white/15">
              Ctrl K
            </kbd>
          </button>

          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
          >
            <Github className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="테마 전환"
            title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/10 text-slate-700 dark:text-neon-cyan border border-slate-200 dark:border-cyan-500/30 hover:shadow-neon-cyan transition-all"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
