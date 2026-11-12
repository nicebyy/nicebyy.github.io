import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, Folder } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { PostEnhancer } from "@/components/PostEnhancer";
import { GiscusComments } from "@/components/GiscusComments";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }
  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="py-4">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-white dark:bg-white/5 hover:bg-cyan-500/10 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-neon-cyan border border-slate-200 dark:border-white/10 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>cd ~/dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Article Column */}
        <article className="flex-1 min-w-0 w-full rounded-3xl border border-slate-200 dark:border-cyan-500/30 bg-white/95 dark:bg-[#0b101e]/95 p-4 sm:p-8 md:p-10 shadow-xl dark:shadow-[0_0_30px_rgba(0,243,255,0.15)] cyber-corner">
          {/* Post Header */}
          <header className="pb-6 mb-8 border-b border-slate-200 dark:border-cyan-500/20 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-neon-cyan border border-cyan-500/40 font-bold dark:shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                <Folder className="w-3.5 h-3.5 text-neon-cyan" />
                {post.category.includes("/") ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="opacity-80">
                      {post.category.split("/")[0]}
                    </span>
                    <span className="text-[10px] text-cyan-500/60 font-mono">
                      ❯
                    </span>
                    <span>
                      {post.category.split("/").slice(1).join("/")}
                    </span>
                  </span>
                ) : (
                  <span>{post.category}</span>
                )}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-cyber tracking-wide text-slate-900 dark:text-white leading-tight break-words">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {post.summary}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3.5 h-3.5 text-purple-500 mr-1" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Markdown Body */}
          <div
            className="prose-cyber"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Prev / Next Post Navigation */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/posts/${prevPost.slug}`}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-neon-cyan/50 bg-slate-50/70 dark:bg-white/[0.02] transition-all"
              >
                <span className="text-[11px] font-mono text-slate-400">
                  ← PREVIOUS LOG
                </span>
                <p className="mt-1 font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-neon-cyan truncate">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link
                href={`/posts/${nextPost.slug}`}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-neon-cyan/50 bg-slate-50/70 dark:bg-white/[0.02] text-right transition-all"
              >
                <span className="text-[11px] font-mono text-slate-400">
                  NEXT LOG →
                </span>
                <p className="mt-1 font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-neon-cyan truncate">
                  {nextPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Giscus Comments */}
          <GiscusComments />
        </article>

        {/* Sticky Table of Contents & Reading Progress Enhancer */}
        <PostEnhancer toc={post.toc} />
      </div>
    </div>
  );
}
