---
title: '[Spring Security] hasRole("ROLE_USER") 오류 원인과 ROLE_ Prefix 동작 원리'
date: '2022-06-02'
category: Backend/Spring
tags:
  - Spring Security
  - hasRole
  - hasAuthority
  - ROLE_ Prefix
  - 트러블슈팅
summary: >-
  Spring Security 설정 시 .hasRole("ROLE_USER")를 전달했을 때 발생하는 IllegalArgumentException 오류의 원인을 내부 소스 코드(ExpressionUrlAuthorizationConfigurer)로 파헤치고, hasRole과 hasAuthority의 차이를 정리합니다.
---

## 문제 상황

Spring Security를 학습하며 `SecurityConfig` 설정 클래스의 `configure(HttpSecurity http)`를 작성하던 중, 교재 예제에서 권한 검증을 다음과 같이 설정한 코드를 보았습니다.

![교재 예제 코드: SecurityConfig 설정](/images/posts/spring-security-hasrole-prefix/image-1.png)

교재에서는 `.hasRole("ROLE_USER")` 형태로 인가를 설정하는 것과 아래 방식이 동일하게 동작한다고 설명되어 있었습니다.

![동일 동작으로 안내된 예제 코드](/images/posts/spring-security-hasrole-prefix/image-2.png)

하지만 막상 애플리케이션을 실행해 보면 애플리케이션 기동 시점에 예외가 발생하며 정상 실행되지 않습니다.

![hasRole ROLE_ prefix 예외 발생 로그](/images/posts/spring-security-hasrole-prefix/image-3.png)

---

## 원인 분석: `hasRole()`은 `ROLE_` Prefix를 자동으로 붙인다

예외 로그를 자세히 읽어보면 친절하게 원인을 알려줍니다.

![IllegalArgumentException 상세 안내 메시지](/images/posts/spring-security-hasrole-prefix/image-4.png)

> `role should not start with 'ROLE_' since it is automatically inserted. Got 'ROLE_USER'`

`hasRole()` 메서드 내부 구현(`ExpressionUrlAuthorizationConfigurer`)을 직접 열어보면 이유를 바로 확인할 수 있습니다.

![hasRole 메서드 내부 구현 확인](/images/posts/spring-security-hasrole-prefix/image-5.png)

내부에서 `hasRole(role)`은 전달받은 문자열 앞에 **`rolePrefix` (`"ROLE_"`)를 자동으로 결합**해 SpEL 표현식(`hasRole('ROLE_' + role)`)을 만들어냅니다.

![rolePrefix 기본값 ROLE_ 선언부](/images/posts/spring-security-hasrole-prefix/image-6.png)

별도의 커스텀 설정을 하지 않는 이상 기본 `rolePrefix`는 `"ROLE_"`입니다. 따라서 `.hasRole("ROLE_USER")`처럼 호출하면 내부적으로는 `"ROLE_ROLE_USER"`를 검사하게 되는 꼴이 되므로, Spring Security가 아예 기동 단계에서 실수를 잡아 예외를 던져주는 것입니다.

### `hasRole()` vs `hasAuthority()` 한눈에 비교

| 메서드 | 자동 `ROLE_` 추가 여부 | 올바른 사용 예시 | DB / `UserDetails` 저장 권장 값 |
| :--- | :---: | :--- | :--- |
| **`hasRole("USER")`** | **O** (`"ROLE_USER"`로 검사) | `.hasRole("USER")` | `"ROLE_USER"` |
| **`hasAuthority("ROLE_USER")`** | **X** (입력한 문자열 그대로 검사) | `.hasAuthority("ROLE_USER")` | `"ROLE_USER"` |

---

## 해결 방법

`hasRole()`을 사용할 때는 **`ROLE_` 접두사를 제외한 순수 역할명(`"USER"`)**만 전달합니다.

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .authorizeRequests()
            .antMatchers("/design", "/orders").hasRole("USER") // "ROLE_USER" 권한 검사
            .antMatchers("/", "/**").permitAll()
        .and()
            .formLogin()
            .loginPage("/login")
        .and()
            .logout()
            .logoutSuccessUrl("/")
        .and()
            .csrf().disable();
}
```

### `UserDetails.getAuthorities()` 구현 시 주의할 점

반대로 `UserDetails` 인터페이스의 `getAuthorities()`에서 사용자 권한을 반환할 때는 **접두사 `"ROLE_"`를 포함한 전체 권한 문자열(`"ROLE_USER"`)**을 반환해야 `.hasRole("USER")`와 정상적으로 매칭됩니다.

```java
@Entity
@Data
@NoArgsConstructor(access = AccessLevel.PUBLIC, force = true)
@RequiredArgsConstructor
public class User implements UserDetails {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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
        // Security 설정의 .hasRole("USER")와 매칭되도록 ROLE_ 접두사를 포함해 반환
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
```
