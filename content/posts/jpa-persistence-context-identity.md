---
title: '[JPA] 영속성 컨텍스트와 동일성보장'
date: '2022-02-28'
category: Backend/JPA
tags:
  - JPA 변경감지
  - JPA 엔티티 동일성
  - JPA 엔티티 수정
  - 영속성컨텍스트
  - 인프런 JPA 1편
  - 인프런 김영한 강사님
summary: >-
  혼자 스프링 토이프로젝트를 만들면서 JPA를 사용하던도중 엔티티간의 동일성에 대해 궁금증이 생겼다. !JPA 영속성 컨텍스트와 동일성보장
  이미지 1(/images/posts/jpa-persistence-context-identity/image-1....
---
**혼자 스프링 토이프로젝트를 만들면서 JPA를 사용하던도중 엔티티간의 동일성에 대해 궁금증이 생겼다.**

![\[JPA\] 영속성 컨텍스트와 동일성보장 이미지 1](/images/posts/jpa-persistence-context-identity/image-1.png)

**우선 , Member 엔티티를 하나 생성을 해서 저장 한 다음 그 ID값으로 find를 실행했을때** 

**출력되는 값은 같음을 확인하였다.**

**하지만**

**만약 영속성 컨텍스트를 벗어난다면 ( entityManager를 flush,clear를 시킴 )**

**같은 ID같으로 조회해서 가져온 엔티티는**

![\[JPA\] 영속성 컨텍스트와 동일성보장 이미지 2](/images/posts/jpa-persistence-context-identity/image-2.png)

**보다시피 불 일치가 나온다. 같은 객체가 아니라는것.**

**이는 , 같은 엔티티라는 보장을 해 줄때 수정관련 작업에서 변경감지를 쿼리가 나가기전에** 

**1차캐시에서 비교를 먼저 해 주고 만약 변경된 값이 있다면 데이터를 변경시키고 쿼리가 나가지만**

**영속성을 보장받지 못하면 다른 엔티티이기 때문에 변경감지가 동작하지 않는다.**

**\=> 같은 ID값으로 찾아와도 다른 객체이다..!**

**밑의 사진은 Member를 저장한 후 EntiryManager를 flush(),clear() 를 시켜서**

**영속상태를 벗긴 엔티티를 수정한 후의 결과이다.**

![\[JPA\] 영속성 컨텍스트와 동일성보장 이미지 3](/images/posts/jpa-persistence-context-identity/image-3.png)

**분명 주소를 수정을 했는데도 수정이 안되어있음!**

**그럼 어떻게 ..?**

**\=> 변경감지가 동작하기위해선 영속상태여야 된다. => 먼저 조회쿼리로 1차캐시로 끌로와서 영속화 시켜야함.**

![\[JPA\] 영속성 컨텍스트와 동일성보장 이미지 4](/images/posts/jpa-persistence-context-identity/image-4.png)
