"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check, Twitter, MessageCircle } from "lucide-react";

interface PostShareToolbarProps {
  title: string;
  url: string;
  summary?: string;
}

export function PostShareToolbar({ title, url, summary }: PostShareToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${title}" - kimkkatta // DEV.LOG\n${summary ? summary.slice(0, 100) + '...' : ''}`);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary || title,
          url,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-cyan-500/30 bg-[#070b14]/80 backdrop-blur-md font-mono text-xs">
      {/* Label */}
      <div className="flex items-center gap-2 text-slate-400">
        <Share2 className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
        <span className="text-[11px] font-chakra tracking-wider text-slate-300 font-bold uppercase">
          // SHARE_PAYLOAD
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          title="게시글 URL 클립보드 복사"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 text-[11px] font-mono ${
            copied
              ? "bg-emerald-500/20 text-neon-green border-emerald-500/50 shadow-[0_0_10px_#00ff9d]"
              : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20 hover:text-neon-cyan hover:border-cyan-400/60"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-neon-green" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5" />
              <span>COPY LINK</span>
            </>
          )}
        </button>

        {/* Twitter / X Share Button */}
        <button
          type="button"
          onClick={handleTwitterShare}
          title="X (Twitter)에 공유하기"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/15 hover:shadow-[0_0_10px_rgba(255,0,127,0.3)] transition-all cursor-pointer active:scale-95 text-[11px] font-mono"
        >
          <Twitter className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">POST TO X</span>
        </button>

        {/* Native Mobile Share Button */}
        <button
          type="button"
          onClick={handleNativeShare}
          title="모바일 기기 공유 메뉴 열기"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-neon-cyan hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all cursor-pointer active:scale-95 text-[11px] font-mono"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SHARE</span>
        </button>
      </div>
    </div>
  );
}
