export const siteConfig = {
  title: "kimkkatta // DEV.LOG",
  author: "kimkkatta",
  githubUsername: "nicebyy",
  role: "Full-Stack & Frontend Developer",
  url: "https://nicebyy.github.io",
  githubRepo: "nicebyy/nicebyy.github.io",
  description:
    "터미널 감성과 인터랙티브 웹 기술을 기록하는 kimkkatta의 개발 로그 & 아카이브",
  bio: "코드로 문제를 해결하고, 실험적인 웹 인터페이스와 아키텍처를 탐구합니다.",
  location: "Seoul, KR",
  statusText: "SYSTEM.ONLINE // kimkkatta NODE",
  email: "nicebyy@users.noreply.github.com",
  social: {
    github: "https://github.com/nicebyy",
  },
  techStack: [
    { name: "TypeScript", level: 61, bytes: "1.24 MB", color: "cyan" },
    { name: "Java", level: 26, bytes: "533 KB", color: "purple" },
    { name: "Kotlin", level: 5, bytes: "95 KB", color: "pink" },
    { name: "JavaScript", level: 4, bytes: "65 KB", color: "amber" },
    { name: "CSS / Style", level: 4, bytes: "73 KB", color: "green" },
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
