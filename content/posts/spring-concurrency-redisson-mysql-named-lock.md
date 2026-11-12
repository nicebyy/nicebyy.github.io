---
title: '[Spring] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락)'
date: '2023-04-07'
category: Backend/Spring
tags:
  - MYSQL
  - NamedLock
  - Redis
  - Redisson
  - Spring
  - 네임드락
  - 레디스
  - 병행제어
  - 분산락
summary: >-
  정말 오랜만에 블로그를 쓰는 것 같다. 쓰고 싶은 것들이 한 트럭인데 생각만하다가 흘러간 세월이 벌써 이렇게된듯.. 틈틈이 이제 써
  봐야겠다. 1. 병행제어 > 실무에서 동시성관리는 매우 중요하다. 특히나 내가 속한 팀인 거래소팀에서는 더욱 중요한 ...
---
정말 오랜만에 블로그를 쓰는 것 같다. 쓰고 싶은 것들이 한 트럭인데 생각만하다가 흘러간 세월이 벌써 이렇게된듯..

틈틈이 이제 써 봐야겠다.

## **1\. 병행제어**

> **실무에서 동시성관리는 매우 중요하다. 특히나 내가 속한 팀인 거래소팀에서는 더욱 중요한 이슈이다.**  
> **이번에 하나의 Redis 서버에서 과부하가 자주 일어나서 개선하는 방향으로 작업을 하다보니 거래소 차트그리는 쪽을 손보게 되었다. 밑의 그림은 대형 거래소 차트 예시이다.**

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 1](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-1.png)

우리거래소는 코인 페어별로 (USDT, ETH, BTC) 등 차트를 그리는데 아무튼 각설하고 , 대충 차트를 그리는 서버가 여러개란 뜻이다. 각 서버는 1분 간격 스케쥴러로 동작하며, 차트를 그린다.

차트그리기 전용 데이터를 다루는 DB가 별도로 존재하며, 차트를 그리기위해 DB값을 업데이트하고 웹소켓을 이용하여 프론트단으로 데이터를 보내 실시간으로 시세가 변하는 것을 보여주기 위함이고, **여러개의 서버**가 차트를 중복해서 그리거나 데이터를 보내면 안되므로 **병행제어가 필요했다.**

동시성관리를 위한 방법들은 여러개 있는데, JAVA 의 **syncronized** 메서드 블록을 이용한다던가 **Atomic** 타입을 사용해서 해결 할 수 있다. 

하지만 **이 방법은 같은 프로세스 내 에서 다른 스레드끼리 경쟁할때만 유효하고 애초에 서버가 다르면 결국 똑같은 문제를 발생시킨다.**

그래서 **병행제어를 위한 분산락**이 필요한데 두 가지 방법을 소개하려한다.

## **2\. 분산락**

> **분산락은 대표적으로 Redis 나 주키퍼 , Mysql의 NamedLock 등이 있는데 기존엔 Redisson 클라이언트를 이용한 Lock 제어를 하였다.**

### **\[1\] Redisson** 

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 2](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-2.png)

**Redis 클라이언트는 분산락을 이용하기위해 Redisson을 이용한 상태이다.**

내가 원하는 key 값으로 락을걸면 정한 시간이나 동작이 완료될 때 까지 Redis 안에 key 값으로 락이 걸리게 되고

다른 서버들은 Redis에 접근할 때 이미 락이 걸려있기 때문에 중복작업을 하지 않게 된다.

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 3](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-3.png)

Redis 내부 예시

하지만 아까 말했듯이 ( Redis를 이용한 원격 함수호출요청이 몇십만, 백만 까지 넘쳐나는 등 .. )

**Redis 과부하를 줄이기 위한것이 목적이었기 때문에, 그리고 또 다른 문제점이 발견되어 Redisson 락을 버리기로 하였다.**

**1\. Redis의 락은 Redis Transaction 행위 중 하나이고, 이는 connection을 계속 점유한다.**

**2\. 다른 작업의 connection 때문에 락을 획득하기위한 connection을 실패하게 되어 락 획득 자체가 실패한다.**

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 4](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-4.png)

위 코드와 같이 **한정된 connectionPoolSize 에 비해 차트를 그리는서버는 총 4개.. 즉 , 락을 잡고 처리하는데 병목이 발생**한다. 

우선 기본적으로 Redis는 싱글스레드 기반이라 별 상관없다고 생각할 수 있겠지만 유일하게 Connection에 영향을 끼치는게 **Redis Transaction**이다. ( Redis Transaction 참고 : [https://sabarada.tistory.com/177](https://sabarada.tistory.com/177))

락을 거는 행위는 Redis 의 WATCH 명령에 속하고 커넥션을 점유하게 되어 병목을 유발 시키거나 , Redis 의 다른 작업이 처리되느라 락 획득에 실패하는 경우가 발생하여서 다른 분산락을 이용하기로 하였다.

### **\[2\] MySQL NamedLock**

마침 DB도 mysql 5.7 이상 버전을 사용하고 있었고, Redis 와 같은 인프라 관련 유지보수 비용도 만만치 않은 상태인데다가 우형 기술블로그가 도움이 많이 되어서 **NamedLock**을 이용하기로 하였다. 

( 참고 : [https://techblog.woowahan.com/2631/](https://techblog.woowahan.com/2631/))

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 5](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-5.png)

mysql NamedLock 으로 변경 후 코드

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 6](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-6.png)

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 7](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-7.png)

(중간 트랜잭션 과정은 대충 생략 ... )

**중요한 곳은 NamedLock과 관련된 chartLockRepository 이다.**

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 8](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-8.png)

우선, **JPA에서는 공식적으로 NamedLock 을 제공하지 않기때문에** native query를 이용해야 했다.

(관련 공식 레퍼런스 : [https://dev.mysql.com/doc/refman/5.7/en/locking-functions.html](https://dev.mysql.com/doc/refman/5.7/en/locking-functions.html))

MySql 의 네임드 락 관련 함수는 총 세 가지를 사용했는데 , 

**1\. 락이 있는지 확인하는 쿼리 : select is\_used\_lock(key)**

**2\. 락을 획득하는 쿼리 : select get\_lock(key, time)**

**3\. 락을 반환하는 쿼리 : select release\_lock(key)**

1 -> 2 -> 3 순서대로 락 관련 제어를 하였다.

1 : 락이 있는지 먼저 물어보고

2 : 락을 획득하여 트랜잭션을 처리 후

3 : 마지막에 락을 다시 반환

이렇게 방식을 바꾸고 나니, **락을 획득하는데 실패하는 경우가 이젠 더이상 나오지 않은데다가 Redis 의존을 떼어내어 부하를 조금 줄이게 되었다**. 중간에 **@Transactional 에 전파옵션을 Required\_new 로 지정해 논 곳이 있는데 , 배치 작업을 하다 중간에 실패해도 해당 코인 외 나머지 차트그리는 작업까지 롤백이 되면 안되므로 전파옵션도 바꾸게 되었다.**

아래는 GPT 한테 도움받은 몇가지 질문들

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 9](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-9.png)

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 10](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-10.png)

![\[Spring\] 동시성 관리와 락 병행제어 (Redisson, Mysql 네임드락) 이미지 11](/images/posts/spring-concurrency-redisson-mysql-named-lock/image-11.png)

반박시 님말 맞음....!!

_아 .. 팀장님좀 뽑아줬으면.. 잘 하고 있는건지 모르겠다.._ 

그런데, 분명 1분동안 락을 점유하도록 했는데 처리시간이 1분이상 걸린건 뭔지 모르겠다.. 아시는 분 댓글부탁드려요..ㅠ
