"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Bookmark,
  Calendar,
  ShieldCheck,
  Github,
  ExternalLink,
  Layers,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Chrome,
  Store,
  Globe,
  Lock,
  X,
} from "lucide-react";
import { projectsData, ProjectItem, ProjectPlatformType } from "@/config/projects";

const iconMap = {
  gamepad: Gamepad2,
  bookmark: Bookmark,
  calendar: Calendar,
  shield: ShieldCheck,
};

const colorConfig = {
  cyan: {
    border: "border-cyan-500/40 hover:border-neon-cyan",
    glow: "hover:shadow-neon-cyan shadow-[0_0_20px_rgba(0,243,255,0.15)]",
    badgeBg: "bg-cyan-500/10 text-neon-cyan border-cyan-500/40",
    iconBg: "bg-cyan-500/15 text-neon-cyan border-cyan-500/50",
    text: "text-neon-cyan",
    bullet: "text-cyan-400",
  },
  pink: {
    border: "border-pink-500/40 hover:border-neon-pink",
    glow: "hover:shadow-neon-pink shadow-[0_0_20px_rgba(255,0,127,0.15)]",
    badgeBg: "bg-pink-500/10 text-neon-pink border-pink-500/40",
    iconBg: "bg-pink-500/15 text-neon-pink border-pink-500/50",
    text: "text-neon-pink",
    bullet: "text-pink-400",
  },
  emerald: {
    border: "border-emerald-500/40 hover:border-neon-green",
    glow: "hover:shadow-neon-green shadow-[0_0_20px_rgba(0,255,157,0.15)]",
    badgeBg: "bg-emerald-500/10 text-neon-green border-emerald-500/40",
    iconBg: "bg-emerald-500/15 text-neon-green border-emerald-500/50",
    text: "text-neon-green",
    bullet: "text-emerald-400",
  },
  purple: {
    border: "border-purple-500/40 hover:border-neon-purple",
    glow: "hover:shadow-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/40",
    iconBg: "bg-purple-500/15 text-purple-300 border-purple-500/50",
    text: "text-purple-300",
    bullet: "text-purple-400",
  },
};

interface ProjectShowcaseProps {
  showTitle?: boolean;
  limit?: number;
  highlightedId?: string;
}

export function ProjectShowcase({
  showTitle = true,
  limit,
  highlightedId,
}: ProjectShowcaseProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!activeModalProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalProject(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModalProject]);

  const categories = ["ALL", "Full-Stack Web", "Mobile & Web App", "Desktop Application", "Browser Extension"];

  const filteredProjects = projectsData
    .filter((p) => selectedFilter === "ALL" || p.category === selectedFilter)
    .slice(0, limit ?? projectsData.length);

  return (
    <section id="projects" className="space-y-6 pt-2 pb-6">
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-neon-cyan text-xs font-mono shadow-[0_0_10px_rgba(0,243,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
              <span>PROJECTS ARCHIVE // FEATURED BUILDS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-cyber tracking-wide text-white drop-shadow-[0_0_12px_rgba(0,243,255,0.3)]">
              FEATURED PROJECTS
            </h2>
            <p className="text-xs sm:text-sm font-chakra text-slate-300 max-w-2xl leading-relaxed">
              단순한 토이를 넘어 실제 사용자 가치와 문제 해결, 0ms 무지연 로컬 우선 및 엔터프라이즈 아키텍처를 탐구한 4대 핵심 개인 프로젝트입니다.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500/15 text-neon-cyan border border-cyan-500/40 hover:bg-cyan-500/25 hover:shadow-neon-cyan transition-all self-start sm:self-auto shrink-0"
          >
            <span>전체 아카이브 보기</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Category Filter Pills (Mobile Horizontal Swipe) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0 sm:flex-wrap">
        <span className="text-[11px] font-chakra text-slate-400 mr-1 flex items-center gap-1 tracking-wider shrink-0">
          <Layers className="w-3.5 h-3.5 text-neon-cyan" />
          <span>FILTER:</span>
        </span>
        {categories.map((cat) => {
          const isActive = selectedFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer shrink-0 active:scale-95 ${
                isActive
                  ? "bg-cyan-500/25 text-neon-cyan border border-cyan-500/60 shadow-neon-cyan font-bold"
                  : "bg-black/50 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {filteredProjects.map((project) => {
          const IconComponent = iconMap[project.iconName] || Layers;
          const styles = colorConfig[project.accentColor] || colorConfig.cyan;
          const isHighlighted = highlightedId === project.id;

          return (
            <article
              key={project.id}
              id={project.id}
              className={`rounded-2xl border ${styles.border} bg-[#0b101e]/95 p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between gap-5 cyber-corner relative group ${styles.glow} ${
                isHighlighted ? "ring-2 ring-neon-cyan ring-offset-2 ring-offset-black" : ""
              }`}
            >
              <span className="cyber-corner-bracket-tl" />
              <span className="cyber-corner-bracket-tr" />
              <span className="cyber-corner-bracket-bl" />
              <span className="cyber-corner-bracket-br" />

              <div className="space-y-4">
                {/* Header: Icon, Category & Status Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${styles.iconBg} border flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${styles.badgeBg} uppercase tracking-wider font-bold shrink-0`}>
                      {project.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-black/60 border border-white/10 text-emerald-400 shrink-0">
                    {project.status}
                  </span>
                </div>

                {/* Full-width Title & Subtitle: No Truncate, Clean Word Wrap */}
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold font-cyber text-white group-hover:text-neon-cyan transition-colors leading-snug break-keep">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-slate-400 break-keep">
                    {project.subtitle}
                  </p>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed line-clamp-2">
                  {project.summary}
                </p>

                {/* Key Features Bullets */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    // KEY HIGHLIGHTS
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {project.keyFeatures.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className={`w-3.5 h-3.5 ${styles.bullet} shrink-0 mt-0.5`} />
                        <span className="line-clamp-1 leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Architecture / Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] font-mono">
                  {project.metrics.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-black/50 border border-white/5 space-y-0.5">
                      <p className="text-[9.5px] text-slate-400 uppercase tracking-tight truncate">
                        {m.label}
                      </p>
                      <p className={`font-bold text-[10px] sm:text-[11px] truncate ${styles.text}`}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.04] text-slate-300 border border-white/10 group-hover:border-cyan-500/30 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-1.5 min-w-0">
                  <a
                    href={project.primaryLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer truncate ${
                      project.primaryLink.type === "microsoft"
                        ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-neon-green border border-emerald-500/40 hover:shadow-neon-green"
                        : project.primaryLink.type === "chrome"
                        ? "bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 hover:shadow-neon-purple"
                        : project.primaryLink.type === "web"
                        ? "bg-cyan-500/15 hover:bg-cyan-500/25 text-neon-cyan border border-cyan-500/40 hover:shadow-neon-cyan"
                        : "bg-pink-500/15 hover:bg-pink-500/25 text-neon-pink border border-pink-500/40 hover:shadow-neon-pink"
                    }`}
                  >
                    {project.primaryLink.type === "microsoft" && <Store className="w-3.5 h-3.5 shrink-0" />}
                    {project.primaryLink.type === "chrome" && <Chrome className="w-3.5 h-3.5 shrink-0" />}
                    {project.primaryLink.type === "web" && <Globe className="w-3.5 h-3.5 shrink-0" />}
                    {project.primaryLink.type === "github" && <Github className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{project.primaryLink.label}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                  </a>

                  {/* Secondary GitHub Repo link (only if public githubUrl exists and primary is not github) */}
                  {project.githubUrl && project.primaryLink.type !== "github" && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub 오픈소스 저장소"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-slate-300 transition-all cursor-pointer shrink-0"
                      aria-label="GitHub 저장소"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">코드</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalProject(project)}
                  className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${styles.badgeBg} hover:opacity-90 shrink-0`}
                >
                  <span>상세 스펙</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {activeModalProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveModalProject(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] rounded-3xl border border-cyan-500/50 bg-[#090e1a] shadow-[0_0_50px_rgba(0,243,255,0.3)] relative cyber-corner flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Cyber Corner Brackets (Stay permanently anchored to dialog corners, never drift or cut through text) */}
            <span className="cyber-corner-bracket-tl" />
            <span className="cyber-corner-bracket-tr" />
            <span className="cyber-corner-bracket-bl" />
            <span className="cyber-corner-bracket-br" />

            {/* Pinned Modal Header */}
            <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-cyan-500/25 bg-[#080d1a] z-10 shrink-0">
              <div className="space-y-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-neon-cyan border border-cyan-500/30 uppercase tracking-wider font-bold">
                    {activeModalProject.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-emerald-400 border border-emerald-500/30 font-bold whitespace-nowrap">
                    {activeModalProject.status}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black font-cyber text-white break-keep leading-tight drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                  {activeModalProject.title}
                </h3>
                <p className="font-mono text-xs sm:text-sm text-pink-400 break-keep">
                  {activeModalProject.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalProject(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-pink-500/20 text-slate-400 hover:text-neon-pink border border-white/10 hover:border-pink-500/40 cursor-pointer transition-all shrink-0 active:scale-95"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Body (Isolated scroll container, custom scrollbar) */}
            <div className="flex-1 overflow-y-auto cyber-scrollbar px-5 sm:px-7 py-5 space-y-6 min-h-0 bg-[#090e1a]/80">
              {/* Full Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-neon-cyan flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
                  <span>PROJECT OVERVIEW</span>
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed font-sans break-keep">
                  {activeModalProject.description}
                </p>
              </div>

              {/* Full Key Features */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold text-neon-pink flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neon-pink" />
                  <span>KEY CAPABILITIES & FEATURES</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {activeModalProject.keyFeatures.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-xl border border-white/5 hover:border-cyan-500/20 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
                      <span className="break-keep">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architecture / Metrics */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-neon-green flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neon-green" />
                  <span>CORE ARCHITECTURE & METRICS</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {activeModalProject.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1"
                    >
                      <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                        {m.label}
                      </p>
                      <p className="font-bold text-neon-cyan text-xs sm:text-sm">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Tech Stack */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-neon-green flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neon-green" />
                  <span>TECH STACK & TOOLS</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalProject.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 text-slate-200 border border-white/10 shadow-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pinned Modal Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t border-cyan-500/25 bg-[#080d1a] z-10 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-300 break-keep">
                  Status: <strong className="text-white whitespace-nowrap">{activeModalProject.status}</strong>
                </span>
                {!activeModalProject.githubUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 whitespace-nowrap">
                    <Lock className="w-3 h-3" />
                    <span>Private Repo</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={activeModalProject.primaryLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer active:scale-95 ${
                    activeModalProject.primaryLink.type === "microsoft"
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-neon-green border border-emerald-500/50 hover:shadow-neon-green"
                      : activeModalProject.primaryLink.type === "chrome"
                      ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 hover:shadow-neon-purple"
                      : activeModalProject.primaryLink.type === "web"
                      ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-neon-cyan border border-cyan-500/50 hover:shadow-neon-cyan"
                      : "bg-pink-500/20 hover:bg-pink-500/30 text-neon-pink border border-pink-500/50 hover:shadow-neon-pink"
                  }`}
                >
                  {activeModalProject.primaryLink.type === "microsoft" && <Store className="w-4 h-4" />}
                  {activeModalProject.primaryLink.type === "chrome" && <Chrome className="w-4 h-4" />}
                  {activeModalProject.primaryLink.type === "web" && <Globe className="w-4 h-4" />}
                  {activeModalProject.primaryLink.type === "github" && <Github className="w-4 h-4" />}
                  <span>{activeModalProject.primaryLink.label} 바로가기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {activeModalProject.githubUrl && activeModalProject.primaryLink.type !== "github" && (
                  <a
                    href={activeModalProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15 hover:border-slate-300 transition-all cursor-pointer active:scale-95"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub 저장소</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
