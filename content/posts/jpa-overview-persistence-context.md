---
title: '[JPA] JPA 개요 및 영속성 컨텍스트'
date: '2022-05-24'
category: JPA
tags:
  - JPA개요
  - JPA란
  - 영속성컨텍스트
summary: >-
  ORM 개요 > OOP 시대에 객체를 RDBMS에 관리하다 보니 SQL 중심적인 개발을 하게 됨으로써 나타나는 문제점들을 해결하기 위해
  도입. > > 객체는 ↔ RDBMS 사이를 매끄럽게 연결하여 SQL 의존성을 덜어내고 OOP 중점적으로 개발을 하는...
---
# ORM 개요

> OOP 시대에 객체를 RDBMS에 관리하다 보니 SQL 중심적인 개발을 하게 됨으로써 나타나는 문제점들을 해결하기 위해 도입.
> 
> 객체는 ↔ RDBMS 사이를 매끄럽게 연결하여 **SQL 의존성을 덜어내고 OOP 중점적으로 개발**을 하는 것이 목표.  
>  

# JPA (Java Persistense Api)

현재 Java 진형의 ORM 표준으로 인터페이스이고 구현체는 Hibernate, EclipseLink, DataNucleus 등

그 중 `Hibernate` 가 우리가 흔히 쓰는 구현체이다.  
 

# SpringDataJPA

JPA를 한 단계 더 추상화 시켜 개발을 편하게 해주는 Spring에서 제공하는 인터페이스

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 1](/images/posts/jpa-overview-persistence-context/image-1.png)

# JPA 구동방식

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 2](/images/posts/jpa-overview-persistence-context/image-2.png)

> persistence.xml에 jdbc 관련 정보 ( driver, username, password, url ) 등을 읽어와서  
> `EntityManagerFactory`에 저장하고 `EntityManager` 를 통해 작업을 한다.
> 
> EntityManagerFactory 는 하나만 생성해서 어플리케이션 전체에 공유되고  
> Threadsafe 한 EntityManager를 생성\*\*하고 내부엔 `영속성 컨텍스트`가 있음.  
> 한번 사용한 EntityManager 는 사용 후 버려지는데 사용 단위는 `Transaction` 범위

# 영속성 컨텍스트

엔티티를 영구적으로 저장하는 공간이며 내부에 `1차캐시`가 있다.

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 3](/images/posts/jpa-overview-persistence-context/image-3.png)

> DB에서 데이터를 조회할 땐 무조건 1차캐시를 먼저 확인하고 없으면 1차캐시로 데이터를 영속화를 한 후에 값을 반환한다.

## Entity의 생명주기

Entity의 상태는 `비영속`, `영속`, `준영속`, `삭제`총 4가지로 나타낼 수 있음.

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 4](/images/posts/jpa-overview-persistence-context/image-4.png)

### 비영속 (new)

> 단순히 엔티티를 새로 생성한 상태

```java
Member member = new Member("kim");
```

### 영속 (Managed)

> 새로 생성한 엔티티가 영속성 컨텍스트에 의해 관리되는 상태  
> 저장 or 조회를 실행하면 영속성컨텍스트가 먼저 엔티티를 관리한다.

```java
EntityManager.persist(member); // 저장
EntityManager.find(id); //조회
```

### 준영속 (detach)

> 영속성 컨텍스트가 엔티티를 관리하지 않는 상태  
> Query가 commit을 호출해도 영속성을 거치지 않는 상태이기 때문에 동작하지 않음  
> 1차캐시에 남아있지 않으므로 당연히 DirtyChecking 기능도 동작하지 않음  
> 영속성컨텍스트의 모든 기능을 이용할 수 없는 상태이다.

```java
EntityManager.detach(member); // 준영속으로 만들기
EntityManager.clear() // 영속성 컨텍스트 초기화
```

### 삭제 (removed)

> 엔티티를 삭제한 상태

```java
EntityManager.remove(member); // 삭제 명령
```

## 영속성 컨텍스트 Flush

> 엔티티의 생명주기는 위와 같으며, `Transaction.commit()` 과 같이 커밋이 호출되어야 DB에 반영이 된다. 이를 `Flush` 라고 한다.  
> 그 전까진 영속성컨텍스트가 붙잡고 있는 상태이다. ( Flush가 되어도 영속성 컨텍스트가 사라지는건 x )
> 
> 그럼 커밋이 호출되는 시점, 즉 DB에 반영되는 시점 기준은 언제일까

*   EntityManager.flush() 를 직접호출
*   Transaction commit (자동호출)
*   JPQL 쿼리를 직접 날림 (자동호출)

위 3가지 조건일 때 DB에 작업한 내용이 반영이 된다. ( 반영이 되어도 영속성 컨텍스트엔 내용이 남아 있음)  
 

# 영속성 컨텍스트의 이점

위와 같은 내용을 바탕으로 영속성컨텍스트에 의해 관리를 받을때 얻을 수 있는 이점이 있다.

## 1\. Entity 동일성 (==) 보장

데이터 값이 같은 두 객체는 참조하는 주소 값이 다르다.

하지만 EntityManager에 의해 관리되는 상태이면 두 객체는 같은 참조를 지닌다.

```java
@Slf4j
@SpringBootTest
@Transactional
class UserTest {

    @Autowired
    EntityManager entityManager;

    @DisplayName("userA id 값으로 조회")
    @Test
    void same(){
        User userA = new User("userA");
        entityManager.persist(userA);

        User findUser = entityManager.find(User.class, userA.getId());

        log.info("user A = {}", userA);
        log.info("findUser = {}",findUser);

        Assertions.assertSame(userA,findUser);
    }
}
```

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 5](/images/posts/jpa-overview-persistence-context/image-5.png)  
 

## 2\. 쓰기지연

모든 데이터 변경 Query를 쓰기지연 저장소에 보관해 놨다가 commit을 수행할 때 한번에 날린다.

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 6](/images/posts/jpa-overview-persistence-context/image-6.png)

```java
@Slf4j
@SpringBootTest
@Transactional
@Rollback(false)
class UserTest {

    @Autowired
    EntityManager entityManager;

    @Test
    void lazy(){

        log.info("===== persist 효출 전 =====");
        User userA = new User("userA");
        entityManager.persist(userA);
        log.info("===== persist 효출 후 =====");

    }
}
```

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 7](/images/posts/jpa-overview-persistence-context/image-7.png)

> persist 를 호출해도 바로 insert query가 발생하지 않고 commit시점에 호출이 된다.

## 3\. DirtyChecking

```java
@Slf4j
@SpringBootTest
@Transactional
@Rollback(false)
class UserTest {

    @Autowired
    EntityManager entityManager;

    @Test
    void dirtyChecking(){

        User userA = new User("userA");
        entityManager.persist(userA);

        userA.setName("userB");

        entityManager.flush();
        entityManager.clear();

        User userB = entityManager.find(User.class, userA.getId());
        log.info("변경 후 = {}",userB);
    }
}
```

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 8](/images/posts/jpa-overview-persistence-context/image-8.png)

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 9](/images/posts/jpa-overview-persistence-context/image-9.png)

> 모든 Entity는 영속성 컨텍스트에서 관리되며 데이터의 CRUD를 추적.
> 
> 변경이 일어나면 영속성 컨텍스트에서 `DirtyChecking`을 통해 1차캐시에서 먼저 조회를 한 후 스냅샷과 값이 다르면 **commit** 시점에 이를 반영한다.

## 4\. 지연로딩

만약 연관관계에 있는 두 Entity 중(ex. user, team) 하나(user)를 호출 하였을때  
그 와 연관된 다른 엔티티는 실제로 호출되기 전 까진 호출되지 않는다.

### User만 호출 했을 경우 (user에 대한 select query 한번만 나감)

```java
@Slf4j
@SpringBootTest
@Rollback(value = false)
@Transactional
class UserTest {

    @Autowired
    EntityManager entityManager;

    Long userId;

    @BeforeEach
    void save(){

        User userA = new User("userA");
        Team team = new Team("team");

        team.users.add(userA);

        userA.setTeam(team);

        entityManager.persist(team);
        userId = userA.getId();

        // 영속성 컨텍스트 초기화
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("team is null")
    void test(){

        User user = entityManager.find(User.class, userId);
        Team team = user.getTeam();

        Assertions.assertNull(team.name);
    }
}
```

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 10](/images/posts/jpa-overview-persistence-context/image-10.png)  
 

### User의 Team 까지 호출 하였을 경우 (프록시 강제초기화)

```java
@Test
    @DisplayName("team is not null")
    void test(){

        User user = entityManager.find(User.class, userId);
        String teamName = user.getTeam().getName();

        Assertions.assertNotNull(teamName);
    }
```

![\[JPA\] JPA 개요 및 영속성 컨텍스트 이미지 11](/images/posts/jpa-overview-persistence-context/image-11.png)

> team 의 getName() 을 호출해야만 team에 대한 select query가 한번 더 나간다.  
> 즉, 실제로 사용하기 전 까진 query가 발생하지 않아 리소스 절감에 도움이 된다.
> 
> 이 옵션을 사용하기 위해선 연관관계를 지정할때 `FetchType=Lazy`로 설정해야 동작함.  
> (Default 옵션으로 `Eager` 이 설정되어 있어 query가 user만 호출해도 2번 발생함)  
> 보통 `@X To One` 관계일때 Lazy로 걸어둔다. ( 최적화 관련 옵션 )

# 연관관계

> DB의 한쪽 엔티티가 다른 엔티티와의 연관된 데이터를 이용하기 위해선 한쪽에서 외래키를 가지고 있어야 한다.
> 
> JPA에서는 필드에 외래키로 관리하는 대신 엔티티를 필드에 추가하고 연관관계의 주인을 지정해준다. ( FK 를 가지고 있는 쪽이 연관관계의 주인이다.)

```java
@Entity
@Setter @Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue
    Long id;
    String name;

    @JoinColumn(name = "team_id")
    @ManyToOne(fetch = FetchType.LAZY)
    Team team;

    public User(String name) {
        this.name = name;
    }

}

@Entity
@Setter @Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Team {

    @Id @GeneratedValue
    Long id;
    String name;

    @OneToMany(mappedBy = "team",cascade = CascadeType.ALL) 
    List<User> users = new ArrayList<>();

    public Team(String name) {
        this.name = name;
    }
}
```

## 연관관계의 종류

*   N:M (@ManyToMany) ⇒ 필드추가가 불가능하므로 일대다 다대일로 풀어쓴다.
*   1:N (@OneToMany) ⇒ mappedby 옵션으로 연관관계의 주인을 지정
*   N:1 (@ManyToOne) ⇒ 외래키 지정
*   1:1 (@OneToOne) ⇒ 외래키 지정

### 출처 : 자바 ORM 표준 JPA 프로그래밍
