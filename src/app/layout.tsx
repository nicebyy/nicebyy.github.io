import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/config/site";

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
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col relative overflow-x-hidden cyber-grid-bg">
        {/* Ambient Neon Glows */}
        <div className="pointer-events-none fixed -top-32 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] z-0" />
        <div className="pointer-events-none fixed bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] z-0" />

        <ThemeProvider>
          <Navbar />
          <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
          <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-[#060911]/80 backdrop-blur-md py-6 mt-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan" />
                <span>
                  © {new Date().getFullYear()} {siteConfig.author}. Powered by
                  Next.js Static Export & GitHub Pages.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-600 dark:hover:text-neon-cyan transition-colors"
                >
                  GITHUB // @{siteConfig.author}
                </a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
