# NICEBYY // DEV.LOG (`nicebyy.github.io`)

인터랙티브 터미널 & 네온 대시보드 감성의 **Next.js 15 정적 기술 블로그**입니다.  
GitHub Pages(`output: 'export'`)를 통해 **100% 무료 호스팅** 및 **GitHub Actions 자동 배포**가 설정되어 있습니다.

## 주요 기능

- **인터랙티브 CLI 터미널 히어로**: `help`, `whoami`, `skills`, `ls`, `status`, `clear` 명령어 실시간 실행
- **사이버펑크 네온 단일 테마**: 딥 블랙/네이비 배경과 시안/핫핑크/에메랄드 네온 글로우 UI
- **실시간 방문자 수 텔레메트리**: `hitscounter.dev` 연동 TODAY / TOTAL 방문자 카운터 (`VisitorCounter` 위젯 — 사이드바 및 대시보드 HUD 표시, 세션 중복 집계 방지 및 로컬 미리보기 조회 전용 모드 지원)
- **마크다운(MD/MDX) 블로그 엔진**: `content/posts/*.md` 파일만 추가하면 자동 빌드, 코드 하이라이팅(`COPY` 버튼 포함), 목차(TOC) 및 독서 진행률 바 자동 생성
- **실시간 검색 및 필터**: `Ctrl + K` 빠른 검색, 카테고리별 탭, 태그 필터, 그리드/리스트 뷰 전환
- **Giscus 댓글 시스템**: GitHub Discussions 연동 댓글 위젯 (다크/라이트 테마 실시간 동기화)

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 실시간으로 블로그를 확인하고 수정할 수 있습니다.

## 새 게시글 작성 방법

`content/posts/` 폴더에 `.md` 파일을 생성하면 자동으로 블로그에 등록됩니다.

```markdown
---
title: "새 포스트 제목"
date: "2026-11-12"
category: "Frontend"
tags: ["Next.js", "React"]
summary: "포스트 요약 설명"
featured: true
---

## 본문 시작
여기에 마크다운으로 내용을 작성하세요.
```

## GitHub Pages 무료 배포 방법

1. 이 프로젝트를 `https://github.com/nicebyy/nicebyy.github.io` 저장소에 Push합니다.
2. GitHub 저장소의 **Settings → Pages → Build and deployment → Source**를 **`GitHub Actions`**로 설정합니다.
3. 이후 `main` 브랜치에 Push할 때마다 `.github/workflows/deploy.yml`이 자동으로 정적 빌드(`out/`)를 수행하고 `https://nicebyy.github.io`에 무료 배포합니다.
