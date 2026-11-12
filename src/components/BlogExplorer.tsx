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

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [posts]);

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

  return (
    <section id="posts" className="py-6 space-y-6 scroll-mt-20">
      {/* Control Bar: Search + Category Filter + View Mode */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0b101e]/90 p-4 sm:p-5 shadow-md space-y-4">
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
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm font-mono bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-white/15 focus:outline-none focus:border-cyan-500 dark:focus:border-neon-cyan transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              SHOWING{" "}
              <strong className="text-cyan-600 dark:text-neon-cyan">
                {filteredPosts.length}
              </strong>{" "}
              / {posts.length} LOGS
            </span>
            <div className="flex items-center rounded-xl p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-cyan-500/20 text-cyan-600 dark:text-neon-cyan shadow-sm"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
                title="카드 그리드 뷰"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-cyan-500/20 text-cyan-600 dark:text-neon-cyan shadow-sm"
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
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
            <Folder className="w-3.5 h-3.5 text-cyan-500" />
            <span>CATEGORY:</span>
          </span>
          {Object.entries(categories).map(([cat, count]) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? "bg-cyan-600 dark:bg-cyan-500/20 text-white dark:text-neon-cyan border border-cyan-600 dark:border-neon-cyan shadow-sm"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10 border border-transparent"
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
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5 text-purple-500" />
              <span>TAGS:</span>
            </span>
            {allTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(active ? null : tag)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                    active
                      ? "bg-purple-600 dark:bg-purple-500/25 text-white dark:text-purple-200 border border-purple-500"
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 border border-slate-200/70 dark:border-white/10"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[11px] font-mono text-rose-500 hover:underline ml-1"
              >
                [Reset Tag]
              </button>
            )}
          </div>
        )}
      </div>

      {/* Posts Display */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/15 p-12 text-center space-y-3">
          <p className="font-mono text-base text-slate-600 dark:text-slate-300">
            [404_NO_MATCHING_LOGS] 조건에 맞는 게시글이 없습니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedTag(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-mono bg-cyan-500/15 text-cyan-700 dark:text-neon-cyan border border-cyan-500/30 hover:bg-cyan-500/25 transition-all"
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
              className="group relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101e]/90 p-6 shadow-sm hover:shadow-xl hover:border-cyan-500/60 dark:hover:border-neon-cyan/60 dark:hover:shadow-neon-cyan transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Meta Row */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-neon-cyan border border-cyan-500/25 font-semibold">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/25 text-[11px]">
                        <Flame className="w-3 h-3" />
                        <span>PINNED</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-neon-cyan transition-colors leading-snug flex items-start justify-between gap-2">
                  <span>{post.title}</span>
                  <ArrowUpRight className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-cyan-500" />
                </h2>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              {/* Tags Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101e]/90 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-cyan-500/[0.04] transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-cyan-600 dark:text-neon-cyan font-semibold">
                    [{post.category}]
                  </span>
                  <span className="text-slate-400">{post.date}</span>
                  <span className="text-slate-400">· {post.readingTime}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-neon-cyan transition-colors truncate">
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
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-neon-cyan ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
