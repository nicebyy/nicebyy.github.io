---
title: '[Spring] Springboot 개발 환경 분리 및 Datasource 암호화 하기'
date: '2022-07-06'
category: Spring
tags:
  - application.yml 암호화
  - Datasource 암호화
  - Spring profile 분리
  - Spring 민감정보 암호화
summary: "\U0001F4DD개발 환경 분리하기 > 다른사람과 같이 진행하는 토이프로젝트에서 테스트용 환경과 개발 환경의 DB를 다르게 설정해 놨기 때문에 환경의 분리가 필요했다. 이 때 환경을 application.proerties 나 .yml 을 이용하여 분리를 한다. 기..."
---
# 📝**개발 환경 분리하기**

> **다른사람과 같이 진행하는 토이프로젝트에서 테스트용 환경과 개발 환경의 DB를 다르게 설정해 놨기 때문에 환경의 분리가 필요했다. 이 때 환경을 application.proerties 나 .yml 을 이용하여 분리를 한다.** 

**기존 application.yml**

```java
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
logging.level:
  org.hibernate.SQL: debug
#  org.hibernate.type: trace
```

**AWS RDS 를 개발 db로 사용하기로 해서 기존 H2 DB를 쓰던 환경을 테스트로 두고, 새로 추가한 Postgres DB를 개발 환경으로(test,dev) 분리하기로 하였다.**

**(SpringBoot 2.4 버전 이후로 on-profile 을 이용해야 한다. 기존의 방식은 deprecated 됨)**

**application.yml**

```java
spring:
  profiles:
    active: dev

logging.level:
  org.hibernate.SQL: debug
#  org.hibernate.type: trace
```

**application-test.yml**

```java
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

**application-dev.yml**

```java
server:
  port: 9090

spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: ##DB위치
    username: ##이름
    password: ##패스워드
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        format_sql: true
```

# 📝**DataSource 암호화 하기**

> **그런데 여기서 한 가지 문제는 이 프로젝트가 Git으로 관리 되고 있다는 것이다.**  
> **만약 저 DataSource 그대로 Git에 올려버리면 보안문제는 물론이고 AWS에서 막아버린���.**  
> **.yml 을 gitignore을 통해 안 올리는 방법도 있겠지만 여기선 암호화해서 올리려고 한다.**

## **Jasypt**

> **Jasypt는 민감정보를 암호화 해주는 모듈로, 여기선 민감정보를 암호화 한 뒤에 환경변수로 복호화키를 설정하여 접속할 수 있게 할 것이다.** 

[https://www.devglan.com/online-tools/jasypt-online-encryption-decryption](https://www.devglan.com/online-tools/jasypt-online-encryption-decryption)

 [](https://www.devglan.com/online-tools/jasypt-online-encryption-decryption)
