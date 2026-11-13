# NICEBYY // DEV.LOG (`nicebyy.github.io`)

인터랙티브 터미널 & 네온 대시보드 감성의 **Next.js 15 정적 기술 블로그**입니다.  
GitHub Pages(`output: 'export'`)를 통해 **100% 무료 호스팅** 및 **GitHub Actions 자동 배포**가 설정되어 있습니다.

## 주요 기능

- **인터랙티브 CLI 터미널 히어로**: `help`, `whoami`, `career`, `projects`, `skills`, `ls`, `scan`, `rain`, `status`, `clear` 명령어 실시간 실행
- **CAREER & RESUME ARCHIVE (`/career`)**: 3개사(G사, J사, A사) 실무 경력 및 미션 크리티컬 아키텍처 문제 해결 이력서 (회사명 비공개/익명화 원칙 준수, 대용량 정산·배치·EDA·Web3·Clean Architecture STAR 성과 아카이브)
- **FEATURED PROJECTS ARCHIVE (`/projects`)**: 4대 핵심 개인 프로젝트 아카이브 (1234pickban 웹 시뮬레이터, kkt-bookmark 안드로이드/PWA 앱, old-calendar 윈도우 스토어 데스크톱 캘린더, job-blocking 크롬 웹스토어 확장 프로그램)
- **사이버펑크 네온 단일 테마 & 고립 무드 앰비언스**: 딥 블랙/네이비 배경과 시안/핫핑크/에메랄드 네온 글로우 UI, 네온 빗줄기·부유 먼지 캔버스(`IsolatedAtmosphere`), CRT 비네팅 & 주사선, 단독 오퍼레이터 레이더 HUD(`LoneOperatorHud`)
- **프로시저럴 Web Audio 빗소리 신디사이저**: 외부 오디오 파일 없이 실시간 생성되는 Night City 빗소리 사운드스케이프(`RAIN FX` / `RAIN SND` 토글 및 `$rain` 명령 지원)
- **실시간 방문자 수 텔레메트리**: `hitscounter.dev` 연동 TODAY / TOTAL 방문자 카운터 (`VisitorCounter` 위젯 — 이전 티스토리 누적 방문자 수 `49,561`명 합산, 사이드바 및 대시보드 HUD 표시, 세션 중복 집계 방지 및 로컬 미리보기 조회 전용 모드 지원)
- **CYBER STUDIO (`/studio`) CMS & 에디터**:
  - **게시물 관리 & 가리기/삭제**: 발행된 게시물을 클릭 한 번으로 가리기(`draft: true`), 영구 삭제(GitHub API `DELETE`), 또는 스튜디오로 즉시 불러와 수정
  - **듀얼 페인 실시간 마크다운 에디터**: 메타데이터 폼, 문법 툴바 단축키, 블로그 실제 테마와 100% 동일한 실시간 프리뷰(`.prose-cyber`) 지원
  - **GitHub API 원클릭 자동 배포 & 로컬 다운로드**: 브라우저 로컬스토리지에 저장된 GitHub PAT로 저장소에 직접 원클릭 커밋/발행 및 `.md` 파일 다운로드 지원
- **마크다운(MD/MDX) 블로그 엔진**: `content/posts/*.md` 파일만 추가하면 자동 빌드, 코드 하이라이팅(`COPY` 버튼 포함), 목차(TOC) 및 독서 진행률 바 자동 생성
- **실시간 검색 및 필터**: `Ctrl + K` 빠른 검색, 카테고리별 탭, 태그 필터, 그리드/리스트 뷰 전환
- **Giscus 댓글 시스템**: GitHub Discussions 연동 댓글 위젯 (사이버펑크 다크 테마 동기화)

## 로컬 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3333`으로 접속하면 실시간으로 블로그를 확인하고 수정할 수 있습니다.

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
