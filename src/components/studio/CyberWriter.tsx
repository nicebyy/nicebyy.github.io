"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Code,
  FileCode2,
  Quote,
  AlertCircle,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Download,
  Copy,
  Check,
  Send,
  RefreshCw,
  Folder,
  Calendar,
  Clock,
  Tag,
  Eye,
  Columns,
  Maximize2,
  FileText,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PostStudioItem } from "@/lib/posts";
import {
  serializePostMarkdown,
  parsePostMarkdown,
  generateSlug,
  renderMarkdownToHtml,
  FrontmatterData,
} from "@/lib/markdown-client";
import {
  commitGitHubFile,
  getGitHubFile,
  getStoredGitHubConfig,
} from "@/lib/github-api";

interface CyberWriterProps {
  initialPost?: PostStudioItem | null;
  allCategories: string[];
  popularTags: string[];
  onOpenSettings: () => void;
  onPostSaved?: (slug: string) => void;
}

const AUTOSAVE_KEY = "cyber_studio_autosave_draft";

export function CyberWriter({
  initialPost,
  allCategories,
  popularTags,
  onOpenSettings,
  onPostSaved,
}: CyberWriterProps) {
  // Frontmatter State
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [isSlugAuto, setIsSlugAuto] = useState(!initialPost);
  const [date, setDate] = useState(
    initialPost?.date || new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState(initialPost?.category || "Dev");
  const [customCat, setCustomCat] = useState("");
  const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [summary, setSummary] = useState(initialPost?.summary || "");
  const [featured, setFeatured] = useState(Boolean(initialPost?.featured));
  const [draft, setDraft] = useState(
    Boolean(initialPost?.draft || initialPost?.hidden)
  );

  // Markdown Body
  const [body, setBody] = useState(initialPost?.rawContent || "");

  // View Mode: split, edit, preview
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

  // Live HTML Preview
  const [htmlPreview, setHtmlPreview] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  // Status & Actions
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When initialPost prop changes (e.g. user clicked "Edit" in PostManager)
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title);
      setSlug(initialPost.slug);
      setIsSlugAuto(false);
      setDate(initialPost.date);
      setCategory(initialPost.category);
      setTags(initialPost.tags);
      setSummary(initialPost.summary);
      setFeatured(Boolean(initialPost.featured));
      setDraft(Boolean(initialPost.draft || initialPost.hidden));
      setBody(initialPost.rawContent || "");
      setStatusMessage({
        type: "info",
        text: `'${initialPost.title}' 편집 모드로 불러왔습니다.`,
      });
    }
  }, [initialPost]);

  // Auto-slug from title if enabled
  useEffect(() => {
    if (isSlugAuto && title) {
      setSlug(generateSlug(title));
    }
  }, [title, isSlugAuto]);

  // Autosave to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || initialPost) return;

    const timer = setTimeout(() => {
      const payload = {
        title,
        slug,
        date,
        category,
        tags,
        summary,
        featured,
        draft,
        body,
        savedAt: Date.now(),
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, slug, date, category, tags, summary, featured, draft, body, initialPost]);

  // Load autosaved draft on mount if no initialPost
  useEffect(() => {
    if (initialPost) return;
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.title || data.body) {
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setIsSlugAuto(false);
          setDate(data.date || new Date().toISOString().split("T")[0]);
          setCategory(data.category || "Dev");
          setTags(Array.isArray(data.tags) ? data.tags : []);
          setSummary(data.summary || "");
          setFeatured(Boolean(data.featured));
          setDraft(Boolean(data.draft));
          setBody(data.body || "");
          setStatusMessage({
            type: "info",
            text: "이전에 작성 중이던 임시 저장 글을 복원했습니다.",
          });
        }
      }
    } catch {
      // ignore
    }
  }, [initialPost]);

  // Debounced live markdown preview compilation
  useEffect(() => {
    let cancel = false;
    setIsRendering(true);

    const timer = setTimeout(async () => {
      const rendered = await renderMarkdownToHtml(body || "*작성된 내용이 없습니다.*");
      if (!cancel) {
        setHtmlPreview(rendered);
        setIsRendering(false);
      }
    }, 150);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [body]);

  // Stats
  const wordCount = useMemo(() => {
    return body.trim().split(/\s+/).filter(Boolean).length;
  }, [body]);

  const readingTime = useMemo(() => {
    const minutes = Math.max(1, Math.ceil(wordCount / 180));
    return `${minutes} min read`;
  }, [wordCount]);

  // Insert formatting snippet into textarea
  const insertSnippet = useCallback(
    (prefix: string, suffix: string = "", defaultText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end) || defaultText;
      const replacement = `${prefix}${selected}${suffix}`;

      const newContent =
        textarea.value.substring(0, start) +
        replacement +
        textarea.value.substring(end);

      setBody(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selected.length
        );
      }, 0);
    },
    []
  );

  // Tag chip handlers
  const handleAddTag = (newTag: string) => {
    const clean = newTag.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Reset editor
  const handleReset = () => {
    if (confirm("작성 중인 내용을 초기화하고 새 글을 작성하시겠습니까?")) {
      setTitle("");
      setSlug("");
      setIsSlugAuto(true);
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("Dev");
      setCustomCat("");
      setTags([]);
      setSummary("");
      setFeatured(false);
      setDraft(false);
      setBody("");
      setStatusMessage(null);
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  };

  // Compile full markdown string
  const getCompiledMarkdown = (): string => {
    const meta: FrontmatterData = {
      title: title.trim() || "Untitled Log",
      date: date.trim() || new Date().toISOString().split("T")[0],
      category: (customCat.trim() || category.trim()) || "Dev",
      tags,
      summary: summary.trim(),
      featured,
      draft,
    };
    return serializePostMarkdown(meta, body);
  };

  // Copy full markdown
  const handleCopyMarkdown = () => {
    const full = getCompiledMarkdown();
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download .md file
  const handleDownloadFile = () => {
    const targetSlug = slug.trim() || generateSlug(title) || "post";
    const full = getCompiledMarkdown();
    const blob = new Blob([full], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${targetSlug}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage({
      type: "success",
      text: `'${targetSlug}.md' 파일이 성공적으로 다운로드되었습니다.`,
    });
  };

  // Commit & Publish to GitHub
  const handlePublishToGitHub = async () => {
    if (!title.trim()) {
      setStatusMessage({ type: "error", text: "게시물 제목을 입력해주세요." });
      return;
    }

    const targetSlug = slug.trim() || generateSlug(title);
    if (!targetSlug) {
      setStatusMessage({ type: "error", text: "유효한 URL 슬러그를 입력해주세요." });
      return;
    }

    const config = getStoredGitHubConfig();
    if (!config.token) {
      setStatusMessage({
        type: "info",
        text: "GitHub 토큰이 필요합니다. 상단 'GITHUB 설정'에서 토큰을 설정해주세요.",
      });
      onOpenSettings();
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const targetPath = `content/posts/${targetSlug}.md`;
      const fullMarkdown = getCompiledMarkdown();

      // Check if file already exists remotely to get SHA
      const remote = await getGitHubFile(targetPath, config);
      const isNew = !remote;

      const res = await commitGitHubFile({
        path: targetPath,
        content: fullMarkdown,
        message: `post: ${isNew ? "create" : "update"} ${title.trim()} (${targetSlug})`,
        sha: remote?.sha,
        ...config,
      });

      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.error || "GitHub 커밋 중 오류가 발생했습니다.",
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: `성공! '${title}' 글이 '${config.branch}' 브랜치에 커밋되었습니다. GitHub Actions를 통해 약 1~2분 내 블로그에 배포됩니다.`,
      });

      // Clear autosave draft
      localStorage.removeItem(AUTOSAVE_KEY);
      onPostSaved?.(targetSlug);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({ type: "error", text: `발행 실패: ${msg}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn ${
            statusMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
              : statusMessage.type === "error"
              ? "border-red-500/40 bg-red-950/20 text-red-300"
              : "border-cyan-500/40 bg-cyan-950/20 text-cyan-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {statusMessage.type === "error" && (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            {statusMessage.type === "info" && (
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Meta Configuration Card (Frontmatter Form) */}
      <div className="p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-[#070b16]/95 shadow-[0_0_30px_rgba(0,243,255,0.1)] space-y-4 cyber-corner">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-ping" />
            <span className="text-xs font-mono font-bold text-neon-cyan tracking-wider">
              POST METADATA / FRONTMATTER CONFIG
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>새 글 초기화</span>
          </button>
        </div>

        {/* Title Input */}
        <div className="space-y-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시물 제목을 입력하세요 (예: [Next.js] 정적 사이트 블로그 구축 가이드)"
            className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 outline-none font-cyber font-bold text-base sm:text-lg transition-all"
          />
        </div>

        {/* Slug & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>URL SLUG (content/posts/[slug].md)</span>
              <button
                type="button"
                onClick={() => setIsSlugAuto(!isSlugAuto)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                {isSlugAuto ? "● 자동 생성 중" : "○ 수동 입력 모드"}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsSlugAuto(false);
                  setSlug(e.target.value);
                }}
                placeholder="my-post-slug"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-neon-cyan outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 block">발행 일자 (DATE)</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-white outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Category & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {/* Category Dropdown & Custom */}
          <div className="space-y-1">
            <span className="text-slate-400 block">카테고리 (CATEGORY)</span>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== "CUSTOM") setCustomCat("");
                }}
                className="w-1/2 px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-white outline-none font-mono text-xs"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CUSTOM">+ 직접 입력</option>
              </select>

              <input
                type="text"
                value={customCat}
                onChange={(e) => {
                  setCustomCat(e.target.value);
                  setCategory("CUSTOM");
                }}
                placeholder="직접 입력 (예: PS/BOJ)"
                className="w-1/2 px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-white placeholder-slate-600 outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Tags Chip Input */}
          <div className="space-y-1">
            <span className="text-slate-400 block">태그 (TAGS - Enter로 추가)</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="태그 입력 후 Enter..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-white placeholder-slate-600 outline-none font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        {/* Tag chips list & suggestions */}
        <div className="space-y-1 text-xs font-mono">
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-neon-cyan border border-cyan-500/30 text-xs font-mono"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-400 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggested tags */}
          {popularTags.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 overflow-x-auto no-scrollbar pt-1">
              <span className="shrink-0">추천 태그:</span>
              {popularTags.slice(0, 8).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => handleAddTag(pt)}
                  className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
                >
                  +{pt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Input */}
        <div className="space-y-1 text-xs font-mono">
          <span className="text-slate-400 block">요약문 (SUMMARY - 검색 및 SNS 미리보기 설명)</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="게시물의 핵심 내용을 요약하여 작성하세요."
            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-white placeholder-slate-600 outline-none font-mono text-xs resize-none"
          />
        </div>

        {/* Toggles (Draft / Featured) */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800 text-xs font-mono">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={draft}
              onChange={(e) => setDraft(e.target.checked)}
              className="w-4 h-4 rounded bg-black border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span
              className={`font-bold transition-colors ${
                draft ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
              }`}
            >
              ⦸ 비공개 / 가리기 모드 (draft: true)
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded bg-black border-slate-700 text-pink-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span
              className={`font-bold transition-colors ${
                featured ? "text-pink-400" : "text-slate-400 group-hover:text-slate-200"
              }`}
            >
              ★ 추천 게시물 (featured: true)
            </span>
          </label>
        </div>
      </div>

      {/* Editor HUD Toolbar & View Switcher */}
      <div className="p-2 sm:p-2.5 rounded-2xl border border-slate-800 bg-black/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {/* Formatting Shortcuts */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={() => insertSnippet("**", "**", "굵은 텍스트")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="굵게 (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("*", "*", "기울임 텍스트")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="기울임 (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet("## ", "\n", "제목 2")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="H2 제목"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("### ", "\n", "제목 3")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="H3 제목"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet("`", "`", "code")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="인라인 코드"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet("```typescript\n", "\n```\n", "// 코드 작성")
            }
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="코드 블록"
          >
            <FileCode2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("> ", "\n", "인용구")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="인용구"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet("> [!NOTE]\n> ", "\n", "사이버펑크 알림 내용")
            }
            className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400 hover:text-neon-cyan"
            title="사이버펑크 알림 (Callout)"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet(
                "\n| 항목 | 설명 |\n| :--- | :--- |\n| 데이터1 | 내용1 |\n"
              )
            }
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="표 (Table)"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("[", "](https://example.com)", "링크 텍스트")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="링크"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet("![", "](/images/example.png)", "이미지 설명")
            }
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="이미지"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("\n---\n\n")}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
            title="구분선"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "split"
                ? "bg-cyan-500/20 text-neon-cyan font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "edit"
                ? "bg-cyan-500/20 text-neon-cyan font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Edit Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "preview"
                ? "bg-cyan-500/20 text-neon-cyan font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Preview Only
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch min-h-[550px]">
        {/* Editor Pane (Left) */}
        {(viewMode === "split" || viewMode === "edit") && (
          <div
            className={`flex flex-col rounded-3xl border border-cyan-500/30 bg-[#060911]/90 shadow-xl p-4 sm:p-5 space-y-2 ${
              viewMode === "edit" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1 text-neon-cyan font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>MARKDOWN EDITOR</span>
              </span>
              <div className="flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>{body.length} chars</span>
                <span>{readingTime}</span>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  insertSnippet("  ");
                }
              }}
              placeholder="마크다운 본문을 작성하세요... (GitHub 마크다운 문법 지원)"
              className="flex-1 w-full h-full min-h-[450px] bg-transparent text-slate-100 placeholder-slate-600 outline-none font-mono text-xs sm:text-sm leading-relaxed resize-y selection:bg-cyan-500/30 selection:text-neon-cyan"
            />
          </div>
        )}

        {/* Live Preview Pane (Right) */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div
            className={`flex flex-col rounded-3xl border border-cyan-500/30 bg-[#0b101e]/95 shadow-xl p-4 sm:p-8 space-y-4 overflow-y-auto max-h-[800px] cyber-corner ${
              viewMode === "preview" ? "lg:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-cyan-500/20 pb-2">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>LIVE BLOG PREVIEW</span>
              </span>
              <span>{isRendering ? "Rendering..." : "Synchronized"}</span>
            </div>

            {/* Post Header Preview */}
            <div className="space-y-3 pb-6 border-b border-cyan-500/20">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-neon-cyan border border-cyan-500/30 font-bold">
                  {customCat || category}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readingTime}
                </span>
                {draft && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    HIDDEN (DRAFT)
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-cyber font-black text-white leading-tight break-words">
                {title || "Untitled Post Title"}
              </h1>

              {summary && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {summary}
                </p>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rendered HTML */}
            <div
              className="prose-cyber min-w-0 w-full max-w-full"
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="p-4 sm:p-5 rounded-3xl border border-cyan-500/30 bg-[#070b16] shadow-[0_0_40px_rgba(0,243,255,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>로컬 자동 임시 저장 활성화됨</span>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-end">
          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 text-xs font-mono transition-all active:scale-95"
            title="전체 마크다운 복사"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "복사됨!" : "마크다운 복사"}</span>
          </button>

          {/* Download .md */}
          <button
            type="button"
            onClick={handleDownloadFile}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all active:scale-95"
            title=".md 파일 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>.md 다운로드</span>
          </button>

          {/* Direct Publish to GitHub */}
          <button
            type="button"
            onClick={handlePublishToGitHub}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-black font-cyber font-bold text-xs tracking-wider shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Send className="w-4 h-4 text-black" />
            )}
            <span>
              {isSaving ? "GITHUB 커밋 전송 중..." : "🚀 GITHUB 즉시 커밋 & 발행"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
