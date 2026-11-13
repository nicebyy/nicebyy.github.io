"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  GitBranch,
  Github,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  getStoredGitHubConfig,
  saveStoredGitHubConfig,
  testGitHubConnection,
  DEFAULT_REPO,
  DEFAULT_BRANCH,
  GitHubConfig,
} from "@/lib/github-api";

interface GitHubSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: GitHubConfig) => void;
}

export function GitHubSettingsModal({
  isOpen,
  onClose,
  onConfigSaved,
}: GitHubSettingsModalProps) {
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState(DEFAULT_REPO);
  const [branch, setBranch] = useState(DEFAULT_BRANCH);
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user?: string;
  } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredGitHubConfig();
      setToken(cfg.token);
      setRepo(cfg.repo);
      setBranch(cfg.branch);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!token.trim()) {
      setTestResult({
        success: false,
        message: "토큰을 입력한 후 테스트를 진행해주세요.",
      });
      return;
    }
    setTesting(true);
    setTestResult(null);

    const res = await testGitHubConnection(token, repo);
    setTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: `연결 성공! 계정 '${res.user}'으로 푸시 권한이 확인되었습니다.`,
        user: res.user,
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || "연결에 실패했습니다.",
      });
    }
  };

  const handleSave = () => {
    saveStoredGitHubConfig({ token, repo, branch });
    onConfigSaved?.({ token, repo, branch });
    onClose();
  };

  const handleDisconnect = () => {
    if (confirm("저장된 GitHub 토큰을 브라우저에서 삭제하시겠습니까?")) {
      saveStoredGitHubConfig({ token: "" });
      setToken("");
      setTestResult(null);
      onConfigSaved?.({ token: "", repo, branch });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-[#070b16] shadow-[0_0_50px_rgba(0,243,255,0.2)] p-6 sm:p-8 space-y-6 cyber-corner max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-neon-cyan">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-cyber font-bold tracking-wider text-white">
                GITHUB SYNC TERMINAL
              </h3>
              <p className="text-[11px] font-mono text-cyan-400/70">
                // ZERO-BACKEND DIRECT REPO INTEGRATION
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Assurance Badge */}
        <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-xs font-mono text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>LOCAL SECURITY PROTOCOL</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                SAFE
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 leading-relaxed">
              입력하신 토큰은 브라우저의 <code className="text-white">localStorage</code>에만 암호화 저장되며 외부 서버로 절대 전송되지 않습니다.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs font-mono">
          {/* GitHub Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-neon-cyan" />
                <span>PERSONAL ACCESS TOKEN (PAT)</span>
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
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-600 outline-none transition-all font-mono text-xs"
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
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-[11px] space-y-2 text-slate-300">
              <p className="font-bold text-neon-cyan">토큰 발급 3단계:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>
                  GitHub 우측 상단 프로필 → <strong>Settings</strong> → 맨 아래 <strong>Developer Settings</strong>
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

          {/* Repo & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-pink-400" />
                <span>REPOSITORY</span>
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="nicebyy/nicebyy.github.io"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-pink-400 text-white placeholder-slate-600 outline-none font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                <span>TARGET BRANCH</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 focus:border-emerald-400 text-white outline-none font-mono text-xs"
              >
                <option value="develop">develop (권장 통합 브랜치)</option>
                <option value="main">main (프로덕션 직접 배포)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              testResult.success
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-red-500/40 bg-red-950/20 text-red-300"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !token}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-neon-cyan text-xs font-mono font-bold disabled:opacity-40 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
              <span>{testing ? "연결 검증 중..." : "연결 테스트"}</span>
            </button>
            {token && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                title="토큰 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>해제</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 text-xs font-mono transition-all"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-cyber font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all active:scale-95"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
