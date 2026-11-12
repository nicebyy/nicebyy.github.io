---
title: "[BOJ 1149] RGB거리 - Java (인접 집 다른 색 칠하기 2차원 DP)"
date: "2021-09-16"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","Java"]
summary: "이웃한 집이 서로 다른 색(R, G, B)을 칠해야 할 때, 이전 집의 다른 두 색 중 최소 비용을 취하며 N번 집까지 칠하는 최소 비용 DP"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | RGB거리 (백준 1149번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 1149번) |
| **문제 링크** | [백준 1149번](https://www.acmicpc.net/problem/1149) |
| **제한 사항** | 시간 제한 0.5초, 메모리 제한 128MB |
| **입력 조건** | 집의 수 $N \le 1,000$, RGB 비용 $\le 1,000$ |
| **핵심 규칙** | 인접한 집은 같은 색으로 칠할 수 없을 때, 모든 집을 칠하는 **최소 비용** 구하기 |

---

## 2. 접근 아이디어: 3가지 색상 상태 전이 DP

- $i$번째 집을 빨강(0)으로 칠하려면, $i-1$번째 집은 초록(1)이나 파랑(2)이어야 합니다:
  $$dp[i][0] = \min(dp[i-1][1], dp[i-1][2]) + cost[i][0]$$
  $$dp[i][1] = \min(dp[i-1][0], dp[i-1][2]) + cost[i][1]$$
  $$dp[i][2] = \min(dp[i-1][0], dp[i-1][1]) + cost[i][2]$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[][] dp = new int[n + 1][3];

        for (int i = 1; i <= n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int r = Integer.parseInt(st.nextToken());
            int g = Integer.parseInt(st.nextToken());
            int b = Integer.parseInt(st.nextToken());

            dp[i][0] = Math.min(dp[i - 1][1], dp[i - 1][2]) + r;
            dp[i][1] = Math.min(dp[i - 1][0], dp[i - 1][2]) + g;
            dp[i][2] = Math.min(dp[i - 1][0], dp[i - 1][1]) + b;
        }

        int minCost = Math.min(dp[n][0], Math.min(dp[n][1], dp[n][2]));
        System.out.println(minCost);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — $N = 1,000$으로 0.05초 미만 즉시 완료.
- **공간 복잡도**: $O(N)$ — 크기 $(N+1) \times 3$ 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1149-rgb-street/result.png)
