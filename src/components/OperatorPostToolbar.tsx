"use client";

import React from "react";
import Link from "next/link";
import { Edit3, ShieldCheck } from "lucide-react";
import { useOperatorAuth } from "@/lib/useOperatorAuth";

export function OperatorPostToolbar({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { isAuthenticated } = useOperatorAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="mb-6 p-3 sm:p-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-fadeIn shadow-[0_0_20px_rgba(0,255,157,0.1)]">
      <div className="flex items-center gap-2 text-emerald-300 font-bold">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>OPERATOR MODE ACTIVE // 이 글의 작성자(운영자)로 인증됨</span>
      </div>

      <Link
        href="/studio"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-neon-cyan border border-cyan-500/50 text-xs font-mono font-bold shadow-[0_0_12px_rgba(0,243,255,0.3)] transition-all active:scale-95 cursor-pointer"
        title="스튜디오에서 이 게시물 편집"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>STUDIO에서 수정</span>
      </Link>
    </div>
  );
}
