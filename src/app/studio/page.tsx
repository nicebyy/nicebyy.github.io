import React from "react";
import type { Metadata } from "next";
import { getAllStudioPosts } from "@/lib/posts";
import { CyberStudio } from "@/components/studio/CyberStudio";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `CYBER STUDIO // CMS & Post Manager | ${siteConfig.title}`,
  description: "게시물 관리(가리기/삭제), 실시간 마크다운 에디터 & GitHub 원클릭 자동 배포",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioPage() {
  const posts = getAllStudioPosts();

  return <CyberStudio initialPosts={posts} />;
}
