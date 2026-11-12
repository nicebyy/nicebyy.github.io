---
title: '[Spring] Bean Validation(@Valid, @Validated)과 폼 유효성 검증'
date: '2022-05-24'
category: Backend/Spring
tags:
  - Form Validation
  - '@Valid'
  - '@Validated'
  - BindingResult
  - Thymeleaf
summary: >-
  Spring Boot Validation 의존성 설정부터 @Valid와 @Validated의 차이, Errors/BindingResult를 활용한 에러 핸들링, 그리고 Thymeleaf 폼 검증 에러 바인딩 방법을 정리합니다.
---

## Validation 개요

웹 애플리케이션에서 사용자가 잘못된 형식의 데이터를 입력했을 때 비즈니스 로직이 오작동하거나 DB 무결성이 깨지는 것을 방지하려면, 애플리케이션 진입 지점에서 철저한 **유효성 검증(Validation)**을 수행해야 합니다.

---

## 의존성 및 검증기(@Valid vs @Validated)

Spring Boot에서 Bean Validation을 사용하려면 먼저 스타터 의존성을 추가합니다.

```groovy
// build.gradle
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

내부적으로 사용하는 검증 스펙과 구현체는 다음과 같습니다.
- **표준 스펙 (JSR-303 / JSR-380)**: `javax.validation` (Spring Boot 3+는 `jakarta.validation`) — [Bean Validation Constraints](https://javaee.github.io/javaee-spec/javadocs/javax/validation/constraints/package-summary.html)
- **구현체 (Hibernate Validator)**: 표준 스펙 + `@CreditCardNumber` 등 확장 검증 애노테이션 제공 — [Hibernate Validator Docs](https://docs.jboss.org/hibernate/validator/6.2/reference/en-US/html_single/#section-builtin-constraints)

### `@Valid` vs `@Validated` 비교

| 구분 | `@Valid` | `@Validated` |
| :--- | :--- | :--- |
| **출처** | Java 표준 스펙 (`javax`/`jakarta.validation`) | Spring 프레임워크 제공 (`org.springframework.validation.annotation`) |
| **주요 적용 범위** | 주로 컨트롤러(`ArgumentResolver`) 단에서 객체 검증 | AOP 기반으로 `@Service` 등 **다른 계층 메서드 파라미터 검증**도 가능 |
| **특징** | 표준 인터페이스 호환 | **검증 그룹(Validation Groups)** 지정 기능 지원 |

실제 검증 작업은 스프링이 자동 등록하는 `LocalValidatorFactoryBean`이 도메인/DTO 클래스에 선언된 애노테이션을 스캔해 수행합니다.

---

## 검증 규칙 선언 예시

```java
package springinaction.tacos.entity;

import lombok.Data;
import org.hibernate.validator.constraints.CreditCardNumber;

import javax.validation.constraints.Digits;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class Order {

    @NotBlank(message = "Name is required")
    private String deliveryName;

    @NotBlank(message = "Street is required")
    private String deliveryStreet;

    @NotBlank(message = "City is required")
    private String deliveryCity;

    @NotBlank(message = "State is required")
    private String deliveryState;

    @NotBlank(message = "Zip code is required")
    private String deliveryZip;

    // Hibernate Validator 확장 애노테이션
    @CreditCardNumber(message = "Not a valid credit card number")
    private String ccNumber;

    @Pattern(regexp = "^(0[1-9]|1[0-2])([\\/])([1-9][0-9])$",
             message = "Must be formatted MM/YY")
    private String ccExpiration;

    @Digits(integer = 3, fraction = 0, message = "Invalid CVV")
    private String ccCVV;
}
```

```java
package springinaction.tacos.entity;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

@Data
public class Taco {

    @NotBlank
    @Size(min = 5, message = "최소 5글자 필요")
    private String name;

    @Size(min = 1, message = "최소 하나 이상의 재료 필요")
    private List<String> ingredients;
}
```

---

## 폼 바인딩과 `Errors` / `BindingResult` 처리

컨트롤러 메서드 파라미터에 `@Valid`를 붙이고 바로 뒤에 `Errors`(또는 하위 인터페이스인 `BindingResult`)를 선언하면, 검증 실패 시 예외를 즉시 던지지 않고 에러 객체에 오류 내역을 담아 컨트롤러 로직에서 제어할 수 있습니다.

```java
@PostMapping
public String processDesign(@Valid Taco design, Errors errors) {
    if (errors.hasErrors()) {
        List<FieldError> list = errors.getFieldErrors();
        list.forEach(e -> log.error(e.getDefaultMessage()));

        return "design"; // 검증 실패 시 입력 폼 뷰로 되돌림
    }

    log.info("Processing design: " + design);
    return "redirect:/orders/current";
}
```

> **`BindingResult`의 `FieldError`와 `GlobalError`**:
> - **`FieldError`**: 특정 필드의 데이터 바인딩이나 애노테이션 유효성 검증에 실패했을 때 생성되는 오류
> - **`GlobalError` (`ObjectError`)**: 단일 필드가 아니라 복합 조건이나 비즈니스 로직상 발생한 전역 오류 (`bindingResult.reject(...)`로 추가)
> - **주의**: `BindingResult` 파라미터가 `@Valid` 객체 **바로 뒤**에 위치하지 않으면 타입 변환 실패나 검증 실패 시 컨트롤러 메서드가 호출되지 않고 `400 Bad Request` 예외(`MethodArgumentNotValidException` 등)가 바로 발생합니다.

### 검증 실패 시 로그 출력 예시

```text
2022-05-15 02:27:10.705  INFO 11824 --- [nio-8080-exec-7] s.t.web.controller.DesignTacoController  : Processing design: Taco(name=12345, ingredients=[FLTO, GRBF, CHED, TMTO, SLSA])
2022-05-15 02:27:18.455 ERROR 11824 --- [nio-8080-exec-1] s.tacos.web.controller.OrderController   : Must be formatted MM/YY
2022-05-15 02:27:18.456 ERROR 11824 --- [nio-8080-exec-1] s.tacos.web.controller.OrderController   : Not a valid credit card number
```

---

## Thymeleaf에서 검증 오류 메시지 표시하기

검증에 실패해 다시 폼 화면으로 돌아갈 때, 사용자가 이전에 입력했던 값을 유지하면서 오류 필드 옆에만 안내 문구를 노출하려면 Thymeleaf의 `#fields` 유틸리티를 활용합니다.

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Taco Cloud</title>
    <link rel="stylesheet" th:href="@{/css/styles.css}"/>
</head>
<body>

<form method="POST" th:action="@{/orders}" th:object="${order}">
    <h1>Order your taco creations!</h1>

    <img th:src="@{/images/TacoCloud.png}"/>
    <a th:href="@{/design}" id="another">Design another taco</a><br/>

    <div th:if="${#fields.hasErrors()}">
        <span class="validationError">Please correct the problems below and resubmit.</span>
    </div>

    <h3>Deliver my taco masterpieces to...</h3>

    <label for="deliveryName">Name: </label>
    <input type="text" id="deliveryName" th:field="*{deliveryName}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('deliveryName')}"
          th:errors="*{deliveryName}">Name Error</span>
    <br/>

    <label for="deliveryStreet">Street address: </label>
    <input type="text" id="deliveryStreet" th:field="*{deliveryStreet}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('deliveryStreet')}"
          th:errors="*{deliveryStreet}">Street Error</span>
    <br/>

    <label for="deliveryCity">City: </label>
    <input type="text" id="deliveryCity" th:field="*{deliveryCity}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('deliveryCity')}"
          th:errors="*{deliveryCity}">City Error</span>
    <br/>

    <label for="deliveryState">State: </label>
    <input type="text" id="deliveryState" th:field="*{deliveryState}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('deliveryState')}"
          th:errors="*{deliveryState}">State Error</span>
    <br/>

    <label for="deliveryZip">Zip code: </label>
    <input type="text" id="deliveryZip" th:field="*{deliveryZip}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('deliveryZip')}"
          th:errors="*{deliveryZip}">Zip Error</span>
    <br/>

    <h3>Here's how I'll pay...</h3>
    <label for="ccNumber">Credit Card #: </label>
    <input type="text" id="ccNumber" th:field="*{ccNumber}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('ccNumber')}"
          th:errors="*{ccNumber}">CC Num Error</span>
    <br/>

    <label for="ccExpiration">Expiration: </label>
    <input type="text" id="ccExpiration" th:field="*{ccExpiration}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('ccExpiration')}"
          th:errors="*{ccExpiration}">Expiration Error</span>
    <br/>

    <label for="ccCVV">CVV: </label>
    <input type="text" id="ccCVV" th:field="*{ccCVV}"/>
    <span class="validationError"
          th:if="${#fields.hasErrors('ccCVV')}"
          th:errors="*{ccCVV}">CVV Error</span>
    <br/>

    <input type="submit" value="Submit order"/>
</form>
</body>
</html>
```

### 주요 Thymeleaf 검증 속성 정리
- `th:field="*{필드명}"`: `id`, `name`, `value` 속성을 객체 필드에 자동 바인딩 (오류 발생 시 기존 입력 값 유지)
- `th:if="${#fields.hasErrors('필드명')}"`: 해당 필드에 검증 오류가 존재할 때만 태그 렌더링
- `th:errors="*{필드명}"`: 발생한 검증 오류 메시지 출력
- `th:errorclass="fieldError"`: 해당 필드에 오류가 있을 경우 지정한 CSS 클래스를 자동으로 추가

---

> 참고 도서: *스프링 인 액션 (Spring in Action)*
