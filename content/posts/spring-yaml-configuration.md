---
title: '[Spring] YAML(YML) 문법과 Spring Boot 설정(@ConfigurationProperties, Profile) 정리'
date: '2022-06-07'
category: Backend/Spring
tags:
  - YAML
  - Spring Boot 설정
  - ConfigurationProperties
  - Profile
  - properties vs yml
summary: >-
  YAML(YML)의 기본 문법과 자료형, Spring Boot에서 @ConfigurationProperties와 Profile로 환경별 설정을 관리하는 방법, 그리고 .properties 파일과 비교했을 때의 장단점을 정리합니다.
---

## YAML(YML)이란?

**YAML**은 사람이 쉽게 읽고 쓸 수 있는 데이터 직렬화 양식입니다. 초기에는 *Yet Another Markup Language*라는 이름이었으나, 마크업 언어가 아닌 **데이터 중심 규격**임을 강조하기 위해 ***YAML Ain't Markup Language***라는 재귀적 약자로 바뀌었습니다.

### YAML의 3가지 장점

1. **우수한 가독성**: XML의 닫는 태그나 JSON의 괄호(`{}`), 쉼표(`,`) 없이 들여쓰기 기반 계층 구조로 표현되어 직관적입니다.
2. **명확한 자료형 지원**: 스칼라(문자열·숫자·불리언), 리스트(배열), 맵(객체) 구조를 깔끔하게 표현합니다.
3. **주석 작성 가능**: JSON과 달리 `#` 기호로 자유롭게 주석을 달 수 있어 설정 의도를 문서화하기 좋습니다.

![YAML 계층 구조와 가독성 비교](/images/posts/spring-yaml-configuration/image-1.png)

---

## YAML 기본 문법과 자료형

### 1. 스칼라(Scalar) & 배열(List)
```yaml
youtube:
  channel:
    - penbird
    - kyleschool
    - habithackers
```

### 2. 맵(Map / Object) & 주석(`#`)
```yaml
youtube: # 유튜브 설정
  channel: # 채널 목록
    - name: penbird # 채널명
      type: ["keyboard and hand writings", "review"]
    - name: kyleschool
      type: ["data science and engineering", "tutorial"]
    - name: habithackers
      type: ["productivity", "training"]
```

---

## Spring Boot에서의 YAML 활용

### 1. `@ConfigurationProperties`로 타입 안전한 설정 바인딩

YAML에 정의한 설정 값을 자바 객체(Bean)의 필드에 자동으로 매핑하고, `@Validated`와 함께 실행 시점 유효성 검증까지 수행할 수 있습니다.

```java
@Component
@ConfigurationProperties(prefix = "taco.orders")
@Data
@Validated
public class OrderProps {

    @Range(min = 5, max = 25, message = "must be in 5~25")
    private int pageSize = 20;
}
```

```yaml
taco:
  orders:
    pageSize: 10
```

Spring Boot는 내부적으로 `spring-configuration-metadata.json` 메타데이터를 기반으로 IDE 자동완성과 `DataSourceProperties` 같은 수많은 기본 설정 바인딩을 제공합니다.

```json
{
  "properties": [
    {
      "name": "spring.profiles.active",
      "type": "java.util.List<java.lang.String>",
      "description": "Comma-separated list of active profiles."
    }
  ]
}
```

```java
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties implements BeanClassLoaderAware, InitializingBean {
    private ClassLoader classLoader;
    private boolean generateUniqueName = true;
    private String name;
    private Class<? extends DataSource> type;
    private String driverClassName;
    private String url;
    private String username;
    private String password;
    // ...
}
```

### 2. Profile 분리 (`prod`, `test`)

운영(`prod`)과 테스트(`test`) 환경의 DB 연결 정보나 JPA `ddl-auto` 옵션을 파일별로 분리해 안전하게 관리할 수 있습니다.

#### `application-prod.yml` (운영 환경)
```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/shop?serverTimezone=Asia/Seoul
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: org.mariadb.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: none
```

#### `application-test.yml` (테스트 환경)
```yaml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/D:/db/h2/taco
    username: sa
    password:
    driver-class-name: org.h2.Driver
```

---

## `.properties` vs `.yml` 비교 및 주의사항

`.properties`는 매 줄마다 접두사를 반복해야 하지만, `.yml`은 중복을 제거해 훨씬 간결합니다.

```properties
# application.properties
spring.datasource.driverClassName=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
spring.datasource.url=jdbc:log4jdbc:mariadb://localhost:3306/test?characterEncoding=UTF-8&serverTimezone=UTC
spring.datasource.hikari.username=root
spring.datasource.hikari.password=1234
spring.datasource.hikari.maximum-pool-size=10
```

```yaml
# application.yml
spring:
  datasource:
    driverClassName: net.sf.log4jdbc.sql.jdbcapi.DriverSpy
    url: jdbc:log4jdbc:mariadb://localhost:3306/test?characterEncoding=UTF-8&serverTimezone=UTC
    hikari:
      username: root
      password: 1234
      maximum-pool-size: 10
```

### YAML의 한계점: `@PropertySource` 미지원

`.properties` 파일은 클래스 상단에 `@PropertySource` 애노테이션을 붙여 임의의 설정 파일을 바로 불러올 수 있지만, **Spring 기본 `@PropertySource`는 `.yml` 포맷을 직접 로드하지 못합니다** (별도 `YamlPropertySourceFactory` 커스텀이 필요함).

```java
@Configuration
@PropertySource("classpath:/com/taco/application.properties")
public class AppConfig {

    @Autowired
    private Environment env;

    @Bean
    public TestBean testBean() {
        TestBean testBean = new TestBean();
        testBean.setName(env.getProperty("testbean.name"));
        return testBean;
    }
}
```

또한 메시지 국제화(`messages.properties`) 등 일부 기능은 `.properties`를 기본으로 사용합니다. (자세한 설정 우선순위 및 변환 방법은 [Spring Boot Externalized Configuration 공식 문서](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#boot-features-external-config)를 참고하세요.)

---

## 참고: Spring Boot 설정 프로퍼티 우선순위 (높은 순)

동일한 키가 여러 곳에 정의되어 있을 경우 아래 순서대로 덮어쓰기가 적용됩니다.

1. 유저 홈 디렉토리의 `spring-boot-dev-tools.properties`
2. 테스트 코드의 `@TestPropertySource`
3. `@SpringBootTest(properties = ...)` 애노테이션 속성
4. 커맨드 라인 인자 (`--server.port=9090`)
5. `SPRING_APPLICATION_JSON` 환경 변수
6. `ServletConfig` / `ServletContext` 초기 파라미터
7. `java:comp/env` JNDI 속성
8. Java 시스템 프로퍼티 (`System.getProperties()`, `-D...`)
9. OS 환경 변수
10. `RandomValuePropertySource` (`random.*`)
11. **JAR 외부**의 프로파일별 설정 (`application-{profile}.yml/properties`)
12. **JAR 내부**의 프로파일별 설정 (`application-{profile}.yml/properties`)
13. **JAR 외부**의 기본 설정 (`application.yml/properties`)
14. **JAR 내부**의 기본 설정 (`application.yml/properties`)
15. `@Configuration` 클래스의 `@PropertySource`
16. `SpringApplication.setDefaultProperties` 기본 프로퍼티
