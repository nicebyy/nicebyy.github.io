---
title: "[BOJ 2293] 동전 1 - Java (동적 계획법 중복 방지 1차원 DP)"
date: "2021-09-18"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","Java"]
summary: "n가지 종류의 동전으로 k원을 만드는 경우의 수를 구할 때, 동전 종류를 바깥쪽 루프로 두어 조합(순서 무관) 중복을 방지하는 1차원 DP 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 동전 1 (백준 2293번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 2293번) |
| **문제 링크** | [백준 2293번](https://www.acmicpc.net/problem/2293) |
| **제한 사항** | 시간 제한 0.5초, 메모리 제한 4MB |
| **입력 조건** | 동전 종류 $n \le 100$, 목표 가치 $k \le 10,000$ |
| **핵심 규칙** | 동전들을 조합하여 합이 $k$원이 되는 **경우의 수** 구하기 (순서가 달라도 구성이 같으면 동일한 경우) |

---

## 2. 접근 아이디어: 조합(Combination) 중복 방지 루프 순서

### 루프 순서의 결정적 차이
- **순서가 상관없는 조합**: 각 동전 종류를 바깥쪽 루프로 두고, 금액 $j$를 안쪽 루프($coin \to k$)로 돕니다:
  $$dp[j] = dp[j] + dp[j - coin]$$
- 이렇게 하면 동전 1원짜리를 먼저 다 반영한 뒤 2원짜리를 반영하므로, $(1, 2)$와 $(2, 1)$이 다른 순열로 세어지지 않고 오직 하나의 조합으로 계산됩니다!
- 메모리 제한이 4MB로 매우 타이트하므로 1차원 크기 $k+1$ 배열(`new int[k + 1]`)을 사용해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int n = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());

        int[] dp = new int[k + 1];
        dp[0] = 1; // 0원을 만드는 경우의 수 1가지 (아무 동전도 안 쓰기)

        for (int i = 0; i < n; i++) {
            int coin = Integer.parseInt(br.readLine());
            for (int j = coin; j <= k; j++) {
                dp[j] += dp[j - coin];
            }
        }

        System.out.println(dp[k]);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(n \times k)$ — $100 \times 10,000 = 10^6$ 연산으로 0.05초 이내 완료.
- **공간 복잡도**: $O(k)$ — 크기 $10,001$ 배열로 4MB 제한 통과.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2293-coin-1/result.png)
