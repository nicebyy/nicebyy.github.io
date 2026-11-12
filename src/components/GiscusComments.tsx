"use client";

import React, { useEffect, useRef } from "react";
import { MessageSquareCode, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useTheme } from "./ThemeProvider";

export function GiscusComments() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { giscus } = siteConfig;

  const isConfigured = Boolean(giscus.repoId && giscus.categoryId);

  useEffect(() => {
    if (!isConfigured || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", giscus.repo);
    script.setAttribute("data-repo-id", giscus.repoId);
    script.setAttribute("data-category", giscus.category);
    script.setAttribute("data-category-id", giscus.categoryId);
    script.setAttribute("data-mapping", giscus.mapping);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", giscus.reactionsEnabled);
    script.setAttribute("data-emit-metadata", giscus.emitMetadata);
    script.setAttribute("data-input-position", giscus.inputPosition);
    script.setAttribute(
      "data-theme",
      theme === "dark" ? "transparent_dark" : "light"
    );
    script.setAttribute("data-lang", giscus.lang);
    script.crossOrigin = "anonymous";
    script.async = true;

    containerRef.current.appendChild(script);
  }, [isConfigured, giscus, theme]);

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-900 dark:text-white mb-4">
        <MessageSquareCode className="w-4 h-4 text-cyan-500 dark:text-neon-cyan" />
        <span>COMMENTS // GITHUB DISCUSSIONS (GISCUS)</span>
      </div>

      {isConfigured ? (
        <div
          ref={containerRef}
          className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0b101e]/60 p-4 sm:p-6"
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-cyan-500/40 bg-cyan-500/[0.04] p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold text-cyan-700 dark:text-neon-cyan">
              [GISCUS_SETUP_READY] GitHub Discussions 댓글 위젯이 준비되어 있습니다.
            </span>
            <a
              href="https://giscus.app/ko"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-cyan-600 dark:text-neon-cyan hover:underline"
            >
              <span>giscus.app 열기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            저장소 Settings에서 <strong>Discussions</strong>를 활성화한 뒤,{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-xs">
              src/config/site.ts
            </code>{" "}
            파일의 <code className="font-mono text-xs">giscus.repoId</code>와{" "}
            <code className="font-mono text-xs">giscus.categoryId</code>만
            채워 넣으면 이 자리에 실시간 댓글창이 표시됩니다.
          </p>
        </div>
      )}
    </section>
  );
}
