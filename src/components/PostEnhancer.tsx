"use client";

import React, { useEffect, useState } from "react";
import { ListTree, ArrowUp, X, ZoomIn } from "lucide-react";
import { TocItem } from "@/lib/posts";

export function PostEnhancer({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    if (!zoomedImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedImage(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomedImage]);

  useEffect(() => {
    // 1. Reading progress bar
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // 2. Add Copy buttons to all <pre> blocks inside article
    const preBlocks = document.querySelectorAll(".prose-cyber pre");
    preBlocks.forEach((pre) => {
      if (pre.querySelector(".copy-code-btn")) return;
      const wrapper = pre as HTMLElement;
      wrapper.style.position = "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "copy-code-btn absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/10 hover:bg-cyan-500/25 text-slate-300 hover:text-neon-cyan border border-white/15 transition-all";
      btn.textContent = "COPY";

      btn.addEventListener("click", () => {
        const codeEl = pre.querySelector("code");
        const text = codeEl ? codeEl.textContent || "" : pre.textContent || "";
        navigator.clipboard.writeText(text);
        btn.textContent = "COPIED!";
        setTimeout(() => {
          btn.textContent = "COPY";
        }, 1800);
      });

      wrapper.appendChild(btn);
    });

    // 3. Add Click-to-Zoom handler to all images inside article
    const images = Array.from(
      document.querySelectorAll(".prose-cyber img")
    ) as HTMLImageElement[];
    const handleImgClick = (e: Event) => {
      const target = e.currentTarget as HTMLImageElement;
      if (target && target.src) {
        setZoomedImage({
          src: target.src,
          alt: target.alt || "",
        });
      }
    };
    images.forEach((img) => {
      if (!img.title) img.title = "클릭하여 원본 크기로 확대";
      img.addEventListener("click", handleImgClick);
    });

    // 4. IntersectionObserver for headings
    const headings = Array.from(
      document.querySelectorAll(".prose-cyber h2, .prose-cyber h3")
    );

    let observer: IntersectionObserver | null = null;
    if (headings.length > 0) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "-80px 0px -70% 0px" }
      );
      headings.forEach((h) => observer?.observe(h));
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      images.forEach((img) => img.removeEventListener("click", handleImgClick));
      observer?.disconnect();
    };
  }, [toc]);

  return (
    <>
      {/* Top Neon Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-neon-cyan via-purple-500 to-neon-green transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Desktop Sticky TOC Sidebar */}
      {toc.length > 0 && (
        <aside className="hidden xl:block w-64 min-w-[16rem] max-w-[16rem] shrink-0">
          <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0b101e]/80 backdrop-blur-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-neon-cyan border-b border-slate-100 dark:border-white/10 pb-2">
              <ListTree className="w-4 h-4" />
              <span>ON THIS PAGE</span>
            </div>
            <ul className="space-y-1.5 text-xs font-mono">
              {toc.map((item) => (
                <li
                  key={item.id}
                  style={{ paddingLeft: item.level === 3 ? "0.75rem" : "0rem" }}
                >
                  <a
                    href={`#${item.id}`}
                    className={`block py-1 transition-colors truncate ${
                      activeId === item.id
                        ? "text-cyan-600 dark:text-neon-cyan font-bold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {item.level === 3 ? "└ " : ""}
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>BACK TO TOP</span>
            </button>
          </div>
        </aside>
      )}

      {/* Cyberpunk Image Lightbox Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
        >
          <div className="w-full max-w-6xl flex items-center justify-between mb-3 px-2 gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-neon-cyan min-w-0">
              <ZoomIn className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {zoomedImage.alt || "IMAGE_VIEWER // ORIGINAL RESOLUTION"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="min-w-[40px] min-h-[40px] shrink-0 flex items-center justify-center rounded-xl bg-white/10 hover:bg-pink-500/20 text-slate-200 hover:text-neon-pink border border-white/15 hover:border-pink-500/40 transition-all active:scale-95"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div
            className="relative max-w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage.src}
              alt={zoomedImage.alt}
              className="max-w-[92vw] max-h-[82vh] w-auto h-auto object-contain rounded-xl border border-cyan-500/40 shadow-[0_0_40px_rgba(0,243,255,0.25)] bg-[#05070e]"
            />
          </div>
          <p className="mt-3 text-[11px] font-mono text-slate-400">
            바깥 영역을 클릭하거나 ESC 키를 누르면 닫힙니다
          </p>
        </div>
      )}
    </>
  );
}
