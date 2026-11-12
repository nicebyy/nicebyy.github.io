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
      <body className="min-h-screen flex flex-col relative overflow-x-hidden cyber-grid-bg">
        {/* Ambient Neon Glows */}
        <div className="pointer-events-none fixed -top-32 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] z-0" />
        <div className="pointer-events-none fixed bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] z-0" />

        <ThemeProvider>
          <AppShell posts={posts}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
