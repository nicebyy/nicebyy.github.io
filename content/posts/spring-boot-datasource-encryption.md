---
title: '[Spring] Spring Boot 개발 환경(Profile) 분리 및 Jasypt DataSource 암호화'
date: '2022-07-06'
category: Backend/Spring
tags:
  - Spring Profile
  - application.yml 암호화
  - Jasypt
  - DataSource 보안
summary: >-
  Spring Boot 2.4+의 config.activate.on-profile 문법을 활용해 테스트(H2)와 개발(PostgreSQL/RDS) 환경을 분리하고, Git 저장소에 DB 접속 정보가 평문 노출되지 않도록 Jasypt로 민감정보를 암호화하는 방법을 정리합니다.
---

## 개발 환경 분리 (Spring Profile)

팀원들과 토이 프로젝트를 진행하면서 로컬 테스트용 DB(H2)와 공용 개발용 DB(AWS RDS PostgreSQL)를 다르게 구성해야 했습니다. 하나의 `application.yml`에 모든 설정을 섞어두면 환경 전환 시 실수가 잦아지므로, **Spring Profile**을 기준으로 설정 파일을 분리했습니다.

### 기존 단일 `application.yml`

```yaml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/~/gubun
    username: sa
    password:
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    org.hibernate.SQL: debug
```

---

### Profile별 YAML 파일 분리 (Spring Boot 2.4+ 기준)

> **주의**: Spring Boot 2.4 이후부터는 기존 `spring.profiles` 속성이 deprecated 되었고, **`spring.config.activate.on-profile`** 문법을 사용해야 합니다.

#### 1. 공통 `application.yml` (활성 프로파일 지정)
```yaml
spring:
  profiles:
    active: dev

logging:
  level:
    org.hibernate.SQL: debug
```

#### 2. 테스트 환경 `application-test.yml` (로컬 H2)
```yaml
server:
  port: 8080

spring:
  config:
    activate:
      on-profile: test
  datasource:
    url: jdbc:h2:tcp://localhost/~/gubun
    username: sa
    password:
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
        format_sql: true
```

#### 3. 개발 환경 `application-dev.yml` (PostgreSQL / AWS RDS)
```yaml
server:
  port: 9090

spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:postgresql://<RDS-ENDPOINT>:5432/<DB_NAME>
    username: <USERNAME>
    password: <PASSWORD>
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        format_sql: true
```

---

## DataSource 민감 정보 암호화 (Jasypt)

환경 분리는 깔끔하게 끝났지만, 한 가지 큰 보안 문제가 남아있었습니다. 바로 **이 프로젝트가 GitHub(특히 Public 저장소)으로 관리된다는 점**입니다.

DB URL, Username, Password나 AWS 키가 평문으로 Git에 커밋되면 심각한 보안 사고로 이어질 수 있습니다. `.gitignore`로 yml 파일 자체를 제외할 수도 있지만, 팀원 간 설정 구조를 공유하면서도 민감 값만 보호하기 위해 **Jasypt(Java Simplified Encryption)** 모듈을 적용했습니다.

### 1. 의존성 추가 (`build.gradle`)
```groovy
implementation 'com.github.ulisesbocchio:jasypt-spring-boot-starter:3.0.5'
```

### 2. 암호화 문자열 생성 및 YAML 적용
Jasypt 암복호화 도구([Devglan Jasypt Online Tool](https://www.devglan.com/online-tools/jasypt-online-encryption-decryption) 또는 단위 테스트 코드)를 사용해 마스터 비밀키(`secretKey`)로 DB 접속 정보를 암호화한 뒤 `ENC(...)` 형식으로 감싸 넣어줍니다.

```yaml
spring:
  datasource:
    url: ENC(rK8x...암호화된_URL...)
    username: ENC(mP2q...암호화된_계정...)
    password: ENC(z9Lp...암호화된_비밀번호...)
```

### 3. 실행 시 환경변수로 복호화 키 주입
실제 암호화를 해제하는 마스터 키(`jasypt.encryptor.password`)는 코드에 절대 적지 않고, 애플리케이션 실행 시 환경변수나 JVM 옵션으로만 전달합니다.

```bash
java -jar -Djasypt.encryptor.password=MY_SECRET_KEY app.jar
```

이 방식을 사용하면 Git 저장소에 설정 파일을 그대로 올려 팀원들과 스키마/옵션을 공유하면서도, 민감한 인증 정보는 안전하게 보호할 수 있습니다.
