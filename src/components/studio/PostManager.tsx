"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  ExternalLink,
  Folder,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Copy,
  Check,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { PostStudioItem } from "@/lib/posts";
import {
  deleteGitHubFile,
  commitGitHubFile,
  getGitHubFile,
  getStoredGitHubConfig,
} from "@/lib/github-api";
import { parsePostMarkdown, serializePostMarkdown } from "@/lib/markdown-client";
import { useOperatorAuth } from "@/lib/useOperatorAuth";

interface PostManagerProps {
  posts: PostStudioItem[];
  onEditPost: (post: PostStudioItem) => void;
  onOpenSettings: () => void;
  onPostListUpdated?: () => void;
}

export function PostManager({
  posts: initialPosts,
  onEditPost,
  onOpenSettings,
  onPostListUpdated,
}: PostManagerProps) {
  const { isAuthenticated, session } = useOperatorAuth();
  const [posts, setPosts] = useState<PostStudioItem[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "HIDDEN">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [processingSlug, setProcessingSlug] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<PostStudioItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Status filter
      if (statusFilter === "PUBLISHED" && (post.draft || post.hidden)) return false;
      if (statusFilter === "HIDDEN" && !post.draft && !post.hidden) return false;

      // Category filter
      if (selectedCategory !== "ALL" && post.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.title.toLowerCase().includes(q);
        const inSlug = post.slug.toLowerCase().includes(q);
        const inCategory = post.category.toLowerCase().includes(q);
        const inSummary = (post.summary || "").toLowerCase().includes(q);
        const inTags = post.tags.some((t) => t.toLowerCase().includes(q));
        return inTitle || inSlug || inCategory || inSummary || inTags;
      }

      return true;
    });
  }, [posts, statusFilter, selectedCategory, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = posts.length;
    const hidden = posts.filter((p) => p.draft || p.hidden).length;
    const published = total - hidden;
    return { total, published, hidden };
  }, [posts]);

  // Toggle Hide / Publish
  const handleToggleHide = async (post: PostStudioItem) => {
    if (!isAuthenticated) {
      setActionMessage({
        type: "error",
        text: "운영자로 로그인해야 게시물을 가리거나 공개할 수 있습니다.",
      });
      return;
    }

    const isCurrentlyHidden = Boolean(post.draft || post.hidden);
    const newStatus = !isCurrentlyHidden;
    const targetPath = `content/posts/${post.slug}.md`;
    const actionLabel = newStatus ? "가리기 (비공개 전환)" : "공개 전환";

    const config = session?.token
      ? { token: session.token, repo: session.repo, branch: session.branch }
      : getStoredGitHubConfig();

    if (!config.token) {
      setActionMessage({
        type: "info",
        text: `운영자 세션이 만료되었거나 토큰이 없습니다. 다시 로그인해주세요.`,
      });
      onOpenSettings();
      return;
    }

    setProcessingSlug(post.slug);
    setActionMessage(null);

    try {
      // 1. Fetch remote file to get SHA and raw content
      let rawMarkdown = post.rawContent;
      let fileSha: string | undefined;

      const remoteFile = await getGitHubFile(targetPath, config);
      if (remoteFile) {
        fileSha = remoteFile.sha;
        rawMarkdown = remoteFile.rawContent;
      }

      // 2. Parse frontmatter, update draft
      const { data, content } = parsePostMarkdown(rawMarkdown);
      const updatedFrontmatter = {
        title: data.title || post.title,
        date: data.date || post.date,
        category: data.category || post.category,
        tags: data.tags || post.tags,
        summary: data.summary || post.summary,
        featured: data.featured ?? post.featured,
        draft: newStatus,
      };

      const newContent = serializePostMarkdown(updatedFrontmatter, content);

      // 3. Commit to GitHub
      const commitRes = await commitGitHubFile({
        path: targetPath,
        content: newContent,
        message: `post: ${newStatus ? "hide" : "publish"} ${post.slug}`,
        sha: fileSha,
        ...config,
      });

      if (!commitRes.success) {
        setActionMessage({
          type: "error",
          text: commitRes.error || `${actionLabel} 처리에 실패했습니다.`,
        });
        return;
      }

      // 4. Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.slug === post.slug
            ? { ...p, draft: newStatus, hidden: newStatus, rawContent: content }
            : p
        )
      );

      setActionMessage({
        type: "success",
        text: `성공! '${post.title}' 게시물이 ${newStatus ? "가려짐(비공개)" : "공개"} 상태로 커밋되었습니다. 잠시 후 GitHub Pages에 반영됩니다.`,
      });
      onPostListUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessage({ type: "error", text: `작업 중 오류 발생: ${msg}` });
    } finally {
      setProcessingSlug(null);
    }
  };

  // Perform post deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (!isAuthenticated) {
      setActionMessage({
        type: "error",
        text: "운영자로 로그인해야 게시물을 삭제할 수 있습니다.",
      });
      return;
    }

    const config = session?.token
      ? { token: session.token, repo: session.repo, branch: session.branch }
      : getStoredGitHubConfig();
    const targetPath = `content/posts/${deleteTarget.slug}.md`;

    if (!config.token) {
      // Fallback copy command
      navigator.clipboard.writeText(
        `git rm content/posts/${deleteTarget.slug}.md && git commit -m "post: delete ${deleteTarget.slug}" && git push origin ${config.branch}`
      );
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 3000);
      return;
    }

    setIsDeleting(true);

    try {
      const remote = await getGitHubFile(targetPath, config);
      const sha = remote?.sha || "";

      const res = await deleteGitHubFile({
        path: targetPath,
        sha,
        message: `post: delete ${deleteTarget.slug}`,
        ...config,
      });

      if (!res.success) {
        setActionMessage({
          type: "error",
          text: res.error || "삭제 중 오류가 발생했습니다.",
        });
        return;
      }

      // Remove from local list
      setPosts((prev) => prev.filter((p) => p.slug !== deleteTarget.slug));
      setActionMessage({
        type: "success",
        text: `'${deleteTarget.title}' 게시물이 GitHub 저장소에서 영구 삭제되었습니다.`,
      });
      setDeleteTarget(null);
      onPostListUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessage({ type: "error", text: `삭제 요청 실패: ${msg}` });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HUD Telemetry Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md">
          <span className="text-[10px] text-slate-400 block tracking-wider">
            TOTAL POSTS
          </span>
          <span className="text-xl sm:text-2xl font-bold font-cyber text-white">
            {stats.total}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 shadow-md">
          <span className="text-[10px] text-neon-cyan block tracking-wider">
            PUBLISHED (공개)
          </span>
          <span className="text-xl sm:text-2xl font-bold font-cyber text-neon-cyan">
            {stats.published}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 shadow-md">
          <span className="text-[10px] text-amber-400 block tracking-wider">
            HIDDEN (가려짐/초안)
          </span>
          <span className="text-xl sm:text-2xl font-bold font-cyber text-amber-400">
            {stats.hidden}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 shadow-md">
          <span className="text-[10px] text-purple-400 block tracking-wider">
            CATEGORIES
          </span>
          <span className="text-xl sm:text-2xl font-bold font-cyber text-purple-300">
            {categories.length}
          </span>
        </div>
      </div>

      {/* Global Notification Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn ${
            actionMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
              : actionMessage.type === "error"
              ? "border-red-500/40 bg-red-950/20 text-red-300"
              : "border-cyan-500/40 bg-cyan-950/20 text-cyan-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {actionMessage.type === "error" && (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            {actionMessage.type === "info" && (
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-black/40 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 슬러그, 카테고리, 태그 검색..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 text-white placeholder-slate-500 outline-none font-mono text-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shrink-0 font-mono text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "ALL"
                  ? "bg-cyan-500/20 text-neon-cyan border border-cyan-500/40 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ALL ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("PUBLISHED")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "PUBLISHED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              공개 ({stats.published})
            </button>
            <button
              onClick={() => setStatusFilter("HIDDEN")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "HIDDEN"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              가려짐 ({stats.hidden})
            </button>
          </div>
        </div>

        {/* Category selector row */}
        <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto no-scrollbar pt-1">
          <span className="text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
              selectedCategory === "ALL"
                ? "bg-cyan-500/20 text-neon-cyan border border-cyan-500/40 font-bold"
                : "bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold"
                  : "bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/20 font-mono text-sm text-slate-500 space-y-2">
            <p>검색 조건에 일치하는 게시물이 없습니다.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setSelectedCategory("ALL");
              }}
              className="text-xs text-neon-cyan hover:underline"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isHidden = Boolean(post.draft || post.hidden);
            const isProcessing = processingSlug === post.slug;

            return (
              <div
                key={post.slug}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isHidden
                    ? "border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50"
                    : "border-slate-800 hover:border-cyan-500/40 bg-[#070b14]/90"
                } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
              >
                {/* Post Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    {/* Status Badge */}
                    {isHidden ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        <EyeOff className="w-3 h-3" />
                        <span>HIDDEN (비공개)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PUBLISHED</span>
                      </span>
                    )}

                    {/* Category */}
                    <span className="inline-flex items-center gap-1 text-cyan-400 font-bold">
                      <Folder className="w-3 h-3" />
                      <span>{post.category}</span>
                    </span>

                    {/* Date */}
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{post.date}</span>
                    </span>

                    {/* Reading time */}
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{post.readingTime}</span>
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <h4 className="text-base sm:text-lg font-cyber font-bold text-white leading-snug break-words">
                    {post.title}
                  </h4>
                  <p className="text-xs font-mono text-slate-500 truncate">
                    /{post.slug}.md
                  </p>

                  {/* Summary */}
                  {post.summary && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {post.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {post.tags.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                        >
                          #{t}
                        </span>
                      ))}
                      {post.tags.length > 5 && (
                        <span className="text-[10px] font-mono text-slate-500">
                          +{post.tags.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Action Buttons */}
                <div className="flex items-center flex-wrap gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {isAuthenticated ? (
                    <>
                      {/* Edit in Studio */}
                      <button
                        onClick={() => onEditPost(post)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-neon-cyan border border-cyan-500/30 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                        title="Studio에서 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>

                      {/* Toggle Hide / Publish */}
                      <button
                        onClick={() => handleToggleHide(post)}
                        disabled={isProcessing}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 cursor-pointer disabled:opacity-40 ${
                          isHidden
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                        title={isHidden ? "공개 상태로 전환" : "블로그에서 가리기"}
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isHidden ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        <span>{isHidden ? "공개하기" : "가리기"}</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteTarget(post)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                        title="게시물 영구 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">삭제</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                      <span>수정 불가 (운영자 전용)</span>
                    </span>
                  )}

                  {/* View link (if published) */}
                  {!isHidden && (
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="새 창에서 글 보기"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl border border-red-500/50 bg-[#090b14] shadow-[0_0_50px_rgba(255,0,85,0.3)] p-6 space-y-5 cyber-corner text-xs font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-red-400 border-b border-red-500/20 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-cyber font-bold tracking-wider text-white">
                게시물 삭제 확인 (PERMANENT DELETE)
              </h3>
            </div>

            <div className="space-y-2">
              <p className="text-slate-300">
                정말로 다음 게시물을 삭제하시겠습니까?
              </p>
              <div className="p-3 rounded-xl bg-black/60 border border-red-500/30 space-y-1">
                <p className="font-bold text-white text-sm break-words">
                  {deleteTarget.title}
                </p>
                <p className="text-slate-400 text-[11px]">
                  경로: content/posts/{deleteTarget.slug}.md
                </p>
              </div>
              <p className="text-red-400/90 text-[11px] leading-relaxed">
                ※ GitHub 토큰이 설정되어 있으면 원격 저장소에서 파일이 직접 삭제되며 자동 재배포됩니다.
              </p>
            </div>

            {/* If no token, show manual git command */}
            {!getStoredGitHubConfig().token && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 text-[10px] block">
                  로컬 Git 수동 삭제 명령어:
                </span>
                <div className="flex items-center justify-between gap-2 p-2 rounded bg-black font-mono text-[11px] text-neon-cyan overflow-x-auto">
                  <code>git rm content/posts/{deleteTarget.slug}.md</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `git rm content/posts/${deleteTarget.slug}.md && git commit -m "post: delete ${deleteTarget.slug}"`
                      );
                      setCopiedCmd(true);
                      setTimeout(() => setCopiedCmd(false), 2000);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-slate-300"
                    title="명령어 복사"
                  >
                    {copiedCmd ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-cyber font-bold tracking-wider shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "삭제 진행 중..." : "영구 삭제"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
