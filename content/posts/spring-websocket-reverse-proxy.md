---
title: '[Spring] WebSocket + SockJS 환경에서 Apache Reverse Proxy 설정 트러블슈팅'
date: '2023-08-11'
category: Backend/Spring
tags:
  - Spring WebSocket
  - SockJS
  - Reverse Proxy
  - Apache HTTP Server
  - 트러블슈팅
summary: >-
  Spring WebSocket(STOMP + SockJS) 서버 앞단에 Apache Reverse Proxy를 구성할 때 Upgrade 헤더 분기 처리 순서로 인해 SockJS 초기 핸드셰이크(/info)가 404 실패하는 원인과 올바른 VirtualHost 설정 방법을 정리합니다.
---

## WebSocket과 HTTP Upgrade 핸드셰이크

**WebSocket**은 웹 브라우저와 WAS(서버) 간에 **실시간 양방향 통신**을 수행하기 위한 프로토콜입니다.

특이한 점은 **초기 연결 수립(Handshake) 단계까지는 일반 HTTP 요청과 동일하게 시작**한다는 것입니다.

![WebSocket 초기 HTTP 핸드셰이크 및 연결 유지](/images/posts/spring-websocket-reverse-proxy/image-1.png)

클라이언트가 HTTP 요청 헤더에 **`Upgrade: websocket`**과 `Connection: Upgrade`를 실어 보내고, 서버(WAS)가 이를 수락(`101 Switching Protocols`)하면 그 이후부터는 HTTP가 아닌 지속적인 TCP 커넥션 기반의 `ws://` 또는 `wss://` 양방향 통신으로 전환됩니다.

![HTTP Upgrade 헤더를 통한 프로토콜 전환](/images/posts/spring-websocket-reverse-proxy/image-2.png)

---

## Reverse Proxy를 두는 이유

웹 클라이언트(JavaScript) 코드 안에 실제 백엔드 WebSocket WAS의 내부 IP와 포트 번호를 직접 노출해 연결하는 것은 보안상 위험하고 인프라 유연성도 떨어집니다.

따라서 사용자에게는 **단일 웹 서버 도메인(80/443 포트)**만 노출하고, 앞단의 **Apache(또는 Nginx) Reverse Proxy**가 요청 경로와 헤더를 판별해 내부 WAS로 포워딩하도록 구성합니다.

![Apache Reverse Proxy를 통한 WebSocket 포워딩 구조](/images/posts/spring-websocket-reverse-proxy/image-3.png)

---

## Apache Reverse Proxy + Spring SockJS 트러블슈팅

Spring 백엔드에서 SockJS와 STOMP 엔드포인트를 다음과 같이 `/websock`으로 등록한 상태였습니다.

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/websock")
                .setAllowedOrigins("*")
                .setHandshakeHandler(new WSHandShakeHandler())
                .withSockJS();
    }
}
```

### 문제 발생: `/websock/info?t=... 404 Not Found`

초기에 Apache 설정에서 `/websock` 하위 경로를 무조건 `ws://` 프록시로 넘기거나 `RewriteRule` 순서를 잘못 배치했을 때, 브라우저 콘솔에서 **`/websock/info?t=... 404 Not Found`** 오류가 발생하며 연결이 실패했습니다.

### 원인 분석
**SockJS**는 브라우저가 WebSocket을 지원하는지 확인하고 세션 협상을 진행하기 위해, 실제 `ws://` 업그레이드 요청을 보내기 전에 먼저 **일반 HTTP GET 요청(`/websock/info?t=...`)**을 보냅니다.

만약 프록시 설정이 `/websock` 경로의 요청을 `Upgrade: websocket` 헤더 확인 없이 `ws://`로 바로 보내버리거나 일반 HTTP 프록시 규칙과 충돌하면, 초기 `/info` HTTP 핸드셰이크 자체가 실패하게 됩니다.

### 해결: `Upgrade` 헤더 조건 분기 및 `HTTP` 선처리 / 폴백 구성

Apache `mod_rewrite`에서는 **`Upgrade: websocket` 헤더가 실제로 포함된 요청만 `ws://`로 넘기고**, SockJS의 `/websock/info` 같은 일반 HTTP 요청은 정상적으로 `http://localhost:8090`으로 전달되도록 규칙을 명확히 분리해야 합니다.

```apache
<VirtualHost *:80>
    ProxyPreserveHost On
    ProxyRequests Off

    RewriteEngine On

    # 1. HTTP Upgrade 헤더가 websocket인 경우에만 ws:// 프로토콜로 프록시
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule /(.*) ws://localhost:8090/$1 [P,L]

    # 2. 그 외 일반 HTTP 요청(SockJS의 /websock/info 핸드셰이크 포함)은 http:// 로 전달
    RewriteRule /(.*) http://localhost:8090/$1 [P,L]

    ProxyPass / http://localhost:8090/
    ProxyPassReverse / http://localhost:8090/
</VirtualHost>
```

> **핵심 포인트**:
> - Apache `mod_rewrite`에서 `RewriteCond`는 바로 아래 줄의 **단 하나의 `RewriteRule`**에만 적용됩니다.
> - SockJS처럼 HTTP 폴링/정보 조회(`/info`)와 WebSocket 업그레이드(`/websocket`)가 같은 엔드포인트 하위에서 함께 동작할 때는, **경로 문자열만 보지 말고 반드시 `HTTP:Upgrade` 헤더 유무를 함께 검사**해 일반 HTTP 요청이 `ws://`로 잘못 라우팅되지 않도록 주의해야 합니다.
