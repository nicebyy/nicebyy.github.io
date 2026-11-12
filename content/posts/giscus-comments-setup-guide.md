---
title: "Giscus로 GitHub Discussions 기반 서버리스 댓글 연동하기"
date: "2026-11-10"
category: "DevOps"
tags: ["Giscus", "GitHub", "Comments", "Serverless"]
summary: "별도의 백엔드 데이터베이스 없이 GitHub Discussions를 활용하여 무료이면서도 다크/라이트 테마가 자동 동기화되는 Giscus 댓글 시스템을 연동하는 1분 가이드입니다."
featured: false
---

## Giscus란 무엇인가요?

정적 블로그(GitHub Pages)는 별도의 DB 서버가 없기 때문에 댓글 기능을 붙이려면 외부 서비스가 필요합니다. **Giscus**는 GitHub 저장소 내의 **Discussions** 기능을 댓글 저장소로 활용하는 오픈소스 위젯입니다.

- **완전 무료 & 광고 없음**
- **GitHub 계정으로 간편 로그인 및 마크다운 댓글 작성**
- **블로그 다크/라이트 모드 전환 시 댓글창 테마 실시간 동기화**

## 1분 연동 설정 순서

1. 내 GitHub 저장소(`nicebyy/nicebyy.github.io`)의 **Settings → General → Features** 섹션에서 **Discussions** 체크박스를 켭니다.
2. [giscus.app/ko](https://giscus.app/ko) 페이지에 접속해 저장소 이름에 `nicebyy/nicebyy.github.io`를 입력합니다.
3. 페이지 하단에 생성된 스크립트 코드에서 `data-repo-id`와 `data-category-id` 값을 복사합니다.
4. 프로젝트의 `src/config/site.ts` 파일을 열고 아래 두 항목만 채워 넣으면 끝납니다!

```typescript
// src/config/site.ts
giscus: {
  enabled: true,
  repo: "nicebyy/nicebyy.github.io",
  repoId: "여기에_복사한_repoId_입력",
  category: "General",
  categoryId: "여기에_복사한_categoryId_입력",
  // ...
}
```
