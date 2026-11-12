---
title: >-
  [Spring] java.lang.NoSuchFieldError: Class
  com.sun.tools.javac.tree.JCTree$JCImport
date: '2023-10-29'
category: Backend/Spring
tags:
  - lombok 빌드실패
summary: >-
  !Spring java.lang.NoSuchFieldError: Class
  com.sun.tools.javac.tree.JCTree$JCImport ... 이미지
  1(/images/posts/spring-nosuchfielderror-jcimpor...
---
![\[Spring\] java.lang.NoSuchFieldError: Class com.sun.tools.javac.tree.JCTree$JCImport ... 이미지 1](/images/posts/spring-nosuchfielderror-jcimport/image-1.png)

스프링부트를 안 쓰고 간단한 라이브러리를 만드는 도중 다음과 같은 문제 발생.

What went wrong:  
Execution failed for task ':compileJava'.  
\> java.lang.NoSuchFieldError: Class co[http://m.sun.tools.javac.tree.JCTree$JCImport](http://m.sun.tools.javac.tree.JCTree$JCImport) does not have member field 'co[http://m.sun.tools.javac.tree.JCTree](http://m.sun.tools.javac.tree.JCTree) qualid'

![\[Spring\] java.lang.NoSuchFieldError: Class com.sun.tools.javac.tree.JCTree$JCImport ... 이미지 2](/images/posts/spring-nosuchfielderror-jcimport/image-2.png)

환경변수로 자바 버전이 21 이상인 경우에 gradle build 하니깐 자꾸 실패하길래 관련 글 서칭

[https://github.com/projectlombok/lombok/issues/3393](https://github.com/projectlombok/lombok/issues/3393)

 [](https://github.com/projectlombok/lombok/issues/3393)
