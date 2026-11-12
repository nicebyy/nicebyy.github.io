"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Sparkles,
  Activity,
  FolderGit2,
  Hash,
  ChevronRight,
  CornerDownLeft,
  Flame,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { PostMeta } from "@/lib/posts";
import { useTheme } from "./ThemeProvider";

interface TerminalLine {
  id: number;
  type: "input" | "output" | "accent";
  text: string;
}

export function TerminalHero({ posts }: { posts: PostMeta[] }) {
  const { theme, toggleTheme } = useTheme();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 1,
      type: "accent",
      text: `[SYSTEM: NEON_CITY_KERNEL] 김까따 OS v2.6.0 ONLINE // Type 'help' or click a command below.`,
    },
    {
      id: 2,
      type: "output",
      text: `> Welcome, Operator! Initialized ${posts.length} markdown logs with full cyber-telemetry.`,
    },
  ]);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

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
          "  whoami   — 운영자(김까따) 프로필 및 개발 철학 출력",
          "  skills   — 실시간 핵심 기술 스택 게이지 전송",
          "  ls       — 최근 발행된 블로그 아카이브 목록 조회",
          "  theme    — 사이버펑크 네온 다크 / 클린 라이트 모드 전환",
          "  clear    — 터미널 콘솔 로그 초기화",
        ].join("\n"),
      });
    } else if (cmd === "whoami") {
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `[OPERATOR] ${siteConfig.author} (${siteConfig.role})\n[LOCATION] ${siteConfig.location}\n[BIO]      ${siteConfig.bio}\n[GITHUB]   https://github.com/${siteConfig.githubRepo}`,
      });
    } else if (cmd === "skills") {
      const skillLines = siteConfig.techStack
        .map((s) => {
          const filled = Math.round(s.level / 10);
          const bar = "█".repeat(filled) + "░".repeat(10 - filled);
          return `  ${s.name.padEnd(16, " ")} [${bar}] ${s.level}%`;
        })
        .join("\n");
      newLines.push({
        id: Date.now() + 1,
        type: "output",
        text: `⚡ TECH STACK TELEMETRY:\n${skillLines}`,
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
    } else if (cmd === "theme") {
      toggleTheme();
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `Switched display mode to [${
          theme === "dark" ? "CLEAN_LIGHT_LAB" : "CYBERPUNK_NEON_DARK"
        }].`,
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
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-cyan-500/40 bg-slate-950 text-slate-100 shadow-xl dark:shadow-neon-cyan overflow-hidden flex flex-col justify-between cyber-corner">
          {/* Terminal Title Bar */}
          <div className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-200/20 dark:border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="ml-2 font-mono text-xs text-slate-300 flex items-center gap-1.5">
                <TerminalIcon className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
                <span className="text-neon-cyan font-bold">{siteConfig.author}</span>
                <span className="text-slate-500">@</span>
                <span className="text-slate-300">cyber-node: ~/workspace</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-neon-cyan border border-cyan-500/30 tracking-wider">
                CLI // ACTIVE
              </span>
            </div>
          </div>

          {/* Terminal Output Area */}
          <div
            ref={terminalBodyRef}
            className="p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-2.5 h-60 overflow-y-auto scrollbar-thin bg-black/60"
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
          <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-200/20 dark:border-cyan-500/30 space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-neon-pink" />
                <span>Quick:</span>
              </span>
              {[
                { name: "help", color: "cyan" },
                { name: "whoami", color: "pink" },
                { name: "skills", color: "green" },
                { name: "ls", color: "cyan" },
                { name: "theme", color: "amber" },
                { name: "clear", color: "slate" },
              ].map(({ name, color }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => executeCommand(name)}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
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
              className="flex items-center gap-2 bg-black/70 rounded-xl px-3 py-2 border border-slate-700 dark:border-cyan-500/40 focus-within:border-neon-cyan focus-within:shadow-neon-cyan transition-all"
            >
              <ChevronRight className="w-4 h-4 text-neon-green shrink-0 animate-pulse" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="명령어를 입력하세요 (whoami, skills, ls, theme, help)..."
                className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="text-xs font-mono text-slate-400 hover:text-neon-cyan flex items-center gap-1 shrink-0 px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                <span>EXEC</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 cols: Developer Telemetry & Neon Dashboard Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-pink-500/40 bg-white/90 dark:bg-[#0b101e]/95 p-5 sm:p-6 shadow-lg dark:shadow-neon-pink flex flex-col justify-between space-y-5 cyber-corner">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-pink-500/10 text-pink-600 dark:text-neon-pink border border-pink-500/40 dark:shadow-[0_0_12px_rgba(255,0,127,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-neon-pink animate-spin-slow" />
                <span>DEV TELEMETRY</span>
              </span>
              <span className="font-mono text-xs text-slate-400 dark:text-cyan-400/80">
                // {siteConfig.author}
              </span>
            </div>

            {/* Neon Sign Header Title */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white dark:drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]">
              {siteConfig.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Neon Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-cyan-500/40 hover:dark:shadow-neon-cyan hover:dark:border-neon-cyan transition-all">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <FolderGit2 className="w-3.5 h-3.5 text-neon-cyan" />
                <span>POSTS</span>
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-neon-cyan dark:drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]">
                {posts.length}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-pink-500/40 hover:dark:shadow-neon-pink hover:dark:border-neon-pink transition-all">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <Activity className="w-3.5 h-3.5 text-neon-pink" />
                <span>CATS</span>
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-neon-pink dark:drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">
                {categories.length}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-emerald-500/40 hover:dark:shadow-neon-green hover:dark:border-neon-green transition-all">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <Hash className="w-3.5 h-3.5 text-neon-green" />
                <span>TAGS</span>
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-neon-green dark:drop-shadow-[0_0_8px_rgba(0,255,157,0.6)]">
                {allTags.length}
              </p>
            </div>
          </div>

          {/* Skill Progress Bars with Neon Glow */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="text-neon-cyan font-bold">// CORE STACK METRICS</span>
              <span className="text-neon-green text-[10px]">OPTIMAL 100%</span>
            </div>
            <div className="space-y-2">
              {siteConfig.techStack.slice(0, 4).map((tech) => (
                <div key={tech.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                      {tech.name}
                    </span>
                    <span className="text-cyan-600 dark:text-neon-cyan font-bold dark:drop-shadow-[0_0_6px_#00f3ff]">
                      {tech.level}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-pink dark:shadow-[0_0_8px_rgba(0,243,255,0.7)]"
                      style={{ width: `${tech.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
