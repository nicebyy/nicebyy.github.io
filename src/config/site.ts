export const siteConfig = {
  title: "NICEBYY // DEV.LOG",
  author: "nicebyy",
  role: "Full-Stack & Frontend Developer",
  url: "https://nicebyy.github.io",
  githubRepo: "nicebyy/nicebyy.github.io",
  description:
    "터미널 감성과 인터랙티브 웹 기술을 기록하는 nicebyy의 개발 로그 & 아카이브",
  bio: "코드로 문제를 해결하고, 실험적인 웹 인터페이스와 아키텍처를 탐구합니다.",
  location: "Seoul, KR",
  statusText: "SYSTEM.ONLINE // READY TO BUILD",
  email: "nicebyy@users.noreply.github.com",
  social: {
    github: "https://github.com/nicebyy",
  },
  techStack: [
    { name: "TypeScript", level: 92, color: "cyan" },
    { name: "React / Next.js", level: 90, color: "purple" },
    { name: "Node.js", level: 85, color: "green" },
    { name: "Tailwind CSS", level: 95, color: "cyan" },
    { name: "Git / CI·CD", level: 88, color: "amber" },
  ],
  // Giscus 댓글 설정 (https://giscus.app 에서 본인 저장소 정보 입력 후 아래 값 채우기)
  giscus: {
    enabled: true,
    repo: "nicebyy/nicebyy.github.io" as `${string}/${string}`,
    repoId: "", // 예: "R_kgDOM..." (비워두면 블로그 화면에 간편 연동 안내가 표시됩니다)
    category: "General",
    categoryId: "", // 예: "DIC_kwDOM..."
    mapping: "pathname",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    lang: "ko",
  },
};

export type SiteConfig = typeof siteConfig;
