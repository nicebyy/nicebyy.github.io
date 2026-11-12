---
title: >-
  [JPA] org.springframework.beans.factory.UnsatisfiedDependencyException: Error
  creating bean with name
date: '2022-04-10'
category: Backend/JPA
tags:
  - JpaCustomRepository
summary: >-
  !JPA org.springframework.beans.factory.UnsatisfiedDependencyException: Error
  creating bean with name 이미지 1(/images/posts/jpa-unsatisfied-d...
---
![\[JPA\] org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 이미지 1](/images/posts/jpa-unsatisfied-dependency-exception/image-1.png)

> **JPA로 작성되었던 기존 CustomRepository Interface를 상속받은 RepositoryImpl을**  
> **QueryDsl 로 복잡한 쿼리를 해결하고 V2로 넘어가는 과정에서 문제가 발생하였다.**  
>   
> **기존 OrderRepositoryImpl를 남기고 싶어서 v1,v2 따로 나누기위해 Class 이름 뒤에 v1을 남기고**  
> **QueryDsl로 작성한 Repository의 뒤에 v2로 작성하여 돌렸더니 ..** 

![\[JPA\] org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 이미지 2](/images/posts/jpa-unsatisfied-dependency-exception/image-2.png)

> **두 시간 삽질을 했다 .. 쿼리가 잘 못 됬는지 확인해보고, 애노테이션도 확인해보고 삽질이란 삽질은 다 했다가**  
> **Repository 자체가 문제란걸 깨닫고 CustomRepository 규칙을 다시 보았다.**  
>   
> **기본 Impl으로 설정되어있는 접미사가 있어야 있어야 Bean을 만드는 규칙이 있었다.**  
> **그리고 리플렉션 api 같은 걸 써서 bean을 등록하고 돌아가기 때문.**

![\[JPA\] org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 이미지 3](/images/posts/jpa-unsatisfied-dependency-exception/image-3.png)

![\[JPA\] org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 이미지 4](/images/posts/jpa-unsatisfied-dependency-exception/image-4.png)

**결론 : Impl 꼭 붙일것.. Custom에 목 매이지 말고 그냥 별도의 Repository 로 따로 빼서 빈으로 만드는 게 더 나을수도**
