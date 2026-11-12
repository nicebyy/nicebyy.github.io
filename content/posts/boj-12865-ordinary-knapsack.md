---
title: "[BOJ 12865] 평범한 배낭 - Java (0-1 배낭 문제 Knapsack DP)"
date: "2021-09-22"
category: "PS/BOJ"
tags: ["BOJ","DP","배낭문제","Knapsack","Java"]
summary: "무게 한도 K 이하로 담을 수 있는 보석 가치의 최댓값을 구하는 전형적인 0-1 Knapsack 1차원/2차원 동적 계획법 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 평범한 배낭 (백준 12865번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 12865번) |
| **문제 링크** | [백준 12865번](https://www.acmicpc.net/problem/12865) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 512MB |
| **입력 조건** | 물품의 수 $N \le 100$, 버틸 수 있는 무게 $K \le 100,000$, 무게 $W$, 가치 $V$ |
| **핵심 규칙** | 배낭에 넣을 수 있는 물건들의 가치의 최댓값 구하기 (각 물건은 최대 1개) |

---

## 2. 접근 아이디어: 0-1 배낭 문제와 1차원 DP 공간 최적화

### 1차원 DP 점화식과 역순 순회
- $dp[w]$: 배낭 무게 한도가 $w$일 때 담을 수 있는 최대 가치.
- 물건 $(W_i, V_i)$를 고려할 때, 같은 물건이 여러 번 중복 선택되는 것을 방지하기 위해 **무게 $w$를 $K$부터 $W_i$까지 역순(내림차순)으로 순회**합니다:
  $$dp[w] = \max(dp[w], dp[w - W_i] + V_i)$$
- 역순으로 갱신하면 $dp[w - W_i]$는 이전 단계의 값(즉, 현재 물건 $i$를 아직 담지 않은 상태)이 보장됩니다.

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

        for (int i = 0; i < n; i++) {
            st = new StringTokenizer(br.readLine());
            int w = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());

            // 중복 방지를 위한 역순 순회
            for (int weight = k; weight >= w; weight--) {
                dp[weight] = Math.max(dp[weight], dp[weight - w] + v);
            }
        }

        System.out.println(dp[k]);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times K)$ — $100 \times 100,000 = 10^7$ 연산으로 0.2초 이내 완료.
- **공간 복잡도**: $O(K)$ — 1차원 크기 $K+1$ 배열로 메모리 절약.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-12865-ordinary-knapsack/result.png)
