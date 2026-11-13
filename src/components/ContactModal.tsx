"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  X,
  Send,
  MessageSquare,
  Clock,
  Terminal,
} from "lucide-react";
import { siteConfig } from "@/config/site";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = siteConfig.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-cyan-500/50 bg-[#080d1a]/95 p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(0,243,255,0.25)] space-y-6 cyber-corner"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-green shadow-[0_0_8px_#00ff9d] animate-ping" />
            <span
              id="contact-modal-title"
              className="text-xs font-mono font-bold tracking-wider text-neon-cyan flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>TRANSMISSION PROTOCOL // INQUIRY</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-pink-500/20 text-slate-400 hover:text-neon-pink border border-transparent hover:border-pink-500/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Description */}
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black font-cyber text-white tracking-wide flex items-center gap-2">
            <span>OPERATOR CONTACT</span>
            <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-cyan-500/10 text-neon-cyan border border-cyan-500/30">
              DIRECT
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            프로젝트 제안, 기술 질문, 블로그 피드백 등 무엇이든 편하게
            연락주세요. 확인 후 정성껏 답변드리겠습니다.
          </p>
        </div>

        {/* Main Email Box */}
        <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/40 bg-black/60 shadow-[inset_0_0_20px_rgba(0,243,255,0.08)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-neon-cyan" />
              <span>PRIMARY EMAIL ADDRESS</span>
            </span>
            <span className="flex items-center gap-1 text-neon-green text-[11px]">
              <Clock className="w-3 h-3" />
              <span>24시간 이내 회신</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[#0d1424] border border-cyan-500/30">
            <code className="font-mono text-sm sm:text-base font-bold text-neon-cyan tracking-wider select-all truncate">
              {siteConfig.email}
            </code>

            <button
              type="button"
              onClick={handleCopyEmail}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                copied
                  ? "bg-emerald-500/20 text-neon-green border border-emerald-500/60 shadow-[0_0_12px_rgba(0,255,157,0.3)]"
                  : "bg-cyan-500/15 hover:bg-cyan-500/25 text-neon-cyan border border-cyan-500/40 hover:shadow-neon-cyan"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-neon-green animate-bounce" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>주소 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Send Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Default Mail Client (mailto) */}
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
              "[kimkkatta DEV.LOG] 안녕하세요, 문의드립니다"
            )}`}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-neon-cyan border border-cyan-500/40 hover:border-cyan-400 hover:shadow-neon-cyan transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>기본 메일 앱 열기</span>
          </a>

          {/* Naver Mail Direct Compose */}
          <a
            href={`https://mail.naver.com/v2/new?to=${encodeURIComponent(
              siteConfig.email
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-neon-green border border-emerald-500/40 hover:border-emerald-400 hover:shadow-neon-green transition-all cursor-pointer active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            <span>네이버 메일로 작성</span>
          </a>
        </div>

        {/* Giscus Discussions Link */}
        <div className="pt-2 text-center">
          <a
            href="https://github.com/nicebyy/nicebyy.github.io/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-neon-pink transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>GitHub Discussions 커뮤니티로 공개 질문하기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
