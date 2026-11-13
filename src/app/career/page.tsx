import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Terminal,
  Sparkles,
  ShieldCheck,
  Lock,
  Layers,
  Cpu,
  Mail,
  Send,
  ArrowUpRight,
  Database,
  CheckCircle2,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { CareerTimeline } from "@/components/CareerTimeline";
import { careerSummaryStats } from "@/config/career";

export const metadata: Metadata = {
  title: "Career",
  description: `${siteConfig.author}의 실무 경력 및 엔지니어링 프로젝트 아카이브 (핀테크, 거래소, 대용량 정산 & Web3 풀스택)`,
  openGraph: {
    title: `Career | ${siteConfig.title}`,
    description: `${siteConfig.author}의 실무 경력 및 엔지니어링 문제 해결 아카이브`,
    url: `${siteConfig.url}/career/`,
    siteName: siteConfig.title,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${siteConfig.title} — Career Experience`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Career | ${siteConfig.title}`,
    description: `${siteConfig.author}의 실무 경력 및 엔지니어링 문제 해결 아카이브`,
    images: ["/og-image.png"],
  },
};

export default function CareerPage() {
  return (
    <div className="py-4 sm:py-6 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner Card */}
      <section className="rounded-3xl border border-emerald-500/40 bg-[#0b101e]/95 p-6 sm:p-10 shadow-xl shadow-neon-green/20 space-y-6 cyber-corner relative">
        <span className="cyber-corner-bracket-tl" />
        <span className="cyber-corner-bracket-tr" />
        <span className="cyber-corner-bracket-bl" />
        <span className="cyber-corner-bracket-br" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-neon-green text-xs font-mono shadow-[0_0_10px_rgba(0,255,157,0.3)]">
              <Terminal className="w-3.5 h-3.5 text-neon-green animate-pulse" />
              <span>OPERATOR RESUME // WORK EXPERIENCE ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-cyber tracking-wide text-white drop-shadow-[0_0_15px_rgba(0,255,157,0.4)]">
              CAREER & EXPERIENCE
            </h1>
            <p className="font-mono text-sm text-pink-400 font-bold">
              {siteConfig.author} · 3 COMPANIES · BACKEND & FULL-STACK ENGINEER
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/60 border border-emerald-500/30 font-mono text-xs text-slate-300 shrink-0">
            <Briefcase className="w-4 h-4 text-neon-green animate-pulse" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Career Span</p>
              <p className="text-neon-green font-bold">약 3년 (33개월)</p>
            </div>
          </div>
        </div>

        {/* Confidentiality Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-slate-200">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed break-keep">
            <strong className="text-amber-300 font-bold">비공개 원칙 안내: </strong>
            본 페이지에 수록된 재직 회사명은 보안 및 비공개 요청에 따라 익명(<strong>A사</strong>, <strong>C사</strong>, <strong>G사</strong>)으로 보호 처리되어 있습니다.
            수행한 프로젝트의 도메인 아키텍처, 성능 튜닝, 문제 해결(STAR) 및 수치 성과는 실제 프로덕션 실무 경험을 100% 사실에 입각하여 정리한 내역입니다.
          </p>
        </div>

        {/* 4 Key Pillars Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {careerSummaryStats.map((stat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 hover:border-emerald-500/40 transition-colors"
            >
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-sm sm:text-base font-bold font-cyber text-neon-green truncate">
                {stat.value}
              </p>
              <p className="text-[11px] font-sans text-slate-400 leading-snug line-clamp-2">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Career Timeline Showcase */}
      <CareerTimeline />

      {/* Career Inquiry / Contact Card */}
      <section className="rounded-3xl border border-cyan-500/40 bg-[#0b101e]/95 p-6 sm:p-8 space-y-4 cyber-corner relative">
        <span className="cyber-corner-bracket-tl" />
        <span className="cyber-corner-bracket-tr" />
        <span className="cyber-corner-bracket-bl" />
        <span className="cyber-corner-bracket-br" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold font-cyber text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-neon-cyan" />
              <span>CAREER INQUIRY & DETAILED CV</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed break-keep">
              실무 경력에 대한 상세 인터뷰, 기술 스택 질의 또는 채용 제안은 아래 이메일로 연락주시면 신속하게 회신드리겠습니다.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <code className="hidden md:inline-block font-mono text-xs sm:text-sm font-bold text-neon-cyan p-2.5 rounded-xl bg-black/60 border border-cyan-500/30">
              {siteConfig.email}
            </code>
            <a
              href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
                "[kimkkatta DEV.LOG] 경력/이력서 관련 문의드립니다"
              )}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-neon-cyan border border-cyan-500/40 hover:shadow-neon-cyan transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>이메일 문의하기</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
