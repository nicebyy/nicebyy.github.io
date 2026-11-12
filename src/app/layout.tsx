import type { Metadata } from "next";
import { Orbitron, Chakra_Petch, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { CircuitBackground } from "@/components/CircuitBackground";
import { siteConfig } from "@/config/site";
import { getAllPosts } from "@/lib/posts";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const chakra = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${siteConfig.title} — ${siteConfig.description}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts = getAllPosts();

  return (
    <html
      lang="ko"
      className={`dark ${orbitron.variable} ${chakra.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col relative overflow-x-hidden cyber-grid-bg cyber-scanlines bg-[#05070e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-neon-cyan">
        {/* Auto-clean legacy Service Worker & Cache Storage from previous projects */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    regs.forEach(function(reg) { reg.unregister(); });
                  });
                }
                if (typeof window !== 'undefined' && 'caches' in window) {
                  caches.keys().then(function(names) {
                    names.forEach(function(name) { caches.delete(name); });
                  });
                }
              })();
            `,
          }}
        />

        {/* Multi-layered Cyberpunk Neon Ambient Glows (GPU Layer Isolated) */}
        <div className="pointer-events-none fixed -top-40 left-10 w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[140px] z-0 animate-pulse transform-gpu [contain:paint]" style={{ transform: "translateZ(0)" }} />
        <div className="pointer-events-none fixed top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-pink-500/20 blur-[150px] z-0 transform-gpu [contain:paint]" style={{ transform: "translateZ(0)" }} />
        <div className="pointer-events-none fixed -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[140px] z-0 transform-gpu [contain:paint]" style={{ transform: "translateZ(0)" }} />

        {/* Live Animated PCB Electric Circuit Background */}
        <CircuitBackground />

        <AppShell posts={posts}>{children}</AppShell>
      </body>
    </html>
  );
}
