---
title: '[JPA] Custom Repository 네이밍 규칙과 UnsatisfiedDependencyException 트러블슈팅'
date: '2022-04-10'
category: Backend/JPA
tags:
  - Spring Data JPA
  - CustomRepository
  - QueryDSL
  - UnsatisfiedDependencyException
summary: >-
  QueryDSL 도입을 위해 Custom Repository 구현체를 V1/V2로 분리하던 중 발생한 UnsatisfiedDependencyException 원인을 Spring Data JPA의 Impl 접미사 탐색 규칙 관점에서 분석하고 해결 방법을 정리합니다.
---

## 문제 상황

기존 JPA 기반의 `OrderRepositoryCustom` 인터페이스를 구현한 `OrderRepositoryImpl`을 유지한 채, QueryDSL을 활용한 V2 구현체를 추가하려고 시도했습니다.

기존 코드를 남겨두기 위해 구현체 클래스 이름을 `OrderRepositoryImplV1`, `OrderRepositoryImplV2` 형태로 나누어 작성하고 애플리케이션을 실행하자 빈 생성 단계에서 오류가 발생했습니다.

![UnsatisfiedDependencyException 발생 에러 로그](/images/posts/jpa-unsatisfied-dependency-exception/image-1.png)

> 처음에는 QueryDSL 쿼리 문법 오류나 `@Repository` 애노테이션 누락을 의심해 한참을 헤맸지만, 근본적인 원인은 **Spring Data JPA의 Custom Repository 구현체 탐색 규칙**에 있었습니다.

![구현체 클래스 네이밍 변경 시도](/images/posts/jpa-unsatisfied-dependency-exception/image-2.png)

---

## 원인 분석: Spring Data JPA의 `Impl` 접미사 규칙

Spring Data JPA는 사용자가 정의한 커스텀 인터페이스(`OrderRepositoryCustom`)를 메인 `JpaRepository`(`OrderRepository`)와 자동으로 연결해 프록시 빈을 조립할 때, **리플렉션 및 네이밍 컨벤션**을 사용합니다.

기본 설정상 커스텀 구현체 클래스 이름은 반드시 **`메인리포지토리명 + Impl`** 또는 **`커스텀인터페이스명 + Impl`** 규칙을 따라야만 Spring Data JPA가 구현체를 찾아 빈으로 엮어줄 수 있습니다.

- **정상 인식**: `OrderRepositoryImpl` 또는 `OrderRepositoryCustomImpl`
- **인식 실패 (`NoSuchBeanDefinition` / `UnsatisfiedDependencyException`)**: `OrderRepositoryImplV1`, `OrderRepositoryImplV2` 등 접미사가 `Impl`로 끝나지 않는 클래스

![Spring Data JPA 공식 문서 커스텀 구현체 명명 규칙](/images/posts/jpa-unsatisfied-dependency-exception/image-3.png)

---

## 해결 방법

### 방법 1. 기본 네이밍 컨벤션(`Impl` 접미사) 준수하기

가장 간단한 해결책은 구현체 클래스 이름 끝이 항상 **`Impl`**로 끝나도록 맞추는 것입니다.

![Impl 접미사 준수 후 정상 구동 확인](/images/posts/jpa-unsatisfied-dependency-exception/image-4.png)

만약 `Impl` 외에 다른 접미사를 사용하고 싶다면 설정 애노테이션에서 커스텀 접미사를 지정할 수도 있습니다.

```java
@EnableJpaRepositories(repositoryImplementationPostfix = "CustomImpl")
```

### 방법 2. QueryDSL 전용 리포지토리를 별도 스프링 빈으로 분리하기 (실무 추천)

복잡한 조회용 QueryDSL 쿼리나 버전별(V1/V2) 구현체가 많아질 때는 굳이 `JpaRepository`의 Custom 확장 구조에 얽매일 필요가 없습니다.

```java
@Repository
@RequiredArgsConstructor
public class OrderQueryRepository {

    private final JPAQueryFactory queryFactory;

    public List<OrderDto> findComplexOrders(...) {
        return queryFactory
            .select(...)
            .from(order)
            .fetch();
    }
}
```

이처럼 **핵심 엔티티 CRUD는 `OrderRepository`에 두고, 화면에 맞춘 복잡한 조회 쿼리는 별도의 `@Repository` 클래스(`OrderQueryRepository`)로 분리**하면 네이밍 제약 없이 훨씬 유연하고 깔끔한 아키텍처를 유지할 수 있습니다.
