import React from "react";
import { Terminal, Github, Cpu, Code2, Globe, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "About",
  description: `${siteConfig.author} 프로필 및 기술 스택 소개`,
};

export default function AboutPage() {
  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <section className="rounded-3xl border border-slate-200 dark:border-cyan-500/40 bg-white/95 dark:bg-[#0b101e]/95 p-6 sm:p-10 shadow-xl dark:shadow-[0_0_30px_rgba(0,243,255,0.2)] space-y-6 cyber-corner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-cyan-500/20">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-neon-cyan text-xs font-mono dark:shadow-[0_0_10px_rgba(0,243,255,0.3)]">
              <Terminal className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
              <span>OPERATOR PROFILE // {siteConfig.author.toUpperCase()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight dark:drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
              {siteConfig.author}
            </h1>
            <p className="font-mono text-sm text-pink-600 dark:text-neon-pink font-bold">
              {siteConfig.role} · {siteConfig.location}
            </p>
          </div>

          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-slate-900 dark:bg-cyan-500/15 text-white dark:text-neon-cyan border border-slate-800 dark:border-neon-cyan/40 hover:opacity-90 transition-all self-start"
          >
            <Github className="w-4 h-4" />
            <span>github.com/{siteConfig.githubUsername}</span>
          </a>
        </div>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
          {siteConfig.bio} 이 블로그는 <strong>Next.js Static Export</strong>와{" "}
          <strong>GitHub Pages</strong>를 활용해 구축한 개인 개발 아카이브입니다.
        </p>

        {/* Tech Stack Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-neon-cyan flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            <span>TECH STACK & CAPABILITIES</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {siteConfig.techStack.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-cyan-600 dark:text-neon-cyan">
                    {item.level}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400"
                    style={{ width: `${item.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Quick Guide */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.05] p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
            <Sparkles className="w-4 h-4" />
            <span>HOW TO CUSTOMIZE THIS PAGE</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            프로필 소개글, 역할, 기술 스택 게이지, GitHub 주소는{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono">
              src/config/site.ts
            </code>{" "}
            파일에서 수정하면 홈페이지 전체에 즉시 반영됩니다.
          </p>
        </div>
      </section>
    </div>
  );
}
