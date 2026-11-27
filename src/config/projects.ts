export interface ProjectHighlight {
  label: string;
  value: string;
}

export type ProjectPlatformType = "microsoft" | "chrome" | "web" | "github";

export interface ProjectPrimaryLink {
  type: ProjectPlatformType;
  label: string;
  url: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Full-Stack Web" | "Mobile & Web App" | "Desktop Application" | "Browser Extension";
  badge: string;
  summary: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  metrics: ProjectHighlight[];
  primaryLink: ProjectPrimaryLink;
  githubUrl?: string; // Optional (private repo may omit this)
  webUrl?: string;
  storeUrl?: string;
  status: string;
  accentColor: "cyan" | "pink" | "emerald" | "purple";
  iconName: "gamepad" | "bookmark" | "calendar" | "shield" | "dice" | "key";
}

export const projectsData: ProjectItem[] = [
  {
    id: "1234pickban",
    title: "1234 Pick/Ban Simulator",
    subtitle: "LoL Ban/Pick & Team Auction Platform",
    category: "Full-Stack Web",
    badge: "Next.js 14 · NestJS 10 · Socket.IO · Docker",
    summary:
      "리그 오브 레전드(LoL) 공식 e스포츠 20단계 밴픽 룰, 피어리스 드래프트, 실시간 팀 경매 및 크로노브레이크 무손실 롤백을 지원하는 올인원 웹 플랫폼",
    description:
      "대회 현장의 긴장감 넘치는 밴픽 환경과 아마추어/동아리 내전 운영에 필요한 도구를 원스톱으로 제공합니다. LCK/글로벌 공식 20단계 밴픽 플로우, 세트 간 챔피언 중복을 금지하는 피어리스 드래프트(Fearless Draft), 잘못된 선택을 언제든 직전 단계로 되돌리는 크로노브레이크(ChronoBreak) 무손실 롤백, 실시간 호가 경쟁 팀 포인트 경매 및 1v1 진영 결정 가위바위보(Side RPS), 라이엇 공식 LoL Esports API 연동 경기 일정 및 롤드컵 대진표를 실시간 동기화합니다.",
    keyFeatures: [
      "공식 LCK 20단계 드래프트 플로우 및 피어리스 드래프트(Fearless Draft) 완벽 구현",
      "드래프트/경매 실수 무손실 스냅샷 롤백 시스템 크로노브레이크(ChronoBreak)",
      "포인트 기반 실시간 선수 호가 입찰 경매 & 스네이크 변형 팀원 드래프트",
      "블루/레드 진영 선택권 1v1 실시간 심리전 가위바위보(Side RPS 배틀)",
      "라이엇 공식 LoL Esports API 연동 실시간 경기 일정 & 롤드컵 토너먼트 대진표 트리",
      "광장 대화 MongoDB 영구 보존 & 1:1 비밀 귓속말 & 플로팅 채팅 위젯",
    ],
    techStack: [
      "Next.js 14",
      "NestJS 10",
      "TypeScript 5",
      "Socket.IO 4",
      "Tailwind CSS",
      "MongoDB 7",
      "Docker Compose",
      "Zustand",
    ],
    metrics: [
      { label: "Architecture", value: "Dual DB (Mongo + In-Memory)" },
      { label: "Sync Engine", value: "Socket.IO Real-time" },
      { label: "Verification", value: "119+ E2E Test Suite" },
    ],
    primaryLink: {
      type: "web",
      label: "웹 서비스 바로가기",
      url: "https://1234banpick.me",
    },
    webUrl: "https://1234banpick.me",
    status: "Active // Live Service",
    accentColor: "cyan",
    iconName: "gamepad",
  },
  {
    id: "kkt-bookmark",
    title: "KKT 북마크 (Smart Bookmark)",
    subtitle: "Clean & Hierarchy Bookmark App",
    category: "Mobile & Web App",
    badge: "Kotlin · Jetpack Compose · Android Room · PWA",
    summary:
      "광고 없는 쾌적함, 강력한 다단계 계층 폴더(트리 구조)와 다중 태그, 브라우저 지정 실행을 지원하는 스마트 북마크 앱",
    description:
      "기존 상용 북마크 앱들의 과도한 광고와 부실한 폴더 분류 기능에서 탈피하여, 100% 로컬 오프라인 데이터베이스 기반으로 안전하고 깊이 있게 링크를 수집·관리하는 모던 북마크 앱입니다. 무제한 깊이의 다단계 폴더 트리와 브레드크럼 이동, 다중 태그 필터링, 원하는 브라우저(크롬, 삼성인터넷, 네이버, 웨일, 엣지 등)를 다이렉트로 선택해 실행하는 기능 및 카카오톡/브라우저 '공유하기' 원클릭 저장과 OpenGraph 메타데이터 자동 추출을 지원합니다.",
    keyFeatures: [
      "무제한 깊이의 다단계 계층 폴더(트리 구조) 및 인터랙티브 브레드크럼 경로 이동",
      "다중 태그(Multi-Tag) 유연 분류 및 상단 가로 스크롤 원클릭 태그 필터 바",
      "실행 브라우저 자유 지정 (Chrome, 삼성인터넷, 네이버 앱, 웨일, Edge Intent 연동)",
      "카카오톡 & 모바일 브라우저 '공유하기' 원클릭 바텀시트 저장 & OG 메타데이터 자동 수집",
      "100% 광고 없는 오프라인 로컬 저장 (Zero Tracking, 무회원가입 프라이버시 보호)",
      "폴더 계층 구조와 태그, 북마크 데이터를 단일 파일로 내보내는 JSON 백업/복원",
    ],
    techStack: [
      "Kotlin",
      "Jetpack Compose",
      "Android Room DB",
      "SQLite",
      "TypeScript",
      "Node.js",
      "Web PWA",
    ],
    metrics: [
      { label: "Data Safety", value: "100% Local-First Offline" },
      { label: "Platform", value: "Android Native + Web PWA" },
      { label: "Zero Ads", value: "0 Trackers / No SDK" },
    ],
    primaryLink: {
      type: "github",
      label: "GitHub 저장소",
      url: "https://github.com/nicebyy/kkt-bookmark",
    },
    githubUrl: "https://github.com/nicebyy/kkt-bookmark",
    status: "Active // Open Source",
    accentColor: "pink",
    iconName: "bookmark",
  },
  {
    id: "old-calendar",
    title: "Classic Calendar (클래식 캘린더)",
    subtitle: "Zero-Latency Desktop Calendar",
    category: "Desktop Application",
    badge: "Electron 34 · React 19 · Vite 6 · Tailwind CSS v4",
    summary:
      "Windows 10 시절의 미려하고 가벼웠던 일정 앱을 정밀하게 계승한 초경량·고반응성(0ms 로컬 우선) 데스크톱 캘린더",
    description:
      "반응성 최우선(Zero-Latency Local-First In-Memory State) 원칙으로 로딩 스피너 및 네트워크 대기 0ms를 실현했습니다. Windows 10 UWP 시그니처 룩앤필(아크릴 반투명 효과, Reveal Highlight, 프레임리스)과 5대 캘린더 뷰, Wi-Fi 삼각측량 기반 Windows 네이티브 동 단위 정밀 위치 감지 및 실시간 기상청 날씨 연동, Google Calendar & Apple iCloud CalDAV 양방향 클라우드 동기화, Microsoft Store(.appx) 및 NSIS 설치형/포터블 EXE 배포 파이프라인을 지원합니다.",
    keyFeatures: [
      "Zero-Latency In-Memory State 기반 로딩 지연 없는 0ms 초고속 렌더링",
      "5대 캘린더 풀 뷰 (월간, 주간, 작업 주, 일간, 연간 뷰 & 시맨틱 줌)",
      "Windows 10 Fluent Design System (아크릴 효과, Reveal Highlight, 프레임리스)",
      "Windows 네이티브 Wi-Fi 삼각측량 초고정밀 위치 감지 & Open-Meteo 실시간 날씨",
      "Google Calendar & Apple iCloud CalDAV 양방향 일정 동기화 엔진",
      "Microsoft Store(.appx), NSIS 설치형, 무설치 포터블 배포 및 GitHub Actions 자동 릴리스",
    ],
    techStack: [
      "Electron 34",
      "React 19",
      "TypeScript 5.7",
      "Vite 6",
      "Zustand 5",
      "Tailwind CSS v4",
      "Vitest 3",
    ],
    metrics: [
      { label: "Responsiveness", value: "0ms In-Memory State" },
      { label: "Packaging", value: "MS Store (.appx) + NSIS" },
      { label: "CI/CD Pipeline", value: "Auto SemVer & Release" },
    ],
    primaryLink: {
      type: "microsoft",
      label: "Microsoft Store 다운로드",
      url: "https://apps.microsoft.com/detail/9nt09z0g12ss",
    },
    storeUrl: "https://apps.microsoft.com/detail/9nt09z0g12ss",
    githubUrl: "https://github.com/nicebyy/old-calender",
    status: "v1.0.2 // MS Store 출시",
    accentColor: "emerald",
    iconName: "calendar",
  },
  {
    id: "job-blocking",
    title: "Job Blocking V2 (채용 공고 필터링)",
    subtitle: "Chrome Extension for Job Portals",
    category: "Browser Extension",
    badge: "Manifest V3 · TypeScript 5.7 · React 18.3 · Vite 6",
    summary:
      "원티드·사람인·잡코리아·리멤버·점핏 5대 채용 플랫폼에서 원치 않는 기업 및 불필요한 추천/광고 공고를 숨기거나 블러 처리하는 크롬 확장 프로그램",
    description:
      "구직 활동 중 피로도를 유발하는 유료 스폰서 광고와 관심 없는 기업 공고를 원천 차단합니다. 원클릭 [공고숨김] 및 [회사차단], 지능형 기업명 정규화와 O(1) 초고속 인덱스 매칭, 잡플래닛·블라인드 실시간 듀얼 기업 평점 뱃지 인라인 렌더링, 사람인·잡코리아 구형 번호 페이지네이션의 0ms 무한 스크롤 자동 변환(Auto-Refill) 및 잡코리아 캐러셀 빈 슬롯을 채우는 Cross-Slide Reflow 자동 재정렬을 제공합니다.",
    keyFeatures: [
      "원클릭 [공고숨김] 및 [회사차단] (지능형 기업명 정규화 & O(1) 초고속 인덱스 매칭)",
      "원티드, 사람인, 잡코리아, 리멤버, 점핏 5대 채용 플랫폼 완전 맞춤 지원",
      "잡플래닛 & 블라인드 실시간 듀얼 기업 평점 뱃지 인라인 렌더링 (2계층 캐싱)",
      "사람인·잡코리아 구형 번호 페이지네이션을 0ms 무지연 무한 스크롤로 자동 변환",
      "잡코리아 캐러셀 공고 숨김 시 빈 슬롯을 채우는 Cross-Slide Reflow 자동 재정렬",
      "100% 개인정보 무수집(Zero Data Collection) & 크롬 웹스토어 배포",
    ],
    techStack: [
      "Chrome Manifest V3",
      "TypeScript 5.7",
      "React 18.3",
      "Vite 6",
      "@crxjs/vite-plugin",
      "Vitest",
      "Playwright",
    ],
    metrics: [
      { label: "Supported Platforms", value: "5 Major Job Portals" },
      { label: "Matching Engine", value: "O(1) Hash Index (0.03ms)" },
      { label: "Privacy Policy", value: "Zero Data Collection" },
    ],
    primaryLink: {
      type: "chrome",
      label: "Chrome 웹스토어 설치",
      url: "https://chromewebstore.google.com/detail/cohpijikelgbghbccpdhffaphajbmplf",
    },
    storeUrl: "https://chromewebstore.google.com/detail/cohpijikelgbghbccpdhffaphajbmplf",
    githubUrl: "https://github.com/nicebyy/job-blockingV2",
    status: "v0.2.6 // Chrome 웹스토어 출시",
    accentColor: "purple",
    iconName: "shield",
  },
  {
    id: "boardgame-calc",
    title: "보드게임 계산기 (Boardgame Calc)",
    subtitle: "Real-time Multiplayer & Offline Tabletop Assistant",
    category: "Mobile & Web App",
    badge: "Flutter 3.50+ · Dart · Socket.IO · Provider · Android APK",
    summary:
      "실시간 소켓 멀티플레이와 로컬 오프라인(Pass & Play)을 모두 지원하며, 점수·화폐 듀얼 트래커와 주사위·경매·배팅·비밀노트 4대 중앙 도구를 갖춘 테이블탑 계산기",
    description:
      "보드게임 플레이 시 발생하는 복잡한 화폐 계산, 승점 집계, 경매 입찰 및 판돈 관리를 스마트폰과 웹에서 원스톱으로 해결하는 종합 보드게임 도구 웹앱입니다. NestJS Socket.IO 백엔드와 연동되는 실시간 온라인 멀티플레이 모드와 네트워크 없는 환경을 위한 로컬 엔진(Pass & Play 및 SharedPreferences 영구 저장) 이중 모드를 제공합니다. 자율 모드 vs 엄격 뱅커 모드 권한 분리, P2P 상호 합의 송금, D6/다면체 텀블링 애니메이션 주사위 롤러, 테이블 팟 배팅, 실시간 카운트다운 경매, 블라인드 비밀노트 및 Web Audio API 0KB PCM 합성 효과음과 로비 BGM을 지원합니다.",
    keyFeatures: [
      "온라인 멀티플레이어(Socket.IO) & 오프라인 로컬 엔진(Pass & Play) 이중 모드 지원",
      "화폐(포인트) & 점수(VP) 듀얼 트래커 및 자율 모드 vs 엄격 뱅커 모드 권한 분리",
      "테이블탑 4대 중앙 도구: 🎲 주사위 롤러, 💰 배팅 판돈/테이블 팟, 🔨 실시간 호가 경매, 📝 블라인드 비밀노트",
      "잔액 및 최고입찰액 보호가 적용된 P2P 상호 합의 송금 시스템",
      "Web Audio API 경량 PCM 합성 효과음 11종 및 로비 BGM 플레이어",
      "Flutter Web PWA 및 Android APK (GitHub Actions 자동 릴리스) 크로스 플랫폼 배포",
    ],
    techStack: [
      "Flutter 3.50+",
      "Dart",
      "Socket.IO",
      "Provider",
      "SharedPreferences",
      "Web Audio API",
      "Android APK",
    ],
    metrics: [
      { label: "Dual Engine", value: "Socket.IO + Offline Local" },
      { label: "Platform", value: "Flutter Web + Android APK" },
      { label: "Audio Engine", value: "0KB Web Audio PCM Synth" },
    ],
    primaryLink: {
      type: "github",
      label: "GitHub 저장소 & APK",
      url: "https://github.com/nicebyy/boardgame-calc",
    },
    githubUrl: "https://github.com/nicebyy/boardgame-calc",
    status: "Active // Open Source",
    accentColor: "cyan",
    iconName: "dice",
  },
  {
    id: "pw-manager",
    title: "pw-manager (비밀번호 & KV 금고)",
    subtitle: "Zero-Knowledge Desktop Password & Key-Value Vault",
    category: "Desktop Application",
    badge: "Electron 34 · TypeScript · scrypt · AES-256-GCM · Vitest",
    summary:
      "다단계 계층 폴더 트리, 무제한 Key-Value 쌍 및 이미지 식별, scrypt + AES-256-GCM 종단간 암호화와 12단어 복구 문구를 지원하는 로컬 데스크톱 비밀번호 금고",
    description:
      "외부 클라우드 의존 없이 100% 로컬 환경에서 민감한 계정 정보와 API 키, 토큰을 안전하게 보호하는 데스크톱 암호화 금고입니다. 마스터 비밀번호를 scrypt(N=16384, r=8, p=1)로 키 유도하여 256-bit DEK를 생성하고, 전체 계층 폴더 트리·Key-Value 속성·식별 이미지(128x128 리사이즈)를 AES-256-GCM으로 인증 암호화합니다. 비밀번호 분실 시 12단어 복구 문구(Dual-Key Envelope)로 복구할 수 있으며, 30초 클립보드 자동 소멸, Windows 시스템 트레이 상주, 미사용 시 자동 잠금, Electron 샌드박스 격리 및 NSIS/포터블 EXE 자동 릴리스를 지원합니다.",
    keyFeatures: [
      "다단계 계층 폴더(트리 구조) & 무제한 커스텀 Key-Value 쌍(API Key, PAT, Token 등)",
      "scrypt 키 유도 + 256-bit AES-256-GCM 강력한 로컬 종단간 인증 암호화",
      "마스터 비밀번호 분실 대비 12단어 복구 문구(Dual-Key Envelope) 시스템",
      "항목별 직관적 이미지 식별 (드래그앤드롭/클립보드 붙여넣기 128x128 암호화 저장) & 프리셋",
      "30초 클립보드 자동 파기, Windows 트레이 백그라운드 상주, 미사용 시 자동 잠금",
      "writeQueue 직렬화 및 .bak 자동 백업으로 프로세스 강제 종료 시 데이터 손상 원천 차단",
    ],
    techStack: [
      "Electron 34",
      "TypeScript 5",
      "scrypt",
      "AES-256-GCM",
      "Vite",
      "Vitest",
      "NSIS / Portable EXE",
    ],
    metrics: [
      { label: "Crypto Core", value: "scrypt + AES-256-GCM" },
      { label: "Architecture", value: "Local-First Zero-Knowledge" },
      { label: "Packaging", value: "NSIS Installer + Portable EXE" },
    ],
    primaryLink: {
      type: "github",
      label: "GitHub 저장소 & 릴리스",
      url: "https://github.com/nicebyy/pw-manager",
    },
    githubUrl: "https://github.com/nicebyy/pw-manager",
    status: "v1.0.0 // Open Source",
    accentColor: "emerald",
    iconName: "key",
  },
];
