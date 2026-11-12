import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
import { siteConfig } from "@/config/site";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.title,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts = getAllPosts();

  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col relative overflow-x-hidden cyber-grid-bg cyber-scanlines">
        {/* Multi-layered Cyberpunk Neon Ambient Glows */}
        <div className="pointer-events-none fixed -top-40 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/15 dark:bg-cyan-400/20 blur-[140px] z-0 animate-pulse" />
        <div className="pointer-events-none fixed top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-pink-600/15 dark:bg-pink-500/20 blur-[150px] z-0" />
        <div className="pointer-events-none fixed -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/15 dark:bg-purple-500/15 blur-[140px] z-0" />

        <ThemeProvider>
          <AppShell posts={posts}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
