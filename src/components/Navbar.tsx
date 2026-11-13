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
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  FolderGit2,
  Edit3,
  Lock,
  Briefcase,
} from "lucide-react";
import dynamic from "next/dynamic";
import { siteConfig } from "@/config/site";
import { useOperatorAuth } from "@/lib/useOperatorAuth";

const CyberBgmPlayer = dynamic(
  () => import("./CyberBgmPlayer").then((mod) => mod.CyberBgmPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="h-8 w-20 sm:w-24 rounded-xl border border-cyan-500/20 bg-black/40" />
    ),
  }
);

const LoneOperatorHud = dynamic(
  () => import("./LoneOperatorHud").then((mod) => mod.LoneOperatorHud),
  {
    ssr: false,
    loading: () => (
      <div className="h-8 w-14 sm:w-24 rounded-xl border border-cyan-500/20 bg-black/40" />
    ),
  }
);

interface NavbarProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  onOpenContact?: () => void;
  activeSection?: "dashboard" | "posts" | "projects" | "about";
  onSelectSection?: (section: "dashboard" | "posts" | "projects" | "about") => void;
}

export function Navbar({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
  onOpenContact,
  activeSection = "dashboard",
  onSelectSection,
}: NavbarProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useOperatorAuth();

  const triggerSearchFocus = () => {
    window.dispatchEvent(new CustomEvent("focus-blog-search"));
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    onSelectSection?.("dashboard");
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
    }
  };

  const handlePostsClick = (e: React.MouseEvent) => {
    onSelectSection?.("posts");
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("posts");
      el?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "/#posts");
      window.dispatchEvent(
        new CustomEvent("sidebar-select-category", { detail: "ALL" })
      );
    }
  };

  const handleProjectsClick = (e: React.MouseEvent) => {
    onSelectSection?.("projects");
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("projects");
      el?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "/#projects");
    }
  };


  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/30 bg-[#060911]/90 backdrop-blur-md transition-colors shadow-[0_4px_25px_-5px_rgba(0,243,255,0.2)]">
      <div className="px-2.5 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar Toggle + Brand & System Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="사이드바 메뉴 열기"
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-cyan-500/15 text-neon-cyan border border-cyan-500/30 hover:shadow-neon-cyan transition-all cursor-pointer shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/50 hover:bg-cyan-500/15 text-neon-cyan border border-cyan-500/40 hover:shadow-neon-cyan transition-all cursor-pointer text-xs font-mono shrink-0"
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
            className="group flex items-center gap-2 sm:gap-2.5 font-bold text-sm sm:text-lg tracking-tight text-white min-w-0"
          >
            <span className="hidden min-[400px]:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/60 items-center justify-center text-neon-cyan group-hover:shadow-neon-cyan group-hover:scale-105 transition-all shrink-0">
              <Terminal className="w-4 h-4" />
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="font-cyber font-black tracking-wider text-white group-hover:text-neon-cyan group-hover:drop-shadow-[0_0_12px_#00f3ff] transition-all truncate">
                {siteConfig.author}
              </span>
              <span className="text-neon-cyan animate-pulse font-black font-mono shrink-0">
                ::
              </span>
              <span className="font-orbitron text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 rounded-md font-black uppercase tracking-widest bg-pink-500/10 text-neon-pink border border-pink-500/50 shadow-[0_0_12px_rgba(255,0,127,0.35)] group-hover:shadow-[0_0_18px_rgba(255,0,127,0.6)] transition-all shrink-0">
                LOG
              </span>
            </span>
          </Link>

          {/* Live HUD Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-chakra tracking-wider text-neon-green shadow-[0_0_10px_rgba(0,255,157,0.2)] shrink-0">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
            <span>{siteConfig.statusText}</span>
          </div>
        </div>

        {/* Center / Right Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <nav className="hidden md:flex items-center gap-1.5 font-chakra text-xs sm:text-sm mr-1">
            <Link
              href="/"
              onClick={handleDashboardClick}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                activeSection === "dashboard" && pathname === "/"
                  ? "bg-cyan-500/15 text-neon-cyan border border-cyan-500/50 shadow-neon-cyan font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-neon-cyan" />
              <span>DASHBOARD</span>
            </Link>
            <Link
              href="/projects"
              onClick={handleProjectsClick}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                (activeSection === "projects" && pathname === "/") || pathname?.startsWith("/projects")
                  ? "bg-cyan-500/15 text-neon-cyan border border-cyan-500/50 shadow-neon-cyan font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>PROJECTS</span>
            </Link>
            <Link
              href="/career"
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                pathname?.startsWith("/career")
                  ? "bg-emerald-500/15 text-neon-green border border-emerald-500/50 shadow-neon-green font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-emerald-500/20"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>CAREER</span>
            </Link>
            <Link
              href="/#posts"
              onClick={handlePostsClick}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                activeSection === "posts" && (pathname === "/" || pathname.startsWith("/posts/"))
                  ? "bg-pink-500/15 text-neon-pink border border-pink-500/50 shadow-neon-pink font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-pink-500/20"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-neon-pink" />
              <span>POSTS</span>
            </Link>
            <Link
              href="/studio"
              title={isAuthenticated ? "스튜디오 (운영자 로그인됨)" : "스튜디오 (운영자 전용)"}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                pathname?.startsWith("/studio")
                  ? "bg-cyan-500/15 text-neon-cyan border border-cyan-500/50 shadow-neon-cyan font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
              }`}
            >
              {isAuthenticated ? (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>STUDIO</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>STUDIO</span>
                </>
              )}
            </Link>
            <Link
              href="/about"
              onClick={() => onSelectSection?.("about")}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider ${
                pathname?.startsWith("/about")
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/50 shadow-neon-purple font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-purple-500/20"
              }`}
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>ABOUT</span>
            </Link>
            <button
              type="button"
              onClick={onOpenContact}
              title="문의하기 (nicebyy@naver.com)"
              className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all tracking-wider text-slate-400 hover:text-neon-green hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 hover:shadow-neon-green cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-neon-green" />
              <span>CONTACT</span>
            </button>
          </nav>

          {/* Cyberpunk HUD BGM Player */}
          <CyberBgmPlayer />

          {/* Isolated Solo Operator Radar & Rain Ambience Dropdown */}
          <LoneOperatorHud />

          {/* Desktop Search Button */}
          <button
            type="button"
            onClick={triggerSearchFocus}
            title="포스트 빠른 검색 (Ctrl + K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-black/60 hover:bg-cyan-500/10 text-slate-400 hover:text-slate-200 border border-cyan-500/30 hover:border-neon-cyan hover:shadow-neon-cyan transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="font-chakra tracking-wider hidden lg:inline">SEARCH...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Ctrl K
            </kbd>
          </button>

          {/* Quick Contact Button (Desktop & Mobile) */}
          <button
            type="button"
            onClick={onOpenContact}
            aria-label="문의하기 (이메일)"
            title="문의하기 (nicebyy@naver.com)"
            className="p-2 rounded-xl text-slate-400 hover:text-neon-green bg-white/5 hover:bg-emerald-500/15 border border-cyan-500/20 hover:border-emerald-500/40 hover:shadow-neon-green transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-neon-green" />
          </button>

          {/* Mobile Studio Button */}
          <Link
            href="/studio"
            aria-label="스튜디오 // 글 작성 및 관리"
            title={isAuthenticated ? "스튜디오 (운영자 모드)" : "스튜디오 (운영자 로그인 필요)"}
            className={`md:hidden p-2 rounded-xl border transition-all cursor-pointer relative ${
              pathname?.startsWith("/studio")
                ? "bg-cyan-500/20 text-neon-cyan border-cyan-500/50 shadow-neon-cyan"
                : "text-slate-400 hover:text-neon-cyan bg-white/5 hover:bg-cyan-500/15 border-cyan-500/20 hover:border-cyan-500/40"
            }`}
          >
            {isAuthenticated ? (
              <>
                <Edit3 className="w-4 h-4 text-neon-cyan" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </>
            ) : (
              <Lock className="w-4 h-4 text-slate-400" />
            )}
          </Link>

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
            className="hidden min-[380px]:inline-flex p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-neon-cyan hover:shadow-neon-cyan transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
