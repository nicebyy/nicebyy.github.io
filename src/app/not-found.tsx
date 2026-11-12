import React from "react";
import Link from "next/link";
import { Terminal, ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found",
  description: "요청하신 페이지를 찾을 수 없습니다.",
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-pink-500/40 bg-white/95 dark:bg-[#0b101e]/95 p-8 shadow-2xl dark:shadow-neon-pink cyber-corner space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-500/10 border border-pink-500/40 flex items-center justify-center text-neon-pink shadow-neon-pink">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <p className="font-mono text-xs text-neon-pink font-bold tracking-widest uppercase">
            // ERROR_CODE: 404_PAGE_NOT_FOUND
          </p>
          <h1 className="text-4xl font-black font-mono text-slate-900 dark:text-white dark:drop-shadow-[0_0_12px_#ff007f]">
            404 NOT FOUND
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-mono">
            요청하신 경로가 나이트 시티의 네트워크에서 소멸되었거나 존재하지 않는 섹터입니다.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-neon-cyan border border-cyan-500/40 hover:bg-cyan-500/25 hover:shadow-neon-cyan transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DASHBOARD</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
