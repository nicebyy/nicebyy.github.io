"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Clock,
  Tag,
  Folder,
  ArrowUpRight,
  LayoutGrid,
  List,
  X,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PostMeta } from "@/lib/posts";

export function BlogExplorer({ posts }: { posts: PostMeta[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    };
    const handleFocusEvent = () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    };

    const handleSidebarCategory = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setSelectedCategory(custom.detail);
        setSelectedTag(null);
      }
    };

    const handleSidebarTag = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        setSelectedTag(custom.detail);
        setSelectedCategory("ALL");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("focus-blog-search", handleFocusEvent);
    window.addEventListener("sidebar-select-category", handleSidebarCategory);
    window.addEventListener("sidebar-select-tag", handleSidebarTag);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focus-blog-search", handleFocusEvent);
      window.removeEventListener(
        "sidebar-select-category",
        handleSidebarCategory
      );
      window.removeEventListener("sidebar-select-tag", handleSidebarTag);
    };
  }, []);

  const categories = useMemo(() => {
    const counts: Record<string, number> = { ALL: posts.length };
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // 태그별 포스트 빈도수 계산 및 내림차순 정렬
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      p.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [posts]);

  const allTags = useMemo(() => {
    const tags = Object.keys(tagCounts);
    tags.sort((a, b) => {
      const diff = tagCounts[b] - tagCounts[a];
      if (diff !== 0) return diff;
      return a.localeCompare(b);
    });
    return tags;
  }, [tagCounts]);

  const TAG_LIMIT = 12;
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const visibleTags = useMemo(() => {
    if (isTagsExpanded || allTags.length <= TAG_LIMIT) {
      return allTags;
    }
    const base = allTags.slice(0, TAG_LIMIT);
    if (selectedTag && !base.includes(selectedTag)) {
      base.push(selectedTag);
    }
    return base;
  }, [allTags, isTagsExpanded, selectedTag]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "ALL" || post.category === selectedCategory;
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    window.dispatchEvent(
      new CustomEvent("blog-select-category", { detail: cat })
    );
  };

  return (
    <section id="posts" className="py-6 space-y-6 scroll-mt-20">
      {/* Control Bar: Search + Category Filter + View Mode */}
      <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-white/95 dark:bg-[#0b101e]/95 p-4 sm:p-5 shadow-md dark:shadow-[0_0_20px_rgba(0,243,255,0.1)] space-y-4 cyber-corner">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-600 dark:text-neon-cyan absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="포스트 제목, 요약, 태그 검색... (Ctrl + K)"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-cyan-500/30 focus:outline-none focus:border-neon-cyan focus:dark:shadow-neon-cyan transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neon-cyan"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              LOGS // <strong className="text-cyan-600 dark:text-neon-cyan dark:drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]">
                {filteredPosts.length}
              </strong>{" "}
              / {posts.length}
            </span>
            <div className="flex items-center rounded-xl p-1 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-cyan-500/30">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-cyan-500/25 text-cyan-600 dark:text-neon-cyan shadow-sm dark:shadow-neon-cyan"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
                title="카드 그리드 뷰"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-cyan-500/25 text-cyan-600 dark:text-neon-cyan shadow-sm dark:shadow-neon-cyan"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
                title="터미널 리스트 뷰"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0 sm:flex-wrap">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Folder className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="dark:text-neon-cyan">CATEGORY:</span>
          </span>
          {Object.entries(categories).map(([cat, count]) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 select-none active:scale-95 ${
                  active
                    ? "bg-cyan-600 dark:bg-cyan-500/20 text-white dark:text-neon-cyan border border-cyan-600 dark:border-neon-cyan shadow-sm dark:shadow-neon-cyan font-bold"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-cyan-500/10 border border-transparent dark:hover:border-cyan-500/30"
                }`}
              >
                <span>{cat}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-cyan-500/15 overflow-x-auto no-scrollbar touch-pan-x pb-1 sm:pb-0 sm:flex-wrap">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1 shrink-0">
              <Tag className="w-3.5 h-3.5 text-neon-pink" />
              <span className="dark:text-neon-pink">TAGS:</span>
            </span>
            {visibleTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(active ? null : tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer shrink-0 select-none active:scale-95 ${
                    active
                      ? "bg-pink-600 dark:bg-pink-500/25 text-white dark:text-neon-pink border border-pink-500 shadow-sm dark:shadow-neon-pink font-bold"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-neon-pink border border-slate-200/70 dark:border-white/10 dark:hover:border-pink-500/40"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}

            {/* Expand / Collapse Button */}
            {allTags.length > TAG_LIMIT && (
              <button
                type="button"
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="px-2.5 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer shrink-0 select-none active:scale-95 flex items-center gap-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-neon-pink border border-pink-500/30 hover:border-pink-500/60 shadow-sm dark:shadow-[0_0_8px_rgba(255,0,127,0.2)] font-semibold"
              >
                {isTagsExpanded ? (
                  <>
                    <span>접기</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>+{allTags.length - TAG_LIMIT} 더보기</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}

            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[11px] font-mono text-rose-500 hover:underline ml-1 shrink-0 cursor-pointer"
              >
                [Reset Tag]
              </button>
            )}
          </div>
        )}
      </div>

      {/* Posts Display */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-cyan-500/30 p-12 text-center space-y-3 cyber-corner">
          <p className="font-mono text-base text-slate-600 dark:text-neon-cyan">
            [404_NO_MATCHING_LOGS] 조건에 맞는 아카이브가 없습니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              handleCategorySelect("ALL");
              setSelectedTag(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-mono bg-cyan-500/15 text-cyan-700 dark:text-neon-cyan border border-cyan-500/40 hover:bg-cyan-500/25 dark:shadow-neon-cyan transition-all cursor-pointer"
          >
            필터 초기화
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group relative rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-[#0b101e]/95 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-cyan-500/60 dark:hover:border-neon-cyan dark:hover:shadow-neon-cyan transition-all flex flex-col justify-between cyber-corner"
            >
              <div className="space-y-3">
                {/* Top Meta Row */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-neon-cyan border border-cyan-500/30 group-hover:dark:shadow-[0_0_10px_rgba(0,243,255,0.4)] font-bold transition-all">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-pink-500/10 text-neon-pink border border-pink-500/40 text-[11px] font-bold dark:shadow-[0_0_10px_rgba(255,0,127,0.3)] animate-pulse">
                        <Flame className="w-3 h-3 text-neon-pink" />
                        <span>PINNED</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500/70" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-500/70" />
                      {post.readingTime}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-black font-cyber tracking-wide text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-neon-cyan dark:group-hover:drop-shadow-[0_0_10px_#00f3ff] transition-all leading-snug flex items-start justify-between gap-2">
                  <span className="break-words min-w-0">{post.title}</span>
                  <ArrowUpRight className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-neon-cyan group-hover:drop-shadow-[0_0_8px_#00f3ff]" />
                </h2>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              {/* Tags Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-black/50 text-slate-600 dark:text-slate-400 group-hover:dark:text-slate-200 border border-slate-200/60 dark:border-cyan-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-[#0b101e]/95 divide-y divide-slate-100 dark:divide-cyan-500/15 overflow-hidden cyber-corner">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-cyan-500/[0.08] dark:hover:border-l-4 dark:hover:border-neon-cyan transition-all"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-cyan-600 dark:text-neon-cyan font-bold">
                    [{post.category}]
                  </span>
                  <span className="text-slate-400">{post.date}</span>
                  <span className="text-slate-400">· {post.readingTime}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black font-cyber tracking-wide text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-neon-cyan dark:group-hover:drop-shadow-[0_0_8px_#00f3ff] transition-all truncate">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {post.summary}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-slate-400 border border-transparent dark:border-cyan-500/20"
                  >
                    #{tag}
                  </span>
                ))}
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-neon-cyan group-hover:drop-shadow-[0_0_6px_#00f3ff] ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
