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
      text: `김까따 OS v2.6.0 [KERNEL: NEXT.JS_STATIC_EXPORT] — Type 'help' or click a command below.`,
    },
    {
      id: 2,
      type: "output",
      text: `> 안녕하세요, ${siteConfig.author}의 개발 로그입니다! (${posts.length}개의 포스트 로드 완료)`,
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
        text: `${siteConfig.author}@dev-node:~$ ${rawCmd}`,
      },
    ];

    if (cmd === "help") {
      newLines.push({
        id: Date.now() + 1,
        type: "output",
        text: [
          "Available commands:",
          "  whoami   — 김까따 개발자 프로필 & 소개 조회",
          "  skills   — 주요 기술 스택 및 숙련도 게이지 출력",
          "  ls       — 최근 작성된 블로그 포스트 리스트 확인",
          "  theme    — 사이버펑크 다크 / 클린 라이트 테마 전환",
          "  clear    — 터미널 출력 로그 초기화",
        ].join("\n"),
      });
    } else if (cmd === "whoami") {
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `[OPERATOR] ${siteConfig.author} (${siteConfig.role})\n[BIO]      ${siteConfig.bio}\n[GITHUB]   https://github.com/${siteConfig.githubRepo}`,
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
        text: `Tech Stack Telemetry:\n${skillLines}`,
      });
    } else if (cmd === "ls") {
      const list = posts
        .slice(0, 5)
        .map((p) => `  - [${p.date}] (${p.category}) ${p.title}`)
        .join("\n");
      newLines.push({
        id: Date.now() + 1,
        type: "output",
        text: `Latest posts in /content/posts:\n${list}`,
      });
    } else if (cmd === "theme") {
      toggleTheme();
      newLines.push({
        id: Date.now() + 1,
        type: "accent",
        text: `Switched display mode to [${
          theme === "dark" ? "LIGHT_TERMINAL" : "CYBERPUNK_DARK"
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
        {/* Left 7 cols: Interactive Terminal Window */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-slate-950 text-slate-100 shadow-xl dark:shadow-neon-cyan overflow-hidden flex flex-col justify-between">
          {/* Terminal Title Bar */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-xs text-slate-400 flex items-center gap-1.5">
                <TerminalIcon className="w-3.5 h-3.5 text-neon-cyan" />
                <span>{siteConfig.author}@github.io: ~/blog</span>
              </span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-neon-cyan border border-cyan-500/20">
              INTERACTIVE CLI
            </span>
          </div>

          {/* Terminal Output Area */}
          <div
            ref={terminalBodyRef}
            className="p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-2.5 h-56 overflow-y-auto scrollbar-thin"
          >
            {history.map((item) => (
              <pre
                key={item.id}
                className={`whitespace-pre-wrap break-words font-mono leading-relaxed ${
                  item.type === "input"
                    ? "text-slate-400"
                    : item.type === "accent"
                    ? "text-neon-cyan font-semibold"
                    : "text-emerald-300/90"
                }`}
              >
                {item.text}
              </pre>
            ))}
          </div>

          {/* Quick Command Chips & Input Prompt */}
          <div className="px-4 py-3 bg-slate-900/70 border-t border-white/10 space-y-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 mr-1">
                Quick Run:
              </span>
              {["help", "whoami", "skills", "ls", "theme", "clear"].map(
                (cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => executeCommand(cmd)}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 transition-colors cursor-pointer"
                  >
                    ${cmd}
                  </button>
                )
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-black/50 rounded-xl px-3 py-2 border border-white/10 focus-within:border-neon-cyan transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-neon-green shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="명령어를 입력해보세요 (예: whoami, skills, ls, help)..."
                className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="text-xs font-mono text-slate-400 hover:text-neon-cyan flex items-center gap-1 shrink-0"
              >
                <span>RUN</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 5 cols: Developer Telemetry & Dashboard Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-purple-500/30 bg-white/90 dark:bg-[#0b101e]/90 p-5 sm:p-6 shadow-lg dark:shadow-neon-purple flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/25">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DEV TELEMETRY</span>
              </span>
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                OPERATOR // {siteConfig.author}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {siteConfig.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>POSTS</span>
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-neon-cyan">
                {posts.length}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                <span>CATEGORIES</span>
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-purple-300">
                {categories.length}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <Hash className="w-3.5 h-3.5 text-emerald-500" />
                <span>TAGS</span>
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-neon-green">
                {allTags.length}
              </p>
            </div>
          </div>

          {/* Skill Progress Bars */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>CORE STACK METRICS</span>
              <span>STATUS: OPTIMAL</span>
            </div>
            <div className="space-y-2">
              {siteConfig.techStack.slice(0, 4).map((tech) => (
                <div key={tech.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                      {tech.name}
                    </span>
                    <span className="text-cyan-600 dark:text-neon-cyan">
                      {tech.level}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400"
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
