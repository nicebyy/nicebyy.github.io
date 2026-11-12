---
title: "Next.js 15 + GitHub Pages로 네온 개발자 블로그 구축하기"
date: "2026-11-12"
category: "Architecture"
tags: ["Next.js", "GitHub Pages", "TailwindCSS", "TypeScript"]
summary: "무료 호스팅인 GitHub Pages 위에 Next.js Static Export(output: 'export')와 GitHub Actions 자동 배포 파이프라인을 결합해 나만의 커스텀 기술 블로그를 구축한 과정과 사용법을 정리합니다."
featured: true
---

## 시스템 아키텍처 개요

GitHub Pages는 정적 파일(HTML, CSS, JS)을 **100% 무료**로 호스팅해 주는 서비스입니다. 과거에는 Jekyll을 주로 사용했지만, 이제는 **Next.js App Router의 Static Export (`output: 'export'`)** 기능과 **GitHub Actions**를 조합해 어떤 디자인이나 인터랙티브 컴포넌트도 자유롭게 구현할 수 있습니다.

### 주요 기술 스택

| 레이어 | 사용 기술 | 역할 |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | 정적 페이지 생성 (SSG) 및 라우팅 |
| **Styling** | Tailwind CSS | 다크/라이트 테마 & 네온 대시보드 UI |
| **Content** | Markdown + Unified / Rehype | 마크다운 파싱 및 코드 문법 하이라이팅 |
| **Comments** | Giscus (GitHub Discussions) | 서버리스 댓글 및 반응(Reaction) 시스템 |
| **CI / CD** | GitHub Actions | `main` 브랜치 Push 시 자동 빌드 & 배포 |

## 새 포스트 작성 방법

블로그에 새 글을 올리는 방법은 매우 간단합니다. `content/posts/` 폴더 안에 `.md` 파일을 생성하면 자동으로 목록과 상세 페이지, 태그, 검색 인덱스에 반영됩니다.

```markdown
---
title: "내가 작성하는 첫 번째 기술 포스팅"
date: "2026-11-12"
category: "Frontend"
tags: ["React", "TypeScript", "Web"]
summary: "이 글에 대한 짧은 요약 설명입니다. 메인 화면 카드에 표시됩니다."
featured: true
---

## 여기에 소제목을 작성하세요

본문 내용을 마크다운으로 자유롭게 작성하면 됩니다.
```

## 코드 하이라이팅 테스트

`rehype-highlight`가 내장되어 있어 다양한 프로그래밍 언어의 구문 강조(Syntax Highlighting)와 우측 상단 **코드 복사 버튼**을 지원합니다.

```typescript
interface SystemStatus {
  node: string;
  uptime: number;
  mode: "CYBERPUNK_DARK" | "LIGHT_TERMINAL";
}

export function checkSystemHealth(status: SystemStatus): string {
  const { node, uptime, mode } = status;
  console.log(`[BOOT] Node ${node} running in ${mode} mode`);
  return `ONLINE (${uptime}ms)`;
}
```

## 무료 호스팅 & 자동 배포 원리

`.github/workflows/deploy.yml` 파일이 이미 설정되어 있어, 코드를 수정하거나 새 마크다운 글을 추가한 뒤 `git push`만 실행하면 GitHub 서버가 알아서 `npm run build`를 수행하고 `out/` 정적 결과물을 `https://nicebyy.github.io`에 배포합니다.
