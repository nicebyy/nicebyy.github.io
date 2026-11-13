"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Edit3,
  Settings,
  Github,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Layers,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { PostStudioItem } from "@/lib/posts";
import { PostManager } from "./PostManager";
import { CyberWriter } from "./CyberWriter";
import { GitHubSettingsModal } from "./GitHubSettingsModal";
import { getStoredGitHubConfig, GitHubConfig } from "@/lib/github-api";

interface CyberStudioProps {
  initialPosts: PostStudioItem[];
}

export function CyberStudio({ initialPosts }: CyberStudioProps) {
  const [activeTab, setActiveTab] = useState<"manager" | "writer">("manager");
  const [editingPost, setEditingPost] = useState<PostStudioItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gitHubConfig, setGitHubConfig] = useState<GitHubConfig>({
    token: "",
    repo: "nicebyy/nicebyy.github.io",
    branch: "develop",
  });

  // Load config on mount
  useEffect(() => {
    setGitHubConfig(getStoredGitHubConfig());
  }, []);

  // Compute all unique categories and popular tags across all posts
  const { allCategories, popularTags } = useMemo(() => {
    const catSet = new Set<string>();
    const tagMap = new Map<string, number>();

    initialPosts.forEach((post) => {
      if (post.category) catSet.add(post.category);
      if (Array.isArray(post.tags)) {
        post.tags.forEach((t) => {
          tagMap.set(t, (tagMap.get(t) || 0) + 1);
        });
      }
    });

    const sortedTags = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);

    return {
      allCategories: Array.from(catSet).sort(),
      popularTags: sortedTags,
    };
  }, [initialPosts]);

  const handleEditPost = (post: PostStudioItem) => {
    setEditingPost(post);
    setActiveTab("writer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setActiveTab("writer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="py-4 space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        {/* Back Link & Brand */}
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-neon-cyan border border-white/10 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>cd ~/dashboard</span>
          </Link>
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-cyber font-black tracking-wider text-white">
              CYBER STUDIO // CMS & POST MANAGER
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-neon-cyan border border-cyan-500/40">
              v1.0
            </span>
          </div>
          <p className="text-xs font-mono text-cyan-400/70">
            게시물 관리(가리기/삭제), 실시간 마크다운 에디터 & GitHub 원클릭 자동 배포
          </p>
        </div>

        {/* GitHub Status & Settings Button */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              gitHubConfig.token
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-slate-700 bg-slate-900/60 text-slate-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                gitHubConfig.token ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="text-[11px]">
              {gitHubConfig.token
                ? `SYNC ON (${gitHubConfig.branch})`
                : "OFFLINE / NO TOKEN"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-neon-cyan border border-cyan-500/30 text-xs font-mono font-bold transition-all active:scale-95"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>GITHUB 설정</span>
          </button>
        </div>
      </div>

      {/* Primary Mode Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-slate-800 backdrop-blur-md font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("manager")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "manager"
              ? "bg-cyan-500/20 text-neon-cyan border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(0,243,255,0.2)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>🗂️ POST MANAGER (게시물 관리 / 삭제 / 가리기)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeTab !== "writer") handleNewPost();
            setActiveTab("writer");
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === "writer"
              ? "bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-white border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(0,243,255,0.2)]"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Edit3 className="w-4 h-4 text-neon-cyan" />
          <span>
            {editingPost
              ? `📝 EDITING: ${editingPost.title.slice(0, 16)}...`
              : "📝 CYBER WRITER (새 글 작성 & 에디터)"}
          </span>
        </button>
      </div>

      {/* Main Tab View */}
      {activeTab === "manager" ? (
        <PostManager
          posts={initialPosts}
          onEditPost={handleEditPost}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <CyberWriter
          key={editingPost?.slug || "new-post"}
          initialPost={editingPost}
          allCategories={allCategories}
          popularTags={popularTags}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* GitHub Settings Modal */}
      <GitHubSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={(cfg) => setGitHubConfig(cfg)}
      />
    </div>
  );
}
