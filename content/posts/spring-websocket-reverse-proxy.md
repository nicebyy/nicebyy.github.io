---
title: '[Spring] Websocket 과 ReverseProxy'
date: '2023-08-11'
category: Spring
tags:
  - apache reverseProxy
  - ReverseProxy
  - sockjs
  - spring websocket
summary: >-
  Websocket --- > 말 그대로 Web 을 이용한 Socket 통신이다. 즉 , HTTP 통신을 이용한다. > 웹 브라우저 <->
  WAS 간의 실시간 양방향 통신을 위해 사용한다. > 처음 핸드쉐이크를 요청할 때 까진 HTTP 와 통신과정이 같...
---
## **Websocket**

---

> **말 그대로 Web 을 이용한 Socket 통신이다. 즉 , HTTP 통신을 이용한다.**  
> **웹 브라우저 <-> WAS 간의 실시간 양방향 통신을 위해 사용한다.**  
> **처음 핸드쉐이크를 요청할 때 까진 HTTP 와 통신과정이 같고 그 이후엔 TCP 커넥션을 이용하여 실시간으로 통신한다는 것이 특징이다.**

![\[Spring\] Websocket 과 ReverseProxy 이미지 1](/images/posts/spring-websocket-reverse-proxy/image-1.png)

> **여기서 특별한 헤더가 추가 된다는 것이 특징인데 , Upgrade 헤더이다.**   
> **HTTP 요청 헤더에서 Websocket 통신을 위해 Upgrade 헤더를 추가해서 요청을 보내는데 이 요청이 WAS 쪽에서 받아 들여져야 그 이후 ws:// or wss:// 프로토콜을 통해 양방향 통신이 가능한 상태가 된다.**

![\[Spring\] Websocket 과 ReverseProxy 이미지 2](/images/posts/spring-websocket-reverse-proxy/image-2.png)

## **Reverse Proxy**

---

> **웹 소켓 서버 정보를 클라이언트쪽에서 (js 단에서) 가지고 있는 것은 상당히 위험하다. 즉 , 웹 클라이언트에서는 실제로 내가 접속하고 있는 서버의 정보를 몰라야 한다는 것이 보안측면에서도 안전하다.**  
>   
> **그래서 사용된 방식이 ReverseProxy 방식인데 엔드 유저들은 실제 웹 소켓서버로 요청을 보낼 때 예를 들어 Backend Server 1 의 ip 와 port 로 직접적으로 요청이 하는 방식이 아닌 우선 웹 서버 80 포트로 요청을 보내면 아파치 서버의 conf 설정을 통해 실제 Was 로 포워딩 되는 방식으로 요청이 가게 하는 방식이다. 이를 리버스 프록싱 방식이라고 한다.**

![\[Spring\] Websocket 과 ReverseProxy 이미지 3](/images/posts/spring-websocket-reverse-proxy/image-3.png)

## **Apache 설정**

---

```apache
<Virtualhost *:80>
	ProxyPreserveHost On
	ProxyRequests Off

	RewriteEngine On
    RewriteCond ${HTTP:Upgrade} websocket [NC]
  	RewriteCond ${HTTP:Connection} upgrade [NC]
    
	RewriteRule /(.*\/websocket) ws://localhost:8090/$1 [P,L]
	RewriteRule /(.*) http://localhost:8090/$1 [P,L]
    
	ProxyPass / http://localhost:8090/
	ProxyPassReverse / http://localhost:8090/
</VirtualHost>
```

> **실제 우리 서버 아파치 설정을 보여주긴 보안상 좀 그러니 예시중 일부를 가져왔다.**  
> **HTTP 요청으로 엔드포인트가 /websocket 으로 끝난다면 ws://localhost:8090 으로 요청을 돌려버린다는 설정이다.**  
>   
> **즉 , 메인도메인으로 요청할 때 엔드포인트에 따라서 프록시을 적용할 지 말지를 결정할 수 있다는 것이다.**  
> **그러나 이것을 적용할 때 문제점이 있었다.**  
>   
> **/websock 처럼 엔드포인트로 프록시 조건이 들어갈 때 HTTP 요청도 받을 수 있게 해야한다는 것.**  
> **다시말해, 웹 소켓 통신만 한다고 해서 ws:// 로 무조건 보내면 처음 HTTP 핸드쉐이크를 실패한다는 것이다.**  
>   

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/websock").setAllowedOrigins("*").setHandshakeHandler(new WSHandShakeHandler()).withSockJS();
    }
}
```

> **웹 소켓 서버의 Configuration 쪽에서 endPoint 를 /websock 으로 받게 했기 때문에 apache conf 파일의 내용을 다음과 같이 순서를 변경한다.**   
> **이렇게 하지 않으면 만약 SockJs를 쓰는 경우엔 웹 클라이언트단에서 콘솔 오류로 info?t=~~~ 404 not Found 를 뱉을 것이다.**

```apache
<Virtualhost *:80>
	ProxyPreserveHost On
	ProxyRequests Off

	RewriteEngine On
    RewriteCond ${HTTP:Upgrade} websocket [NC]
  	RewriteCond ${HTTP:Connection} upgrade [NC]
    
    RewriteRule /(.*) http://localhost:8090/$1 [P,L]
	RewriteRule /(.*\/websocket) ws://localhost:8090/$1 [P,L]
    
	ProxyPass / http://localhost:8090/
	ProxyPassReverse / http://localhost:8090/
</VirtualHost>
```
