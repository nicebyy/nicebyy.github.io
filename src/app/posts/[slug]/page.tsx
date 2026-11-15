import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, Folder } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/config/site";
import { PostEnhancer } from "@/components/PostEnhancer";
import { GiscusComments } from "@/components/GiscusComments";
import { OperatorPostToolbar } from "@/components/OperatorPostToolbar";
import { PostShareToolbar } from "@/components/PostShareToolbar";

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
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  // Strip stray markdown image remnants in summary for clean social card preview
  const cleanDescription =
    post.summary
      .replace(/!?\[?[^\]]*\]?\(\/images\/[^)]+\)/g, "")
      .replace(/\s+/g, " ")
      .trim() || siteConfig.description;

  const ogImage = post.image || "/og-image.png";

  return {
    title: post.title,
    description: cleanDescription,
    openGraph: {
      title: `${post.title} | ${siteConfig.title}`,
      description: cleanDescription,
      url: `${siteConfig.url}/posts/${slug}/`,
      siteName: siteConfig.title,
      locale: "ko_KR",
      type: "article",
      publishedTime: post.date,
      authors: [siteConfig.author],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: cleanDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `${siteConfig.url}/posts/${slug}/`,
    },
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

  const postUrl = `${siteConfig.url}/posts/${slug}/`;
  const cleanDescription =
    post.summary
      .replace(/!?\[?[^\]]*\]?\(\/images\/[^)]+\)/g, "")
      .replace(/\s+/g, " ")
      .trim() || siteConfig.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: cleanDescription,
    image: post.image ? [post.image] : [`${siteConfig.url}/og-image.png`],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  return (
    <div className="py-4">
      {/* Schema.org Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-neon-cyan border border-white/10 hover:border-cyan-400/40 transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>cd ~/dashboard</span>
        </Link>
      </div>

      {/* Operator Quick Edit Bar (Only visible when logged in) */}
      <OperatorPostToolbar slug={post.slug} title={post.title} />

      <div className="flex flex-col xl:flex-row gap-8 items-start w-full min-w-0">
        {/* Main Article Column */}
        <article className="flex-1 min-w-0 w-full rounded-3xl border border-cyan-500/30 bg-[#0b101e]/95 p-4 sm:p-8 md:p-10 shadow-[0_0_30px_rgba(0,243,255,0.12)] cyber-corner">
          {/* Post Header */}
          <header className="pb-6 mb-8 border-b border-cyan-500/20 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500/10 text-neon-cyan border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,243,255,0.25)]">
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
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {post.readingTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-cyber tracking-wide text-white leading-tight break-words drop-shadow-[0_0_15px_rgba(0,243,255,0.3)]">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed break-words">
                {post.summary}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3.5 h-3.5 text-purple-400 mr-1" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Markdown Body */}
          <div
            className="prose-cyber min-w-0 w-full max-w-full"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Social Share Toolbar */}
          <div className="mt-10">
            <PostShareToolbar
              title={post.title}
              url={postUrl}
              summary={cleanDescription}
            />
          </div>

          {/* Prev / Next Post Navigation */}
          <div className="mt-8 pt-6 border-t border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/posts/${prevPost.slug}`}
                className="group min-w-0 block p-4 rounded-2xl border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/[0.05] bg-white/[0.02] transition-all"
              >
                <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-400">
                  ← PREVIOUS LOG
                </span>
                <p className="mt-1 font-bold text-sm text-slate-200 group-hover:text-neon-cyan truncate">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link
                href={`/posts/${nextPost.slug}`}
                className="group min-w-0 block p-4 rounded-2xl border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/[0.05] bg-white/[0.02] text-right transition-all"
              >
                <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-400">
                  NEXT LOG →
                </span>
                <p className="mt-1 font-bold text-sm text-slate-200 group-hover:text-neon-cyan truncate">
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
