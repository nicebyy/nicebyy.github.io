"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
  BookOpen,
  User,
  Folder,
  FolderOpen,
  Tag,
  FileCode2,
  ChevronDown,
  ChevronRight,
  Github,
  Terminal,
  X,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { PostMeta } from "@/lib/posts";

interface SidebarProps {
  posts: PostMeta[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  posts,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [catOpen, setCatOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = useMemo(() => {
    const counts: Record<string, number> = { ALL: posts.length };
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [posts]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    onCloseMobile();
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("sidebar-select-category", { detail: category })
        );
      }, 150);
    } else {
      window.dispatchEvent(
        new CustomEvent("sidebar-select-category", { detail: category })
      );
      const el = document.getElementById("posts");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectTag = (tag: string) => {
    onCloseMobile();
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("sidebar-select-tag", { detail: tag })
        );
      }, 150);
    } else {
      window.dispatchEvent(
        new CustomEvent("sidebar-select-tag", { detail: tag })
      );
      const el = document.getElementById("posts");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top: Profile & Collapse Button */}
      <div className="space-y-4">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-3 pt-4 pb-3 border-b border-slate-200/80 dark:border-white/10`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-neon-cyan shrink-0 shadow-sm">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {siteConfig.author}
                </p>
                <p className="font-mono text-[11px] text-cyan-600 dark:text-neon-cyan truncate">
                  @{siteConfig.githubUsername}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className="hidden lg:flex p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/15 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-neon-cyan border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-2.5 space-y-1">
          {!collapsed && (
            <p className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              NAVIGATION
            </p>
          )}
          <Link
            href="/"
            onClick={onCloseMobile}
            title="대시보드 홈"
            className={`flex items-center ${
              collapsed ? "justify-center px-2" : "gap-2.5 px-3"
            } py-2 rounded-xl text-xs font-mono transition-all ${
              pathname === "/"
                ? "bg-cyan-500/15 text-cyan-700 dark:text-neon-cyan border border-cyan-500/30 font-bold"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          <Link
            href="/#posts"
            onClick={() => handleSelectCategory("ALL")}
            title="전체 포스트 목록"
            className={`flex items-center ${
              collapsed ? "justify-center px-2" : "gap-2.5 px-3"
            } py-2 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="flex-1 flex items-center justify-between">
                <span>All Logs</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10">
                  {posts.length}
                </span>
              </span>
            )}
          </Link>

          <Link
            href="/about"
            onClick={onCloseMobile}
            title="김까따 소개 (About)"
            className={`flex items-center ${
              collapsed ? "justify-center px-2" : "gap-2.5 px-3"
            } py-2 rounded-xl text-xs font-mono transition-all ${
              pathname?.startsWith("/about")
                ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            {!collapsed && <span>About 김까따</span>}
          </Link>
        </div>

        {/* Categories Accordion (Expanded mode) or Icon (Collapsed mode) */}
        <div className="px-2.5 pt-2 border-t border-slate-200/70 dark:border-white/10">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1.5">
              {Object.entries(categories).map(([cat, count]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  title={`${cat} (${count})`}
                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-cyan-500/20 text-cyan-600 dark:text-neon-cyan border border-cyan-500/40"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span className="text-[9px] leading-none mt-0.5">
                    {cat.slice(0, 3)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setCatOpen(!catOpen)}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                <span>CATEGORIES</span>
                {catOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {catOpen && (
                <div className="space-y-0.5 pt-0.5">
                  {Object.entries(categories).map(([cat, count]) => {
                    const isSelected = activeCategory === cat && pathname === "/";
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-neon-cyan border border-cyan-500/30 font-semibold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {isSelected ? (
                            <FolderOpen className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{cat}</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Posts Section (Only when expanded) */}
        {!collapsed && (
          <div className="px-2.5 pt-2 border-t border-slate-200/70 dark:border-white/10 space-y-1">
            <button
              type="button"
              onClick={() => setRecentOpen(!recentOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              <span>RECENT LOGS</span>
              {recentOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {recentOpen && (
              <div className="space-y-1 pt-0.5">
                {posts.slice(0, 4).map((post) => {
                  const active = pathname?.includes(post.slug);
                  return (
                    <Link
                      key={post.slug}
                      href={`/posts/${post.slug}`}
                      onClick={onCloseMobile}
                      className={`flex items-start gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                        active
                          ? "bg-cyan-500/15 text-cyan-700 dark:text-neon-cyan font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <FileCode2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-cyan-500" />
                      <span className="line-clamp-1 leading-snug">
                        {post.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tags Cloud (Only when expanded) */}
        {!collapsed && allTags.length > 0 && (
          <div className="px-2.5 pt-2 border-t border-slate-200/70 dark:border-white/10 space-y-1.5">
            <button
              type="button"
              onClick={() => setTagsOpen(!tagsOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              <span>TAGS</span>
              {tagsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {tagsOpen && (
              <div className="flex flex-wrap gap-1 px-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 border border-slate-200/70 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer of Sidebar */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/10">
        <a
          href={siteConfig.social.github}
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub 저장소 열기"
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-cyan-500/10 text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-neon-cyan border border-slate-200/80 dark:border-white/10 transition-all`}
        >
          <span className="flex items-center gap-2 truncate">
            <Github className="w-4 h-4 shrink-0" />
            {!collapsed && <span>github/{siteConfig.githubUsername}</span>}
          </span>
          {!collapsed && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200/80 dark:border-cyan-500/20 bg-white/85 dark:bg-[#070b14]/90 backdrop-blur-md transition-all duration-300 z-30 overflow-y-auto ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Slide-Over Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-white dark:bg-[#070b14] border-r border-slate-200 dark:border-cyan-500/30 shadow-2xl overflow-y-auto">
            {sidebarContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
