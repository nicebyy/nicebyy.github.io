---
title: '[Spring] Spring 컨테이너 구조와 Bean 등록 전략 (자동 vs 수동)'
date: '2022-05-07'
category: Backend/Spring
tags:
  - Spring 구조
  - ApplicationContext
  - DI 컨테이너
  - CGLIB
  - Bean 등록
summary: >-
  스프링 애플리케이션의 핵심인 ApplicationContext DI 컨테이너와 빈(Bean) 등록 방식, @Configuration의 CGLIB 프록시 싱글톤 보장 원리, 그리고 수동/자동 빈 등록 기준을 정리합니다.
---

## 스프링 컨테이너(ApplicationContext)의 구조

스프링 애플리케이션은 기본적으로 수많은 **컴포넌트(Component / Bean)** 간의 의존성 주입(DI)과 상호작용으로 동작합니다. 이 객체들의 생성, 생명주기, 의존관계를 관리하는 중심 컨테이너가 바로 **`ApplicationContext`**입니다.

---

## Java Config 기반 Bean 등록과 CGLIB 싱글톤 보장

`@Configuration` 애노테이션이 붙은 설정 클래스 내부에서 `@Bean` 메서드를 정의하면 스프링 컨테이너에 빈이 등록됩니다.

```java
@Configuration // @Configuration 내부에도 @Component가 포함되어 있음
public class AppConfig {

    @Bean
    public UserService userService() {
        return new UserService(userRepository());
    }

    @Bean
    public UserRepository userRepository() {
        return new UserRepository();
    }
}
```

스프링 컨테이너는 등록된 빈을 내부적으로 **빈 이름(Key) — 빈 객체(Value)** 맵 형태로 보관합니다.

| 빈 이름 (Bean Name) | 빈 객체 참조 (Singleton Instance) |
| :--- | :--- |
| `userService` | `UserService@x01` |
| `userRepository` | `UserRepository@x02` |

### 등록된 빈 클래스 확인 (`EnhancerBySpringCGLIB`)

실제로 스프링 컨테이너에서 `AppConfig` 빈을 조회해 클래스 타입을 출력해 보면 흥미로운 결과를 볼 수 있습니다.

```java
ApplicationContext ac = new AnnotationConfigApplicationContext(AppConfig.class);

AppConfig bean = ac.getBean(AppConfig.class);
System.out.println("bean = " + bean.getClass());
// 출력: class hello.core.AppConfig$$EnhancerBySpringCGLIB$$bd479d70
```

> **왜 `CGLIB` 프록시 객체가 출력될까?**  
> 순수 자바 코드만 보면 `userService()` 호출 시 `userRepository()`가 호출되어 매번 `new UserRepository()`가 새로 생성될 것처럼 보입니다. 하지만 스프링은 **`CGLIB` 바이트코드 조작 라이브러리를 통해 `AppConfig`를 상속받은 프록시 클래스를 만들어 등록**함으로써, 이미 컨테이너에 등록된 빈이 있으면 새로 생성하지 않고 기존 인스턴스를 반환하여 **싱글톤(Singleton)을 완벽히 보장**합니다.

---

## 자동 빈 등록 vs 수동 빈 등록

스프링은 `@Autowired`(생성자 주입 권장)를 통해 컨테이너에 등록된 빈을 필요한 곳에 자동으로 주입해 줍니다. 빈을 등록하는 방식은 크게 두 가지로 나뉩니다.

- **자동 빈 등록**: `@Component` 및 이를 상속한 `@Service`, `@Repository`, `@Controller`, `@RestController`를 컴포넌트 스캔(`@ComponentScan`)으로 자동 등록
- **수동 빈 등록**: `@Configuration` 클래스 안에서 `@Bean`을 선언해 직접 객체를 생성·반환하여 등록

### 실무에서의 수동 빈 등록 기준

애플리케이션의 빈은 역할에 따라 **업무 로직(비즈니스 빈)**과 **기술 지원 로직(인프라 빈)**으로 나눌 수 있습니다.

| 구분 | 대상 | 권장 빈 등록 방식 | 이유 |
| :--- | :--- | :--- | :--- |
| **업무 로직 빈** | `Controller`, `Service`, `Repository` | **자동 빈 등록 (`@Component`)** | 비즈니스 요구사항에 따라 수가 많고 유사한 패턴을 가지므로 컴포넌트 스캔이 생산적이며 문제 지점 파악도 용이함 |
| **기술 지원 빈** | DB 커넥션 설정, 공통 로깅, AOP, 보안(Security) 설정 | **수동 빈 등록 (`@Configuration` + `@Bean`)** | 애플리케이션 전반(횡단 관심사)에 광범위하게 영향을 미치므로 설정 파일 한곳에서 명확하게 드러나도록 관리하는 것이 유지보수에 유리함 |

---

> 참고: 인프런 *스프링 핵심 원리 - 기본편*, 도서 *스프링 인 액션*
