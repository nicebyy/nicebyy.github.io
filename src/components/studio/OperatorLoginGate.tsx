"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Lock,
  Key,
  GitBranch,
  Terminal,
  ArrowLeft,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useOperatorAuth } from "@/lib/useOperatorAuth";
import { DEFAULT_BRANCH } from "@/lib/github-api";

interface OperatorLoginGateProps {
  onSuccess?: () => void;
}

export function OperatorLoginGate({ onSuccess }: OperatorLoginGateProps) {
  const { login } = useOperatorAuth();
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState(DEFAULT_BRANCH);
  const [showToken, setShowToken] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage("운영자 액세스 토큰(PAT)을 입력해주세요.");
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage(null);

    const res = await login(token, branch);
    setIsAuthenticating(false);

    if (res.success) {
      onSuccess?.();
    } else {
      setErrorMessage(res.error || "인증에 실패했습니다.");
    }
  };

  return (
    <div className="py-6 sm:py-10 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-xl space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-neon-cyan border border-white/10 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>cd ~/dashboard</span>
          </Link>
        </div>

        {/* Cyberpunk Access Gate Card */}
        <div className="relative rounded-3xl border border-red-500/40 bg-[#070b16]/95 p-6 sm:p-10 shadow-[0_0_60px_rgba(255,0,85,0.25)] space-y-6 cyber-corner">
          {/* Top Clearance Banner */}
          <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(255,0,85,0.3)]">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 block">
                  RESTRICTED ACCESS // LEVEL 5
                </span>
                <h2 className="text-lg sm:text-xl font-cyber font-bold tracking-wider text-white">
                  OPERATOR CLEARANCE GATE
                </h2>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-400">
              <ShieldAlert className="w-3 h-3" />
              <span>READ-ONLY VISITOR</span>
            </div>
          </div>

          {/* Terminal Intro */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-400">
            <p className="text-neon-cyan font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>kimkkatta DEV.LOG :: STUDIO CONTROL CENTER</span>
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              본 스튜디오는 블로그 운영자(<strong>kimkkatta</strong>) 전용 관리 공간입니다.
              <br />
              인가되지 않은 방문자는 게시글 작성, 가리기/비공개 전환 및 삭제 기능을 사용할 수 없습니다.
            </p>
            <p className="text-emerald-400/90 text-[10px]">
              ※ 최초 1회 인증 완료 시 브라우저에 안전하게 보관되어 이후 재인증 없이 즉시 사용하실 수 있습니다.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            {/* Operator Token Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>OPERATOR ACCESS KEY (GitHub PAT)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                >
                  {showGuide ? "가이드 닫기" : "토큰 발급 방법 (1분)"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_... 또는 github_pat_..."
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-black/70 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-600 outline-none font-mono text-xs transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Collapsible Token Guide */}
            {showGuide && (
              <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-[11px] space-y-2 text-slate-300 animate-fadeIn">
                <p className="font-bold text-neon-cyan">토큰 발급 3단계:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>
                    GitHub 우측 상단 프로필 → <strong>Settings</strong> → <strong>Developer Settings</strong>
                  </li>
                  <li>
                    <strong>Personal access tokens</strong> → <strong>Tokens (classic)</strong> 선택
                  </li>
                  <li>
                    <strong>Generate new token (classic)</strong> 클릭 후, Scopes에서 <strong className="text-neon-cyan">repo</strong> 전체 체크 후 생성!
                  </li>
                </ol>
                <div className="pt-1">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=kimkkatta-blog-studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neon-cyan hover:underline font-bold"
                  >
                    <span>토큰 생성 바로가기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Target Branch Selection */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                <span>DEFAULT TARGET BRANCH</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/70 border border-slate-700 focus:border-emerald-400 text-white outline-none font-mono text-xs"
              >
                <option value="main">main (프로덕션 즉시 라이브 발행 - 권장)</option>
                <option value="develop">develop (개발/초안 보관 브랜치)</option>
              </select>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAuthenticating || !token.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-black font-cyber font-bold text-xs tracking-wider shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>인증 검증 중 (VERIFYING CREDENTIALS)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>운영자 로그인 (VERIFY & UNLOCK STUDIO)</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="text-[11px] font-mono text-slate-500 text-center border-t border-slate-800/80 pt-4">
            🔒 토큰은 브라우저의 <code className="text-slate-400">localStorage</code>에만 보관되며 외부 제3자 서버로 절대 전송되지 않습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
