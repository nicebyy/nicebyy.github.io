---
title: '[Spring] Redisson Remote Service 내부 동작 원리와 한계 분석'
date: '2023-06-25'
category: Backend/Spring
tags:
  - MSA
  - Redis
  - Redisson
  - RemoteService
  - JDK Dynamic Proxy
summary: >-
  Redis 기반 RPC 기능을 제공하는 Redisson Remote Service를 Spring Boot Gradle 멀티모듈 프로젝트로 직접 구현하고, 디버깅과 Codec 분석을 통해 JDK 동적 프록시 동작 원리와 Common 모듈 패키지 결합도 한계를 분석합니다.
---

## Redisson Remote Service란?

**Redisson**은 Jedis, Lettuce와 달리 분산 환경에 특화된 고수준 자료구조와 분산 락(Distributed Lock), 분산 실행기 등을 제공하는 Redis 클라이언트입니다.

그중 **Redisson Remote Service(`RRemoteService`)**는 다른 Redis 클라이언트에는 없는 독특한 기능으로, 별도의 HTTP/REST API나 gRPC 없이 **Redis를 매개체로 하여 서로 다른 서버 간에 Java 인터페이스 메서드를 원격 호출(RPC)**할 수 있게 해줍니다.

![Redisson Remote Service 기본 구조 1](/images/posts/spring-redisson-remote-service/image-1.png)

![Redisson Remote Service 기본 구조 2](/images/posts/spring-redisson-remote-service/image-2.png)

![Redisson Remote Service 요청/응답 흐름](/images/posts/spring-redisson-remote-service/image-3.png)

---

## 1. 로컬 테스트 환경 구축 (Docker + Redis)

- **개발 환경**: Spring Boot 3.1.0, Java 17, Gradle 멀티모듈, IntelliJ IDEA, Docker (WSL2), P3X Redis UI

먼저 프로젝트 루트에 `docker-compose.yml`을 작성해 로컬 테스트용 Redis 컨테이너(`6379`)를 띄웁니다.

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis-remoteService:
    container_name: redis-remoteService
    image: redis:latest
    restart: always
    ports:
      - 6379:6379
```

![docker-compose 파일 구성](/images/posts/spring-redisson-remote-service/image-4.png)

![Docker 백그라운드 실행](/images/posts/spring-redisson-remote-service/image-5.png)

![Docker Desktop Redis 포트 6379 확인](/images/posts/spring-redisson-remote-service/image-6.png)

P3X Redis UI(또는 RedisInsight)로 로컬 Redis(`localhost:6379`)에 정상 접속되는지 확인해 둡니다.

![P3X Redis UI 커넥션 설정 1](/images/posts/spring-redisson-remote-service/image-7.png)

![P3X Redis UI 커넥션 설정 2](/images/posts/spring-redisson-remote-service/image-8.png)

---

## 2. Gradle 멀티모듈 프로젝트 구성

이번 실습 프로젝트는 다음과 같이 **Gradle 멀티모듈**로 분리해 구성했습니다. (굳이 공통 모듈을 둔 이유는 뒤에서 내부 직렬화 구조를 뜯어볼 때 명확히 드러납니다.)

1. **`remoteService` (Root)**: 서브모듈 공통 Gradle 설정
2. **`redissonServer`**: 원격 요청을 수신해 실제 메서드를 실행하는 서버 (`7071`)
3. **`redissonClient`**: 인터페이스를 통해 원격 메서드를 호출하는 클라이언트 (`7070`)
4. **`redissonCommon`**: Server와 Client가 함께 공유하는 인터페이스 및 DTO 모듈

![Gradle 멀티모듈 디렉토리 구조 1](/images/posts/spring-redisson-remote-service/image-9.png)

![Gradle 멀티모듈 디렉토리 구조 2](/images/posts/spring-redisson-remote-service/image-10.png)

### 루트 `build.gradle`
```groovy
buildscript {
    ext {
        springBootVersion = '3.1.0'
    }
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath "org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}"
        classpath "io.spring.gradle:dependency-management-plugin:1.0.11.RELEASE"
    }
}

subprojects {
    repositories {
        mavenCentral()
    }
    apply plugin: 'java'
    apply plugin: 'idea'
    apply plugin: 'org.springframework.boot'
    apply plugin: 'io.spring.dependency-management'

    group 'com.example'
    version '1.0-SNAPSHOT'
    sourceCompatibility = '17'

    dependencies {
        compileOnly 'org.projectlombok:lombok'
        implementation 'org.springframework.boot:spring-boot-starter-data-redis'
        annotationProcessor 'org.projectlombok:lombok'
        annotationProcessor "org.springframework.boot:spring-boot-configuration-processor"
        testImplementation 'org.springframework.boot:spring-boot-starter-test'
    }

    tasks.named('test') {
        useJUnitPlatform()
    }
    tasks.register("prepareKotlinBuildScriptModel") {}
}
```

### `redissonServer` / `redissonClient` `build.gradle`
```groovy
dependencies {
    implementation project(path: ":redissonCommon", configuration: 'default')
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

### `redissonCommon` `build.gradle`
공통 모듈은 단독 실행 가능한 JAR가 아니므로 `bootJar`를 비활성화하고 일반 `jar`로 패키징합니다.

```groovy
bootJar { enabled = false }
jar { enabled = true }
```

`ApplicationReadyEvent`를 이용해 서버 모듈 기동 시 `redissonCommon`의 `Member` 클래스가 정상적으로 로드되는지 먼저 검증했습니다.

![공통 모듈 로드 확인 1](/images/posts/spring-redisson-remote-service/image-11.png)

![공통 모듈 로드 확인 2](/images/posts/spring-redisson-remote-service/image-12.png)

---

## 3. 공통 인터페이스 & Server / Client 구현

### `redissonCommon`: 원격 서비스 인터페이스 정의
Client가 호출하고 Server가 구현할 공통 인터페이스를 정의합니다.

![redissonCommon 패키지 구성](/images/posts/spring-redisson-remote-service/image-13.png)

```java
package com.example.redissoncommon.remote;

import com.example.redissoncommon.entity.Member;

public interface RemoteMemberServiceInterface {
    Member renameMember(Member member, String newName);
}
```

### `redissonServer`: 구현체 등록 및 Redisson 서버 모드

![redissonServer 패키지 구성](/images/posts/spring-redisson-remote-service/image-14.png)

```yaml
# redissonServer application.yml
server:
  port: 7071
spring:
  data:
    redis:
      port: 6379
      host: redis://localhost
```

```java
@Service
@Slf4j
public class RemoteMemberService implements RemoteMemberServiceInterface {
    @Override
    public Member renameMember(Member member, String newName) {
        log.info("before rename => {}", member);
        member.setName(newName);
        log.info("after rename => {}", member);
        return member;
    }
}
```

```java
@Configuration
@EnableCaching
@RequiredArgsConstructor
public class RedissonConfiguration {

    @Value("${spring.data.redis.host}")
    private String REDIS_HOST;

    @Value("${spring.data.redis.port}")
    private String REDIS_PORT;

    private final RemoteMemberService remoteMemberService;

    @Bean
    public RedissonClient redissonClient() {
        Config redisConfig = new Config();
        redisConfig.useSingleServer()
                .setAddress(REDIS_HOST + ":" + REDIS_PORT);
        return Redisson.create(redisConfig);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void registerRemoteService() {
        RRemoteService remoteService = redissonClient().getRemoteService();
        remoteService.register(RemoteMemberServiceInterface.class, remoteMemberService);
    }
}
```

![Server RedissonConfiguration 실행 확인](/images/posts/spring-redisson-remote-service/image-15.png)

#### Redisson Config의 4가지 주요 서버 모드
1. **클러스터 모드 (`useClusterServers`)**: 여러 Redis 노드로 구성된 클러스터 환경
   ![클러스터 모드](/images/posts/spring-redisson-remote-service/image-16.png)
2. **센티넬 모드 (`useSentinelServers`)**: 장애 감지와 자동 Failover 고가용성 구성
   ![센티넬 모드](/images/posts/spring-redisson-remote-service/image-17.png)
3. **마스터-슬레이브 모드 (`useMasterSlaveServers`)**: 읽기/쓰기 분산 구성
   ![마스터-슬레이브 모드](/images/posts/spring-redisson-remote-service/image-18.png)
4. **싱글 서버 모드 (`useSingleServer`)**: 단일 Redis 서버 접속 (본 실습 구성)
   ![싱글 서버 모드](/images/posts/spring-redisson-remote-service/image-19.png)
   ![그 외 프록시/멀티 클러스터 옵션](/images/posts/spring-redisson-remote-service/image-20.png)

또한 `remoteService.register()` 호출 시 기본적으로는 **단일 워커 스레드**로 요청을 처리하지만, 동시 처리량을 높이려면 `workersAmount` 인자나 커스텀 `ExecutorService`를 전달해 멀티스레드로 처리할 수 있습니다.

![workerAmount 멀티스레드 지정 옵션](/images/posts/spring-redisson-remote-service/image-21.png)

![ExecutorService 지정 옵션](/images/posts/spring-redisson-remote-service/image-22.png)

---

### `redissonClient`: 프록시 빈 등록 및 원격 호출

![redissonClient 패키지 구성](/images/posts/spring-redisson-remote-service/image-23.png)

```yaml
# redissonClient application.yml
server:
  port: 7070
spring:
  data:
    redis:
      port: 6379
      host: redis://localhost
```

```java
@Configuration
@EnableCaching
public class RedissonConfiguration {

    @Value("${spring.data.redis.host}")
    private String REDIS_HOST;

    @Value("${spring.data.redis.port}")
    private String REDIS_PORT;

    @Bean
    public RedissonClient redissonClient() {
        Config redisConfig = new Config();
        redisConfig.useSingleServer()
                .setAddress(REDIS_HOST + ":" + REDIS_PORT);
        return Redisson.create(redisConfig);
    }

    @Bean
    public RemoteMemberServiceInterface remoteMemberService() {
        return redissonClient()
                .getRemoteService()
                .get(RemoteMemberServiceInterface.class, RemoteInvocationOptions.defaults()
                        // 반환값이 필요 없는 Fire-and-Forget 방식이라면 .noAck().noResult() 지정 가능
                );
    }
}
```

> 기본 옵션인 `RemoteInvocationOptions.defaults()`는 **Ack와 반환값을 기다리는 동기 방식**이며 타임아웃 관련 설정을 커스터마이징할 수 있습니다. 반환값이 필요 없다면 `.noAck().noResult()`로 블로킹 없이 비동기 전송할 수 있습니다.

![RemoteInvocationOptions 타임아웃 옵션 확인](/images/posts/spring-redisson-remote-service/image-24.png)

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final AtomicLong memberIdSequence = new AtomicLong(0L);
    private final ConcurrentHashMap<Long, Member> memberDB = new ConcurrentHashMap<>();
    private final RemoteMemberServiceInterface remoteMemberServiceInterface;

    public Member callRemoteRenameService(Member member, String name) {
        if (member == null) {
            throw new IllegalArgumentException("couldn't find member");
        }
        return remoteMemberServiceInterface.renameMember(member, name);
    }

    public Member findMemberById(Long id) {
        return memberDB.get(id);
    }

    public Member createMember(String name) {
        Member member = new Member(incrementSequence(), name);
        memberDB.put(member.getId(), member);
        return member;
    }

    private Long incrementSequence() {
        return memberIdSequence.incrementAndGet();
    }
}
```

```java
@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/member")
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/create")
    public Member createMember(@RequestParam String name) {
        Member member = memberService.createMember(name);
        log.info("created member => {}", member);
        return member;
    }

    @PostMapping("/rename")
    public Member renameMember(@RequestParam Long id, @RequestParam String name) {
        Member findMember = memberService.findMemberById(id);
        return memberService.callRemoteRenameService(findMember, name);
    }
}
```

---

## 4. Postman 테스트 및 내부 동작 디버깅

Postman으로 `7070` 클라이언트 서버에 Member 생성(`hello`) 후 이름 변경(`newHello`)을 요청하면, 실제로 `7071` 서버 모듈의 `renameMember()`가 실행되어 이름이 변경된 결과 객체를 반환합니다.

![Postman Member 생성 요청](/images/posts/spring-redisson-remote-service/image-25.png)

![Postman Remote rename 요청](/images/posts/spring-redisson-remote-service/image-26.png)

![원격 메서드 실행 결과 응답 확인](/images/posts/spring-redisson-remote-service/image-27.png)

### 어떻게 인터페이스 메서드 호출만으로 원격 실행이 될까?

디버거로 `remoteMemberServiceInterface` 빈의 실제 구현체를 찍어보면, Redisson이 **JDK Dynamic Proxy**를 생성해 주입했음을 알 수 있습니다.

![JDK 동적 프록시 객체 확인](/images/posts/spring-redisson-remote-service/image-28.png)

메서드를 호출하는 순간 프록시의 `InvocationHandler`가 가로채어 호출 인터페이스 이름과 메서드 시그니처를 추출합니다.

![InvocationHandler 동작 디버깅](/images/posts/spring-redisson-remote-service/image-29.png)

그리고 `getRequestQueueName()`을 통해 요청을 적재할 Redis 큐 키를 생성합니다.

![getRequestQueueName 내부 호출](/images/posts/spring-redisson-remote-service/image-30.png)

![요청 큐 키 생성 1](/images/posts/spring-redisson-remote-service/image-31.png)

![요청 큐 키 생성 2](/images/posts/spring-redisson-remote-service/image-32.png)

실제로 `redissonServer`를 잠시 중단한 상태에서 Client 요청을 보내면, Redis 내부에 `{redisson_rs:...}` 형태로 요청 큐가 쌓이는 모습을 Redis UI에서 직접 확인할 수 있습니다.

![서버 중단 후 요청 전송](/images/posts/spring-redisson-remote-service/image-33.png)

![Redis UI에서 확인한 요청 큐 키](/images/posts/spring-redisson-remote-service/image-34.png)

![직렬화된 요청 페이로드](/images/posts/spring-redisson-remote-service/image-35.png)

---

## 5. Codec 분석을 통해 발견한 구조적 한계

Redisson은 기본적으로 직렬화 코덱(Codec)으로 바이너리 포맷인 **Kryo**(`Kryo5Codec`)를 사용합니다.

![기본 Serializer 설정 확인](/images/posts/spring-redisson-remote-service/image-36.png)

내부 데이터를 사람이 읽을 수 있도록 `JsonJacksonCodec`으로 변경해 실제 Redis에 저장된 페이로드를 확인해 보았습니다.

![JsonJacksonCodec 변경 설정](/images/posts/spring-redisson-remote-service/image-37.png)

![JSON 직렬화된 요청 내역 상세](/images/posts/spring-redisson-remote-service/image-38.png)

결과를 보면 두 가지 중요한 사실을 발견할 수 있습니다.

1. Redis 요청 큐 Key 이름 자체가 **인터페이스의 전체 패키지 경로(FQCN)**를 포함하여 생성됩니다.
2. 요청 페이로드 Value 안에도 **파라미터로 넘긴 `Member` 객체의 패키지 경로(`com.example.redissoncommon.entity.Member`)가 `@class` 타입 정보로 박혀 있습니다.**

### 실무 도입 시 결론

- 위와 같은 강결합 구조 때문에 Server와 Client가 **동일한 패키지 경로의 인터페이스·DTO(`redissonCommon` 모듈)를 강제로 공유**해야만 원격 역직렬화가 정상 동작합니다.
- 도메인 주도 설계(DDD)나 마이크로서비스(MSA) 관점에서 서비스 간 패키지 결합도가 강제되는 것은 큰 단점입니다. 만약 도입해야 한다면 도메인 엔티티를 직접 넘기지 말고 **원격 통신 전용 Common DTO 모듈을 별도로 격리**해 사용하는 것이 바람직합니다.
- 초저지연 인메모리 RPC가 반드시 필요한 특수 트랜잭션 구간이 아니라면, 서비스 간 느슨한 결합을 유지할 수 있는 **전용 메시지 큐(Kafka, RabbitMQ)나 REST/gRPC 통신을 사용하는 편이 아키텍처 유지보수에 유리**해 보입니다.

> 실습 전체 소스 코드: [GitHub - nicebyy/RedissonRemoteService](https://github.com/nicebyy/RedissonRemoteService)
