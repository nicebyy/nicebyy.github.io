---
title: '[Spring] Spring MVC HTTP 통신 핵심 애노테이션 총정리'
date: '2022-06-16'
category: Backend/Spring
tags:
  - '@RequestParam'
  - '@RequestBody'
  - '@ModelAttribute'
  - '@PathVariable'
  - Spring MVC
summary: >-
  Spring MVC 컨트롤러에서 HTTP 요청을 매핑하고 데이터를 바인딩할 때 사용하는 @RequestMapping, @RequestParam, @ModelAttribute, @RequestBody, @PathVariable, @ResponseBody 등의 역할을 정리합니다.
---

## `@RequestMapping` (요청 URL 및 Method 매핑)

클라이언트가 특정 URL로 HTTP 요청을 보내면 `DispatcherServlet`이 URL과 HTTP Method 조건에 맞는 컨트롤러 메서드를 찾아 실행합니다.

실무에서는 **클래스 레벨에 공통 Prefix 경로(`@RequestMapping("/orders")`)를 두고, 메서드 레벨에 HTTP Method별 단축 애노테이션(`@GetMapping`, `@PostMapping` 등)을 붙이는 방식**을 주로 사용합니다.

```java
@Controller
@Slf4j
@SessionAttributes("order")
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {

    @GetMapping("/current") // @RequestMapping(value = "/current", method = RequestMethod.GET)과 동일
    public String orderForm(@AuthenticationPrincipal User user, Order order) {
        // ...
        return "orderForm";
    }
}
```

---

## HTTP Method별 매핑 애노테이션

### 1. `@GetMapping`
- 주로 리소스 조회 요청(`GET`)을 처리하며, 추가 데이터는 URL 쿼리 스트링(`?limit=10&offset=0`)으로 전달받습니다.
- `@RequestParam`이나 `@ModelAttribute`를 통해 파라미터를 바인딩한 뒤 View 이름 또는 데이터를 반환합니다.

```java
// @RequestParam: String, int 등 단일(Primitive/Wrapper) 요청 파라미터 수신
@GetMapping
public String ordersForUser(
        @AuthenticationPrincipal User user,
        Model model,
        @RequestParam int limit,
        @RequestParam int offset) {

    PageRequest pageable = PageRequest.of(offset, limit);
    model.addAttribute("orders", orderRepository.findByUserOrderByPlacedAtDesc(user, pageable));

    return "orderList";
}
```

```java
// @ModelAttribute: 쿼리 파라미터나 Form 데이터를 자바 객체(DTO) 필드에 자동 바인딩
@GetMapping("/current")
public String orderForm(@AuthenticationPrincipal User user, @ModelAttribute Order order) {
    if (order.getDeliveryName() == null) {
        order.setDeliveryName(user.getFullname());
    }
    if (order.getDeliveryStreet() == null) {
        order.setDeliveryStreet(user.getStreet());
    }
    if (order.getDeliveryCity() == null) {
        order.setDeliveryCity(user.getCity());
    }
    if (order.getDeliveryState() == null) {
        order.setDeliveryState(user.getState());
    }
    if (order.getDeliveryZip() == null) {
        order.setDeliveryZip(user.getZip());
    }
    return "orderForm";
}
```

### 2. `@PostMapping`
- 리소스 생성 또는 데이터 전송(`POST`) 요청을 처리하며, 데이터를 **HTTP Request Body**에 담아 보낼 수 있습니다.
- Form 전송(`application/x-www-form-urlencoded`)은 `@ModelAttribute`로, JSON API 본문(`application/json`)은 `@RequestBody`로 수신합니다.

```java
// Form 파라미터 기반 POST 처리 (@ModelAttribute 생략 가능)
@PostMapping
public String processOrder(
        @Valid Order order,
        Errors errors,
        SessionStatus sessionStatus,
        @AuthenticationPrincipal User user) {

    if (errors.hasErrors()) {
        return "orderForm";
    }

    log.info("order submitted : {}", order);
    order.setUser(user);
    orderRepository.save(order);
    sessionStatus.setComplete();
    return "redirect:/";
}
```

```java
// JSON Body 기반 POST 처리 (@RequestBody 필수)
@PostMapping
public String processOrderJson(
        @Valid @RequestBody Order order,
        Errors errors,
        SessionStatus sessionStatus,
        @AuthenticationPrincipal User user) {

    if (errors.hasErrors()) {
        return "orderForm";
    }
    order.setUser(user);
    orderRepository.save(order);
    sessionStatus.setComplete();
    return "redirect:/";
}
```

### 3. `@PutMapping`, `@PatchMapping`, `@DeleteMapping`
- HTML `<form>` 태그는 기본적으로 `GET`과 `POST`만 지원하지만, RESTful API 설계에서는 용도에 맞는 HTTP Method 애노테이션을 구분해 사용합니다.
  - **`@PutMapping`**: 리소스 **전체 교체(수정)** 요청
  - **`@PatchMapping`**: 리소스 **일부 필드 수정** 요청
  - **`@DeleteMapping`**: 리소스 **삭제** 요청

---

## 파라미터 바인딩 & 응답 관련 주요 애노테이션

### `@RequestParam` vs `@ModelAttribute` vs `@RequestBody`

| 애노테이션 | 수신 데이터 위치 | 내부 동작 원리 | 생략 가능 여부 |
| :--- | :--- | :--- | :--- |
| **`@RequestParam`** | 쿼리 파라미터 / Form 단일 값 | `ConversionService` 타입 변환 | 단순 타입(`String`, `int` 등)일 때 생략 가능 |
| **`@ModelAttribute`** | 쿼리 파라미터 / Form 객체 | `WebDataBinder`를 통해 생성자·Setter에 바인딩 후 `Model`에 자동 등록 | 객체 타입일 때 생략 가능 |
| **`@RequestBody`** | HTTP Message Body (JSON 등) | **`HttpMessageConverter`**(`MappingJackson2HttpMessageConverter`)로 역직렬화 | **생략 불가** |

### `@PathVariable` (경로 변수)
URL 쿼리 스트링(`?tacoNum=1`) 대신 URL 경로 자체의 일부를 변수로 추출할 때 사용합니다. (예: `/tacos/1`)

```java
@GetMapping("/{tacoNum}")
@ResponseBody
public Taco getTaco(@PathVariable Long tacoNum) {
    return tacoRepository.findById(tacoNum).orElseThrow();
}
```

### `@ResponseBody` (HTTP Body 직접 응답)
`ViewResolver`를 통해 HTML 템플릿을 렌더링하는 대신, 반환 객체를 JSON/문자열로 직렬화하여 HTTP 응답 본문에 직접 담아 보냅니다. (`@RestController` = `@Controller` + `@ResponseBody`)

```java
@GetMapping("/list")
@ResponseBody
@ResponseStatus(HttpStatus.OK)
public List<List<Taco>> getTacos(@AuthenticationPrincipal User user) {
    Pageable pageable = PageRequest.of(0, orderProps.getPageSize());
    List<Order> orders = orderRepository.findByUserOrderByPlacedAtDesc(user, pageable);

    return orders.stream()
            .map(Order::getTacos)
            .collect(Collectors.toList());
}
```

> 상태 코드와 커스텀 HTTP 헤더까지 세밀하게 제어해야 한다면 `ResponseEntity<T>`로 감싸 반환하는 것이 좋습니다.

### `RedirectAttributes`
PRG(Post-Redirect-Get) 패턴으로 리다이렉트할 때 경로 변수나 일회성 플래시 메시지(`addFlashAttribute`)를 안전하게 전달할 수 있습니다.

```java
@PostMapping
public String processDesign(
        @Valid Taco design,
        Errors errors,
        RedirectAttributes redirectAttributes) {
    if (errors.hasErrors()) {
        return "design";
    }

    Taco savedTaco = tacoRepository.save(design);
    redirectAttributes.addAttribute("tacoNum", savedTaco.getId());

    return "redirect:/taco/{tacoNum}";
}
```

### 메서드 레벨에서의 `@ModelAttribute`
컨트롤러 내부 메서드 위에 `@ModelAttribute("orders")`를 선언하면, 해당 컨트롤러의 **모든 요청 핸들러가 실행되기 전**에 반환값이 자동으로 `Model`에 담겨 뷰에서 공통으로 사용할 수 있습니다.

```java
@ModelAttribute("orders")
public List<Order> orders(@AuthenticationPrincipal User user) {
    Pageable pageable = PageRequest.of(0, orderProps.getPageSize());
    return orderRepository.findByUserOrderByPlacedAtDesc(user, pageable);
}
```
