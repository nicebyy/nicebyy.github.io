---
title: '[Spring] Spring Redirect 가 동작하지 않는 이유'
date: '2022-11-07'
category: Spring
tags:
  - Spring Redirect
  - 리다이렉션
summary: >-
  문제상황 /product URL로 상품 등록이라는 동작을 한 뒤에 내가 등록한 상품 리스트로 redirect 명령을 내리려고한다. 보통,
  이런 리다이렉션 같은 경우는 상품을 등록 후 새로고침을 수행하였을때 재 등록을 방지하기 위해서 사용하는데 소위 P...
---
## **문제상황**

/product URL로 상품 등록이라는 동작을 한 뒤에 내가 등록한 상품 리스트로 redirect 명령을 내리려고한다.

보통, 이런 리다이렉션 같은 경우는 상품을 등록 후 새로고침을 수행하였을때

재 등록을 방지하기 위해서 사용하는데 소위 PRG (Post, Redirect, Get 이라고 부른다.)

![\[Spring\] Spring Redirect 가 동작하지 않는 이유 이미지 1](/images/posts/spring-redirect-troubleshooting/image-1.png)

상품 등록 코드

```java
    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public String addProduct(
            @ModelAttribute ProductDto.CreateProduct createProduct,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam List<MultipartFile> productImages
    ) throws IOException {
        User currentUser = userService.findByUserId(user.getUserId());
        productService.registerProduct(currentUser,createProduct,productImages);

        return "redirect:/product";
    }
```

상품 등록을 모두 수행한 후, 상품 리스트를 보여주는 Url (/product) 로 Get요청을 하는 상황.

상품이 성공적으로 등록되었으면 201 상태코드를 반환을 동시에 수행

![\[Spring\] Spring Redirect 가 동작하지 않는 이유 이미지 2](/images/posts/spring-redirect-troubleshooting/image-2.png)

여기서 등록하기를 누르면 예상과 달리 리다이렉트를 수행하지 않는 문제의 상황이 발생한다.

![\[Spring\] Spring Redirect 가 동작하지 않는 이유 이미지 3](/images/posts/spring-redirect-troubleshooting/image-3.png)

곰곰히 생각해보니 **Redirect 동작은 서버 => 브라우저 에게 내리는 명령**이므로 결국 수행은 브라우저가 한다.

그 기준은 Post 수행후 반환된 상태코드를 기준으로 판별한다는 것.

따라서 다음과 같이 변경한다. (HttpStatus.CREATED =>  HttpStatus.FOUND)

```java
    @PostMapping("/new")
    @ResponseStatus(HttpStatus.FOUND)
    public String addProduct(
            @ModelAttribute ProductDto.CreateProduct createProduct,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam List<MultipartFile> productImages
    ) throws IOException {

        User currentUser = userService.findByUserId(user.getUserId());
        productService.registerProduct(currentUser,createProduct,productImages);

        return "redirect:/product";
    }
```

다시 상품등록을 똑같이 요청하면 , 수행 후 정상적으로 redirect가 된 것을 확인할 수 있다.

![\[Spring\] Spring Redirect 가 동작하지 않는 이유 이미지 4](/images/posts/spring-redirect-troubleshooting/image-4.png)
