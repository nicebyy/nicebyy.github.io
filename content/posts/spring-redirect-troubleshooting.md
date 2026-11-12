---
title: '[Spring] PRG 패턴에서 redirect:/가 동작하지 않는 이유 (@ResponseStatus 함정)'
date: '2022-11-07'
category: Backend/Spring
tags:
  - Spring MVC
  - Redirect
  - PRG 패턴
  - HttpStatus
  - 트러블슈팅
summary: >-
  상품 등록 후 PRG(Post-Redirect-Get) 패턴으로 목록 페이지 리다이렉트를 구현할 때, @ResponseStatus(HttpStatus.CREATED)로 인해 브라우저 리다이렉트가 무시되는 원인과 올바른 HTTP 상태 코드 설정법을 정리합니다.
---

## 문제 상황

`/product/new` 경로로 상품을 등록한 뒤, 등록된 상품 목록 페이지(`/product`)로 이동시키기 위해 **PRG(Post-Redirect-Get) 패턴**을 적용했습니다.

> **PRG 패턴이란?**  
> POST 요청 후 결과 페이지를 바로 렌더링하면 사용자가 새로고침(`F5`)을 눌렀을 때 중복 등록(POST 재전송)이 발생할 수 있습니다. 이를 막기 위해 서버가 `3xx Redirect`를 내려 브라우저가 자동으로 `GET` 요청을 다시 보내도록 유도하는 웹 표준 패턴입니다.

![상품 등록 화면 및 PRG 흐름](/images/posts/spring-redirect-troubleshooting/image-1.png)

초기에 작성한 컨트롤러 코드는 다음과 같았습니다. "상품 리소스가 새로 생성되었다"는 의미로 `@ResponseStatus(HttpStatus.CREATED)`(`201`)를 함께 선언하고 `"redirect:/product"`를 반환했습니다.

```java
@PostMapping("/new")
@ResponseStatus(HttpStatus.CREATED) // ← 문제의 원인 (201 Created)
public String addProduct(
        @ModelAttribute ProductDto.CreateProduct createProduct,
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestParam List<MultipartFile> productImages
) throws IOException {
    User currentUser = userService.findByUserId(user.getUserId());
    productService.registerProduct(currentUser, createProduct, productImages);

    return "redirect:/product";
}
```

![상품 등록 요청 실행](/images/posts/spring-redirect-troubleshooting/image-2.png)

하지만 막상 등록하기 버튼을 눌러보면 DB에는 정상적으로 등록되지만, **브라우저가 `/product`로 리다이렉트되지 않고 멈추거나 에러 화면이 뜨는 현상**이 발생했습니다.

![리다이렉트가 동작하지 않는 화면](/images/posts/spring-redirect-troubleshooting/image-3.png)

---

## 원인 분석: 리다이렉트는 HTTP 3xx 상태 코드를 보고 브라우저가 수행한다

리다이렉트는 서버가 혼자 페이지를 바꾸는 것이 아니라, **서버가 응답 헤더(`Location: /product`)와 함께 `3xx` 상태 코드를 내려주면 브라우저가 이를 해석해 새 URL로 `GET` 요청을 보내는 동작**입니다.

| 반환 상태 코드 | 브라우저의 동작 방식 |
| :--- | :--- |
| **`302 Found` / `303 See Other`** | 응답 헤더의 `Location` 값을 읽고 자동으로 해당 URL로 `GET` 리다이렉트 실행 |
| **`201 Created`** (`@ResponseStatus` 강제 지정) | 브라우저는 `Location` 헤더가 있더라도 "요청이 성공(2xx)하고 응답이 끝났다"고 판단해 리다이렉트를 수행하지 않음 |

즉, `@ResponseStatus(HttpStatus.CREATED)`가 Spring MVC가 기본으로 설정해 주는 `302 Found` 상태 코드를 **`201`로 덮어써 버렸기 때문에** 리다이렉트가 동작하지 않은 것입니다.

---

## 해결 방법

리다이렉트를 정상적으로 수행하려면 `@ResponseStatus(HttpStatus.FOUND)`(`302`)를 명시하거나, 더 깔끔하게는 **`@ResponseStatus` 애노테이션 자체를 제거**해 Spring MVC의 `RedirectView`가 자동으로 `302 Found`를 내려주도록 두면 됩니다.

```java
@PostMapping("/new")
@ResponseStatus(HttpStatus.FOUND) // 또는 @ResponseStatus 생략 (기본값 302 Found)
public String addProduct(
        @ModelAttribute ProductDto.CreateProduct createProduct,
        @AuthenticationPrincipal CustomUserDetails user,
        @RequestParam List<MultipartFile> productImages
) throws IOException {
    User currentUser = userService.findByUserId(user.getUserId());
    productService.registerProduct(currentUser, createProduct, productImages);

    return "redirect:/product";
}
```

수정 후 다시 상품을 등록해 보면 `/product` 목록 페이지로 깔끔하게 리다이렉트되는 것을 확인할 수 있습니다.

![302 Found 반환 후 정상 리다이렉트 확인](/images/posts/spring-redirect-troubleshooting/image-4.png)

> **설계 팁**:
> - **Thymeleaf / SSR (View 반환)**: `return "redirect:/..."`와 함께 `302/303` 사용 (`@ResponseStatus(201)` 금지)
> - **REST API (`@RestController`)**: 리다이렉트 대신 `ResponseEntity.created(URI.create("/product/" + id)).build()`를 사용해 `201 Created`와 `Location` 헤더를 응답으로 내려주고, 프론트엔드(SPA) 코드에서 라우팅을 처리하는 것이 표준입니다.
