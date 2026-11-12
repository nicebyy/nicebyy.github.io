import React from "react";
import { getAllPosts } from "@/lib/posts";
import { TerminalHero } from "@/components/TerminalHero";
import { BlogExplorer } from "@/components/BlogExplorer";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-4">
      <TerminalHero posts={posts} />
      <BlogExplorer posts={posts} />
    </div>
  );
}
