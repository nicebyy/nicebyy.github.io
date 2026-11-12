---
title: '[JPA] (Auditing) @LastModifiedDate 동작 안함'
date: '2022-03-03'
category: JPA
tags:
  - '@LastModifiedDate'
  - auditing
  - JPA
  - 벌크성쿼리 추적
summary: >-
  !JPA (Auditing) @LastModifiedDate 동작 안함 이미지
  1(/images/posts/jpa-auditing-lastmodifieddate/image-1.png) 엔티티에 대해 ​변경추적 이력을
  넣고싶어서 JPA의 Auditi...
---
![\[JPA\] (Auditing) @LastModifiedDate 동작 안함 이미지 1](/images/posts/jpa-auditing-lastmodifieddate/image-1.png)

 **엔티티에 대해 ​변경추적 이력을 넣고싶어서 JPA의 Auditing기능을 쓰는 과정에 이상한 점을 찾았다.​**

**​@LastModifiedDate만 동작을 안함..**

**이게 뭐지..? 하다가 엔티티 하나만 수정해보니 동작은 하는데**

![\[JPA\] (Auditing) @LastModifiedDate 동작 안함 이미지 2](/images/posts/jpa-auditing-lastmodifieddate/image-2.png)

**문제는 Item들이 전체 세일을 할때 동작을 안함 .. (2~12는 전체할인 기능동작 , 13는 하나만 수정)**

**아마 전체 할인 기능을 사용할 때 벌크성 쿼리를 날리는 과정에 DB에 바로 때려박아서**

**변경감지를 못하기 때문에 그런게 아닐까 싶다.**

![\[JPA\] (Auditing) @LastModifiedDate 동작 안함 이미지 3](/images/posts/jpa-auditing-lastmodifieddate/image-3.png)

**찾아보니 맞는거 같다..**

**어쩔수 없이 TimeEntity에 별도의 로직을 추가 한 뒤에 벌크쿼리를 날리기전에 전체 업데이트 한번 한 뒤에 실행하니**

**수정날짜 바꾸기 동작함**

![\[JPA\] (Auditing) @LastModifiedDate 동작 안함 이미지 4](/images/posts/jpa-auditing-lastmodifieddate/image-4.png)

![\[JPA\] (Auditing) @LastModifiedDate 동작 안함 이미지 5](/images/posts/jpa-auditing-lastmodifieddate/image-5.png)

**결론 : 벌크성 쿼리는 추적할 생각하지말거나 직접 넣어주는 로직을 짜야함**
