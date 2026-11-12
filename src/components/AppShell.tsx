"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { PostMeta } from "@/lib/posts";
import { siteConfig } from "@/config/site";

export function AppShell({
  posts,
  children,
}: {
  posts: PostMeta[];
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kimgatta_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("kimgatta_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar
        isSidebarCollapsed={isCollapsed}
        onToggleSidebar={toggleCollapse}
        onOpenMobileSidebar={() => setIsMobileOpen(true)}
      />

      <div className="flex-1 flex relative z-10">
        <Sidebar
          posts={posts}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </main>

          <footer className="border-t border-cyan-500/20 bg-[#060911]/90 backdrop-blur-md py-6 mt-8 sm:mt-12">
            <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-chakra tracking-wider text-slate-400">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-center sm:text-left">
                <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f3ff] shrink-0" />
                <span>
                  © {new Date().getFullYear()} {siteConfig.author} (@
                  {siteConfig.githubUsername}). POWERED BY NEXT.JS & GITHUB PAGES.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon-cyan drop-shadow-[0_0_8px_#00f3ff] transition-colors"
                >
                  GITHUB // @{siteConfig.githubUsername}
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
