---
title: '[Spring] 분산 환경 동시성 제어 — Redisson 락 병목과 MySQL Named Lock 전환기'
date: '2023-04-07'
category: Backend/Spring
tags:
  - Concurrency
  - Distributed Lock
  - Redisson
  - MySQL NamedLock
  - Spring
summary: >-
  암호화폐 거래소 다중 서버 환경에서 1분 단위 차트 배치를 처리할 때 Redisson 분산 락에서 겪은 커넥션 풀 병목 현상을 분석하고, MySQL Named Lock(GET_LOCK/RELEASE_LOCK) 및 REQUIRES_NEW 트랜잭션 격리로 전환해 해결한 실무 경험을 정리합니다.
---

## 1. 다중 서버 환경에서의 병행 제어(Concurrency Control)

실무에서 동시성과 데이터 정합성 관리는 매우 중요하며, 특히 금융·가상자산 거래소 도메인에서는 작은 중복 처리나 Race Condition도 큰 이슈로 이어집니다.

![거래소 실시간 시세 차트 예시](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-1.png)

당시 제가 담당하던 거래소 차트 시스템은 **여러 대의 서버 인스턴스**가 1분 간격 스케줄러로 동작하며 BTC, ETH 등 코인 페어별 시세 데이터를 DB에 갱신하고 WebSocket으로 실시간 전달하는 구조였습니다.

문제는 **여러 서버가 동일한 시점의 1분 차트 배치를 동시에 중복 실행해서는 안 된다**는 점이었습니다.

- 자바의 `synchronized`나 `Atomic` 타입은 **단일 JVM 프로세스 내부의 스레드 간 경쟁**만 막아줄 뿐, 서로 다른 서버 인스턴스 간의 중복 실행은 제어할 수 없습니다.
- 따라서 여러 서버가 공통으로 참조할 수 있는 외부 저장소 기반의 **분산 락(Distributed Lock)**이 반드시 필요했습니다.

---

## 2. 기존 방식: Redisson 분산 락과 발생한 병목 문제

기존에는 **Redisson** 클라이언트를 이용한 Redis 분산 락으로 배타 제어를 수행하고 있었습니다.

![Redisson 분산 락 동작 구조](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-2.png)

원하는 Key로 락을 획득하면 일정 시간 또는 작업이 끝날 때까지 Redis에 락 키가 유지되어, 다른 서버 인스턴스가 중복 작업을 수행하지 않도록 막아줍니다.

![Redis 내부에 저장된 락 키 예시](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-3.png)

### 왜 Redisson 락을 교체하게 되었을까?

당시 전체 아키텍처에서는 수많은 원격 호출 등으로 인해 Redis 서버 자체의 부하가 매우 높은 상태였고, Redisson 분산 락에서도 두 가지 문제가 겹쳐 발생했습니다.

1. **Redis 트랜잭션과 커넥션 점유**: Redis의 분산 락 제어(`WATCH` 등)가 진행되는 동안 커넥션을 점유하며 부하를 가중시킵니다.
2. **커넥션 풀 경합으로 인한 락 획득 실패**: 다른 대량 트래픽 작업들과 한정된 Redis 커넥션 풀을 공유하다 보니, 정작 차트 스케줄러가 락을 획득하기 위한 커넥션 할당 자체가 실패하는 현상이 빈번했습니다.

![한정된 Redisson ConnectionPoolSize 설정으로 인한 병목](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-4.png)

차트 서버가 4대 이상인 상황에서 한정된 `connectionPoolSize`를 두고 다른 작업과 경합이 벌어지자 락 획득 실패율이 높아졌고, Redis 의존도와 부하를 낮추기 위해 다른 분산 락 대안을 찾게 되었습니다.

> 참고: [Redis Transaction의 동작과 주의사항](https://sabarada.tistory.com/177)

---

## 3. 대안 적용: MySQL Named Lock 전환

마침 메인 DB로 MySQL 5.7 이상 버전을 사용하고 있었고, 우아한형제들 기술블로그([MySQL Named Lock을 활용한 분산 락](https://techblog.woowahan.com/2631/))의 사례를 참고해 추가 인프라 비용 없이 **MySQL Named Lock**으로 전환하기로 결정했습니다.

![MySQL Named Lock 전환 후 서비스 구조](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-5.png)

![차트 배치 로직 락 적용 코드 1](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-6.png)

![차트 배치 로직 락 적용 코드 2](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-7.png)

### Native Query 기반 `ChartLockRepository` 구현

JPA는 MySQL의 Named Lock 함수를 기본 문법으로 제공하지 않으므로 Native Query로 직접 호출하도록 구현했습니다.

![MySQL Named Lock Native Query 리포지토리](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-8.png)

사용한 MySQL 5.7+ 내장 락 함수는 다음 3가지입니다. ([MySQL Locking Functions 공식 문서](https://dev.mysql.com/doc/refman/5.7/en/locking-functions.html))

1. **`SELECT IS_USED_LOCK(:key)`**: 해당 이름의 락이 현재 점유 중인지 확인
2. **`SELECT GET_LOCK(:key, :timeout)`**: 지정된 키 이름으로 락 획득 시도 (대기 타임아웃 초 단위 지정)
3. **`SELECT RELEASE_LOCK(:key)`**: 작업 완료 후 락 명시적 해제

### 적용 결과 및 트랜잭션 격리 (`REQUIRES_NEW`)

`락 상태 확인 → 락 획득 → 비즈니스 트랜잭션 수행 → finally 블록에서 락 해제` 흐름으로 전환한 뒤에는 **더 이상 락 획득 실패 장애가 발생하지 않았으며, Redis 서버의 부하도 눈에 띄게 줄일 수 있었습니다.**

또한 배치 작업 중 특정 코인 페어의 처리가 실패하더라도 다른 정상 코인 차트 작업까지 함께 롤백되지 않도록, 개별 처리 메서드의 트랜잭션 전파 옵션을 **`@Transactional(propagation = Propagation.REQUIRES_NEW)`**로 분리해 장애 전파를 차단했습니다.

---

## 4. 트러블슈팅 리마인드 (Named Lock의 Timeout 오해)

당시 작업을 진행하며 GPT와 함께 점검했던 락 동작 특성 및 주의사항 기록입니다.

![MySQL Named Lock 동작 질의 1](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-9.png)

![MySQL Named Lock 동작 질의 2](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-10.png)

![MySQL Named Lock 동작 질의 3](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-11.png)

> **💡 회고: "GET_LOCK에 1분(60초)을 넘겼는데 왜 작업 시간이 1분을 초과해도 락이 풀리지 않았을까?"**  
> 당시 가장 궁금했던 부분인데, **MySQL `GET_LOCK(str, timeout)`의 `timeout`은 Redis의 TTL(유지 시간)이 아니라 "락을 획득하기 위해 기다리는 대기 타임아웃(Wait Timeout)"**입니다!  
> MySQL Named Lock은 한 번 획득하면 `RELEASE_LOCK()`을 호출하거나 해당 DB 커넥션 세션이 끊어질 때까지 **시간 제한 없이 계속 유지**됩니다. 또한 락을 쥐고 있는 동안 DB 커넥션을 점유하므로, 실무에서는 **Named Lock 전용 별도 DataSource(커넥션 풀)를 일반 비즈니스 DataSource와 분리**해 커넥션 고갈(Deadlock)을 예방하는 것이 안전합니다.
