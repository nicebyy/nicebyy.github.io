---
title: '[Spring Security] 스프링 시큐리티 인증·인가 구성 및 UserDetailsService 구현 정리'
date: '2022-06-07'
category: Backend/Spring
tags:
  - Spring Security
  - WebSecurityConfigurerAdapter
  - UserDetailsService
  - PasswordEncoder
  - BCrypt
summary: >-
  Spring Security의 HTTP 보안 설정(HttpSecurity)과 주요 인가 메서드, 4가지 사용자 저장소(In-Memory, JDBC, LDAP, 커스텀 UserDetailsService) 구성 방법, 그리고 BCrypt PasswordEncoder 적용법을 정리합니다.
---

## Spring Security 기본 구성 (`SecurityConfig`)

Spring Security 의존성을 추가하면 모든 HTTP 요청에 대해 기본 인증 필터 체인이 동작합니다. 과거 Spring Boot 2.x 기반에서는 `WebSecurityConfigurerAdapter`를 상속해 `configure()` 메서드를 오버라이드하여 웹 보안 정책과 사용자 인증 방식을 구성했습니다.

![Spring Security 보안 설정 구조](/images/posts/spring-security-setup/image-1.png)

> **최신 버전 참고 (Spring Security 5.7+ / Spring Boot 3.x)**:  
> 현재는 `WebSecurityConfigurerAdapter`가 deprecated 되었으며, **`SecurityFilterChain`을 `@Bean`으로 등록**하는 컴포넌트 기반 설정 방식이 표준입니다. 다만 내부 인가 메서드(`authorizeHttpRequests`, `formLogin`, `UserDetailsService`, `PasswordEncoder`)의 핵심 개념은 동일합니다.

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/design", "/orders").hasRole("USER")
                .antMatchers("/", "/**").permitAll()
            .and()
                .formLogin()
                .loginPage("/login")
            .and()
                .logout()
                .logoutSuccessUrl("/")
            .and()
                .csrf();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
            .userDetailsService(userDetailsService)
            .passwordEncoder(encoder());
    }
}
```

### 주요 HTTP 인가 메서드 및 SpEL 표현식 정리

| 메서드 / SpEL 표현식 | 설명 |
| :--- | :--- |
| `permitAll()` | 인증 여부와 무관하게 무조건 접근 허용 |
| `denyAll()` | 무조건 접근 거부 |
| `anonymous()` / `isAnonymous()` | 익명 사용자(미인증 사용자)에게만 접근 허용 |
| `authenticated()` / `isAuthenticated()` | 로그인으로 인증된 사용자에게 접근 허용 |
| `fullyAuthenticated()` / `isFullyAuthenticated()` | remember-me 자동 로그인이 아닌 직접 인증된 사용자에게만 허용 |
| `rememberMe()` / `isRememberMe()` | remember-me 쿠키를 통해 자동 인증된 사용자에게 허용 |
| `hasRole(String)` | 지정된 역할(자동 `ROLE_` 접두사 포함)을 가진 사용자에게 허용 |
| `hasAnyRole(String...)` | 나열된 역할 중 하나라도 가지면 허용 |
| `hasAuthority(String)` | 접두사 추가 없이 지정된 정확한 권한 문자열을 가진 사용자에게 허용 |
| `hasAnyAuthority(String...)` | 나열된 권한 중 하나라도 가지면 허용 |
| `hasIpAddress(String)` | 지정된 IP 대역에서 온 요청일 때만 허용 |
| `access(String)` | 인자로 전달한 SpEL 표현식이 `true`일 때 접근 허용 (예: `hasRole('USER') and isFullyAuthenticated()`) |

---

## 사용자 스토어(User Store) 구성 4가지 방식

Spring Security는 인증에 사용할 사용자 정보를 어디서 가져올지 크게 4가지 방식으로 구성할 수 있습니다.

1. **In-Memory 기반** (테스트 및 고정 계정용)
2. **JDBC 기반** (표준 RDBMS 쿼리 방식)
3. **LDAP 기반** (사내 디렉토리 서버 연동용)
4. **커스텀 `UserDetailsService`** (JPA 엔티티 연동 — **실무 표준**)

### 1. In-Memory 기반
변경이 필요 없는 소수의 테스트 계정을 메모리에 올려둘 때 사용합니다.

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth
        .inMemoryAuthentication()
        .withUser("admin").password("{noop}1234").authorities("ADMIN")
        .and()
        .withUser("testuser").password("{noop}1234").authorities("USER");
}
```

### 2. JDBC 기반
RDBMS 테이블에 저장된 사용자 정보를 SQL로 직접 조회합니다. 기본적으로 `username`을 조건으로 사용자(`username, password, enabled`), 권한(`username, authority`), 그룹을 조회하며 커스텀 SQL 지정도 가능합니다.

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.jdbcAuthentication()
        .dataSource(dataSource)
        .usersByUsernameQuery("""
                select username, password, enabled
                from users
                where username = ?
                """)
        .authoritiesByUsernameQuery("""
                select username, authority
                from authorities
                where username = ?
                """)
        .passwordEncoder(encoder());
}
```

### 3. LDAP 기반
**LDAP(Lightweight Directory Access Protocol)**는 네트워크상 디렉토리 서비스 표준(X.500 DAP)을 TCP/IP 기반으로 경량화한 트리 구조 저장·인증 프로토콜입니다. 주로 사내 통합 계정 관리 환경에서 사용됩니다. ([참고: LDAP 개념 정리](https://www.blocko.io/developer/ldap-%EC%9D%B8%EC%A6%9D/))

```java
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.ldapAuthentication()
        .userSearchBase("ou=people")
        .userSearchFilter("(uid={0})")
        .groupSearchBase("ou=groups")
        .groupSearchFilter("member={0}")
        .contextSource()
            .root("dc=taco,dc=com")
            .ldif("classpath:users.ldif")
        .and()
        .passwordCompare()
            .passwordEncoder(new BCryptPasswordEncoder())
            .passwordAttribute("userPasscode");
}
```

### 4. 커스텀 `UserDetailsService` 구현 (JPA 연동)

실무에서는 JPA 엔티티가 `UserDetails`를 구현하거나 별도의 어댑터 클래스를 두고, `UserDetailsService`를 구현해 DB에서 회원을 조회하는 방식을 사용합니다.

#### `UserDetails` 인터페이스 주요 메서드

| 메서드명 | 리턴 타입 | 설명 |
| :--- | :--- | :--- |
| `getAuthorities()` | `Collection<? extends GrantedAuthority>` | 계정이 가진 권한 목록 반환 |
| `getPassword()` | `String` | 암호화된 비밀번호 반환 |
| `getUsername()` | `String` | 사용자 로그인 식별자(ID) 반환 |
| `isAccountNonExpired()` | `boolean` | 계정 만료 여부 (`true`: 만료되지 않음) |
| `isAccountNonLocked()` | `boolean` | 계정 잠금 여부 (`true`: 잠기지 않음) |
| `isCredentialsNonExpired()` | `boolean` | 비밀번호 만료 여부 (`true`: 만료되지 않음) |
| `isEnabled()` | `boolean` | 계정 활성화 여부 (`true`: 사용 가능) |

#### 엔티티 · 리포지토리 · 서비스 · 회원가입 컨트롤러 예시

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
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
```

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}

@Service
@RequiredArgsConstructor
public class UserRepositoryUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(username);
        if (user != null) {
            return user;
        }
        throw new UsernameNotFoundException("User '" + username + "' not found");
    }
}
```

```java
@Data
public class RegistrationForm {
    private String username;
    private String password;
    private String fullname;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String phone;

    public User toUser(PasswordEncoder passwordEncoder) {
        return new User(
            username,
            passwordEncoder.encode(password),
            fullname, street, city, state, zip, phone
        );
    }
}

@Controller
@RequestMapping("/register")
@RequiredArgsConstructor
public class RegistrationController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public String registerForm() {
        return "registration";
    }

    @PostMapping
    public String processRegistration(RegistrationForm form) {
        userRepo.save(form.toUser(passwordEncoder));
        return "redirect:/login";
    }
}
```

---

## PasswordEncoder (비밀번호 단방향 해싱)

Spring Security 5부터는 보안을 위해 **`PasswordEncoder`를 통한 비밀번호 암호화가 의무화**되었습니다. 회원가입 시 반드시 `encode()`로 해싱해 저장해야 하며, 로그인 시에는 내부적으로 `matches(rawPwd, encodedPwd)`로 일치 여부를 검증합니다.

실제로 `BCryptPasswordEncoder`로 저장된 DB 레코드는 다음과 같이 솔트(Salt)가 적용된 해시 문자열로 저장됩니다.

| ID | USERNAME | PASSWORD (BCrypt 해시) | FULLNAME | CITY |
| :---: | :--- | :--- | :--- | :--- |
| `1` | `user` | `$2a$10$GtCiKop4o9Vlm7CoKryHCuXVehCyNYB5krnMJBbfOylkVInzinc7K` | `user` | `aaa` |

### Spring Security 제공 주요 `PasswordEncoder` 구현체
- **`BCryptPasswordEncoder`**: 가장 널리 쓰이는 BCrypt 해싱 (강력한 단방향 + 랜덤 Salt 내장)
- **`Pbkdf2PasswordEncoder`**: PBKDF2 알고리즘 기반 암호화
- **`SCryptPasswordEncoder`**: scrypt 해싱
- **`NoOpPasswordEncoder`**: 암호화 미적용 (deprecated, 테스트 외 사용 금지)
