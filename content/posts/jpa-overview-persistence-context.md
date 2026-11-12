---
title: '[JPA] JPA 개요와 영속성 컨텍스트 핵심 정리'
date: '2022-05-24'
category: Backend/JPA
tags:
  - JPA
  - ORM
  - 영속성 컨텍스트
  - Dirty Checking
  - 지연로딩
summary: >-
  ORM과 JPA의 등장 배경부터 EntityManagerFactory/EntityManager의 구동 원리, 영속성 컨텍스트의 4가지 생명주기 및 핵심 이점(동일성 보장, 쓰기 지연, 변경 감지, 지연 로딩)을 예제 코드와 함께 정리합니다.
---

## ORM과 JPA 개요

객체지향 프로그래밍(OOP) 환경의 도메인 객체를 관계형 데이터베이스(RDBMS)에 직접 매핑하다 보면, 비즈니스 로직보다 반복적인 SQL 작성과 데이터 변환에 집중하게 되는 **패러다임 불일치** 문제가 발생합니다.

이를 해결하기 위해 등장한 **ORM(Object-Relational Mapping)**은 객체와 테이블 사이를 매끄럽게 연결하여 SQL 의존도를 낮추고 객체지향적인 설계에 집중할 수 있도록 돕습니다.

- **JPA (Jakarta/Java Persistence API)**: Java 진영의 ORM 기술 표준 명세(인터페이스 모음)입니다. 대표적인 구현체로는 **Hibernate**, EclipseLink 등이 있으며 실무에서는 대부분 Hibernate를 사용합니다.
- **Spring Data JPA**: JPA를 한 단계 더 추상화하여 `JpaRepository` 인터페이스만으로 기본적인 CRUD와 페이징, 쿼리 메서드 등을 손쉽게 작성할 수 있도록 지원하는 스프링 모듈입니다.

![JPA와 Spring Data JPA 계층 구조](/images/posts/jpa-overview-persistence-context/image-1.png)

---

## JPA 구동 방식

![JPA 구동 아키텍처](/images/posts/jpa-overview-persistence-context/image-2.png)

1. 애플리케이션 시작 시 설정 파일(`persistence.xml` 또는 Spring Boot `application.yml`)에서 JDBC 드라이버, DB URL, 계정 정보를 읽어 **`EntityManagerFactory`**를 생성합니다.
2. `EntityManagerFactory`는 애플리케이션 전체에서 **단 하나만 생성되어 공유되는 Thread-Safe 객체**입니다.
3. 실제 DB 작업(트랜잭션 단위)이 필요할 때마다 팩토리로부터 **`EntityManager`**를 생성합니다.
   > **주의**: `EntityManager` 내부에는 **영속성 컨텍스트(Persistence Context)**가 존재하며, **`EntityManager` 자체는 Thread-Safe하지 않으므로** 스레드 간에 절대 공유해서는 안 됩니다. 트랜잭션이 종료되면 즉시 반환/종료됩니다.

---

## 영속성 컨텍스트 (Persistence Context)

영속성 컨텍스트는 **"엔티티를 영구 저장하는 논리적인 환경"**으로, 내부에 **1차 캐시**, **쓰기 지연 SQL 저장소**, **스냅샷(Snapshot)**을 유지합니다.

![영속성 컨텍스트와 1차 캐시](/images/posts/jpa-overview-persistence-context/image-3.png)

엔티티를 조회(`find()`)하면 먼저 **1차 캐시**를 확인하고, 캐시에 존재하지 않을 때만 DB에서 SELECT 쿼리를 실행해 데이터를 가져온 뒤 1차 캐시에 등록(영속화)하고 반환합니다.

### 엔티티의 4가지 생명주기

엔티티는 영속성 컨텍스트와의 관계에 따라 `비영속`, `영속`, `준영속`, `삭제` 4가지 상태를 가집니다.

![엔티티의 생명주기](/images/posts/jpa-overview-persistence-context/image-4.png)

| 상태 | 설명 | 주요 메서드 |
| :--- | :--- | :--- |
| **비영속 (New / Transient)** | 단순히 객체를 생성만 한 상태로, 영속성 컨텍스트와 무관함 | `new Member("kim")` |
| **영속 (Managed)** | 영속성 컨텍스트에 저장되어 관리되는 상태 (1차 캐시, 변경 감지 동작) | `em.persist(member)`, `em.find(...)` |
| **준영속 (Detached)** | 영속성 컨텍스트에서 분리된 상태 (트랜잭션 커밋이나 Dirty Checking 미동작) | `em.detach(member)`, `em.clear()`, `em.close()` |
| **삭제 (Removed)** | 영속성 컨텍스트 및 DB에서 삭제 예약된 상태 | `em.remove(member)` |

```java
// 1. 비영속 상태
Member member = new Member("kim");

// 2. 영속 상태
em.persist(member);
Member found = em.find(Member.class, member.getId());

// 3. 준영속 상태 (더 이상 변경 감지가 동작하지 않음)
em.detach(member);
em.clear(); // 영속성 컨텍스트 전체 초기화

// 4. 삭제 상태
em.remove(member);
```

### 플러시 (Flush)

플러시(`flush`)는 영속성 컨텍스트의 변경 내용을 데이터베이스에 동기화하는 작업입니다. (주의: 플러시가 발생해도 1차 캐시가 비워지지는 않습니다.)

플러시가 자동으로 또는 수동으로 발생하는 시점은 다음 3가지입니다.
1. `em.flush()` 직접 호출
2. 트랜잭션 커밋(`Transaction.commit()`) 시 자동 호출
3. **JPQL 쿼리 실행 직전** 자동 호출 (DB와의 정합성 유지를 위함)

---

## 영속성 컨텍스트의 4가지 핵심 이점

### 1. 1차 캐시와 동일성(`==`) 보장

영속성 컨텍스트는 같은 트랜잭션 내에서 동일한 식별자(PK)로 조회한 엔티티에 대해 **자바 객체 수준의 동일성(`==`)을 보장**합니다.

```java
@Slf4j
@SpringBootTest
@Transactional
class UserTest {

    @Autowired
    EntityManager entityManager;

    @DisplayName("userA id 값으로 조회 시 동일성 보장")
    @Test
    void same() {
        User userA = new User("userA");
        entityManager.persist(userA);

        User findUser = entityManager.find(User.class, userA.getId());

        log.info("user A   = {}", userA);
        log.info("findUser = {}", findUser);

        Assertions.assertSame(userA, findUser); // true (같은 참조 주소)
    }
}
```

![엔티티 동일성 보장 확인 로그](/images/posts/jpa-overview-persistence-context/image-5.png)

### 2. 트랜잭션을 지원하는 쓰기 지연 (Transactional Write-Behind)

`persist()`를 호출할 때마다 즉시 DB로 INSERT SQL을 보내지 않고, **쓰기 지연 SQL 저장소**에 쿼리를 모아두었다가 트랜잭션 커밋(또는 플러시) 시점에 한꺼번에 전송합니다.

![쓰기 지연 동작 구조](/images/posts/jpa-overview-persistence-context/image-6.png)

```java
@Slf4j
@SpringBootTest
@Transactional
@Rollback(false)
class UserTest {

    @Autowired
    EntityManager entityManager;

    @Test
    void lazyWrite() {
        log.info("===== persist 호출 전 =====");
        User userA = new User("userA");
        entityManager.persist(userA);
        log.info("===== persist 호출 후 =====");
    }
}
```

![persist 호출 후 커밋 시점 쿼리 실행 로그](/images/posts/jpa-overview-persistence-context/image-7.png)

로그를 보면 `persist` 호출 직후가 아니라 메서드가 끝나고 트랜잭션이 커밋되는 시점에 INSERT 쿼리가 실행되는 것을 확인할 수 있습니다.

### 3. 변경 감지 (Dirty Checking)

영속 상태의 엔티티는 1차 캐시에 저장될 때 최초 상태의 **스냅샷(Snapshot)**을 함께 보관합니다. 커밋 시점에 현재 엔티티의 필드 값과 스냅샷을 비교하여 변경된 부분이 있으면 자동으로 UPDATE SQL을 생성해 반영합니다.

```java
@Slf4j
@SpringBootTest
@Transactional
@Rollback(false)
class UserTest {

    @Autowired
    EntityManager entityManager;

    @Test
    void dirtyChecking() {
        User userA = new User("userA");
        entityManager.persist(userA);

        // 별도의 update() 호출 없이 필드 값만 변경
        userA.setName("userB");

        entityManager.flush();
        entityManager.clear();

        User userB = entityManager.find(User.class, userA.getId());
        log.info("변경 후 = {}", userB);
    }
}
```

![Dirty Checking 스냅샷 비교 흐름](/images/posts/jpa-overview-persistence-context/image-8.png)

![Dirty Checking UPDATE 쿼리 실행 결과](/images/posts/jpa-overview-persistence-context/image-9.png)

### 4. 지연 로딩 (Lazy Loading)과 프록시

연관관계(`@ManyToOne` 등)를 `FetchType.LAZY`로 설정하면, 메인 엔티티(`User`)를 조회할 때 연관 엔티티(`Team`)는 실제 DB에서 즉시 조회하지 않고 **프록시(Proxy) 객체**로 채워둡니다.

#### `User`만 조회하고 `Team`의 메서드를 호출하지 않은 경우
```java
@Test
@DisplayName("지연 로딩 시 프록시 내부 필드는 초기화 전까지 null")
void test() {
    User user = entityManager.find(User.class, userId);
    Team team = user.getTeam();

    // 프록시 객체는 실제 메서드가 호출되기 전까지 DB 조회를 수행하지 않음
    Assertions.assertNull(team.name);
}
```

![User만 조회 시 SELECT 1회 실행](/images/posts/jpa-overview-persistence-context/image-10.png)

#### `user.getTeam().getName()`으로 실제 데이터를 사용하는 순간
```java
@Test
@DisplayName("실제 팀 이름 조회 시 프록시 초기화 발생")
void test() {
    User user = entityManager.find(User.class, userId);
    String teamName = user.getTeam().getName(); // 이 시점에 Team SELECT 쿼리 실행

    Assertions.assertNotNull(teamName);
}
```

![Team getName 호출 시 추가 SELECT 실행](/images/posts/jpa-overview-persistence-context/image-11.png)

> **성능 최적화 팁**: `@ManyToOne`, `@OneToOne`처럼 `~ToOne`으로 끝나는 연관관계는 기본 패치 전략이 즉시 로딩(`EAGER`)입니다. N+1 문제와 불필요한 조인을 막기 위해 **반드시 `fetch = FetchType.LAZY`로 명시**하는 것이 실무 표준입니다.

---

## 연관관계 매핑 기본

데이터베이스 테이블은 외래 키(FK)로 조인하지만, 객체는 참조(`Team team`)를 통해 탐색합니다. JPA에서는 두 객체의 연관관계 중 **외래 키를 관리할 주인(Owner)**을 지정하며, 외래 키가 존재하는 테이블 쪽(`N`쪽)이 연관관계의 주인이 됩니다.

```java
@Entity
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id") // 외래 키를 관리하는 연관관계의 주인
    private Team team;

    public User(String name) {
        this.name = name;
    }
}

@Entity
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Team {

    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL) // 주인이 아니므로 읽기 전용 매핑
    private List<User> users = new ArrayList<>();

    public Team(String name) {
        this.name = name;
    }
}
```

### 연관관계 종류 요약
- **`@ManyToOne` (N:1)**: 외래 키를 가지는 쪽으로 가장 흔히 사용하며, 지연 로딩(`LAZY`) 설정 필수
- **`@OneToMany` (1:N)**: 주로 양방향 매핑 시 반대편(`mappedBy`) 조회용으로 사용
- **`@OneToOne` (1:1)**: 주 테이블이나 대상 테이블 중 한쪽에 외래 키를 두고 지연 로딩 설정
- **`@ManyToMany` (N:M)**: 연결 테이블에 추가 컬럼(주문 시각 등)을 넣을 수 없으므로 실무에서는 사용하지 않고, **중간 엔티티를 두어 `@OneToMany` + `@ManyToOne`으로 풀어서 설계**합니다.

---

> 참고 도서: *자바 ORM 표준 JPA 프로그래밍 (김영한 저)*
