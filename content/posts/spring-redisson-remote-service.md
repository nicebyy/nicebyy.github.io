---
title: '[Spring] Redisson Remote Service 분해해보기'
date: '2023-06-25'
category: Backend/Spring
tags:
  - MSA
  - Redis
  - Redisson
  - RedissonRemoteService
  - RemoteService
  - 레디스
summary: >-
  Redisson > Reddison 은 Redis 의 클라이언트중 하나로 Jedis, Lecttuce 와 같은 ‘분산’ 서비스 또는 락을
  중점으로 이용할 때 사용된다. 이번 포스팅은 락 관련은 넘어가고 Remote Service 에 대해 포스팅하고자 ...
---
## **Redisson**

> **Reddison** 은 **Redis 의 클라이언트**중 하나로 Jedis, Lecttuce 와 같은 ‘분산’ 서비스 또는 락을 중점으로 이용할 때 사용된다. 이번 포스팅은 락 관련은 넘어가고 Remote Service 에 대해 포스팅하고자 한다.

## **Redisson Remote Service**

> 기존의 다른 Redis 클라이언트로는 할 수 없었던 Redisson 의 분산 서비스의 특징이다.  
> **RemoteService** 는 크게 서버 인스턴스와 클라이언트 인스턴스로 두 종류로 구성되어있다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 1](/images/posts/spring-redisson-remote-service/image-1.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 2](/images/posts/spring-redisson-remote-service/image-2.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 3](/images/posts/spring-redisson-remote-service/image-3.png)

위 그림과 같이 아래 클라이언트 인스턴스가 호출하고자 하는 서비스 인터페이스를 가지고 호출을하면 서버측 인스턴스에서 요청을 받아들이는 방식으로 작동한다.

## **프로젝트 생성**

*   실행 환경 : springboot 3.1.0, Gradle, intellij, window10, Redis, Docker

### **Redis 설치하기**

---

**docker-compose** 를 통해 간단하게 테스트용 로컬 레디스를 설치

(관련 설명링크 : [https://learn.microsoft.com/ko-kr/azure/cognitive-services/containers/docker-compose-recipe](https://learn.microsoft.com/ko-kr/azure/cognitive-services/containers/docker-compose-recipe))

window의 wsl2 를 이용하여 docker 를 구동하였음.

(mac 을 사용한다면 brew 와 같은 패키지 관리자를 설치후 docker를 설치하면 됨)

**docker-compose.yml**

```bash
version : '3.8'
services :
  redis-remoteService :
    container_name : redis-remoteService
    image : redis:latest
    restart: always
    ports: 
      - 6379:6379
```

![\[Spring\] Redisson Remote Service 분해해보기 이미지 4](/images/posts/spring-redisson-remote-service/image-4.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 5](/images/posts/spring-redisson-remote-service/image-5.png)

프로젝트 최상단위치에 docker-compose 파일을 넣어두고 백그라운드로 실행.

6379 포트로 잘 돌아가는 것을 확인. (Docker Desktop)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 6](/images/posts/spring-redisson-remote-service/image-6.png)

**\- P3x Redis UI 툴로 확인**해보기 (혹은 Redis insight 를 추천)

커넥션 설정

![\[Spring\] Redisson Remote Service 분해해보기 이미지 7](/images/posts/spring-redisson-remote-service/image-7.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 8](/images/posts/spring-redisson-remote-service/image-8.png)

### **SpringBoot 프로젝트 구성**

---

> 스프링 프로젝트를 다음과 같이 **Gradle 멀티모듈 프로젝트**로 구성하였다. (이유는 나중에 설명)  
>   
> 1\. 가장 바깥쪽 껍데기 Root 프로젝트인 **remoteService** 프로젝트  
> 2\. 요청을 받아 처리하는 서버 모듈인 **redissonServer**  
> 3\. 요청을 보내는 클라이언트 모듈인 **redissonClient**  
> 4\. Server 와 Client 가 공통적으로 사용하는 코드가 담인 공통묘듈 **redissonCommon**

![\[Spring\] Redisson Remote Service 분해해보기 이미지 9](/images/posts/spring-redisson-remote-service/image-9.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 10](/images/posts/spring-redisson-remote-service/image-10.png)

*   **remoteService** \- build.gradle  
    루트 프로젝트에서 하위 서브모듈들의 공통적인 dependency 들을 정의해준다.

```bash
buildscript {
	ext{
		springBootVersion = '3.1.0'
	}
	repositories {
		mavenCentral();
	}
	dependencies {
		classpath "org.springframework.boot:spring-boot-gradle-plugin:${springBootVersion}"
		classpath "io.spring.gradle:dependency-management-plugin:1.0.11.RELEASE"
	}
}

// 하위 모든 프로젝트 공통 세팅
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
	tasks.register("prepareKotlinBuildScriptModel"){}
}
```

*   **redissonServer** \- build.gradle

```bash
bootJar {
    archiveFileName = 'redisson-client'
}

dependencies {
    implementation project(path: ":redissonCommon", configuration: 'default')
    implementation('org.springframework.boot:spring-boot-starter-web')
}
```

*   **redissonCommon** \- build.gradle  
    공통모듈은 독립으로 존재 하지않고 server 나 client 에 항상 종속적이므로 bootJar = false 로 함

```bash
bootJar{enabled = false}
jar{enabled = true}

dependencies {
}
```

### **공통모듈 로드 확인하기**

---

redissonCommon 프로젝트에 간단하게 ApplicationReadyEvent로 Member Entity 하나를 만들어서 redissonServer 모듈 실행 시 정상적으로 불러와지는지 확인해본다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 11](/images/posts/spring-redisson-remote-service/image-11.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 12](/images/posts/spring-redisson-remote-service/image-12.png)

### **Redisson Common Module 작업하기**

---

![\[Spring\] Redisson Remote Service 분해해보기 이미지 13](/images/posts/spring-redisson-remote-service/image-13.png)

아까 추가한 Member 엔티티를 인자로 받아 이름을 바꿔주는 서비스인 RemoteMemberService의 인터페이스를 하나 만들겠다.

*   **RemoteMemberServiceInterface.java**

```java
package com.example.redissoncommon.remote;

import com.example.redissoncommon.entity.Member;

public interface RemoteMemberServiceInterface {

    public void renameMember(Member member, String newName);
}
```

> Redisson Remote Service 를 이용하기 위해선 Server 와 Client 가 같이 사용할 수 있는 인터페이스가 필요한데 Client쪽에서는 이 **RemoteMemberServiceInterface** 를 호출하는 방식으로 사용할 것이고 , Server 쪽에서는 **RedissonRemoteService 에 이 인터페이스와 인터페이스를 구현한 서비스 클래스를 등록**할 것이다.

### **Reddisson Server Module 작업하기**

---

![\[Spring\] Redisson Remote Service 분해해보기 이미지 14](/images/posts/spring-redisson-remote-service/image-14.png)

*   **application.yml** (redissonServer)

```bash
server:
  port: 7071
spring:
  data:
    redis:
      port: 6379
      host: redis://localhost
```

*   **RemoteMemberService**.java

```java
package com.example.redissonserver.service;

import com.example.redissoncommon.entity.Member;
import com.example.redissoncommon.remote.RemoteMemberServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class RemoteMemberService implements RemoteMemberServiceInterface {
    @Override
    public Member renameMember(Member member,String newName){
        log.info("before rename => {} ",member);
        member.setName(newName);
        log.info("after rename => {}",member);
        return member;
    }
}
```

> 아까 공통모듈 패키지에서 만들어놓은 RemoteMemberServiceInterface 를 구현하는 클래스를 서버쪽 모듈에 추가한다.

*   **RedissonConfiguration.java  
    **

```java
package com.example.redissonserver.config;

import com.example.redissoncommon.remote.RemoteMemberServiceInterface;
import com.example.redissonserver.service.RemoteMemberService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.redisson.Redisson;
import org.redisson.api.RRemoteService;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

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
    public void registerRemoteService(){
        RRemoteService remoteService = redissonClient().getRemoteService();
        remoteService.register(RemoteMemberServiceInterface.class,remoteMemberService);
    }
}
```

![\[Spring\] Redisson Remote Service 분해해보기 이미지 15](/images/posts/spring-redisson-remote-service/image-15.png)

여기선 간단하게 RedisClient 에 필요한 설정들과 등록할 RemoteService 메서드를 WAS 가 실행될 때 등록되게 해놓았다.

설정부분에서 두 가지 특이사항이 있는데 첫 번째로 **Config** 부분이다. Config 부분에서 싱글서버로 등록할 때 여러 서버 형태를 체크해서 이미 존재하는지 확인한다.

보다시피 서버형태는 총 4개이다.

1.**클러스터** 모드 : 말 그대로 여러개의 Redis로 구성되어있는 **레디스 클러스터**를 사용하는 경우이다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 16](/images/posts/spring-redisson-remote-service/image-16.png)

2.**센티넬** 모드 : 다운되었을 때 고가용성을위한 **센티넬 모드**로 사용할 경우이다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 17](/images/posts/spring-redisson-remote-service/image-17.png)

3.**마스터 슬레이브 모드** : **마스터-슬레이브 노드로 구성된 레디스 구성**일 경우이다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 18](/images/posts/spring-redisson-remote-service/image-18.png)

4.**싱글 서버 모드** : 레디스 한 대로 모든 요청을 받는 용도로 사용할 경우 이다. 본 예제에서 사용할 모드이다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 19](/images/posts/spring-redisson-remote-service/image-19.png)

그 외 프록시모드 , 멀티 클러스터 모드 등등 있는데 자세한건 공식 깃헙에 들어가면 나와있으니 참고.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 20](/images/posts/spring-redisson-remote-service/image-20.png)

두 번째 특이사항은 **RRemoteService** 에다가 등록할 RemoteService 를 등록하는 과정인데 **기본 값은** 요청이 들어올 때 하나의 스레드로만 처리하게 하는 옵션을 가지고 있다.

만약 **멀티스레드로** 동시에 여러개 처리를 원할 경우

![\[Spring\] Redisson Remote Service 분해해보기 이미지 21](/images/posts/spring-redisson-remote-service/image-21.png)

사용할 workerAmount 수를 지정해 주면 된다.

혹은 별도의 ExcutorService 를 등록하고 싶을 경우

![\[Spring\] Redisson Remote Service 분해해보기 이미지 22](/images/posts/spring-redisson-remote-service/image-22.png)

이런식으로 등록해 주면 된다.

### **클라이언트 모듈 작업하기**

---

> 클라이언트쪽에서는 간단하게 Member 객체를 생성하는 부분과 이름을 바꾸는 부분이 있는 Service 클래스와 요청을 받는 Controller 로 구성하였다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 23](/images/posts/spring-redisson-remote-service/image-23.png)

*   **application.yml** (redissonClient)

```bash
server:
  port: 7070
spring:
  data:
    redis:
      port: 6379
      host: redis://localhost
```

*   **RedissonConfiguration**.java  
    

```java
package com.example.redissonclient.config;

import com.example.redissoncommon.remote.RemoteMemberServiceInterface;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.api.RemoteInvocationOptions;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
    public RemoteMemberServiceInterface remoteMemberService(){
        // 호출할 RemoteMemberService 를 RedisClient 로 부터 호출 하는 부분
        return redissonClient()
                .getRemoteService()
                .get(RemoteMemberServiceInterface.class, RemoteInvocationOptions.defaults()
//                        .noAck().noResult() // 변환 결과가 없을 경우 추가할 수 있는 옵션. blocking 이 걸리지 않는다.
                );
    }
}
```

RemoteMemberService 를 Common 모듈의 인터페이스를 이용하여 **Bean 으로 설정과 동시에 컨테이너에 올리도록** 하였다. 사용하는 부분에서 저 인터페이스 빈을 사용하면 된다.

**RemoteService** 를 호출할 때 **기본 값은 결과 값을 반환한다는 가정**에 있다. 만약 반환 값이 있다면 추가로 설정해 줘야 하는것이 시간 관련된 부분이다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 24](/images/posts/spring-redisson-remote-service/image-24.png)

없다면 noAck() , noResult() 로 설정해 주면 된다.

*   **MemberService**.java

```java
package com.example.redissonclient.service;

import com.example.redissoncommon.entity.Member;
import com.example.redissoncommon.remote.RemoteMemberServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final AtomicLong memberIdSequence = new AtomicLong(0L);
    private final ConcurrentHashMap<Long,Member> memberDB = new ConcurrentHashMap<Long,Member>();

    private final RemoteMemberServiceInterface remoteMemberServiceInterface;

    public Member callRemoteRenameService(Member member,String name){

        if(member==null)
            throw new IllegalArgumentException("couldn't find member");
        return remoteMemberServiceInterface.renameMember(member,name);
    }

    public Member findMemberById(Long id){
        return Optional.ofNullable(memberDB.get(id))
                .orElse(null);
    }

    public Member createMember(String name){
        Member member = new Member(incrementSequence(), name);
        memberDB.put(member.getId(),member);
        return member;
    }

    private Long incrementSequence(){
        return memberIdSequence.incrementAndGet();
    }
}
```

여기서 중요한부분은 RemoteMemberServiceInterface 인터페이스의 메서드를 호출한다는 것이다.

*   **MemberController**.java

```java
package com.example.redissonclient.controller;

import com.example.redissonclient.service.MemberService;
import com.example.redissoncommon.entity.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/member")
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/create")
    public Member createMember(@RequestParam String name){
        Member member = memberService.createMember(name);
        log.info("created member => {}",member);
        return member;
    }

    @PostMapping("/rename")
    public Member renameMember(@RequestParam Long id,@RequestParam String name){
        Member findMember = memberService.findMemberById(id);
        return memberService.callRemoteRenameService(findMember,name);
    }
}
```

### **Postman 으로 요청 테스트**

---

![\[Spring\] Redisson Remote Service 분해해보기 이미지 25](/images/posts/spring-redisson-remote-service/image-25.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 26](/images/posts/spring-redisson-remote-service/image-26.png)

파라미터로 간단하게 hello 를 전달하여 새로운 Memer 객체를 생성한 후 newHello 로 이름을 바꾸는 테스트이다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 27](/images/posts/spring-redisson-remote-service/image-27.png)

정상적으로 동작하는 것을 확인하였다. 그렇다면 어떻게 인터페이스의 메서드를 호출했는데 동작하는것인가?

### **RemoteService 동작 살펴보기**

---

![\[Spring\] Redisson Remote Service 분해해보기 이미지 28](/images/posts/spring-redisson-remote-service/image-28.png)

빈으로 올라와있는 인터페이스를 찍어보면 당연히 **jdk 동적 프록시**를 사용하고 있다.

보통 빈 컨테이너로 올릴 때 인터페이스를 이용하면 jdk 동적 프록시를 사용하고 class 그대로 이용하면 aop 가 동작해 **CGLIB** 로 올라간다.

인터페이스 메서드를 사용하는 부분에 debug 를 찍어보면

![\[Spring\] Redisson Remote Service 분해해보기 이미지 29](/images/posts/spring-redisson-remote-service/image-29.png)

InvocationalHandler 가 동작하여 remoteInterface 의 getName()을 찾아 맞는 메서드를 호출한다.

그리고 getRequestQueueName 을 호출하는데

![\[Spring\] Redisson Remote Service 분해해보기 이미지 30](/images/posts/spring-redisson-remote-service/image-30.png)

바로 이부분. ConcurrentCacheMap 으로 만들어진 요청큐 안에 특별한 키 값으로 요청을 넣는 것을 확인할 수 있다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 31](/images/posts/spring-redisson-remote-service/image-31.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 32](/images/posts/spring-redisson-remote-service/image-32.png)

확인해 보니 {redisson\_rs : ~~~ } 형태로 들어간다. 직접 확인해보기 위해 RemoteServer를 잠시 꺼보자. 그리고 Redis UI tool 에서 확인해보면

![\[Spring\] Redisson Remote Service 분해해보기 이미지 33](/images/posts/spring-redisson-remote-service/image-33.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 34](/images/posts/spring-redisson-remote-service/image-34.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 35](/images/posts/spring-redisson-remote-service/image-35.png)

요런 모양으로 들어와 있는데 잘 보면 Key 값이 아까 본 모양이랑 똑같이 나와있다.

**즉, 내부적으로 Key 를 생성할 때 결정자 중 하나가 “패키지 경로” 라는 것.**

**실제로 value 로 나와있는 저 값들도 다시 디코딩을 해보면 호출하는 메서드의 패키지 위치라던지 필요한 파라미터 또한 패키지경로 까지 포함한 값으로 들어오게 되어있다.**

**그래서 처음에 구조 설계를 할때 Common 공통 모듈을 생성한 것**이다.

Server 와 Client 가 공통적으로 사용해야하는 **RemoteMemberServiceInterface** 가 Common 모듈 안에 있어야 RemoteServer 가 요청을 받은 후 에도 해당 패키지로 찾아가서 해당 메서드를 Call 할 수 있기 때문. 즉 , **공통 모듈 구조가 강제화 된다는 뜻이다**.

이게 가장 큰 단점이라 만약 사용한다면 저 **Common 모듈을 원격 전용 모듈로서 따로 분리**하고 파라미터로 받는 Member 객체도 엔티티 그대로 사용하지 말고 별도의 Remote 전용 MemberDto 로 따로 컨버팅하고 사용하야 구조에 지나치게 의존적인 관계가 그나마 덜 해지는 것 같다.

참고로, Redisson Config을 설정할 때 내부적으로 Serialier 를 **Kyro** 를 사용하고있다.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 36](/images/posts/spring-redisson-remote-service/image-36.png)

저 Codec을 **JsonJacksonCodec** 으로 변경해서 데이터를 확인해보자.

![\[Spring\] Redisson Remote Service 분해해보기 이미지 37](/images/posts/spring-redisson-remote-service/image-37.png)

![\[Spring\] Redisson Remote Service 분해해보기 이미지 38](/images/posts/spring-redisson-remote-service/image-38.png)

보다시피 파라미터로 받는 Member 엔티티의 클래스 경로까지 모두 포함한다는 것이 보인다. 즉 , 도메인 주도 설계를 한 경우엔 쓰기 쉽지 않아 보이는 강제된 설계구조란 뜻이다.

내부적으로 Serializer 를 재 정의 하거나, 혹은 한다 하더라도 어떤 예상치 못한 문제가 발생할 지 알 수 없으므로 도입하기 애매한 기술인 것 같다.

결론적으로 만약 사용한다면 중요 트랜잭션로직의 속도를 중시한다면 인 메모리 기반 RemoteService 이므로 사용해도 괜찮겠지만 그게 아니라면 별도의 MessageQueue 를 이용하는 것이 좋아보인다.

[https://github.com/nicebyy/RedissonRemoteService](https://github.com/nicebyy/RedissonRemoteService)

 [](https://github.com/nicebyy/RedissonRemoteService)
