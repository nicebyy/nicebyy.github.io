"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  activeSection?: "dashboard" | "posts" | "about";
  onSelectSection?: (section: "dashboard" | "posts" | "about") => void;
}

export function Sidebar({
  posts,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  activeSection = "dashboard",
  onSelectSection,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [catOpen, setCatOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Specific categories (excluding ALL, since All Logs is in NAVIGATION)
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
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

  useEffect(() => {
    const handleBlogCat = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setActiveCategory(custom.detail);
        onSelectSection?.("posts");
      }
    };
    window.addEventListener("blog-select-category", handleBlogCat);
    return () => {
      window.removeEventListener("blog-select-category", handleBlogCat);
    };
  }, [onSelectSection]);

  const handleDashboardClick = (e: React.MouseEvent) => {
    onCloseMobile();
    onSelectSection?.("dashboard");
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
    }
  };

  const handleAllLogsClick = (e: React.MouseEvent) => {
    onCloseMobile();
    onSelectSection?.("posts");
    handleSelectCategory("ALL");
  };

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    onSelectSection?.("posts");
    onCloseMobile();
    if (pathname !== "/") {
      router.push("/#posts");
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
      window.history.replaceState(null, "", "/#posts");
    }
  };

  const handleSelectTag = (tag: string) => {
    onCloseMobile();
    onSelectSection?.("posts");
    if (pathname !== "/") {
      router.push("/#posts");
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
      window.history.replaceState(null, "", "/#posts");
    }
  };

  const sidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top: Profile & Collapse Button */}
      <div className="space-y-4">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-3 pt-4 pb-3 border-b border-slate-200/80 dark:border-cyan-500/20`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-600 dark:text-neon-cyan shrink-0 shadow-sm dark:shadow-[0_0_12px_rgba(0,243,255,0.4)]">
                <Terminal className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="font-cyber font-black text-sm text-slate-900 dark:text-white dark:drop-shadow-[0_0_8px_#00f3ff] truncate">
                  {siteConfig.author}
                </p>
                <p className="font-mono text-[11px] text-pink-600 dark:text-neon-pink truncate">
                  @{siteConfig.githubUsername}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            className="hidden lg:flex p-2 rounded-xl bg-slate-100 dark:bg-black/50 hover:bg-cyan-500/15 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-neon-cyan border border-slate-200 dark:border-cyan-500/30 hover:dark:shadow-neon-cyan transition-all cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-neon-cyan animate-pulse" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="사이드바 닫기"
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-neon-cyan border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-2.5 space-y-1">
          {!collapsed && (
            <p className="px-2 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-neon-cyan/70">
              // NAVIGATION
            </p>
          )}

          {(() => {
            const isDashboardActive = activeSection === "dashboard" && pathname === "/";
            const isAllLogsActive =
              (activeSection === "posts" || pathname.startsWith("/posts/")) &&
              activeCategory === "ALL";
            const isAboutActive = pathname?.startsWith("/about") || activeSection === "about";

            return (
              <>
                <Link
                  href="/"
                  onClick={handleDashboardClick}
                  title="대시보드 홈"
                  className={`flex items-center ${
                    collapsed ? "justify-center px-2" : "gap-2.5 px-3"
                  } py-2 rounded-xl text-xs font-mono transition-all ${
                    isDashboardActive
                      ? "bg-cyan-500/15 text-neon-cyan border border-cyan-500/40 shadow-neon-cyan font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
                  }`}
                >
                  <Cpu className={`w-4 h-4 shrink-0 ${isDashboardActive ? "text-neon-cyan animate-pulse" : "text-slate-500"}`} />
                  {!collapsed && <span>Dashboard</span>}
                </Link>

                <Link
                  href="/#posts"
                  onClick={handleAllLogsClick}
                  title="전체 포스트 목록"
                  className={`flex items-center ${
                    collapsed ? "justify-center px-2" : "gap-2.5 px-3"
                  } py-2 rounded-xl text-xs font-mono transition-all ${
                    isAllLogsActive
                      ? "bg-pink-500/15 text-neon-pink border border-pink-500/50 shadow-neon-pink font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-pink-500/20"
                  }`}
                >
                  <BookOpen className={`w-4 h-4 shrink-0 ${isAllLogsActive ? "text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,127,0.7)]" : "text-slate-500"}`} />
                  {!collapsed && (
                    <span className="flex-1 flex items-center justify-between">
                      <span>All Logs</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded transition-all ${
                        isAllLogsActive
                          ? "bg-pink-500/25 text-neon-pink border border-pink-500/50 shadow-[0_0_8px_rgba(255,0,127,0.4)] font-bold"
                          : "bg-white/5 text-slate-400 border border-white/10"
                      }`}>
                        {posts.length}
                      </span>
                    </span>
                  )}
                </Link>

                <Link
                  href="/about"
                  onClick={() => {
                    onCloseMobile();
                    onSelectSection?.("about");
                  }}
                  title="김까따 소개 (About)"
                  className={`flex items-center ${
                    collapsed ? "justify-center px-2" : "gap-2.5 px-3"
                  } py-2 rounded-xl text-xs font-mono transition-all ${
                    isAboutActive
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/50 shadow-neon-purple font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-purple-500/20"
                  }`}
                >
                  <User className={`w-4 h-4 shrink-0 ${isAboutActive ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" : "text-slate-500"}`} />
                  {!collapsed && <span>About 김까따</span>}
                </Link>
              </>
            );
          })()}
        </div>

        {/* Categories Accordion (Expanded mode) or Icon (Collapsed mode) */}
        <div className="px-2.5 pt-2 border-t border-slate-200/70 dark:border-white/10">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1.5">
              {Object.entries(categories).map(([cat, count]) => {
                const isSelected =
                  activeCategory === cat &&
                  activeSection === "posts" &&
                  (pathname === "/" || pathname.startsWith("/posts/"));
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    title={`${cat} (${count})`}
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/20 text-neon-cyan border border-cyan-500/40 shadow-neon-cyan"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span className="text-[9px] leading-none mt-0.5">
                      {cat.slice(0, 3)}
                    </span>
                  </button>
                );
              })}
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
                    const isSelected =
                      activeCategory === cat &&
                      activeSection === "posts" &&
                      (pathname === "/" || pathname.startsWith("/posts/"));
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500/15 text-neon-cyan border border-cyan-500/40 shadow-neon-cyan font-bold"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {isSelected ? (
                            <FolderOpen className="w-3.5 h-3.5 text-neon-cyan shrink-0 animate-pulse" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{cat}</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-cyan-500/25 text-neon-cyan border border-cyan-500/40 font-bold"
                            : "bg-white/5 text-slate-400 border border-white/10"
                        }`}>
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
      <div className="p-2.5 border-t border-cyan-500/20">
        <a
          href={siteConfig.social.github}
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub 저장소 열기"
          className={`flex items-center ${
            collapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
          } rounded-xl bg-black/50 hover:bg-cyan-500/15 text-xs font-chakra tracking-wider text-slate-300 hover:text-neon-cyan border border-cyan-500/30 hover:shadow-neon-cyan transition-all`}
        >
          {collapsed ? (
            <Github className="w-4 h-4 text-neon-cyan" />
          ) : (
            <>
              <span className="flex items-center gap-2 truncate">
                <Github className="w-4 h-4 text-neon-cyan shrink-0" />
                <span>GITHUB // @{siteConfig.githubUsername}</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            </>
          )}
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-cyan-500/20 bg-[#070b14]/90 backdrop-blur-md transition-all duration-300 z-30 overflow-y-auto ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Slide-Over Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-[#070b14] border-r border-cyan-500/40 shadow-2xl shadow-neon-cyan overflow-y-auto">
            {sidebarContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
