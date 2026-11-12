---
title: "[프로그래머스] k진수에서 소수 개수 구하기 - Java (2022 KAKAO BLIND RECRUITMENT)"
date: "2022-02-04"
category: "PS/Programmers"
tags: ["Programmers","소수 판별","진법 변환","문자열","Java"]
summary: "정수를 k진수로 변환한 뒤 0을 기준으로 분리하여 조건에 맞는 소수의 개수를 판별하는 카카오 기출 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | k진수에서 소수 개수 구하기 (Level 2) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) / 2022 KAKAO BLIND RECRUITMENT |
| **문제 링크** | [프로그래머스 k진수에서 소수 개수 구하기 (Level 2)](https://school.programmers.co.kr/learn/courses/30/lessons/92335) |
| **입력 조건** | 정수 $n$ ($1 \le n \le 1,000,000$), 진법 $k$ ($3 \le k \le 10$) |
| **핵심 규칙** | 변환된 수에서 `0`으로 구분된 각 수 중 소수(Prime Number)의 개수 카운트 |

### 문제 조건의 형태
- `0P0`: 소수 양쪽에 0이 있는 경우
- `P0`: 소수 오른쪽에만 0이 있고 왼쪽에는 아무것도 없는 경우
- `0P`: 소수 왼쪽에만 0이 있고 오른쪽에는 아무것도 없는 경우
- `P`: 소수 양쪽에 아무것도 없는 경우 (단, $P$ 내부에는 0이 포함되지 않음)

위 네 가지 조건은 결국 **"변환된 수를 '0'을 구분자(delimiter)로 분할했을 때 나타나는 각 부분 숫자가 소수인가?"**를 묻는 것과 정확히 일치합니다.

---

## 2. 접근 아이디어 및 주의점 (Pitfall)

### 단계별 해결 알고리즘
1. **k진수 변환**: $n$을 $k$로 나눈 나머지를 앞쪽에 붙여가며 진법 변환을 수행합니다.
2. **0 기준 분할**: 변환된 문자열을 `split("0")`으로 분리합니다.
3. **빈 문자열 필터링**: 연속된 0이 있을 경우 빈 문자열(`""`)이 발생하므로 이를 제외합니다.
4. **소수 판별**: 각 숫자에 대해 $2$부터 $\sqrt{P}$까지 나누어 떨어지는지 검사합니다.

### ⚠️ 핵심 함정: 자료형 오버플로우 (Integer Overflow)
- $n \le 1,000,000$이지만, 3진수로 변환하면 최대 **13자리**까지 길이가 늘어날 수 있습니다.
- 예를 들어 0이 하나도 없이 13자리 숫자가 만들어지면, Java의 32비트 정수형(`int`의 최댓값 약 $2.14 \times 10^9$)을 가볍게 초과합니다.
- 따라서 숫자를 파싱할 때 **반드시 `long`(64비트 정수)**을 사용해야 `NumberFormatException`이나 오버플로우를 방지할 수 있습니다.
- 또한 **1은 소수가 아님**에 유의해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    public int solution(int n, int k) {
        // 1. n을 k진수 문자열로 변환
        String converted = convert(n, k);

        // 2. '0'을 기준으로 분리하여 빈 문자열 제거 후 long으로 파싱하여 소수 판별
        return (int) Arrays.stream(converted.split("0"))
                .filter(e -> !e.isEmpty()) // 빈 문자열 필터링
                .mapToLong(Long::parseLong) // 큰 수 대비 long 변환 (오버플로우 방지)
                .filter(this::isPrime) // 소수 판별
                .count();
    }

    // k진수 변환 함수
    public String convert(int n, int k) {
        StringBuilder sb = new StringBuilder();
        while (n > 0) {
            sb.insert(0, n % k);
            n /= k;
        }
        return sb.toString();
    }

    // 소수 판별 함수 (O(√N))
    public boolean isPrime(long n) {
        if (n <= 1) return false;
        for (long i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}
```

---

## 4. 복잡도 분석 및 성능 요약

- **진법 변환 시간 복잡도**: $O(\log_k n)$ — $n \le 10^6$이므로 최대 약 13회 연산으로 매우 빠름.
- **소수 판별 시간 복잡도**: 각 조각에 대해 $O(\sqrt{P})$ — 최대 $P \approx 10^{13}$이어도 $\sqrt{P} \approx 3 \times 10^6$ 수준으로 시간 제한(수 초) 내에 여유롭게 통과.
- **공간 복잡도**: $O(\log_k n)$ — 변환된 문자열 저장을 위한 최소 메모리 사용.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-92335-k-prime-number/result.png)
