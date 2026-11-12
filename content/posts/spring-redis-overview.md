---
title: '[Spring] Redis 개요와 세션 클러스터링, Spring Data Redis 연동'
date: '2022-09-17'
category: Backend/Spring
tags:
  - Redis
  - Spring Data Redis
  - 세션 클러스터링
  - Cache
summary: >-
  In-Memory Key-Value 저장소 Redis의 개념과 Memcached와의 차이점, 다중 서버 환경에서 Redis 기반 세션 클러스터링이 필요한 이유, 그리고 Spring Boot에서의 기본 연동 설정을 정리합니다.
---

![Redis 로고 및 개념](/images/posts/spring-redis-overview/image-1.png)

## Redis란?

**Redis(Remote Dictionary Server)**는 고성능 **In-Memory 기반 Key-Value 데이터 스토어**입니다. 주로 빈번한 읽기·쓰기가 발생하는 데이터의 **캐시(Cache)**, 분산 락(Distributed Lock), 메시지 브로커, 세션 저장소 등으로 폭넓게 활용됩니다.

> **Cache(캐시)란?**  
> 자주 조회되는 데이터나 연산 결과를 메모리처럼 접근 속도가 빠른 임시 저장소에 미리 복사해 두고, 반복 요청 시 DB 부하 없이 빠르게 응답하기 위한 계층입니다.

---

## Memcached vs Redis

세션을 메모리에 올려 관리한다는 점에서는 유사하지만, **Spring 진영의 세션 클러스터링 공식 권장 저장소는 Redis**입니다. 두 저장소의 핵심 차이는 다음과 같습니다.

![Memcached와 Redis 비교](/images/posts/spring-redis-overview/image-2.png)

1. **풍부한 자료구조 지원**: 단순 문자열(String) 외에도 List, Set, Sorted Set(ZSet), Hash, BitMap 등 다양한 자료구조를 네이티브로 지원합니다.
2. **영속성(Persistence) 지원**: 메모리 데이터를 디스크(RDB 스냅샷, AOF 로그)에 기록해 서버 재시작 시에도 데이터를 복구할 수 있습니다.
3. **유연한 메모리 교체 정책**: LRU뿐 아니라 LFU, Random, TTL 만료 등 상황에 맞는 다양한 Eviction 정책을 선택할 수 있습니다.

---

## Redis 실무 적용 사례: 세션 클러스터링 (Session Clustering)

단일 서버 환경에서는 서버 내 로컬 메모리(`HttpSession`)에 로그인 세션을 저장해도 문제가 없습니다. 하지만 트래픽 분산(Scale-Out)을 위해 **여러 대의 WAS 인스턴스를 띄우면 세션 불일치 문제**가 발생합니다.

![다중 서버 환경에서의 세션 불일치 문제](/images/posts/spring-redis-overview/image-3.png)

예를 들어 사용자가 `Server 1`에서 로그인한 뒤 다음 요청이 로드밸런서를 통해 `Server 2`나 `Server 3`으로 전달되면, 해당 서버의 메모리에는 로그인 세션 정보가 없어 로그인이 풀려버립니다. 서버끼리 세션을 매번 복제해 동기화(Session Replication)하는 방식은 서버 대수가 늘어날수록 네트워크·메모리 부하가 급증합니다.

![Redis를 활용한 중앙 세션 클러스터링](/images/posts/spring-redis-overview/image-4.png)

이를 해결하기 위해 모든 WAS가 **외부 공용 Redis 세션 스토어 하나를 바라보도록 구성**하면, 어느 서버로 요청이 라우팅되더라도 동일한 사용자 세션을 안전하게 유지할 수 있습니다. 도메인별로 서버가 분리된 마이크로서비스 환경에서도 공통 인증 세션을 공유할 수 있습니다.

Redis GUI 도구로 확인해 보면 실제 로그인된 사용자 세션 키가 저장된 모습을 볼 수 있습니다.

![Redis UI에서 확인한 세션 데이터](/images/posts/spring-redis-overview/image-5.png)

---

## Spring Boot에서 Redis 연동하기

> **참고**: Spring Boot 2.0 이후부터는 비동기 Netty 기반의 **Lettuce** 클라이언트가 기본 내장되어 있습니다. 아래 코드는 전통적인 `JedisConnectionFactory` 구성 예시로, 환경에 따라 `LettuceConnectionFactory`로 동일하게 대체할 수 있습니다.

### 1. 의존성 추가 (`build.gradle`)
```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

### 2. 접속 정보 설정 (`application.properties`)
```properties
### Redis
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=1234
```

### 3. `RedisConfig` 설정 클래스 작성
`StringRedisSerializer`를 지정해 Redis 키와 값이 바이트 직렬화 깨짐 없이 가독성 있는 문자열(`String`) 형태로 저장되도록 구성합니다.

```java
@Configuration
public class RedisConfig {

    @Value("${spring.redis.host}")
    private String host;

    @Value("${spring.redis.port}")
    private int port;

    @Value("${spring.redis.password}")
    private String password;

    @Bean
    public RedisConnectionFactory connectionFactory() {
        JedisConnectionFactory jcf = new JedisConnectionFactory();
        jcf.setHostName(host);
        jcf.setPort(port);
        jcf.setPassword(password);
        return jcf;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }
}
```

위 구성을 적용하고 Spring Session(`spring-session-data-redis`)을 연동하면, Spring Security 인증 세션이 Redis에 정상적으로 적재·관리되는 것을 GUI 툴에서도 바로 확인할 수 있습니다.

![Spring Security 세션이 Redis에 저장된 화면](/images/posts/spring-redis-overview/image-6.png)

---

> 참고 링크:
> - [Redis 공식 다운로드](https://redis.io/download/)
> - [Spring Data Redis 공식 프로젝트](https://spring.io/projects/spring-data-redis/)
> - [P3X Redis UI](https://www.electronjs.org/apps/p3x-redis-ui)
