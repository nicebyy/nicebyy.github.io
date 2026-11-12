---
title: "[BOJ 11057] 오르막 수 - Java (동적 계획법 & 10007 모듈러)"
date: "2021-09-18"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","수학","Java"]
summary: "길이가 N이고 인접한 수가 같거나 증가하는 오르막 수의 개수를 구하기 위해 dp[길이][끝자리] 점화식과 10,007 모듈러를 적용한 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 오르막 수 (백준 11057번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 11057번) |
| **문제 링크** | [백준 11057번](https://www.acmicpc.net/problem/11057) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 수의 길이 $N \le 1,000$ |
| **핵심 규칙** | 인접한 수가 같거나 증가하는 오르막 수의 개수를 $10,007$로 나눈 나머지 출력 (0으로 시작 가능) |

---

## 2. 접근 아이디어: 동적 계획법 점화식

- $dp[i][j]$: 길이가 $i$이고 마지막 숫자가 $j$인 오르막 수의 개수.
- 마지막 숫자가 $j$가 되려면 이전 자리의 숫자는 $0$부터 $j$까지 가능하므로:
  $$dp[i][j] = \sum_{d=0}^j dp[i-1][d] \pmod{10,007}$$
- 또는 $dp[i][j] = (dp[i][j - 1] + dp[i - 1][j]) \pmod{10,007}$로 누적합 단순화가 가능합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    private static final int MOD = 10_007;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[][] dp = new int[n + 1][10];

        // 길이 1 초기화
        for (int j = 0; j <= 9; j++) {
            dp[1][j] = 1;
        }

        for (int i = 2; i <= n; i++) {
            for (int j = 0; j <= 9; j++) {
                for (int k = 0; k <= j; k++) {
                    dp[i][j] = (dp[i][j] + dp[i - 1][k]) % MOD;
                }
            }
        }

        int total = 0;
        for (int j = 0; j <= 9; j++) {
            total = (total + dp[n][j]) % MOD;
        }

        System.out.println(total);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times 10 \times 10) = O(N)$ — 0.05초 미만 완료.
- **공간 복잡도**: $O(N \times 10)$ — DP 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-11057-uphill-number/result.png)
