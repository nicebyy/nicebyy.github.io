---
title: '[Spring] JDK 21+ 환경에서 Lombok NoSuchFieldError: JCTree$JCImport 빌드 에러 해결'
date: '2023-10-29'
category: Backend/Spring
tags:
  - Lombok
  - JDK 21
  - Gradle
  - NoSuchFieldError
  - 트러블슈팅
summary: >-
  JDK 21 이상 환경에서 Gradle 빌드 시 구버전 Lombok 어노테이션 프로세서가 javac 내부 AST API(JCTree$JCImport.qualid)와 충돌하여 발생하는 NoSuchFieldError 원인과 해결 방법을 정리합니다.
---

## 문제 상황

Spring Boot 스타터의 자동 의존성 관리를 쓰지 않고 순수 Java/Spring 기반의 간단한 라이브러리를 구성한 뒤 Gradle 빌드를 실행하던 중 컴파일 단계에서 다음과 같은 오류가 발생했습니다.

![Gradle compileJava 빌드 실패](/images/posts/spring-nosuchfielderror-jcimport/image-1.png)

```text
What went wrong:
Execution failed for task ':compileJava'.
> java.lang.NoSuchFieldError: Class com.sun.tools.javac.tree.JCTree$JCImport does not have member field 'com.sun.tools.javac.tree.JCTree qualid'
```

![JDK 21 환경 에러 상세 로그](/images/posts/spring-nosuchfielderror-jcimport/image-2.png)

---

## 원인 분석

로컬 환경변수(`JAVA_HOME`)의 Java 버전이 **JDK 21 이상**일 때 구버전 **Lombok**(`1.18.28` 이하)을 함께 사용하면 발생하는 대표적인 호환성 충돌 에러입니다.

- Lombok은 컴파일 타임에 어노테이션 프로세서로 동작하면서 `javac` 컴파일러 내부 비공개 AST API(`com.sun.tools.javac.tree.JCTree$JCImport`)를 직접 참조합니다.
- **JDK 21**부터 `JCTree$JCImport` 클래스의 `qualid` 필드 타입이 기존 `JCTree`에서 `JCTree.JCFieldAccess`로 변경되면서, 예전 시그니처를 기대하고 있던 구버전 Lombok이 필드를 찾지 못해 `NoSuchFieldError`를 던지게 됩니다.

> 참고 이슈: [lombok/issues/3393](https://github.com/projectlombok/lombok/issues/3393)

---

## 해결 방법

### 1. Lombok 버전을 `1.18.30` 이상으로 업그레이드 (권장)

JDK 21의 `javac` 변경 사항이 정식 반영된 **Lombok `1.18.30` 이상** 버전으로 의존성을 올려주면 즉시 해결됩니다.

```groovy
// build.gradle
dependencies {
    compileOnly 'org.projectlombok:lombok:1.18.34'
    annotationProcessor 'org.projectlombok:lombok:1.18.34'

    testCompileOnly 'org.projectlombok:lombok:1.18.34'
    testAnnotationProcessor 'org.projectlombok:lombok:1.18.34'
}
```

### 2. Gradle Java Toolchain으로 컴파일 JDK 버전 명시

만약 레거시 프로젝트 특성상 Lombok 버전을 올릴 수 없는 경우라면, `build.gradle`에 Java Toolchain을 명시하여 JDK 17 등으로 컴파일하도록 고정할 수 있습니다.

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}
```
