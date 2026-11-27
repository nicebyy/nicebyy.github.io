import React from "react";
import type { Metadata } from "next";
import { FolderGit2, Sparkles, Terminal, Code2, Layers, Cpu } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ProjectShowcase } from "@/components/ProjectShowcase";

export const metadata: Metadata = {
  title: "Projects",
  description: `${siteConfig.author}의 핵심 개인 프로젝트 (1234pickban, kkt-bookmark, old-calendar, job-blocking, boardgame-calc, pw-manager) 아카이브`,
  openGraph: {
    title: `Projects | ${siteConfig.title}`,
    description: `${siteConfig.author}의 핵심 개인 프로젝트 아카이브`,
    url: `${siteConfig.url}/projects/`,
    siteName: siteConfig.title,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${siteConfig.title} — Projects`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Projects | ${siteConfig.title}`,
    description: `${siteConfig.author}의 핵심 개인 프로젝트 아카이브`,
    images: ["/og-image.png"],
  },
};

export default function ProjectsPage() {
  return (
    <div className="py-4 sm:py-6 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner Card */}
      <section className="rounded-3xl border border-cyan-500/40 bg-[#0b101e]/95 p-6 sm:p-10 shadow-xl shadow-neon-cyan/20 space-y-6 cyber-corner relative">
        <span className="cyber-corner-bracket-tl" />
        <span className="cyber-corner-bracket-tr" />
        <span className="cyber-corner-bracket-bl" />
        <span className="cyber-corner-bracket-br" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-neon-cyan text-xs font-mono shadow-[0_0_10px_rgba(0,243,255,0.3)]">
              <Terminal className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
              <span>OPERATOR LABS // WORKSHOP ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-cyber tracking-wide text-white drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]">
              PERSONAL PROJECTS
            </h1>
            <p className="font-mono text-sm text-pink-400 font-bold">
              {siteConfig.author} · {siteConfig.projects.length} CORE PRODUCTION BUILDS
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/60 border border-cyan-500/30 font-mono text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-neon-green animate-pulse" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Status</p>
              <p className="text-neon-green font-bold">ALL SYSTEMS LIVE</p>
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
          단순한 연습용 토이 프로젝트를 넘어, <strong>실제 겪은 일상의 불편함을 코드로 직접 해결</strong>하고 
          <strong> 0ms 로컬 우선(Local-First), 실시간 양방향 소켓, 브라우저 확장, 암호화 보안 및 크로스 플랫폼</strong>을 
          탐구한 {siteConfig.projects.length}대 핵심 프로젝트 아카이브입니다.
        </p>

        {/* Core Projects Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {siteConfig.projects.map((proj, idx) => {
            const borderColors = [
              "border-cyan-500/30 text-cyan-400",
              "border-pink-500/30 text-pink-400",
              "border-emerald-500/30 text-emerald-400",
              "border-purple-500/30 text-purple-400",
              "border-cyan-500/30 text-cyan-400",
              "border-emerald-500/30 text-emerald-400",
            ];
            const colorClass = borderColors[idx % borderColors.length];
            return (
              <a
                key={proj.id}
                href={`#${proj.id}`}
                className={`p-3 rounded-2xl bg-black/40 border ${colorClass.split(" ")[0]} space-y-1 hover:bg-white/[0.04] hover:scale-[1.02] transition-all block`}
              >
                <p className={`text-[10px] font-mono uppercase tracking-wider ${colorClass.split(" ")[1]}`}>
                  {String(idx + 1).padStart(2, "0")}. {proj.category}
                </p>
                <p className="text-xs sm:text-sm font-bold font-cyber text-white truncate">{proj.id}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{proj.title.split("(")[0].trim()}</p>
              </a>
            );
          })}
        </div>
      </section>

      {/* Main Project Showcase */}
      <ProjectShowcase showTitle={false} />
    </div>
  );
}
