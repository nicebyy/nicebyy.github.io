"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
import { buildCategoryTree, CategoryNode } from "@/lib/categories";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 520;
const DEFAULT_SIDEBAR_WIDTH = 256;

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
  const [tagsOpen, setTagsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Resizable sidebar width state & drag handler
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarWidthRef = useRef(sidebarWidth);

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  // Restore saved width from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kimgatta_sidebar_width");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle resizing mouse & touch movements
  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (clientX: number) => {
      const maxWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.floor(window.innerWidth * 0.5));
      const clamped = Math.min(Math.max(clientX, MIN_SIDEBAR_WIDTH), maxWidth);
      setSidebarWidth(clamped);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      setIsResizing(false);
      try {
        localStorage.setItem("kimgatta_sidebar_width", String(sidebarWidthRef.current));
      } catch {
        // ignore
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [isResizing]);

  const handleResetWidth = (e: React.MouseEvent) => {
    e.preventDefault();
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    try {
      localStorage.setItem("kimgatta_sidebar_width", String(DEFAULT_SIDEBAR_WIDTH));
    } catch {
      // ignore
    }
  };

  // Hierarchical category tree
  const categoryTree = useMemo(() => buildCategoryTree(posts), [posts]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    Backend: true,
  });

  const toggleFolder = (folderName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

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
                  title="kimkkatta 소개 (About)"
                  className={`flex items-center ${
                    collapsed ? "justify-center px-2" : "gap-2.5 px-3"
                  } py-2 rounded-xl text-xs font-mono transition-all ${
                    isAboutActive
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/50 shadow-neon-purple font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-purple-500/20"
                  }`}
                >
                  <User className={`w-4 h-4 shrink-0 ${isAboutActive ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]" : "text-slate-500"}`} />
                  {!collapsed && <span>About kimkkatta</span>}
                </Link>
              </>
            );
          })()}
        </div>

        {/* Categories Accordion (Expanded mode) or Icon (Collapsed mode) */}
        <div className="px-2.5 pt-2 border-t border-slate-200/70 dark:border-white/10">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1.5">
              {categoryTree.map((node) => {
                const isSelected =
                  (activeCategory === node.fullPath ||
                    activeCategory.startsWith(node.fullPath + "/")) &&
                  activeSection === "posts" &&
                  (pathname === "/" || pathname.startsWith("/posts/"));
                return (
                  <button
                    key={node.fullPath}
                    type="button"
                    onClick={() => handleSelectCategory(node.fullPath)}
                    title={`${node.name} (${node.count})`}
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/20 text-neon-cyan border border-cyan-500/40 shadow-neon-cyan"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span className="text-[9px] leading-none mt-0.5">
                      {node.name.slice(0, 3)}
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
                  {categoryTree.map((node) => {
                    const hasChildren = node.children.length > 0;
                    const isExpanded = Boolean(expandedFolders[node.name]);
                    const isExactSelected = activeCategory === node.fullPath;
                    const isChildSelected = activeCategory.startsWith(
                      node.fullPath + "/"
                    );
                    const isSelected =
                      (isExactSelected || isChildSelected) &&
                      activeSection === "posts" &&
                      (pathname === "/" || pathname.startsWith("/posts/"));

                    return (
                      <div key={node.fullPath} className="space-y-0.5">
                        <div
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                            isSelected
                              ? "bg-cyan-500/15 text-neon-cyan border border-cyan-500/40 shadow-neon-cyan font-bold"
                              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/20"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectCategory(node.fullPath)}
                            className="flex-1 flex items-center gap-2 truncate text-left cursor-pointer"
                          >
                            {isSelected ? (
                              <FolderOpen className="w-3.5 h-3.5 text-neon-cyan shrink-0 animate-pulse" />
                            ) : (
                              <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="truncate">{node.name}</span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              onClick={() => handleSelectCategory(node.fullPath)}
                              className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                                isSelected
                                  ? "bg-cyan-500/25 text-neon-cyan border border-cyan-500/40 font-bold"
                                  : "bg-white/5 text-slate-400 border border-white/10"
                              }`}
                            >
                              {node.count}
                            </span>
                            {hasChildren && (
                              <button
                                type="button"
                                onClick={(e) => toggleFolder(node.name, e)}
                                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-neon-cyan transition-colors cursor-pointer"
                                title={
                                  isExpanded
                                    ? "서브카테고리 접기"
                                    : "서브카테고리 펼치기"
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-neon-cyan" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {hasChildren && isExpanded && (
                          <div className="ml-3 pl-2.5 border-l border-cyan-500/20 space-y-0.5 pt-0.5">
                            {node.children.map((child) => {
                              const isChildActive =
                                activeCategory === child.fullPath &&
                                activeSection === "posts" &&
                                (pathname === "/" ||
                                  pathname.startsWith("/posts/"));
                              return (
                                <button
                                  key={child.fullPath}
                                  type="button"
                                  onClick={() =>
                                    handleSelectCategory(child.fullPath)
                                  }
                                  className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                                    isChildActive
                                      ? "bg-cyan-500/20 text-neon-cyan border border-cyan-500/50 shadow-[0_0_8px_rgba(0,243,255,0.3)] font-bold"
                                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    <span className="text-[10px] text-cyan-500/60 font-mono">
                                      └
                                    </span>
                                    <span className="truncate">
                                      {child.name}
                                    </span>
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                                      isChildActive
                                        ? "bg-cyan-500/30 text-neon-cyan font-bold"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {child.count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
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
      {/* Desktop Sticky Collapsible & Resizable Sidebar */}
      <aside
        style={{ width: isCollapsed ? 64 : sidebarWidth }}
        className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-cyan-500/20 bg-[#070b14]/90 backdrop-blur-md z-30 relative ${
          isResizing ? "transition-none select-none" : "transition-[width] duration-300"
        }`}
      >
        <div className="flex-1 min-h-0 overflow-y-auto cyber-scrollbar flex flex-col">
          {sidebarContent(isCollapsed)}
        </div>

        {/* Cyberpunk Neon Resizer Handle (Only when expanded) */}
        {!isCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="사이드바 너비 조절"
            title="드래그하여 사이드바 너비 조절 (더블 클릭: 기본 크기 복원)"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            onTouchStart={() => {
              setIsResizing(true);
            }}
            onDoubleClick={handleResetWidth}
            className={`absolute top-0 -right-2 w-4 h-full cursor-col-resize z-40 flex items-center justify-center transition-colors group select-none ${
              isResizing ? "bg-cyan-500/20" : "hover:bg-cyan-500/10"
            }`}
          >
            {/* 세로 네온 가이드라인 */}
            <div
              className={`w-[2px] h-full transition-all duration-150 ${
                isResizing
                  ? "bg-neon-cyan shadow-[0_0_8px_#00f3ff,0_0_16px_#00f3ff]"
                  : "bg-transparent group-hover:bg-cyan-400/70 group-hover:shadow-[0_0_6px_#00f3ff]"
              }`}
            />

            {/* 중앙 사이버펑크 네온 도트 핸들 */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center justify-center py-2 px-0.5 rounded-full border transition-all duration-150 pointer-events-none ${
                isResizing
                  ? "border-cyan-400 bg-black shadow-[0_0_10px_#00f3ff] opacity-100 scale-110"
                  : "opacity-0 group-hover:opacity-100 border-cyan-500/60 bg-[#070b14] shadow-[0_0_6px_rgba(0,243,255,0.4)]"
              }`}
            >
              <div className="w-1 h-1 rounded-full bg-neon-cyan shadow-[0_0_3px_#00f3ff]" />
              <div className="w-1 h-1 rounded-full bg-neon-pink shadow-[0_0_3px_#ff007f]" />
              <div className="w-1 h-1 rounded-full bg-neon-cyan shadow-[0_0_3px_#00f3ff]" />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Slide-Over Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-[#070b14] border-r border-cyan-500/40 shadow-2xl shadow-neon-cyan overflow-y-auto cyber-scrollbar">
            {sidebarContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
