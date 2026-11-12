---
title: '[JPA] Auditing @LastModifiedDate가 벌크성 쿼리에서 동작하지 않는 이유와 해결 방법'
date: '2022-03-03'
category: Backend/JPA
tags:
  - '@LastModifiedDate'
  - JPA Auditing
  - JPA
  - 벌크성 쿼리
  - Dirty Checking
summary: >-
  JPA Auditing의 @LastModifiedDate가 단건 수정에서는 정상 동작하지만 벌크성 UPDATE 쿼리에서는 동작하지 않는 원인과 영속성 컨텍스트 우회 문제를 분석하고, 실무에서 적용할 수 있는 해결 방법을 정리합니다.
---

## 문제 상황

엔티티의 생성 시각과 수정 시각을 자동으로 추적하기 위해 **Spring Data JPA Auditing**(`@CreatedDate`, `@LastModifiedDate`)을 적용하던 중 의아한 현상을 발견했습니다.

![Auditing 적용 엔티티 설정](/images/posts/jpa-auditing-lastmodifieddate/image-1.png)

단건 엔티티 수정 시에는 `lastModifiedDate`가 정상적으로 갱신되는데, 전체 상품 할인(세일)처럼 **다수의 데이터를 한 번에 수정하는 벌크성 쿼리(Bulk Update)**를 실행하면 `@LastModifiedDate`가 전혀 업데이트되지 않았습니다.

![단건 수정과 벌크 수정 결과 비교](/images/posts/jpa-auditing-lastmodifieddate/image-2.png)

> 위 결과를 보면 2~12번 데이터는 전체 할인 벌크 쿼리가 실행된 항목이고, 13번은 단건 수정이 일어난 항목입니다. 13번만 수정 일시가 정상 반영된 것을 확인할 수 있습니다.

---

## 원인 분석: 영속성 컨텍스트 우회와 라이프사이클 콜백 미실행

JPA Auditing은 내부적으로 `AuditingEntityListener`를 통해 엔티티의 **`@PrePersist` / `@PreUpdate` 생명주기 콜백**을 가로채어 날짜 필드를 채워줍니다.

하지만 JPQL이나 QueryDSL을 이용한 **벌크 연산(`@Modifying` + `UPDATE` 쿼리)**은 동작 방식이 다릅니다.

![벌크성 쿼리와 영속성 컨텍스트 동작](/images/posts/jpa-auditing-lastmodifieddate/image-3.png)

| 구분 | 단건 엔티티 수정 (Dirty Checking) | 벌크성 UPDATE 쿼리 |
| :--- | :--- | :--- |
| **영속성 컨텍스트 경유** | O (1차 캐시 스냅샷 비교) | **X (영속성 컨텍스트를 무시하고 DB에 직접 쿼리 실행)** |
| **JPA 생명주기 콜백 (`@PreUpdate`)** | 실행됨 | **실행되지 않음** |
| **Auditing (`@LastModifiedDate`)** | 자동 갱신 | **갱신되지 않음** |

즉, 벌크 연산은 영속성 컨텍스트의 변경 감지(Dirty Checking)를 거치지 않고 DB로 바로 SQL을 날리기 때문에 JPA의 `AuditingEntityListener`가 개입할 틈이 없습니다.

---

## 해결 방법

### 1. 벌크 쿼리 작성 시 수정 일시(`lastModifiedDate`)를 직접 명시하기

가장 깔끔하고 권장되는 방법은 벌크성 `UPDATE` 쿼리 자체에 수정 시각 파라미터(`LocalDateTime.now()` 또는 DB 함수 `CURRENT_TIMESTAMP`)를 직접 포함시키는 것입니다.

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE Item i SET i.price = i.price * :rate, i.lastModifiedDate = :now WHERE i.category = :category")
int bulkUpdatePrice(
    @Param("rate") double rate,
    @Param("now") LocalDateTime now,
    @Param("category") String category
);
```

> **Tip**: 벌크 연산 후에는 영속성 컨텍스트와 DB 간의 데이터 불일치를 막기 위해 반드시 `@Modifying(clearAutomatically = true)` 옵션을 함께 설정해 영속성 컨텍스트를 비워주어야 합니다.

### 2. 엔티티 계층(`BaseTimeEntity`)에서 별도 갱신 메서드 활용하기

상황에 따라 쿼리 수정이 어렵거나 도메인 객체 단위로 후처리가 필요한 경우, `BaseTimeEntity`에 명시적인 갱신 메서드를 추가해 벌크 작업 전후로 수정 일시를 관리할 수 있습니다.

![BaseTimeEntity 수동 갱신 로직 추가](/images/posts/jpa-auditing-lastmodifieddate/image-4.png)

![벌크 작업 후 수정 날짜 정상 반영 확인](/images/posts/jpa-auditing-lastmodifieddate/image-5.png)

---

## 요약

- JPA Auditing(`@LastModifiedDate`)은 **변경 감지(Dirty Checking) 기반의 단건/엔티티 생명주기**에서만 자동 동작합니다.
- 영속성 컨텍스트를 우회해 DB에 직접 실행되는 **JPQL/QueryDSL 벌크 연산에서는 `@PreUpdate` 콜백이 호출되지 않으므로**, 쿼리 구문 내에 `lastModifiedDate = :now`를 명시적으로 반영해야 안전합니다.
