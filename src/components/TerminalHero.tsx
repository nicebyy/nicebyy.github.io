"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Terminal as TerminalIcon,
  Sparkles,
  Activity,
  FolderGit2,
  Hash,
  ChevronRight,
  CornerDownLeft,
  Flame,
  Code2,
  Github,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { PostMeta } from "@/lib/posts";
import { VisitorCounter } from "./VisitorCounter";

interface TerminalLine {
  id: number;
  type: "input" | "output" | "accent";
  text: string;
}

export function TerminalHero({ posts }: { posts: PostMeta[] }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 1,
      type: "accent",
      text: `[SYSTEM: NEON_CITY_KERNEL] kimkkatta OS v2.6.0 ONLINE // Type 'help' or click a command below.`,
    },
    {
      id: 2,
      type: "output",
      text: `> Welcome, Operator! Initialized ${posts.length} archived logs. [SECTOR_09: 0 PEERS DETECTED — SOLO SESSION]`,
    },
  ]);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category))),
    [posts]
  );
  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))),
    [posts]
  );

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    const newLines: TerminalLine[] = [
      {
        id: Date.now(),
        type: "input",
        text: `${siteConfig.author}@neon-node:~$ ${rawCmd}`,
      },
    ];

    if (cmd === "help") {
      newLines.push({
        id: Date.now() + 1,
        type: "output",
        text: [
          "⚡ AVAILABLE CYBER COMMANDS:",
          "  whoami   — 운영자(kimkkatta) 프로필 및 개발 철학 출력",
          "  career   — 실무 경력 및 아키텍처 문제 해결 이력서 (익명화)",
          "  projects — 4대 핵심 개인 프로젝트 아카이브 출력",
          "  skills   — 실시간 핵심 기술 스택 게이지 전송",
          "  ls       — 최근 발행된 블로그 아카이브 목록 조회",
          "  scan     — 주변 서브넷 활성 오퍼레이터 신호 탐색",
          "  rain     — Night City 빗소리 사운드 & 빗줄기 이펙트 전환",
          "  status   — 나이트 시티 메인프레임 통신 상태 진단",
          "  clear    — 터미널 콘솔 로그 초기화",
        ].join("\n"),
      });
    } else if (cmd === "whoami") {
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `[OPERATOR] ${siteConfig.author} (${siteConfig.role})\n[LOCATION] ${siteConfig.location}\n[BIO]      ${siteConfig.bio}\n[GITHUB]   https://github.com/${siteConfig.githubRepo}`,
      });
    } else if (cmd === "career" || cmd === "resume" || cmd === "exp") {
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: [
          "💼 KIMKKATTA VERIFIED WORK EXPERIENCE ARCHIVE:",
          "  (보안 및 비공개 원칙에 따라 회사명은 A사, C사, G사 및 서비스명은 일반화되어 표기됩니다)",
          "",
          "  [1] 블록체인 핀테크 & 대용량 정산 플랫폼 기업 (G사) | 2025.07 ~ 2026.05 (11개월)",
          "      • 직무: 백엔드 개발팀 · 백엔드 / 서버 개발 엔지니어",
          "      • 주요 성과: DAG 위상 정렬 기반 인메모리 트리 캐싱으로 DB I/O 90%+ 감축, Dynamic JDBC Cursor & Spring Batch 5 튜닝, 다차원 출금 정책 엔진 구축",
          "      • Tech: Java 17, Kotlin, Spring Boot 3.4, Spring Batch 5, MySQL 8, JPA, QueryDSL, Redis",
          "",
          "  [2] Web3 블록체인 게임 & 플랫폼 개발사 (C사) | 2024.06 ~ 2025.05 (1년)",
          "      • 직무: 웹 개발팀 · 풀스택 소프트웨어 엔지니어",
          "      • 주요 성과: Clean Layered Architecture 4계층 도메인 설계, TDD 90%+ 테스트 커버리지, 온체인 민팅 대기열 & SSE 실시간 모니터링, 무한 스크롤 v2",
          "      • Tech: NestJS, TypeScript, MongoDB, React 18, TanStack Query v5, Zustand, Tailwind",
          "",
          "  [3] 글로벌 암호화폐 거래소 & 핀테크 플랫폼 기업 (A사) | 2022.08 ~ 2023.08 (1년 1개월)",
          "      • 직무: 거래소개발팀 · 백엔드 / 서버 개발 엔지니어",
          "      • 주요 성과: RabbitMQ 실시간 메시징 아키텍처 개편 및 SPOF 해소, WebSocket 패킷 다이어트, No-Offset 커서 페이징 & N+1 해결, MySQL Named Lock 전환",
          "      • Tech: Java 11, Spring Boot 2.7, MySQL 8, Redis, RabbitMQ, WebSocket (STOMP), Prometheus",
          "",
          "> 상단 내비게이션의 CAREER 메뉴 또는 /career 에서 각 프로젝트별 STAR 문제 해결 상세 내역을 열람할 수 있습니다.",
        ].join("\n"),
      });
    } else if (cmd === "projects" || cmd === "project") {
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: [
          "🚀 KIMKKATTA PRODUCTION PROJECTS ARCHIVE:",
          "  1. 1234pickban   — LoL 20단계 밴픽/피어리스 & 실시간 팀 경매 & 크로노브레이크 플랫폼",
          "     [Stack] Next.js 14 · NestJS 10 · Socket.IO · Docker (Web)",
          "     [Web]   https://1234banpick.me (Private Repo // 웹 서비스 운영)",
          "",
          "  2. kkt-bookmark  — 100% 로컬 DB, 다단계 폴더 트리 & 브라우저 지정 실행 스마트 북마크",
          "     [Stack] Kotlin · Jetpack Compose · Room DB (Android & PWA)",
          "     [Repo]  https://github.com/nicebyy/kkt-bookmark",
          "",
          "  3. old-calendar  — 0ms 로컬 우선 반응성, Windows 10 UWP 룩앤필 데스크톱 캘린더",
          "     [Stack] Electron 34 · React 19 · Vite 6 · Tailwind CSS v4 (Desktop)",
          "     [Store] Microsoft Store (https://apps.microsoft.com/detail/9nt09z0g12ss)",
          "     [Repo]  https://github.com/nicebyy/old-calender",
          "",
          "  4. job-blocking  — 5대 채용 플랫폼(원티드·사람인·잡코리아) 광고 차단 & 무한 스크롤 & 평점 뱃지",
          "     [Stack] Chrome Manifest V3 · TypeScript · React 18 · Vite (Extension)",
          "     [Store] Chrome 웹스토어 (https://chromewebstore.google.com/detail/cohpijikelgbghbccpdhffaphajbmplf)",
          "     [Repo]  https://github.com/nicebyy/job-blockingV2",
          "",
          "> 상단 내비게이션의 PROJECTS 메뉴 또는 /projects 에서 상세 스펙을 열람할 수 있습니다.",
        ].join("\n"),
      });
    } else if (cmd === "skills") {
      const skillLines = siteConfig.techStack
        .map((s) => {
          const filled = Math.round(s.level / 10);
          const bar = "█".repeat(filled) + "░".repeat(10 - filled);
          const byteInfo = "bytes" in s && s.bytes ? ` (${s.bytes})` : "";
          return `  ${s.name.padEnd(14, " ")} [${bar}] ${String(s.level + "%").padStart(4, " ")}${byteInfo}`;
        })
        .join("\n");
      newLines.push({
        id: Date.now() + 1,
        type: "output",
        text: `⚡ GITHUB TELEMETRY (@nicebyy | 28 repos [13 public + 15 private] | 29.8 MB analyzed):\n${skillLines}`,
      });
    } else if (cmd === "ls") {
      const list = posts
        .slice(0, 5)
        .map((p) => `  - [${p.date}] (${p.category}) ${p.title}`)
        .join("\n");
      newLines.push({
        id: Date.now() + 1,
        type: "output",
        text: `📁 ARCHIVED LOGS in /content/posts:\n${list}`,
      });
    } else if (cmd === "scan") {
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `[SUBNET_RADAR_SCAN] Sweeping Night City Sector 01..09...\n  • Sector 01 ~ 04 : [NO CARRIER / SILENT]\n  • Sector 05 ~ 08 : [SIGNAL LOST / ABANDONED]\n  • Sector 09      : [SOLO NODE ACTIVE -> ${siteConfig.author} (YOU)]\n> RESULT: 0 other operators detected. Signal completely isolated.`,
      });
    } else if (cmd === "rain" || cmd === "rain on" || cmd === "rain off") {
      const explicitState =
        cmd === "rain on" ? true : cmd === "rain off" ? false : undefined;
      window.dispatchEvent(
        new CustomEvent("toggle-rain-audio", { detail: explicitState })
      );
      if (typeof explicitState === "boolean") {
        window.dispatchEvent(
          new CustomEvent("toggle-rain-visual", { detail: explicitState })
        );
      }
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `[ATMOSPHERE_DECK] Night City ambient rain soundscape ${
          explicitState === true
            ? "ENABLED"
            : explicitState === false
            ? "DISABLED"
            : "TOGGLED"
        }. (Rain outside the shelter terminal...)`,
      });
    } else if (cmd === "status") {
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `[MAINFRAME STATUS] ISOLATED_SOLO_NODE\n  • PROTOCOL: CYBERPUNK_DARK_ONLY (IMMUTABLE)\n  • PEERS_IN_RANGE: 0000 (ALONE)\n  • UPTIME: 99.99%\n  • NODE: NIGHT_CITY_SECTOR_09`,
      });
    } else if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    } else {
      newLines.push({
        id: Date.now() + 1,
        type: "output",
        text: `Command not found: '${rawCmd}'. Type 'help' for available commands.`,
      });
    }

    setHistory((prev) => [...prev, ...newLines]);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  return (
    <section className="relative pt-2 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 7 cols: Interactive Cyber Terminal Window */}
        <div className="lg:col-span-7 rounded-2xl border border-cyan-500/40 bg-slate-950 text-slate-100 shadow-xl shadow-neon-cyan overflow-hidden flex flex-col justify-between cyber-corner relative group">
          <span className="cyber-corner-bracket-tl" />
          <span className="cyber-corner-bracket-tr" />
          <span className="cyber-corner-bracket-bl" />
          <span className="cyber-corner-bracket-br" />
          {/* Terminal Title Bar */}
          <div className="px-3.5 sm:px-4 py-2.5 bg-slate-900/95 border-b border-cyan-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <span className="ml-1 font-mono text-xs text-slate-300 flex items-center gap-1.5 truncate">
                <TerminalIcon className="w-3.5 h-3.5 text-neon-cyan shrink-0 animate-pulse" />
                <span className="text-neon-cyan font-black font-cyber shrink-0">{siteConfig.author}</span>
                <span className="text-slate-500">@</span>
                <span className="text-slate-300 font-chakra truncate">cyber-node</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-ping" />
              <span className="hidden sm:inline font-orbitron text-[10px] px-2 py-0.5 rounded bg-pink-500/10 text-neon-pink border border-pink-500/35 tracking-widest cyber-signal-flicker">
                SOLO_NODE // 0 PEERS
              </span>
              <span className="sm:hidden font-orbitron text-[9px] px-1.5 py-0.5 rounded bg-pink-500/10 text-neon-pink border border-pink-500/35 tracking-wider">
                SOLO
              </span>
            </div>
          </div>

          {/* Terminal Output Area */}
          <div
            ref={terminalBodyRef}
            className="p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-2.5 h-60 overflow-y-auto scrollbar-thin bg-black/70"
          >
            {history.map((item) => (
              <pre
                key={item.id}
                className={`whitespace-pre-wrap break-words font-mono leading-relaxed ${
                  item.type === "input"
                    ? "text-slate-400"
                    : item.type === "accent"
                    ? "text-neon-cyan font-semibold drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]"
                    : "text-emerald-300/90 drop-shadow-[0_0_6px_rgba(0,255,157,0.3)]"
                }`}
              >
                {item.text}
              </pre>
            ))}
          </div>

          {/* Quick Command Neon Buttons & Input Prompt */}
          <div className="px-3.5 sm:px-4 py-3 bg-slate-900/80 border-t border-cyan-500/30 space-y-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0 sm:flex-wrap">
              <span className="text-[11px] font-chakra text-slate-400 mr-1 flex items-center gap-1 tracking-wider shrink-0">
                <Flame className="w-3 h-3 text-neon-pink" />
                <span>QUICK:</span>
              </span>
              {[
                { name: "help", color: "cyan" },
                { name: "projects", color: "pink" },
                { name: "scan", color: "pink" },
                { name: "rain", color: "cyan" },
                { name: "whoami", color: "cyan" },
                { name: "skills", color: "green" },
                { name: "ls", color: "cyan" },
                { name: "status", color: "amber" },
                { name: "clear", color: "slate" },
              ].map(({ name, color }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => executeCommand(name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer shrink-0 select-none cyber-chip active:scale-95 ${
                    color === "pink"
                      ? "bg-pink-500/10 text-neon-pink border border-pink-500/40 hover:bg-pink-500/25 hover:shadow-neon-pink"
                      : color === "green"
                      ? "bg-emerald-500/10 text-neon-green border border-emerald-500/40 hover:bg-emerald-500/25 hover:shadow-neon-green"
                      : color === "amber"
                      ? "bg-amber-500/10 text-neon-amber border border-amber-500/40 hover:bg-amber-500/25"
                      : "bg-cyan-500/10 text-neon-cyan border border-cyan-500/40 hover:bg-cyan-500/25 hover:shadow-neon-cyan"
                  }`}
                >
                  ${name}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-black/80 rounded-xl px-2.5 sm:px-3 py-2 border border-cyan-500/40 focus-within:border-neon-cyan focus-within:shadow-neon-cyan transition-all"
            >
              <ChevronRight className="w-4 h-4 text-neon-green shrink-0 animate-pulse" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="명령어 입력 (scan, rain, whoami, skills, status, help)..."
                className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="text-xs font-orbitron tracking-wider text-slate-300 hover:text-neon-cyan flex items-center gap-1 shrink-0 px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                <span>EXEC</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 cols: Developer Telemetry & Neon Dashboard Card */}
        <div className="lg:col-span-5 rounded-2xl border border-pink-500/40 bg-[#0b101e]/95 p-5 sm:p-6 shadow-lg shadow-neon-pink flex flex-col justify-between gap-5 cyber-box cyber-corner group relative">
          <span className="cyber-corner-bracket-tl" />
          <span className="cyber-corner-bracket-tr" />
          <span className="cyber-corner-bracket-bl" />
          <span className="cyber-corner-bracket-br" />
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron tracking-widest font-bold bg-pink-500/10 text-neon-pink border border-pink-500/40 shadow-[0_0_12px_rgba(255,0,127,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-neon-pink animate-spin-slow" />
                <span>DEV TELEMETRY</span>
              </span>
              <span className="font-orbitron text-xs text-cyan-400/80 tracking-wider">
                // {siteConfig.author}
              </span>
            </div>

            {/* Neon Sign Header Title with Cyber SF Font */}
            <h1 className="text-2xl sm:text-3xl font-black font-cyber tracking-wide text-white drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]">
              {siteConfig.title}
            </h1>
            <p className="text-xs sm:text-sm font-chakra text-slate-300 leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Neon Stats Grid with Orbitron */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <div className="rounded-xl p-2.5 sm:p-3 bg-black/50 border border-cyan-500/40 hover:shadow-neon-cyan hover:border-neon-cyan transition-all">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-orbitron tracking-wider text-slate-400">
                <FolderGit2 className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span>POSTS</span>
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-orbitron font-black text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]">
                {posts.length}
              </p>
            </div>
            <div className="rounded-xl p-2.5 sm:p-3 bg-black/50 border border-pink-500/40 hover:shadow-neon-pink hover:border-neon-pink transition-all">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-orbitron tracking-wider text-slate-400">
                <Activity className="w-3.5 h-3.5 text-neon-pink shrink-0" />
                <span>CATS</span>
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-orbitron font-black text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">
                {categories.length}
              </p>
            </div>
            <div className="rounded-xl p-2.5 sm:p-3 bg-black/50 border border-emerald-500/40 hover:shadow-neon-green hover:border-neon-green transition-all">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-orbitron tracking-wider text-slate-400">
                <Hash className="w-3.5 h-3.5 text-neon-green shrink-0" />
                <span>TAGS</span>
              </div>
              <p className="mt-1 text-lg sm:text-2xl font-orbitron font-black text-neon-green drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]">
                {allTags.length}
              </p>
            </div>
          </div>

          {/* Live Visitor Telemetry Strip */}
          <VisitorCounter variant="telemetry" />

          {/* Skill Progress Bars with Neon Glow */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-[10px] sm:text-[11px] font-chakra tracking-wide text-slate-400">
              <span className="text-neon-cyan font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Code2 className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span>// CODE METRICS</span>
                <a
                  href={`https://github.com/${siteConfig.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0"
                  title="GitHub Profile (@nicebyy)"
                >
                  <Github className="w-2.5 h-2.5 shrink-0" />
                  <span>@{siteConfig.githubUsername}</span>
                </a>
              </span>
              <span className="text-neon-green text-[9.5px] sm:text-[10px] font-orbitron font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse shrink-0" />
                <span>28 REPOS · 29.8 MB</span>
              </span>
            </div>
            <div className="space-y-2">
              {siteConfig.techStack.map((tech) => {
                const colorStyles = {
                  cyan: {
                    bar: "from-cyan-400 via-sky-500 to-blue-500 shadow-[0_0_8px_rgba(0,243,255,0.6)]",
                    text: "text-neon-cyan",
                    glow: "drop-shadow-[0_0_6px_#00f3ff]",
                    badge: "text-cyan-300 bg-cyan-950/60 border-cyan-500/30",
                  },
                  purple: {
                    bar: "from-purple-500 via-indigo-500 to-neon-pink shadow-[0_0_8px_rgba(168,85,247,0.6)]",
                    text: "text-purple-400",
                    glow: "drop-shadow-[0_0_6px_#c084fc]",
                    badge: "text-purple-300 bg-purple-950/60 border-purple-500/30",
                  },
                  pink: {
                    bar: "from-pink-500 via-rose-500 to-red-500 shadow-[0_0_8px_rgba(255,0,127,0.6)]",
                    text: "text-neon-pink",
                    glow: "drop-shadow-[0_0_6px_#ff007f]",
                    badge: "text-pink-300 bg-pink-950/60 border-pink-500/30",
                  },
                  amber: {
                    bar: "from-amber-400 via-yellow-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
                    text: "text-amber-400",
                    glow: "drop-shadow-[0_0_6px_#fbbf24]",
                    badge: "text-amber-300 bg-amber-950/60 border-amber-500/30",
                  },
                  green: {
                    bar: "from-emerald-400 via-green-500 to-teal-500 shadow-[0_0_8px_rgba(0,255,157,0.6)]",
                    text: "text-neon-green",
                    glow: "drop-shadow-[0_0_6px_#00ff9d]",
                    badge: "text-emerald-300 bg-emerald-950/60 border-emerald-500/30",
                  },
                }[tech.color || "cyan"] || {
                  bar: "from-neon-cyan via-purple-500 to-neon-pink shadow-[0_0_8px_rgba(0,243,255,0.7)]",
                  text: "text-neon-cyan",
                  glow: "drop-shadow-[0_0_6px_#00f3ff]",
                  badge: "text-cyan-300 bg-cyan-950/60 border-cyan-500/30",
                };

                return (
                  <div key={tech.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-chakra">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 font-medium">
                          {tech.name}
                        </span>
                        {"bytes" in tech && tech.bytes && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${colorStyles.badge}`}
                          >
                            {tech.bytes}
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-orbitron font-bold ${colorStyles.text} ${colorStyles.glow}`}
                      >
                        {tech.level}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colorStyles.bar}`}
                        style={{ width: `${Math.max(tech.level, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
