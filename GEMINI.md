# Git Commit & Development Rules for nicebyy.github.io (김까따 DEV.LOG)

## 1. 브랜치 운영 전략 (Branching Strategy: main - develop - feature)
- 프로젝트는 **`main` - `develop` - `feature/*` (또는 `post/*`, `fix/*`)** 브랜치 전략을 준수한다.
- **`main` 브랜치**:
  - GitHub Pages 프로덕션 배포 전용 브랜치 (`.github/workflows/deploy.yml`을 통해 자동 빌드 및 배포).
  - 작업 중 검증되지 않은 코드를 **`main` 브랜치에 직접 커밋하거나 푸시하는 행위는 엄격히 금지**한다.
  - **`main` 브랜치로의 병합 및 프로덕션 푸시는 사용자가 직접 수행**하며, **에이전트는 `develop` 브랜치에만 푸시**한다.
- **`develop` 브랜치**:
  - 일상 기능 개발, UI 개편, 구조 개선 등의 통합 브랜치.
  - 에이전트 작업 완료 후 검증을 통과한 코드는 **`origin develop`**으로 푸시한다.
- **`feature/*`, `post/*`, `fix/*` 브랜치**:
  - **신규 기능 개발**: `feature/<기능명>` 또는 `feat/<기능명>` (예: `feature/series-tag`, `feat/search-filter`)
  - **블로그 글 작성/수정**: `post/<글-슬러그>` (예: `post/nextjs-deepdive`)
  - **버그 수정**: `fix/<버그명>` (예: `fix/sidebar-mobile-scroll`)
  - **작업 워크플로우**:
    1. 작업 시작 전: 최신 브랜치 동기화 후 새 브랜치 생성 (`git checkout -b feature/<기능명>`)
    2. 작업 진행: 단위 작업 완료 후 원자적 커밋 수행.
    3. 작업 완료 및 검증: 정적 빌드 100% 통과 확인 후 병합.
- **다중 세션(에이전트) 작업 격리 원칙**:
  - 2개 이상의 에이전트 세션이 동시에 작업할 때는 파일 덮어쓰기 및 Git 인덱스 락(`.git/index.lock`) 충돌을 방지하기 위해 **규칙 9의 `git worktree` 격리를 반드시 적용**한다.

---

## 2. 작업 단위별 자동 커밋 규칙 (Automatic Atomic Commits)
- 의미 있는 작업 단위(새 기능 구현, 포스트 작성, 버그 수정, UI 테마 개선, 설정 변경 등)가 완료되고 **정적 빌드 검증이 완료되면 작업을 마칠 때 자동으로 Git 커밋을 수행**한다.
- **커밋 전 필수 프로세스 (순서 엄수)**:
  1. `git status`로 변경 사항 및 추적되지 않은(untracked) 파일 확인.
  2. 불필요한 빌드 산출물(`.next/`, `out/`)이나 임시 파일이 포함되지 않았는지 점검 (`.gitignore` 준수).
  3. **Next.js 정적 빌드(`npm run build`)를 실행하여 100% 에러 없이 완료되는지 확인 (필수 게이트)**.
  4. 관련 파일만 선별하여 스테이징 (`git add <files>`).
  5. Conventional Commits 규칙에 맞추어 명확하고 구체적인 커밋 메시지로 커밋 (`git commit -m "..."`).
  6. 커밋 완료 후 사용자에게 커밋 내역(브랜치, 커밋 메시지, 해시)과 **빌드/검증 결과**를 명확히 안내한다.

---

## 3. 커밋 메시지 컨벤션 (Conventional Commits)
커밋 메시지는 `<type>(<scope>): <subject>` 형식을 기본으로 하며, 변경 내용을 한글 또는 영어로 명확히 기술한다.

- `feat`: 새로운 사이트 기능 추가 (예: `feat(sidebar): 최근 게시글 아코디언 접기 토글 추가`)
- `post`: 신규 블로그 마크다운 포스트 작성 또는 글 내용 수정 (예: `post: Next.js 정적 블로그 아키텍처 가이드 발행`)
- `fix`: 버그 및 스타일/렌더링 오류 수정 (예: `fix(theme): 라이트 모드 코드 블록 텍스트 대비 개선`)
- `style`: 로직 변경 없는 UI 스타일링, 마진/패딩 조정, CSS 레이아웃 변경
- `refactor`: 동작 변경 없는 컴포넌트 구조 개선 또는 유틸 함수 리팩토링
- `perf`: 렌더링 성능 최적화, 이미지/폰트 로딩 경량화
- `docs`: README, 가이드 문서 등 문서 작업
- `chore`: 패키지 의존성 설치, 빌드 설정 및 스크립트 수정

---

## 4. 원자적 커밋(Atomic Commit) 원칙
- 서로 연관 없는 두 개 이상의 변경(예: 사이드바 UI 수정 + 새 블로그 마크다운 글 추가)을 하나의 커밋으로 묶지 않고 각각 분리하여 커밋한다.
- 각 커밋 시점의 코드는 빌드가 깨지지 않고 정상 동작하는 독립적인 상태여야 한다.

---

## 5. 정적 빌드 및 무결성 검증 의무화 규칙 (Mandatory Static Export & Link Integrity)
GitHub Pages는 순수 정적 호스팅이므로 동적 서버 런타임이 동작하지 않는다. 따라서 다음 무결성 검증을 필수로 수행한다.

1. **Static Export 검증**:
   - 커밋 또는 머지 전 반드시 `npm run build`를 실행하여 모든 App Router 라우트(`/`, `/about`, `/posts/[slug]`)가 정적 HTML(`out/`)로 정상 생성되는지 검증한다.
   - `generateStaticParams`가 `content/posts/`의 모든 마크다운 슬러그를 누락 없이 프리렌더링하는지 확인한다.
2. **마크다운 Frontmatter 무결성**:
   - 모든 새 글(`.md`, `.mdx`)은 필수 메타데이터(`title`, `date`, `category`, `tags`, `summary`)를 반드시 갖추어야 한다.
3. **GitHub Pages 서빙 보호 파일 유지**:
   - `public/.nojekyll` 파일이 절대 삭제되지 않도록 보호한다 (`_next/` 정적 에셋 경로 404 차단 목적).
   - `next.config.mjs`의 `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }` 설정을 임의로 변경하지 않는다.

---

## 6. UI 작업 시 사이버펑크 네온 단일 테마 & SF 타이포그래피 지원 의무화 규칙
블로그는 **사이버펑크 네온 다크 단일 테마(Permanent Dark Theme)**만을 지원하며, 화이트 모드는 영구 비활성화한다.

1. **사이버펑크 타이포그래피 체계 준수**:
   - 디스플레이/로고/스탯: **`Orbitron`** (`font-orbitron`)
   - 서브헤딩/내비게이션/버튼: **`Chakra Petch`** (`font-chakra`)
   - 코드/터미널: **`JetBrains Mono`** (`font-mono`)
   - 한글 본문: **`Chakra Petch` + `Pretendard Variable`**
2. **네온 발광 및 명도 대비(Contrast) 검증**:
   - 딥 블랙/네이비 배경(`#05070e`) 위에서 시안(`#00f3ff`) / 핫핑크(`#ff007f`) / 에메랄드(`#00ff9d`) 네온 글로우 및 텍스트 시인성 100% 확보.
3. **코드 블록 및 하이라이팅 가독성**:
   - 사이버펑크 신택스 컬러 및 우상단 `COPY` 버튼 가독성 보장.
4. **접이식 사이드바(Sidebar) UX 검증**:
   - 데스크톱: 펼침(`w-64`) ↔ 접힘(`w-16`) 토글 시 레이아웃 깨짐이 없고 상태(`localStorage`)가 정상 저장되는지 확인.
   - 모바일: 햄버거 메뉴(`☰`) 클릭 시 드로어가 부드럽게 열리고, 카테고리/태그 클릭 또는 외부 터치 시 정상적으로 닫히는지 확인.

---

## 7. 로컬 개발 환경 및 포트 관리 규칙 (Dev Server & Port Policy)
1. **포트 충돌 방지**:
   - 로컬 작업 시 타 프로젝트와의 포트 충돌을 방지하기 위해 **기본 포트는 항상 `3333`을 사용**한다 (`npm run dev` 시 `next dev -p 3333` 실행).
2. **개발 표시기(Dev Indicator) 정책**:
   - 화면 우측 하단을 가리는 Next.js 로고 뱃지가 노출되지 않도록 `next.config.mjs`의 `devIndicators: false` 설정을 유지한다.

---

## 8. 블로그 운영자 정보 & 프로젝트 문서 동기화 규칙 (Identity & Config Sync Policy)
1. **단일 진실 공급원 (Single Source of Truth)**:
   - 블로그 운영자 정보(닉네임, 역할, 소개글, 기술 스택, 소셜 링크, Giscus 설정)는 반드시 **`src/config/site.ts`**에서 중앙 관리한다.
2. **닉네임 및 계정 식별 규칙**:
   - **블로그 표시 닉네임**: `김까따` (로고, 헤더, 터미널 프롬프트, 자기소개 등 모든 화면 표시)
   - **GitHub 계정 식별자**: `nicebyy` (GitHub 프로필 링크, 저장소 주소 `nicebyy/nicebyy.github.io`)
   - 임의로 표시 닉네임을 변경하거나 하드코딩하지 않는다.
3. **문서 동기화**:
   - 사이트 기능 추가(새 컴포넌트, 라우트 등)나 큰 변경 사항이 발생하면 `README.md`의 기능 목록 및 사용 가이드를 함께 갱신한다.

---

## 9. 다중 에이전트 동시 작업 시 Git Worktree 격리 의무화 규칙 (Mandatory Git Worktree Isolation Policy)
2개 이상의 에이전트(세션)가 같은 저장소에서 **동시에** 작업할 때는 반드시 `git worktree`로 **물리적으로 분리된 작업 디렉터리**를 사용한다.

1. **적용 대상**:
   - 병렬 서브에이전트를 실행하거나, 백그라운드에서 빌드/테스트를 수행하는 동시에 다른 에이전트가 코드를 수정해야 하는 경우.
2. **위치 및 생성 규칙**:
   - 워크트리는 저장소 루트의 **`.agents/worktrees/<브랜치명>/`** 아래에 생성한다.
   - 생성 명령:
     ```bash
     git worktree add .agents/worktrees/<브랜치명> -b <브랜치명> origin/main
     ```
3. **정리 의무**:
   - 작업 완료 후 병합이 끝나면 메인 체크아웃에서 반드시 워크트리와 브랜치를 정리한다:
     ```bash
     git worktree remove .agents/worktrees/<브랜치명>
     git branch -d <브랜치명>
     git worktree prune
     ```

---

## 10. 모바일 반응형(Mobile Responsive) 및 터치 UX 검증 의무화 규칙 (Mandatory Mobile Responsiveness & Touch UX Standards)
스마트폰, 태블릿, 데스크톱 등 다양한 디바이스 환경에서 완벽한 가독성과 사용성을 제공하기 위해 아래 모바일 반응형 및 터치 UX 원칙을 필수로 준수한다.

1. **최소 뷰포트 지원 기준 (Minimum Viewport: 360px)**:
   - 최소 360px(스마트폰 소형 화면: iPhone SE, Galaxy 기본형 등)부터 태블릿(768px~1024px), 데스크톱, 4K 울트라와이드 디스플레이까지 레이아웃 깨짐 없이 유연하게 적응해야 한다.
2. **수평 스크롤 유출(Horizontal Overflow / Scroll Leak) 엄격 금지**:
   - `body` 및 전체 레이아웃 컨테이너에서 화면 밖으로 콘텐츠가 삐져나와 원치 않는 가로 스크롤이 발생하지 않도록 `overflow-x: hidden` 및 `min-w-0`, `max-w-full`을 철저히 관리한다.
   - 코드 블록(`<pre>`), 표(`<table>`), 긴 문자열/URL은 컨테이너 내부 수평 스크롤(`overflow-x-auto -webkit-overflow-scrolling: touch`) 또는 줄바꿈(`break-words`, `overflow-wrap: break-word`)으로 격리한다.
3. **모바일 수평 스와이프 UX (Horizontal Swipe with `.no-scrollbar`)**:
   - 카테고리 탭, 태그 필터 칩, 빠른 터미널 명령어 등 가로로 나열되는 버튼 그룹은 모바일 화면에서 세로로 과도하게 늘어지지 않도록 부드러운 가로 스와이프(`overflow-x-auto no-scrollbar touch-pan-x flex-nowrap sm:flex-wrap`)를 적용한다.
4. **터치 타깃 및 인터랙션 피드백 (Touch Target & Feedback)**:
   - 모든 클릭/터치 가능 요소(헤더 햄버거 메뉴, 닫기 버튼, 검색 아이콘, 탭/태그 칩 등)는 최소 40px 이상의 터치 영역(`p-2` 이상, 적절한 패딩)을 확보한다.
   - 터치 시각 피드백으로 `active:scale-95` 또는 명확한 배경색/네온 테두리 변화를 제공하여 모바일 터치 조작감을 극대화한다.
5. **모바일 사이드바 드로어(Sidebar Drawer) 동작 원칙**:
   - 모바일 드로어가 열렸을 때 뒷배경은 `bg-black/80 backdrop-blur-md`로 부드럽게 블러 처리하고, 오버레이 터치 시 즉시 드로어를 닫는다.
   - 드로어 내부의 내비게이션 링크, 카테고리 항목, 태그 항목, 최근 포스트를 탭하면 목적지로 이동함과 동시에 모바일 드로어가 자동으로 닫혀야 한다 (`onCloseMobile()` 연동).
6. **모바일 타이포그래피 및 가독성 (Korean Typography Standard)**:
   - 모바일 한글 본문은 어색한 글자 단위 쪼개짐을 방지하기 위해 `word-break: keep-all; overflow-wrap: break-word;`를 기본 적용한다.
   - 본문 카드의 패딩은 작은 화면에서 여백 낭비를 줄이고 본문 영역을 넓히기 위해 `p-4 sm:p-8 md:p-10` 등 반응형 단계별 패딩을 적용한다.

