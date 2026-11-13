import React from "react";
import { getAllPosts } from "@/lib/posts";
import { TerminalHero } from "@/components/TerminalHero";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { BlogExplorer } from "@/components/BlogExplorer";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-6">
      <TerminalHero posts={posts} />
      <ProjectShowcase />
      <BlogExplorer posts={posts} />
    </div>
  );
}

