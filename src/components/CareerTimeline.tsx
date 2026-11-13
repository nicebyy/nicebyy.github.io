"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  Wrench,
  Trophy,
  Lock,
  Sparkles,
  ExternalLink,
  Code2,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import {
  careerCompaniesData,
  CareerCompany,
  CareerProject,
} from "@/config/career";

const companyColorTheme: Record<
  string,
  {
    border: string;
    glow: string;
    badgeBg: string;
    text: string;
    accent: string;
    bgHover: string;
  }
> = {
  "company-g": {
    border: "border-emerald-500/40 hover:border-neon-green",
    glow: "hover:shadow-neon-green shadow-[0_0_25px_rgba(0,255,157,0.12)]",
    badgeBg: "bg-emerald-500/15 text-neon-green border-emerald-500/40",
    text: "text-neon-green",
    accent: "text-emerald-400",
    bgHover: "hover:bg-emerald-500/10",
  },
  "company-c": {
    border: "border-cyan-500/40 hover:border-neon-cyan",
    glow: "hover:shadow-neon-cyan shadow-[0_0_25px_rgba(0,243,255,0.12)]",
    badgeBg: "bg-cyan-500/15 text-neon-cyan border-cyan-500/40",
    text: "text-neon-cyan",
    accent: "text-cyan-400",
    bgHover: "hover:bg-cyan-500/10",
  },
  "company-a": {
    border: "border-purple-500/40 hover:border-neon-purple",
    glow: "hover:shadow-neon-purple shadow-[0_0_25px_rgba(168,85,247,0.12)]",
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/40",
    text: "text-purple-300",
    accent: "text-purple-400",
    bgHover: "hover:bg-purple-500/10",
  },
};

export function CareerTimeline() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    "chew-chew-batch": true,
    "shibarise-v1": true,
    "metamatch-admin": true,
    "aladdin-exchange": true,
    "buyaladdin-seller": true,
  });

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    careerCompaniesData.forEach((comp) => {
      comp.projects.forEach((proj) => {
        allExpanded[proj.id] = true;
      });
    });
    setExpandedProjects(allExpanded);
  };

  const collapseAll = () => {
    setExpandedProjects({});
  };

  const filteredCompanies = careerCompaniesData.filter(
    (comp) => selectedFilter === "ALL" || comp.id === selectedFilter
  );

  return (
    <div className="space-y-8">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-cyan-500/20 backdrop-blur-sm">
        {/* Company Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0">
          <span className="text-[11px] font-chakra text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-neon-cyan" />
            <span>FILTER:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 active:scale-95 ${
              selectedFilter === "ALL"
                ? "bg-cyan-500/25 text-neon-cyan border border-cyan-500/60 shadow-neon-cyan font-bold"
                : "bg-black/50 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
            }`}
          >
            전체 보기 (3개사)
          </button>
          {careerCompaniesData.map((comp) => {
            const isActive = selectedFilter === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedFilter(comp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-cyan-500/25 text-neon-cyan border border-cyan-500/60 shadow-neon-cyan font-bold"
                    : "bg-black/50 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
                }`}
              >
                <span>{comp.alias}</span>
                <span className="text-[10px] opacity-70">({comp.totalDuration})</span>
              </button>
            );
          })}
        </div>

        {/* Global Expand / Collapse Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            전체 펼치기
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            전체 접기
          </button>
        </div>
      </div>

      {/* Companies Timeline List */}
      <div className="space-y-10">
        {filteredCompanies.map((company, cIndex) => {
          const theme = companyColorTheme[company.id] || companyColorTheme["company-g"];

          return (
            <article
              key={company.id}
              className={`rounded-3xl border ${theme.border} bg-[#0b101e]/95 p-6 sm:p-8 space-y-6 cyber-corner relative group ${theme.glow} transition-all duration-300`}
            >
              <span className="cyber-corner-bracket-tl" />
              <span className="cyber-corner-bracket-tr" />
              <span className="cyber-corner-bracket-bl" />
              <span className="cyber-corner-bracket-br" />

              {/* Company Header Block */}
              <div className="space-y-3 pb-5 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Alias Pill */}
                    <div
                      className={`w-10 h-10 rounded-xl ${theme.badgeBg} border flex items-center justify-center font-black font-cyber text-base shadow-md`}
                    >
                      {company.alias}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${theme.badgeBg} uppercase tracking-wider`}>
                          {company.industry}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <Lock className="w-3 h-3" />
                          <span>{company.confidentialBadge}</span>
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wide mt-1 break-keep">
                        {company.name}
                      </h2>
                    </div>
                  </div>

                  {/* Period Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-slate-300 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-neon-cyan" />
                    <span>{company.period}</span>
                    <span className={`font-bold ${theme.text}`}>({company.totalDuration})</span>
                  </div>
                </div>

                {/* Team & Position */}
                <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-white font-bold">{company.team}</span>
                  <span>·</span>
                  <span className="text-pink-400 font-bold">{company.position}</span>
                </div>

                {/* Company Summary Description */}
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed break-keep">
                  {company.description}
                </p>

                {/* Core Tech Stack */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {company.coreTech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.04] text-slate-300 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Company's Projects Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Cpu className={`w-3.5 h-3.5 ${theme.text}`} />
                    <span>MAJOR PROJECTS ({company.projects.length})</span>
                  </h3>
                </div>

                <div className="space-y-5">
                  {company.projects.map((project, pIndex) => {
                    const isExpanded = !!expandedProjects[project.id];

                    return (
                      <div
                        key={project.id}
                        className="rounded-2xl border border-white/10 bg-black/50 p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all"
                      >
                        {/* Project Header */}
                        <div
                          className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 cursor-pointer select-none"
                          onClick={() => toggleProject(project.id)}
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 font-bold">
                                PROJECT #{pIndex + 1}
                              </span>
                              <span className="text-xs font-mono text-slate-400">
                                {project.period} ({project.duration})
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-bold font-cyber text-white group-hover:text-neon-cyan transition-colors break-keep">
                              {project.name}
                            </h4>
                            <p className="text-xs font-mono text-slate-400 leading-relaxed">
                              {project.overview}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-neon-cyan bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all shrink-0 self-start cursor-pointer"
                            aria-label={isExpanded ? "상세 성과 접기" : "상세 성과 펼치기"}
                          >
                            <span>{isExpanded ? "상세 접기" : "상세 성과 (STAR) 보기"}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Role Summary */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-slate-300 flex items-start gap-2">
                          <span className="text-neon-cyan font-bold shrink-0">// ROLE:</span>
                          <span className="break-keep">{project.role}</span>
                        </div>

                        {/* Tech Stack Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/[0.03] text-slate-400 border border-white/5"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Collapsible Detailed STAR Achievements */}
                        {isExpanded && (
                          <div className="space-y-4 pt-4 border-t border-white/10 animate-fadeIn">
                            <h5 className="text-xs font-mono font-bold text-neon-cyan flex items-center gap-1.5 uppercase tracking-wider">
                              <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                              <span>담당 역할 및 핵심 문제 해결 내역 (STAR)</span>
                            </h5>

                            <div className="space-y-4">
                              {project.achievements.map((ach, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="rounded-xl border border-white/10 bg-black/40 p-4 sm:p-5 space-y-3 relative overflow-hidden"
                                >
                                  {/* Achievement Title */}
                                  <div className="flex items-start gap-2">
                                    <span className="text-neon-pink font-mono text-xs font-bold shrink-0 mt-0.5">
                                      {String(aIdx + 1).padStart(2, "0")}.
                                    </span>
                                    <h6 className="font-bold text-sm sm:text-base text-white break-keep leading-snug">
                                      {ach.title}
                                    </h6>
                                  </div>

                                  {/* Problem Box (if exists) */}
                                  {ach.problem && (
                                    <div className="rounded-lg bg-rose-500/[0.06] border border-rose-500/20 p-3 text-xs leading-relaxed space-y-1">
                                      <p className="font-mono text-[10.5px] font-bold text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>배경 및 문제점 (Problem)</span>
                                      </p>
                                      <p className="text-slate-300 font-sans break-keep pl-4">
                                        {ach.problem}
                                      </p>
                                    </div>
                                  )}

                                  {/* Action Box */}
                                  <div className="rounded-lg bg-cyan-500/[0.06] border border-cyan-500/20 p-3 text-xs leading-relaxed space-y-1">
                                    <p className="font-mono text-[10.5px] font-bold text-neon-cyan flex items-center gap-1 uppercase tracking-wider">
                                      <Wrench className="w-3.5 h-3.5 shrink-0" />
                                      <span>해결 과정 및 구현 (Action)</span>
                                    </p>
                                    <p className="text-slate-200 font-sans break-keep pl-4">
                                      {ach.action}
                                    </p>
                                  </div>

                                  {/* Result Box */}
                                  <div className="rounded-lg bg-emerald-500/[0.08] border border-emerald-500/30 p-3 text-xs leading-relaxed space-y-1">
                                    <p className="font-mono text-[10.5px] font-bold text-neon-green flex items-center gap-1 uppercase tracking-wider">
                                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                                      <span>핵심 성과 및 정량적 결과 (Result)</span>
                                    </p>
                                    <p className="text-emerald-200 font-sans font-semibold break-keep pl-4">
                                      {ach.result}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
