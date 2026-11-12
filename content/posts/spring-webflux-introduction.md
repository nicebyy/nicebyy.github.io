---
title: '[Spring] WebFlux 도입에 관한 이야기'
date: '2022-11-03'
category: Spring
tags:
  - spring webflux
  - Webflux
  - webflux 도입
summary: >-
  > WebFlux 란 웹에서 Reactor의 스트리밍 처리를 담당하기 위해 Spring 5.0 부터 도입이 되었고 > non-blocking
  에 기반한 reactive streams 를 back pressure 와 함께 처리하여 동시에 많은 요청을 처...
---
> **WebFlux 란 웹에서 Reactor의 스트리밍 처리를 담당하기 위해 Spring 5.0 부터 도입이 되었고**  
> **non-blocking 에 기반한 reactive streams 를 back pressure 와 함께 처리하여 동시에 많은 요청을 처리하기 위한 목적으로 나왔다.  
> **  
> **이전의 Reactive streams는 low 레벨이기 때문에 API 에 있어서 유용하지 못했지만 Webflux에서 풍부한 라이브러리와 연산자들을 통해 서버사이드에 좀 더 집중할 수 있게 되었다.**

![\[Spring\] WebFlux 도입에 관한 이야기 이미지 1](/images/posts/spring-webflux-introduction/image-1.png)

![\[Spring\] WebFlux 도입에 관한 이야기 이미지 2](/images/posts/spring-webflux-introduction/image-2.png)

## **WebFlux vs SpringMVC**

> **기본적으로 SpringMVC는 멀티스레드에 기반한 명령형 프로그래밍 방식이다.**  
> **즉, 나타내고자 하는 기능을 분명하게 나눌 수 있고 디버깅이 쉬우며 유지보수가 편리하다.**  
>   
> **그에 반해 WebFlux는 여러 Streams 복잡한 조합과 비동기적인 함수형 프로그래밍 방식을 채택하여 파이프라인을 구성하는 것이기 때문에 변경 추적이 쉽지 않을 뿐더러 변경 추적이 어렵다.**

```java
basketFlux.concatMap(basket -> {
    final Mono<List<String>> distinctFruits = Flux.fromIterable(basket).distinct().collectList();
    final Mono<Map<String, Long>> countFruitsMono = Flux.fromIterable(basket)
            .groupBy(fruit -> fruit)
            .concatMap(groupedFlux -> groupedFlux.count()
                .map(count -> {
                    final Map<String, Long> fruitCount = new LinkedHashMap<>();
                    fruitCount.put(groupedFlux.key(), count);
                    return fruitCount;
                }) 
            ) 
            .reduce((accumulatedMap, currentMap) -> new LinkedHashMap<String, Long>() { {
                putAll(accumulatedMap);
                putAll(currentMap);
            }})
    return Flux.zip(distinctFruits, countFruitsMono, (distinct, count) -> new FruitInfo(distinct, count));
}).subscribe(System.out::println);
```

(Webflux 예시코드)

## **그럼에도 WebFlux를 쓰는이유**

> 그렇다면 왜 굳이 SpringMVC대신 Webflux 를 쓰려고할까.  
> 단순히 많은 요청을 더 잘 처리하기 위해서 혹은 반전이 일어날만한 성능 기대를 위해 도입을 해야하나?

실제로 초당 500개 정도의 요청을 받는다면 사용을 고려할 만하다고 하지만 여러 글들을 찾아 본 결과 다음과 같은 환경이면 도입할만 하다고 판단하는 것 같다.

1.  **데이터를 스트리밍으로 지속적으로 보내줘야 하는 경우**
2.  **대부분 비즈니스 로직이 다른 업스트림 호출이 반환되기를 기다리는 경우 (ex. 오케스트레이션, API 게이트 웨이)**
3.  **여러 API를 호출하는 로직 그리고 이를 위합하여 전달하는 시스템일 경우**
4.  **빈번한 컨텍스트 스위칭으로 인해 늘어난 IO 수행시간으로 인해 CPU와 메모리에 부하가 심한경우 (무거운 스레드)**

## **WebFlux에 맞게 쓰려면**

> **webflux는 기본적으로 비동기이기 때문에 그에 맞는 환경이 갖춰진 상태에서 도입을 해야 적절하게 잘 썼다 라고 얘기할 수 있을 것 같다.**  
>   
> **예를들어 Tmax 사의 Tibero DB와 Rxjava, Webflux를 이용하여 교통정보를 실시간 스트림으로 보내주는 작업을 하는 친구가 있는데 DB가 계속 죽는다고 얘기를 했었다.**  
> **그 원인이 기본적으로 RDB는 블로킹을 동반한 동기성 DB 이기 때문이다.**  
> **아무리 서버로직에서 비동기로 처리하더라도 DB가 비동기가 아니면 결국 병목은 똑같이 걸리기 때문.**  
> **따라서 Webflux 를 사용하려면 이와 관련된 DB는 Redis 나 R2DBC와 같은 Nosql 기반 DB를 선택하는 것도 방법이 되겠다.**  
> **이러한 이유로 우리회사 같은경우 단순 호출을 기반으로 진행된 챗봇 프로젝트에선 webflux와 redis를 이용하여 개발을 했었다. (현재는 보류)**  
>   
> **https://www.youtube.com/watch?v=I0zMm6wIbRI**  
> **어느 머기업에서 Webflux를 도입했다가 오히려 느렸던 이유에 대해 설명해논 영상이있다. 블록킹코드가 하나라도 있으면 Webflux 도입하는 의미가 퇴색된다는 것이다. 즉 모든 코드들은 가능한 비동기 Non-blocking으로 개발해야 한다.**

![\[Spring\] WebFlux 도입에 관한 이야기 이미지 3](/images/posts/spring-webflux-introduction/image-3.png)
