---
title: "[BOJ 2579] 계단 오르기 - Java (연속 3계단 방지 동적 계획법)"
date: "2021-09-16"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","Java"]
summary: "연속된 세 계단을 밟을 수 없고 마지막 계단을 반드시 밟아야 할 때, 1칸 전+2칸 전 또는 2칸 전에서 도약하는 2가지 전이를 고려한 DP 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 계단 오르기 (백준 2579번 / 실버 3) |
| **플랫폼 / 난이도** | 백준 (실버 3, 2579번) |
| **문제 링크** | [백준 2579번](https://www.acmicpc.net/problem/2579) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 계단 수 $n \le 300$, 점수 $\le 10,000$ |
| **핵심 규칙** | 1) 한 번에 1계단 또는 2계단, 2) 연속된 세 계단 밟기 금지, 3) **마지막 계단 필수 착지** 조건 하의 최대 점수 |

---

## 2. 접근 아이디어: 마지막 계단 착지 2가지 경우의 수

- 마지막 계단 $i$에 착지하는 유효한 경우는 오직 둘 중 하나입니다:
  1. $i-2$번째 계단에서 2칸 건너뛰어 온 경우: $dp[i-2] + score[i]$
  2. $i-3$번째에서 2칸 건너뛰어 $i-1$을 밟고 1칸 올라온 경우: $dp[i-3] + score[i-1] + score[i]$
- 점화식:
  $$dp[i] = \max(dp[i-2], dp[i-3] + score[i-1]) + score[i]$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] score = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            score[i] = Integer.parseInt(br.readLine());
        }

        if (n == 1) {
            System.out.println(score[1]);
            return;
        }

        int[] dp = new int[n + 1];
        dp[1] = score[1];
        dp[2] = score[1] + score[2];

        for (int i = 3; i <= n; i++) {
            dp[i] = Math.max(dp[i - 2], dp[i - 3] + score[i - 1]) + score[i];
        }

        System.out.println(dp[n]);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 0.05초 미만 완료.
- **공간 복잡도**: $O(N)$ — 크기 $N+1$ 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2579-climbing-stairs/result.png)
