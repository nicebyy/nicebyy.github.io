"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Edit3,
  LogOut,
  Settings,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { PostStudioItem } from "@/lib/posts";
import { PostManager } from "./PostManager";
import { CyberWriter } from "./CyberWriter";
import { OperatorLoginGate } from "./OperatorLoginGate";
import { GitHubSettingsModal } from "./GitHubSettingsModal";
import { useOperatorAuth } from "@/lib/useOperatorAuth";

interface CyberStudioProps {
  initialPosts: PostStudioItem[];
}

export function CyberStudio({ initialPosts }: CyberStudioProps) {
  const { isAuthenticated, session, isLoading, logout } = useOperatorAuth();
  const [activeTab, setActiveTab] = useState<"manager" | "writer">("manager");
  const [editingPost, setEditingPost] = useState<PostStudioItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  // If still hydrating or checking storage
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-neon-cyan">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="tracking-widest">VERIFYING OPERATOR CLEARANCE...</p>
      </div>
    );
  }

  // If NOT authenticated, show the Operator Security Clearance Login Gate
  if (!isAuthenticated) {
    return <OperatorLoginGate />;
  }

  // Authenticated Operator Studio
  return (
    <div className="py-4 space-y-6 animate-fadeIn">
      {/* Top Navigation & Operator Status Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>OPERATOR UNLOCKED</span>
            </span>
          </div>
          <p className="text-xs font-mono text-cyan-400/70">
            게시물 관리(가리기/삭제), 실시간 마크다운 에디터 & GitHub 원클릭 자동 배포
          </p>
        </div>

        {/* Operator Profile & Logout Control */}
        <div className="flex items-center flex-wrap gap-2.5 font-mono text-xs">
          {/* Active Operator Pill */}
          <div className="px-3.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,157,0.15)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{session?.displayName || "kimkkatta"}</span>
              <span className="text-slate-400 text-[10px]">(@{session?.username})</span>
              <span className="text-slate-500">|</span>
              <span className="text-neon-cyan text-[10px]">{session?.branch || "develop"}</span>
            </div>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-slate-700 text-xs font-mono transition-all"
            title="저장소/브랜치 설정"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              if (confirm("운영자 세션을 로그아웃하시겠습니까?")) {
                logout();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
            title="운영자 로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* Primary Mode Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-slate-800 backdrop-blur-md font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("manager")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
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
      />
    </div>
  );
}
