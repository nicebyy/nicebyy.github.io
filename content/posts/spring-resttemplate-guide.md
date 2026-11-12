---
title: '[Spring] RestTemplate 동작 원리와 HTTP 메서드 사용법 (WebClient 비교)'
date: '2022-06-26'
category: Backend/Spring
tags:
  - REST API
  - RestTemplate
  - WebClient
  - Spring MVC
  - 스프링 인 액션
summary: >-
  Spring의 동기식 REST 클라이언트 RestTemplate의 HttpMessageConverter 기반 동작 원리와 GET/POST/PUT/DELETE 사용 예시, 그리고 대용량 동시성 환경에서 WebClient가 권장되는 이유를 정리합니다.
---

## RestTemplate이란?

**`RestTemplate`**은 Spring 3.0부터 제공되는 HTTP 클라이언트로, 다른 서비스의 REST API에 HTTP 요청을 보내고 응답을 받아올 때 사용하는 **동기(Synchronous)·블로킹(Blocking) 방식**의 템플릿 클래스입니다. (HATEOAS 링크 탐색에는 `Traverson`과 함께 사용되기도 합니다.)

![서비스 간 REST 통신 구조](/images/posts/spring-resttemplate-guide/image-1.png)

서버 내부에서 외부 API나 다른 마이크로서비스(Service A → Service B)로부터 JSON 데이터를 받아올 때, `Jackson2HttpMessageConverter` 등을 이용해 자바 객체(DTO)로 손쉽게 역직렬화해 줍니다.

---

## RestTemplate 내부 동작 원리

![RestTemplate 내부 동작 흐름](/images/posts/spring-resttemplate-guide/image-2.png)

요청과 응답은 **`RestTemplate → HttpMessageConverter → RequestEntity → (HTTP 통신) → ResponseEntity → HttpMessageConverter → Java Object`** 순서로 변환됩니다.

### 1. 기본 MessageConverter 등록
`RestTemplate`은 생성자에서 클래스패스에 존재하는 JSON/문자열/바이너리 컨버터(`MappingJackson2HttpMessageConverter`, `GsonHttpMessageConverter`, `StringHttpMessageConverter` 등)를 자동으로 등록합니다.

```java
public RestTemplate() {
    this.messageConverters.add(new ByteArrayHttpMessageConverter());
    this.messageConverters.add(new StringHttpMessageConverter());
    // ...
    if (jackson2Present) {
        this.messageConverters.add(new MappingJackson2HttpMessageConverter());
    } else if (gsonPresent) {
        this.messageConverters.add(new GsonHttpMessageConverter());
    } else if (jsonbPresent) {
        this.messageConverters.add(new JsonbHttpMessageConverter());
    } else if (kotlinSerializationJsonPresent) {
        this.messageConverters.add(new KotlinSerializationJsonHttpMessageConverter());
    }
    // ...
}
```

### 2. Callback 기반 요청 실행
`getForObject()` 등의 메서드를 호출하면 내부적으로 `RequestCallback`과 `HttpMessageConverterExtractor`를 생성한 뒤 핵심 메서드인 `execute()`로 위임하여 처리합니다.

```java
@Override
@Nullable
public <T> T getForObject(String url, Class<T> responseType, Object... uriVariables)
        throws RestClientException {
    RequestCallback requestCallback = acceptHeaderRequestCallback(responseType);
    HttpMessageConverterExtractor<T> responseExtractor =
            new HttpMessageConverterExtractor<>(responseType, getMessageConverters(), logger);
    return execute(url, HttpMethod.GET, requestCallback, responseExtractor, uriVariables);
}
```

---

## 주요 HTTP 메서드 활용 가이드

`RestTemplate`은 HTTP Method별로 직관적인 12종의 메서드(오버로딩 포함 총 41개)를 제공합니다.

| 메서드 | 설명 | HTTP Method | 반환 타입 |
| :--- | :--- | :--- | :--- |
| `getForObject(...)` / `getForEntity(...)` | 리소스 조회 | `GET` | `T` / `ResponseEntity<T>` |
| `postForObject(...)` / `postForEntity(...)` | 리소스 생성 요청 | `POST` | `T` / `ResponseEntity<T>` |
| `postForLocation(...)` | 리소스 생성 후 `Location` URI 반환 | `POST` | `URI` |
| `put(...)` | 리소스 전체 수정 | `PUT` | `void` |
| `patchForObject(...)` | 리소스 일부 수정 | `PATCH` | `T` |
| `delete(...)` | 리소스 삭제 | `DELETE` | `void` |
| `headForHeaders(...)` | 응답 헤더만 조회 | `HEAD` | `HttpHeaders` |
| `optionsForAllow(...)` | 지원 가능한 HTTP Method(`Allow`) 조회 | `OPTIONS` | `Set<HttpMethod>` |
| `exchange(...)` | 커스텀 헤더·메서드·제네릭 타입 응답까지 지원하는 범용 API | ALL | `ResponseEntity<T>` |
| `execute(...)` | 가장 저수준(Low-level)의 콜백 직접 제어 메서드 | ALL | `T` |

### GET 요청 예시
```java
@Service
@Slf4j
@RequiredArgsConstructor
public class TacoCloudClient {

    private final RestTemplate rest;

    // 1. 가변 인자로 URL 변수 전달
    public Ingredient getIngredientById(String ingredientId) {
        return rest.getForObject(
                "http://localhost:8080/ingredients/{id}",
                Ingredient.class,
                ingredientId);
    }

    // 2. 제네릭 컬렉션(List<Ingredient>) 수신 시 ParameterizedTypeReference와 exchange 사용
    public List<Ingredient> getAllIngredients() {
        return rest.exchange(
                "http://localhost:8080/ingredients",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Ingredient>>() {}
        ).getBody();
    }

    // 3. Map으로 URL 변수 전달
    public Ingredient getIngredientByIdMap(String ingredientId) {
        Map<String, String> urlVariables = new HashMap<>();
        urlVariables.put("id", ingredientId);
        return rest.getForObject("http://localhost:8080/ingredients/{id}",
                Ingredient.class, urlVariables);
    }

    // 4. UriComponentsBuilder로 안전하게 URI 조립
    public Ingredient getIngredientByUri(String ingredientId) {
        URI url = UriComponentsBuilder
                .fromHttpUrl("http://localhost:8080/ingredients/{id}")
                .build(Map.of("id", ingredientId));
        return rest.getForObject(url, Ingredient.class);
    }

    // 5. 헤더 정보와 상태 코드까지 함께 확인하려면 getForEntity 사용
    public Ingredient getIngredientEntity(String ingredientId) {
        ResponseEntity<Ingredient> responseEntity =
                rest.getForEntity("http://localhost:8080/ingredients/{id}",
                        Ingredient.class, ingredientId);
        log.info("Fetched time: {}", responseEntity.getHeaders().getDate());
        return responseEntity.getBody();
    }
}
```

### POST / PUT / DELETE 요청 예시
```java
// POST: 객체 생성 및 응답 바디 반환
public Ingredient createIngredient(Ingredient ingredient) {
    return rest.postForObject("http://localhost:8080/ingredients",
            ingredient, Ingredient.class);
}

// POST: 생성된 리소스의 Location URI 반환
public URI createIngredientLocation(Ingredient ingredient) {
    return rest.postForLocation("http://localhost:8080/ingredients", ingredient);
}

// POST: ResponseEntity로 헤더(Location)와 바디 동시 확인
public Ingredient createIngredientEntity(Ingredient ingredient) {
    ResponseEntity<Ingredient> responseEntity =
            rest.postForEntity("http://localhost:8080/ingredients",
                    ingredient, Ingredient.class);
    log.info("New resource created at {}", responseEntity.getHeaders().getLocation());
    return responseEntity.getBody();
}

// PUT
public void updateIngredient(Ingredient ingredient) {
    rest.put("http://localhost:8080/ingredients/{id}",
            ingredient, ingredient.getId());
}

// DELETE
public void deleteIngredient(String ingredientId) {
    rest.delete("http://localhost:8080/ingredients/{id}", ingredientId);
}
```

---

## RestTemplate의 한계와 WebClient의 등장

Spring 5.0부터는 비동기 클라이언트인 `AsyncRestTemplate`이 deprecated 되었고, **`WebClient` 사용이 권장**되고 있습니다. (참고로 Spring Boot 3.2+에서는 동기 환경에서도 더 세련된 체이닝 API를 제공하는 `RestClient`도 추가되었습니다.)

| 비교 항목 | `RestTemplate` (Spring MVC) | `WebClient` (Spring WebFlux) |
| :--- | :--- | :--- |
| **I/O 모델** | **Blocking** | **Non-Blocking** |
| **실행 방식** | **Synchronous** | **Asynchronous** (동기 `.block()`도 지원) |
| **스레드 모델** | 요청당 스레드 1개 점유 (Multi-Thread Pool) | 소수의 이벤트 루프 스레드 (Event-Driven) |

![RestTemplate vs WebClient 동시 요청 성능 비교](/images/posts/spring-resttemplate-guide/image-3.png)

기존의 **Sync-Blocking** 방식(`RestTemplate`)은 외부 API 응답이 돌아올 때까지 워커 스레드가 아무 일도 하지 못한 채 대기합니다. 동시 요청 수가 스레드 풀 크기(Max Threads)를 초과하면 요청이 큐에 쌓이면서 전체 응답 지연이 급격히 증가하는 **Thread Pool Hell(스레드 풀 고갈)** 현상이 발생할 수 있습니다.

반면 `WebClient`는 **Async & Non-Blocking + Event-Driven** 방식으로 동작하므로, 외부 I/O 응답을 기다리는 동안 스레드가 다른 요청을 처리할 수 있어 적은 리소스로도 대규모 트래픽을 효율적으로 감당할 수 있습니다.

---

> 참고 자료:
> - [동기 vs 비동기, Blocking vs Non-Blocking](https://velog.io/@nittre/%EB%B8%94%EB%A1%9C%ED%82%B9-Vs.-%EB%85%BC%EB%B8%94%EB%A1%9C%ED%82%B9-%EB%8F%99%EA%B8%B0-Vs.-%EB%B9%84%EB%8F%99%EA%B8%B0)
> - [Spring WebFlux는 어떻게 적은 리소스로 많은 트래픽을 감당할까?](https://alwayspr.tistory.com/44)
