---
title: '[SpringSecurity] 권한 설정 hasRole 오류와 prefix'
date: '2022-06-02'
category: Backend/Spring
tags:
  - 스프링시큐리티 hasrole
summary: >-
  스프링시큐리티를 공부하던 도중 책에서 이런 코드가 있었다. SecutiryConfig 구성 클래스 안에서 configure를
  orverride 하는 코드이다. !SpringSecurity 권한 설정 hasRole 오류와 prefix 이미지 1(/i...
---
**스프링시큐리티를 공부하던 도중 책에서 이런 코드가 있었다.**

**SecutiryConfig 구성 클래스 안에서 configure를 orverride 하는 코드이다.**

![\[SpringSecurity\] 권한 설정 hasRole 오류와 prefix 이미지 1](/images/posts/spring-security-hasrole-prefix/image-1.png)

**.hasRole() 을 호출할 때 ROLE\_USER 로 설정하는것.**

**그리고 이는 밑의 코드와 동일하게 돌아간다고**

![\[SpringSecurity\] 권한 설정 hasRole 오류와 prefix 이미지 2](/images/posts/spring-security-hasrole-prefix/image-2.png)

**하지만 막상 돌려보면 ?** 

![\[SpringSecurity\] 권한 설정 hasRole 오류와 prefix 이미지 3](/images/posts/spring-security-hasrole-prefix/image-3.png)

??????

**오류를 찾아봤더니 친절하게 설명을 해준다.**

![\[SpringSecurity\] 권한 설정 hasRole 오류와 prefix 이미지 4](/images/posts/spring-security-hasrole-prefix/image-4.png)

**ROLE\_ 은 자동생성해주니깐 prefix의 ROLE\_ 을 쓰지말라고 ..**

**hasRole()의 내부는 이렇게 생겨먹었다.**

![\[SpringSecurity\] 권한 설정 hasRole 오류와 prefix 이미지 5](/images/posts/spring-security-hasrole-prefix/image-5.png)

 **저 rolePrefix는 자동으로 ROLE\_ 이라는 prefix를 붙여주기 때문에 ROLE\_ 이라는 prefix를 제외한 ��한을 적으라는 것이다.**

![\[SpringSecurity\] 권한 설정 hasRole 오류와 prefix 이미지 6](/images/posts/spring-security-hasrole-prefix/image-6.png)

**여기서 ROLE\_ 이라는 prefix를 자동으로 붙여준다. 별도의 설정을 하지 않는 이상**

**따라서 다음과 같이 바꿔준다.**

```less
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                    .antMatchers("/design", "/orders")
                    .hasRole("USER")
                    .antMatchers("/", "/**").permitAll()
                .and()
                    .formLogin()
                    .loginPage("/login")
//                    .defaultSuccessUrl("/design",true)
                .and()
                    .logout()
                    .logoutSuccessUrl("/")
                .and()
                    .csrf().disable();
    }
```

**그런데 만약 내가 prefix를 따로 설정 해놨다면 ?** 

**getAuthorities에서 설정한 prefix를 따온다.**

```aspectj
@Entity
@Data
@NoArgsConstructor(access=AccessLevel.PUBLIC, force=true)
@RequiredArgsConstructor
public class User implements UserDetails {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private final String username;
    private final String password;
    private final String fullname;
    private final String street;
    private final String city;
    private final String state;
    private final String zip;
    private final String phoneNumber;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```
