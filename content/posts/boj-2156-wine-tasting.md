---
title: "[BOJ 2156] 포도주 시식 - Java (연속 3잔 금지 동적 계획법)"
date: "2021-09-15"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","Java"]
summary: "계단 오르기와 달리 마지막 잔을 마시지 않아도 되는 포도주 시식 규칙을 반영하여, 이전 잔을 마시지 않는 경우(dp[i-1])를 포함한 3가지 점화식 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 포도주 시식 (백준 2156번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 2156번) |
| **문제 링크** | [백준 2156번](https://www.acmicpc.net/problem/2156) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 포도주 잔의 수 $n \le 10,000$, 양 $\le 1,000$ |
| **핵심 규칙** | 연속으로 3잔을 마실 수 없을 때, **최대로 마실 수 있는 포도주의 양** 계산 (마지막 잔 필수 아님) |

---

## 2. 접근 아이디어: 계단 오르기와의 결정적 차이

- 계단 오르기는 마지막 계단을 반드시 밟아야 했지만, **포도주 시식은 $i$번째 잔을 건너뛰어도 됩니다!**
- 따라서 3가지 전이를 고려합니다:
  1. $i$번째 잔을 마시지 않는 경우: $dp[i-1]$
  2. $i$번째 잔을 마시고 이전 잔은 건너뛴 경우: $dp[i-2] + wine[i]$
  3. $i$번째 잔과 $i-1$번째 잔을 연속으로 마신 경우: $dp[i-3] + wine[i-1] + wine[i]$
- 점화식:
  $$dp[i] = \max(dp[i-1], \max(dp[i-2] + wine[i], dp[i-3] + wine[i-1] + wine[i]))$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] wine = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            wine[i] = Integer.parseInt(br.readLine());
        }

        if (n == 1) {
            System.out.println(wine[1]);
            return;
        }

        int[] dp = new int[n + 1];
        dp[1] = wine[1];
        dp[2] = wine[1] + wine[2];

        for (int i = 3; i <= n; i++) {
            dp[i] = Math.max(dp[i - 1], Math.max(dp[i - 2] + wine[i], dp[i - 3] + wine[i - 1] + wine[i]));
        }

        System.out.println(dp[n]);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 0.1초 이내 완료.
- **공간 복잡도**: $O(N)$ — 크기 $N+1$ 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2156-wine-tasting/result.png)
