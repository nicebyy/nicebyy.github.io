---
title: "[BOJ 9465] 스티커 - Java (동적 계획법 2행 DP)"
date: "2021-10-13"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","Java"]
summary: "스티커 한 장을 뜯으면 상하좌우를 사용할 수 없으므로, 대각선 이전 열과 2칸 이전 열의 최댓값을 조합하여 누적 점수를 최대화하는 2행 DP 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 스티커 (백준 9465번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 9465번) |
| **문제 링크** | [백준 9465번](https://www.acmicpc.net/problem/9465) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | $2 \times n$ 스티커 격자 ($n \le 100,000$), 각 스티커 점수 $\le 100$ |
| **핵심 규칙** | 스티커 1장을 떼면 상하좌우 인접 스티커는 찢어져 사용할 수 없을 때, **뗄 수 있는 스티커 점수의 최댓값** 계산 |

---

## 2. 접근 아이디어: 동적 계획법 (2행 DP)

### 대각선 전이 원칙
- $j$번째 열의 위쪽 스티커($(0, j)$)를 떼기 위해서는, 바로 앞 열의 아래쪽 스티커($(1, j-1)$)를 뗐거나, 또는 2칸 앞 열($(0, j-2)$ 또는 $(1, j-2)$)에서 건너뛰어 온 경우여야 합니다.
- 따라서 점화식은 다음과 같습니다:
  $$dp[0][j] = \max(dp[1][j - 1], dp[1][j - 2]) + score[0][j]$$
  $$dp[1][j] = \max(dp[0][j - 1], dp[0][j - 2]) + score[1][j]$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());
        StringBuilder sb = new StringBuilder();

        while (tc-- > 0) {
            int n = Integer.parseInt(br.readLine());
            int[][] cost = new int[2][n + 1];
            int[][] dp = new int[2][n + 1];

            for (int r = 0; r < 2; r++) {
                StringTokenizer st = new StringTokenizer(br.readLine());
                for (int c = 1; c <= n; c++) {
                    cost[r][c] = Integer.parseInt(st.nextToken());
                }
            }

            dp[0][1] = cost[0][1];
            dp[1][1] = cost[1][1];

            for (int i = 2; i <= n; i++) {
                dp[0][i] = Math.max(dp[1][i - 1], dp[1][i - 2]) + cost[0][i];
                dp[1][i] = Math.max(dp[0][i - 1], dp[0][i - 2]) + cost[1][i];
            }

            sb.append(Math.max(dp[0][n], dp[1][n])).append("\n");
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 1차원 선형 순회로 $N = 100,000$에서 0.3초 이내 즉시 완료.
- **공간 복잡도**: $O(N)$ — $2 \times (N + 1)$ DP 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-9465-stickers/result.png)
