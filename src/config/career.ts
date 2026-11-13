export interface CareerProjectAchievement {
  title: string;
  problem?: string;
  action: string;
  result: string;
}

export interface CareerProject {
  id: string;
  name: string;
  period: string;
  duration: string;
  overview: string;
  role: string;
  techStack: string[];
  achievements: CareerProjectAchievement[];
  keyFeatures?: string[];
}

export interface CareerCompany {
  id: string;
  alias: string;
  name: string;
  confidentialBadge: string;
  industry: string;
  period: string;
  totalDuration: string;
  team: string;
  position: string;
  description: string;
  coreTech: string[];
  projects: CareerProject[];
}

export interface CareerSummaryStat {
  label: string;
  value: string;
  description: string;
}

export const careerSummaryStats: CareerSummaryStat[] = [
  {
    label: "Total Experience",
    value: "약 3년 (33개월)",
    description: "핀테크, 거래소, 대용량 정산 & Web3 백엔드/풀스택",
  },
  {
    label: "Core Architecture",
    value: "EDA & High-Throughput",
    description: "RabbitMQ, WebSocket, DAG 위상 정렬, Spring Batch",
  },
  {
    label: "DB & Optimization",
    value: "90%+ I/O 감축",
    description: "No-Offset 페이징, 커버링 인덱스, 벌크 플러시, Named Lock",
  },
  {
    label: "Code Quality",
    value: "90%+ Test Coverage",
    description: "Clean Layered Architecture, TDD & 동시성 테스트",
  },
];

export const careerCompaniesData: CareerCompany[] = [
  {
    id: "company-g",
    alias: "G사",
    name: "블록체인 핀테크 & 대용량 정산 플랫폼 기업 (G사)",
    confidentialBadge: "🔒 비공개 // G사",
    industry: "블록체인 핀테크 / 대용량 분산 배치 / 정산 엔진",
    period: "2025.07 ~ 2026.05",
    totalDuration: "11개월",
    team: "백엔드 개발팀",
    position: "백엔드 / 서버 개발 엔지니어",
    description:
      "Chew-fi 글로벌 핀테크 플랫폼의 백엔드 코어 API 설계 및 개발, 대용량 회원 트랜잭션에 따른 파트너 수익금 쉐어 정산 및 자동 구매 배치 엔진 최적화, 다차원 출금 정책 엔진 구축을 주도했습니다.",
    coreTech: [
      "Java 17",
      "Kotlin",
      "Spring Boot 3.4",
      "Spring Batch 5",
      "MySQL 8.0",
      "Spring Data JPA",
      "QueryDSL 5",
      "Redis",
      "Redisson",
      "MongoDB",
      "SonarQube",
    ],
    projects: [
      {
        id: "chew-chew-batch",
        name: "Chew-fi 대용량 배치 및 정산 시스템 (chew-chew-batch)",
        period: "2025.07 ~ 2026.05",
        duration: "11개월",
        overview:
          "대규모 회원 트랜잭션에 따른 파트너 수익금 쉐어 정산, 자동 구매(Auto-Purchase), 일일 정산 및 통계를 전담하는 대용량 배치 프로세싱 시스템입니다.",
        role: "대용량 정산 파이프라인 설계, DAG 위상 정렬 인메모리 트리 캐싱, Spring Batch 성능 튜닝 및 동시성 무결성 테스트 구축",
        techStack: [
          "Java 17",
          "Kotlin",
          "Spring Boot 3.4.1",
          "Spring Batch 5",
          "Spring Cloud OpenFeign",
          "MySQL 8.0",
          "Spring Data JDBC",
          "Spring Data JPA",
          "QueryDSL 5",
          "MongoDB",
          "JUnit 5",
          "Spring Batch Test",
          "Micrometer Prometheus",
        ],
        achievements: [
          {
            title: "인메모리 위상 정렬(Topological Sort) DAG 기반 파트너 트리 구축 및 대용량 정산 I/O 최적화",
            problem:
              "회원 간 추천인(Partner) 관계가 다단계 트리 형태로 형성되는 비즈니스 구조에서, 거래 및 매칭 발생 시마다 상위 추천인을 재귀적으로 DB 조회하여 정산 포인트를 분배함에 따라 트랜잭션 증가 시 DB N+1 쿼리 폭증, Row Lock 경합, 트랜잭션 타임아웃이 발생했습니다. 또한 데이터 순환 참조(Cycle) 발생 시 무한 루프로 인한 시스템 셧다운 위험이 존재했습니다.",
            action:
              "파트너 등록 시 방향성 비순환 그래프(DAG) 순환 참조 검증 알고리즘을 도입하고, 진입 차수(Indegree) 큐를 활용한 위상 정렬 알고리즘 기반 전체 파트너 인메모리 트리 캐싱(ShareSettlementUtils)을 구현했습니다. 실시간 거래 시 DB I/O 없이 메모리 상에서 최하위 노드부터 상위 노드로 약정 요율(SHARE_PROFIT_RATE)에 따라 수익 포인트를 연쇄 누적(AccumulateTxPoint)하고, 배치 트랜잭션 완료 시점에 단일 벌크(Bulk) 쿼리로 DB에 일괄 플러시(FlushSettlementListener)하도록 리팩토링했습니다.",
            result:
              "정산 트랜잭션당 DB I/O 호출 횟수를 90% 이상 감축시켰으며, DB Row Lock 경합을 완전히 제거하여 대용량 매칭 정산 처리량을 극대화하고 파트너 순환 참조 버그를 사전에 원천 차단했습니다.",
          },
          {
            title: "Spring Batch 성능 튜닝 및 Dynamic JDBC Cursor 도입",
            problem:
              "대량의 회원 아이템 자동 구매(Auto Purchase) 및 정산 배치 수행 시, 기본 JPA Paging Item Reader 사용으로 인한 오프셋 탐색 지연과 영속성 컨텍스트 1차 캐시 메모리 누적으로 OOM(Out Of Memory) 위험이 지속되었습니다.",
            action:
              "영속성 컨텍스트 오버헤드가 없는 스트리밍 기반의 커스텀 DynamicJdbcCursorItemReader를 구현하여 대량 데이터를 일정 청크(Chunk) 단위로 메모리 부하 없이 순차 스트리밍 처리했습니다. 또한 대량 엔티티 저장 시 IDENTITY 채번 방식의 한계(Batch Insert 비활성화)를 극복하기 위해 Sequence/Table-Seq 채번 전략을 도입하여 JDBC Batch Insert 효율을 극대화했습니다.",
            result:
              "배치 처리 시 JVM 메모리 점유율을 안정적으로 일정하게 유지하고, 대용량 배치 처리 속도를 수 배 이상 단축했습니다.",
          },
          {
            title: "정산 정합성을 위한 동시성 및 E2E 테스트 자동화",
            problem:
              "금융 및 수익금 정산 도메인 특성상 단 1원의 오차도 허용되지 않으므로, 복잡한 추천인 트리 깊이와 분기 상황에서 동시 트랜잭션 발생 시 정산 불일치가 발생할 리스크가 있었습니다.",
            action:
              "Kotlin 기반의 정산 단위 테스트, 다건 동시성 테스트(Multi-thread Concurrency Test) 및 E2E 테스트 파이프라인을 구축하여 다양한 추천인 트리 깊이와 분기 상황에서의 동시 트랜잭션 처리 무결성을 사전 검증했습니다.",
            result:
              "다양한 동시 트랜잭션 상황에서도 단 한 건의 자산 누락이나 중복 정산 없는 100% 수익 분배 무결성을 검증하고 무중단 배포 안정성을 확보했습니다.",
          },
        ],
      },
      {
        id: "shibarise-v1",
        name: "Chew-fi 백엔드 코어 API (shibarise-v1)",
        period: "2025.07 ~ 2026.05",
        duration: "11개월",
        overview:
          "Chew-fi 플랫폼의 유저 인증, 회원 관리, 지갑 자산, 직급/커미션 계산, 출금 정책 및 백오피스 운영을 위한 메인 백엔드 코어 API입니다.",
        role: "출금 정책 엔진(Withdraw Policy Engine) 설계, 직급/커미션 엔진 트리 최적화, 자산 보안 파이프라인 및 모니터링 체계 수립",
        techStack: [
          "Java 17",
          "Kotlin",
          "Spring Boot 3.4.1",
          "Spring Security",
          "OAuth2 Client",
          "MySQL 8.0",
          "MongoDB",
          "Redis",
          "Redisson 3.50",
          "Spring Session Redis",
          "AWS SES",
          "Firebase Admin (FCM)",
          "SonarQube",
          "P6spy",
        ],
        achievements: [
          {
            title: "다차원 회원 출금 한도 및 동적 정책 엔진 (Withdraw Policy Engine) 구축",
            problem:
              "플랫폼 토큰 경제의 인플레이션 방지 및 어뷰징 차단을 위해 회원 직급, 시장가 대비 공시가 비율, 출금 횟수 및 기간별 한도를 복합적으로 평가하는 정교한 출금 제어 메커니즘이 요구되었습니다.",
            action:
              "회원별 직급(Rank), 누적 출금액, 시장가/공시가 비율을 실시간 평가하여 출금 승인/거절을 판정하는 WithdrawLimitComponent를 설계했습니다. 또한 서버 재배포 없이 런타임에 관리자 설정을 통해 출금 제한 주기 및 패널티 일괄 해제 주기를 변경할 수 있는 동적 스케줄러(WithdrawLockSchedulerService)와 국가/지역별 규제에 맞는 글로벌 Locale 분리 정책을 구현했습니다.",
            result:
              "토큰 유출 및 어뷰징 시도를 사전에 원천 차단하고, 운영 정책 변경에 유연하게 대응하는 무중단 동적 정책 통제 체계를 구축했습니다.",
          },
          {
            title: "회원 실적 볼륨(Volume) 누적합 및 직급(Rank) / 커미션 엔진 최적화",
            problem:
              "추천인 네트워크 트리를 타고 올라가며 하위 파트너의 구매 실적(Volume)을 상위로 전파/합산할 때 불필요한 중복 순회로 인한 연산 지연이 발생했습니다.",
            action:
              "트리 탐색 시 중복 방문 노드를 제거하는 메모이제이션 및 경로 최적화 알고리즘을 적용하고, 회원 실적 변경 시 비동기 이벤트 기반으로 실시간/배치 직급 산정(MemberRankService) 및 커미션 요율(MemberCommissionService)을 자동 갱신하는 파이프라인을 구축했습니다.",
            result:
              "대규모 볼륨 롤업 연산 속도를 대폭 개선하고 실시간 직급 갱신 지연시간을 최소화했습니다.",
          },
          {
            title: "보안 강화, 민감 자산 변경 파이프라인 및 코드 품질 체계화",
            problem:
              "회원 지갑 주소 및 주요 출금 정보 수정 시 계정 탈취 위험과, 개발 단계에서의 N+1 쿼리 유입 위험이 상존했습니다.",
            action:
              "회원 지갑 주소 변경 시 AWS SES 기반 일회용 이메일 인증 절차와 관리자 회원 정보 수정에 대한 상세 감사 로깅(Audit Logging)을 구축했습니다. SonarQube 정적 분석 도구 도입 및 P6spy 연동으로 SQL 실행 로그 포맷팅과 파라미터 바인딩을 가시화했습니다.",
            result:
              "민감 금융 자산에 대한 보안 무결성을 확보하고, N+1 쿼리 및 슬로우 쿼리를 개발/스테이징 단계에서 사전 차단했습니다.",
          },
        ],
      },
    ],
  },
  {
    id: "company-c",
    alias: "C사",
    name: "Web3 블록체인 게임 & 플랫폼 개발사 (C사)",
    confidentialBadge: "🔒 비공개 // C사",
    industry: "Web3 게임 / 블록체인 TCG / 관리자 플랫폼",
    period: "2024.06 ~ 2025.05",
    totalDuration: "1년",
    team: "웹 개발팀",
    position: "풀스택 소프트웨어 엔지니어 (백엔드 코어 & 프론트 어드민)",
    description:
      "Web3 기반 TCG 게임 'MetaMatch' 운영 관리 시스템(Admin Platform)의 백엔드 API 및 프론트엔드 어드민 전체를 단독 설계·구축했습니다. 도메인 중심 클린 아키텍처, TDD 90% 커버리지, 온체인 민팅 대기열 관리 및 실시간 SSE 스트리밍을 구현했습니다.",
    coreTech: [
      "NestJS",
      "TypeScript",
      "MongoDB (Mongoose)",
      "React 18",
      "TanStack Query v5",
      "Zustand",
      "Tailwind CSS",
      "Vite",
      "SSE",
      "Jest",
      "GCP",
    ],
    projects: [
      {
        id: "metamatch-admin",
        name: "MetaMatch 관리자 플랫폼 (metamatch-admin & metamatch-admin-api)",
        period: "2024.06 ~ 2025.05",
        duration: "1년",
        overview:
          "Web3 기반 TCG/수집형 블록체인 게임 'MetaMatch'의 게임 데이터, 유저 자산, 보상 지급, 온체인 민팅 대기열 및 운영 정책을 총괄하는 백오피스 통합 플랫폼입니다.",
        role: "백엔드 API 및 프론트엔드 SPA 단독 설계/개발, 클린 레이어드 아키텍처 수립, TDD 테스트 자동화 및 SSE 온체인 모니터링 구축",
        techStack: [
          "NestJS",
          "TypeScript",
          "MongoDB",
          "Mongoose",
          "Passport",
          "JWT",
          "SSE",
          "Cache-Manager",
          "React 18",
          "TanStack Query v5",
          "Zustand",
          "Tailwind CSS",
          "Vite",
          "React Hook Form",
          "Jest",
          "GCP",
        ],
        achievements: [
          {
            title: "Clean Layered Architecture 지향 도메인 중심 설계 (Back-End)",
            problem:
              "빠른 게임 기능 추가 및 스키마 변경이 잦은 환경에서 컨트롤러나 서비스 계층에 DB(MongoDB) 의존성이 직접 침투할 경우 코드 결합도 증가 및 유지보수성 저하 우려가 존재했습니다.",
            action:
              "Presentation, Application(UseCase/Facade), Domain(Entity & Domain Service), Infrastructure(Mongoose Schema & Repository)의 4계층으로 명확히 분리했습니다. 핵심 도메인 로직이 외부 DB 기술에 종속되지 않도록 POJO 기반 도메인 모델과 영속성 스키마를 분리 매핑하고, 복합 비즈니스는 Application 계층 Facade 패턴으로 캡슐화했습니다.",
            result:
              "게임 보상 룰 및 정책 변경 시 다른 계층에 사이드 이펙트를 주지 않는 독립적인 개발 환경을 마련하고 코드 재사용성과 가독성을 대폭 향상시켰습니다.",
          },
          {
            title: "TDD 지향 개발 및 테스트 자동화 (테스트 커버리지 90% 이상 달성)",
            problem:
              "게임 내 카드, 팩, 가챠, 출석 체크, 우편함 보상 등 재화 및 자산과 직결된 핵심 로직의 계산 착오는 서비스 신뢰도에 치명적인 영향을 초래할 수 있었습니다.",
            action:
              "Jest 기반으로 비즈니스 단위 유닛 테스트를 선행/동시 작성하고, Application UseCase/Facade 계층 통합 테스트 및 Supertest 기반 컨트롤러 E2E 테스트를 구축했습니다. Mongoose Model 모킹 및 테스트 픽스처(Fixture)를 표준화했습니다.",
            result:
              "핵심 비즈니스 로직 테스트 커버리지 90% 이상을 달성하여, 신규 정책 및 기능 추가 시 버그 없는 안정적인 배포 파이프라인을 확립했습니다.",
          },
          {
            title: "세분화된 RBAC 인증/인가 및 JWT 이중 토큰 보안 체계 구축",
            problem:
              "운영자, CS 담당자, 게임 기획자 등 역할별 정밀한 접근 제어와, 토큰 만료 시 관리자 작업 중단 없는 무중단 세션 유지가 필요했습니다.",
            action:
              "Passport 및 NestJS Guard를 활용한 역할 기반 접근 제어(RBAC)를 구현하고, 단기 Access Token과 장기 Refresh Token을 발급하는 이중 토큰 구조를 채택했습니다. 토큰 갱신 시 기존 토큰을 즉시 무효화하고 재발급하는 Refresh Token Rotation 메커니즘을 적용했습니다.",
            result:
              "관리자별 메뉴 및 기능 인가 무결성을 확보하고 세션 보안성을 극대화했습니다.",
          },
          {
            title: "캐싱 전략 도입 및 Cache Evict 기반 응답 성능 최적화",
            problem:
              "유저 자산 현황, 활동 로그, 마스터 카드 정보 등 반복 조회되지만 변경 빈도가 낮은 무거운 MongoDB 집계(Aggregation) 쿼리로 인해 I/O 병목이 발생했습니다.",
            action:
              "NestJS Cache-Manager를 도입하여 빈번하게 호출되는 읽기 전용 API에 인메모리 캐시를 적용하고, 보상 생성이나 카드 스키마 수정 등 CUD 실행 시 연관 캐시 키를 즉시 무효화(Cache Evict)하는 정교한 라이프사이클을 관리했습니다.",
            result:
              "대시보드 및 마스터 데이터 조회 API 응답 지연시간을 대폭 단축하고 MongoDB 읽기 부하를 경감시켰습니다.",
          },
          {
            title: "Web3 트랜잭션 민팅 대기열(Mint Queue) 관리 및 SSE 실시간 모니터링",
            problem:
              "블록체인 네트워크의 가스비 변동 및 혼잡도로 인해 NFT 카드 추출/민팅 트랜잭션이 지연되거나 실패할 경우 자산 유실 방지 및 실시간 모니터링이 필수적이었습니다.",
            action:
              "카드 추출 대기열(Mint-Queue) 상태 관리 파이프라인을 구축하여 실패 트랜잭션 감지 및 대기(Pending) 상태 전환 후 안전하게 재처리(Retry)하는 관리자 제어 기능을 구현했습니다. 또한 SSE(Server-Sent Events) 단방향 스트리밍을 통해 최신 블록 높이와 온체인 상태를 프론트엔드로 실시간 푸시했습니다.",
            result:
              "온체인 트랜잭션 실패로 인한 유저 자산 누락 위험을 제로화하고 실시간 블록체인 모니터링 체계를 확립했습니다.",
          },
          {
            title: "전역 상태 아키텍처 분리 & Silent Refresh 토큰 파이프라인 (Front-End)",
            problem:
              "복잡한 관리자 폼/모달 상태와 서버 비동기 데이터가 혼재되어 상태 불일치가 발생하고, Access Token 만료 시 작업 중이던 폼 작성 내용이 유실되는 UX 문제가 있었습니다.",
            action:
              "Zustand(클라이언트 UI 전역 상태)와 TanStack Query(서버 상태 및 캐싱/자동 리패칭)를 명확히 분리했습니다. Axios Response Interceptor에서 401 감지 시 실패 요청들을 큐(Queue)에 일시 보관하고 Refresh Token으로 새 토큰 발급 성공 시 대기 요청들을 순차 재실행(Silent Retry)하는 비동기 큐잉 메커니즘을 구현했습니다.",
            result:
              "Props Drilling을 완전히 제거하고, 관리자가 오랜 시간 작업 중에도 로그인 끊김이나 데이터 유실 없는 매끄러운 사용자 경험을 실현했습니다.",
          },
          {
            title: "대용량 카드/아이템 목록 무한 스크롤(Infinite Scroll v2) 성능 최적화",
            problem:
              "수천 장 이상의 게임 카드 및 NFT 목록을 일괄 렌더링 시 DOM 노드 폭증으로 브라우저 프리징 현상이 발생했습니다.",
            action:
              "Intersection Observer API와 React Query의 useInfiniteQuery를 결합하여 스크롤 위치 기반 무한 스크롤(v2)을 구현하고, 공통 Table Mapper 및 모달 컴포넌트를 설계하여 반복 테이블 뷰의 재사용성을 극대화했습니다.",
            result:
              "초기 페이지 로딩 속도와 브라우저 메모리 사용량을 대폭 절감하고 수천 건의 카드 데이터를 부드럽게 탐색할 수 있도록 최적화했습니다.",
          },
        ],
      },
    ],
  },
  {
    id: "company-a",
    alias: "A사",
    name: "글로벌 암호화폐 거래소 & 핀테크 플랫폼 기업 (A사)",
    confidentialBadge: "🔒 비공개 // A사",
    industry: "글로벌 암호화폐 거래소 / 코어 API / 실시간 메시징",
    period: "2022.08 ~ 2023.08",
    totalDuration: "1년 1개월",
    team: "거래소개발팀",
    position: "백엔드 / 서버 개발 엔지니어 (팀원)",
    description:
      "글로벌 암호화폐 거래소 플랫폼 코어 API 및 배치 시스템 고도화, 실시간 시세/알림 메시징 아키텍처 전면 개편, 글로벌 커머스 입점 판매자 플랫폼(Seller Admin) 풀스택 리뉴얼을 수행했습니다.",
    coreTech: [
      "Java 11",
      "Spring Boot 2.7",
      "Spring Data JPA",
      "QueryDSL",
      "MySQL 8.0",
      "Redis",
      "RabbitMQ",
      "WebSocket (STOMP)",
      "Apache Reverse Proxy",
      "Prometheus",
      "Grafana",
      "AWS",
    ],
    projects: [
      {
        id: "aladdin-exchange",
        name: "글로벌 암호화폐 거래소 플랫폼 코어 & 실시간 중계 시스템",
        period: "2022.08 ~ 2023.08",
        duration: "1년",
        overview:
          "글로벌 암호화폐 거래소 플랫폼 코어 API 및 실시간 호가/시세 중계, 스테이킹 서비스를 전담하는 미션 크리티컬 시스템입니다.",
        role: "실시간 메시징 아키텍처 개편(RabbitMQ), WebSocket 패킷 다이어트, 대용량 주문 쿼리 커서 페이징 최적화, MySQL Named Lock 전환",
        techStack: [
          "Java 11",
          "Spring Boot 2.7",
          "Spring Data JPA",
          "QueryDSL",
          "MySQL 8.0",
          "Redis (Lettuce, Redisson)",
          "RabbitMQ",
          "WebSocket (STOMP)",
          "Apache Reverse Proxy",
          "Prometheus",
          "Grafana",
          "AWS CloudWatch",
          "Docker Compose",
        ],
        achievements: [
          {
            title: "실시간 알림/시세 메시징 아키텍처 전면 개편 (RabbitMQ 도입 및 Publish 서버 분리)",
            problem:
              "단일 Redis 인스턴스에 세션 저장, 캐싱, 트레이딩봇 데이터, 주문 체결 알림 원격 호출(Redisson RemoteServiceCall)이 과도하게 집중되어, 급격한 거래량 증가 시 I/O 병목으로 전체 시스템 지연이 발생하고 고스펙 AWS ElastiCache 유지로 인프라 비용 부담이 가중되었습니다.",
            action:
              "실시간 시세 및 알림 중계를 전담하는 독립 Publish 서버를 신규 분리하고 AMQP 브로커인 RabbitMQ를 도입했습니다. 코인 페어(USDT, BTC, ETH 등 BaseCoin)별 독립 Queue와 Consumer를 분리 설계하여 특정 코인의 트래픽 급증이 다른 코인 거래에 영향을 주지 않도록 격리했습니다. 체결 처리 엔진(Trade Server)에서 이벤트를 발행하고 Publish 서버가 비동기 수신하여 클라이언트에게 실시간 푸시하는 이벤트 기반 아키텍처(EDA)를 구축했습니다.",
            result:
              "단일 장애 지점(SPOF)을 해소하고 코인별 트래픽 장애 격리를 달성했습니다. Redis의 메시징 부하를 RabbitMQ로 분산시켜 AWS ElastiCache 사양 다운스케일링을 통한 인프라 비용 절감을 달성했습니다.",
          },
          {
            title: "WebSocket 통신 패킷 다이어트 및 네트워크 대역폭 최적화",
            problem:
              "기존 실시간 소켓 브로드캐스팅 시 JPA 엔티티 객체를 직접 직렬화하여 전송함에 따라 양방향 연관관계 필드 및 불필요한 데이터가 포함되어 단일 패킷의 크기가 비대해졌고, 모바일 웹 및 저사양 클라이언트 브라우저에서 JSON 파싱 지연과 네트워크 대역폭 낭비가 초래되었습니다.",
            action:
              "엔티티의 외부 직접 노출을 전면 차단하고 프론트엔드 실시간 렌더링에 필요한 필드만 엄선한 경량 DTO(MessagePublishDto, TradePublishMessageDto) 설계 및 변환 계층을 도입했습니다. 클라이언트가 관심 있는 코인 페어의 토픽만 선택적으로 구독하도록 STOMP 토픽 구조를 세분화했습니다.",
            result:
              "전송 데이터 패킷 크기를 수십 배 감축시키고 네트워크 I/O 지연시간을 대폭 개선하여 클라이언트 렌더링 성능을 극대화했습니다.",
          },
          {
            title: "대용량 주문/호가 조회 쿼리 최적화 (No-Offset 커서 페이징 & N+1 해결)",
            problem:
              "누적 주문 데이터가 수백만 건 이상으로 증가하면서 기존 OFFSET 기반 페이징의 성능 저하(오프셋 탐색을 위한 풀 테이블 스캔)가 발생했고, 호가 및 체결 내역 조회 시 연관 관계 매핑 오류로 인한 심각한 N+1 쿼리가 발생했습니다.",
            action:
              "대용량 주문/호가 내역 조회 API를 No-Offset 기반의 커서 페이징(Cursor-based Pagination)으로 전환하고 반환 타입을 Slice로 변경했습니다. QueryDSL 동적 쿼리를 작성하여 복합 커버링 인덱스(Covering Index)를 정상적으로 타도록 실행 계획(Explain Plan)을 튜닝하고, Fetch Join 및 @EntityGraph를 적용하여 연관 엔티티 조회 N+1 쿼리를 단일 쿼리로 통합했습니다.",
            result:
              "데이터 누적량과 관계없이 주문/호가 조회 속도를 일정한 O(1) 수준으로 평탄화하여 데이터베이스 부하를 급감시키고 응답 속도를 수백 배 개선했습니다.",
          },
          {
            title: "분산 락 아키텍처 개선 (Redisson Lock -> MySQL Named Lock 전환)",
            problem:
              "입출금 배치, 차트 생성 배치, CoinMarketCap API 시세 수집 배치 등 복수의 배치 스케줄러가 Redisson 분산 락을 공유 사용함에 따라, Redis 부하 증가 시 분산 락 타임아웃 및 일시적 연결 지연이 핵심 금융 배치 작업의 실패로 전파되는 결합도 문제가 존재했습니다.",
            action:
              "배치 동시성 제어가 필요한 작업의 락 매커니즘을 Redis 의존성에서 분리하고, RDBMS 고유 기능을 활용한 MySQL Named Lock(GET_LOCK(), RELEASE_LOCK()) 구조로 전환하여 전용 트랜잭션 커넥션 풀 기반으로 락을 관리하도록 리팩토링했습니다.",
            result:
              "Redis 가용성 장애 발생 시에도 배치 시스템이 영향받지 않도록 장애 격리(Fault Tolerance)를 확보하고 Redis 리소스 점유율 감소 및 배치 스케줄러의 동시성 안전성을 보장했습니다.",
          },
          {
            title: "CoinMarketCap(CMC) 시세 배치 및 지갑 쿼리 튜닝",
            problem:
              "대량의 외부 시세/호가 데이터를 주기적으로 갱신할 때 IN 쿼리 기반 DELETE 연산으로 인한 DB 락 경합 및 시퀀스 채번 병목이 발생했습니다.",
            action:
              "단건 IN 삭제 방식을 Truncate / 벌크 연산으로 전환하여 트랜잭션 롤백 로그 및 쓰기 부하를 축소하고, Hibernate Sequence 채번 전략을 최적화하여 DB Round-Trip을 최소화했습니다. 유저 지갑 일일 출금 한도 초기화(DailyInitBatchJob) 로직을 개선하여 지갑 테이블 락 점유 시간을 최소화했습니다.",
            result:
              "CMC 시세 수집 및 일일 초기화 배치 수행 시간을 획기적으로 단축하여 안정적인 거래 시세 동기화 환경을 제공했습니다.",
          },
          {
            title: "암호화폐 스테이킹(Staking & Special Staking) 서비스 신규 개발",
            action:
              "회원이 보유 코인을 일정 기간 락업(Lock-up)하면 만기 또는 주기에 따라 약정 이자를 지급하는 스테이킹 비즈니스 로직 및 API를 설계·구현했습니다. 일일 이자 지급 및 만기 해제 스케줄러 배치를 개발하고 락업 해제 시 자산 복구 트랜잭션 정합성을 보장했습니다.",
            result:
              "관리자용 스페셜 스테이킹 이력 조회, 통계 대시보드 및 대용량 정산 내역 엑셀 다운로드 기능을 완비하여 신규 금융 수익 모델을 성공적으로 론칭했습니다.",
          },
        ],
      },
      {
        id: "buyaladdin-seller",
        name: "글로벌 커머스 판매자 백오피스 플랫폼 (Seller Admin)",
        period: "2022.08 ~ 2023.02",
        duration: "약 6개월",
        overview:
          "글로벌 커머스 입점 판매자를 위한 판매자 백오피스(Seller Admin) 신규 구축 및 풀스택 리뉴얼 프로젝트입니다.",
        role: "판매자 관리 백오피스 풀스택 리뉴얼 주도, RestTemplate -> WebClient 논블로킹 전환, API 게이트웨이 인터셉터 통합",
        techStack: [
          "Java 11",
          "Spring Boot 2.7",
          "Spring Data JPA",
          "MySQL 8.0",
          "Spring Cloud OpenFeign",
          "Spring WebClient",
          "Thymeleaf (SSR)",
          "JavaScript (jQuery)",
          "Bootstrap",
          "Swagger",
        ],
        achievements: [
          {
            title: "판매자 관리 백오피스 풀스택 리뉴얼 및 신규 구축 주도",
            action:
              "상품(Product), 주문/배송(Delivery), 정산(Settlement), 1:1 문의(QnA) 도메인의 백엔드 API 설계부터 Thymeleaf 기반 프론트엔드 SSR 화면 구현까지 주도적으로 개발했습니다. 다중 이미지 일괄 업로드, 카테고리/브랜드 연동, 재고 수량에 따른 판매 상태 자동 전이 로직을 완성했습니다.",
            result:
              "판매자 업무 효율을 극대화하는 반응형 백오피스 환경을 구축하고 100% 무결점 론칭을 달성했습니다.",
          },
          {
            title: "통신 계층 고도화: 블로킹 RestTemplate에서 논블로킹 WebClient로 전환",
            problem:
              "외부 배송 조회 API 및 사내 서비스 연동 시 전통적인 RestTemplate의 동기-블로킹 I/O로 인해 외부 응답 지연 시 톰캣 쓰레드 풀이 고갈되는 리스크가 존재했습니다.",
            action:
              "배송 정보 조회 및 외부 연동 레이어를 WebClient로 마이그레이션하여 비동기/논블로킹 통신을 지원하고, FeignGateway 및 AppInfoFilter 도입에 맞추어 Feign Client 통신 헤더 인터셉터 파이프라인을 통합했습니다.",
            result:
              "외부 통신 시 쓰레드 차단 문제를 예방하고 고부하 트래픽 상황에서도 서비스 확장성을 확보했습니다.",
          },
          {
            title: "개발 생산성 및 인터페이스 표준화",
            action:
              "Springdoc OpenAPI(Swagger)를 적용하여 사내 타 시스템 및 프론트 협업을 위한 API 명세를 자동화하고, Thymeleaf Layout 공통 템플릿 컴포넌트화를 통해 UI 재사용성과 관리 효율성을 제고했습니다.",
            result:
              "타 팀과의 연동 개발 커뮤니케이션 비용을 대폭 축소하고 신규 화면 개발 생산성을 40% 이상 향상시켰습니다.",
          },
        ],
      },
    ],
  },
];
