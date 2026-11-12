---
title: "[BOJ 1890] 점프 - Java (2차원 동적 계획법 DP)"
date: "2021-08-22"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","Java"]
summary: "칸에 적힌 수만큼 오른쪽 또는 아래쪽으로만 점프할 수 있을 때, (0, 0)에서 (N-1, N-1)까지 도달 가능한 경로의 총 개수를 long DP로 누적 합산"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 점프 (백준 1890번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 1890번) |
| **문제 링크** | [백준 1890번](https://www.acmicpc.net/problem/1890) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 게임판 크기 $N \le 100$, 각 칸의 점프 거리 ($0 \le \text{jump} \le 9$) |
| **핵심 규칙** | 가장 왼쪽 위에서 출발하여 항상 오른쪽 또는 아래로 점프해 가장 오른쪽 아래로 도달 가능한 경로의 총 개수 |

---

## 2. 접근 아이디어: 2차원 DP와 long 타입 선언

### 그래프 탐색(BFS/DFS) vs DP
- 오른쪽과 아래쪽으로만 이동하므로 순환 사이클이 없는 **DAG(Directed Acyclic Graph)** 구조입니다.
- 단순 DFS나 BFS로 탐색하면 경로 수가 지수적으로 증가($2^{63}-1$)하여 무조건 시간 초과 또는 메모리 초과가 발생합니다.
- 경로의 수가 매우 커질 수 있으므로 반드시 **`long[][] dp`**를 선언해야 합니다.

### 점화식 전개
- `dp[y][x]`: $(0, 0)$에서 $(y, x)$까지 도달하는 경로의 수.
- `dp[0][0] = 1`로 시작하여 $(y, x)$를 차례대로 순회합니다:
  - 현재 칸이 종점($(N-1, N-1)$)이거나 `dp[y][x] == 0`이면 건너뜁니다.
  - 오른쪽 이동: $x + jump < N \implies dp[y][x + jump] += dp[y][x]$
  - 아래쪽 이동: $y + jump < N \implies dp[y + jump][x] += dp[y][x]$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[][] map = new int[n][n];
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int j = 0; j < n; j++) {
                map[i][j] = Integer.parseInt(st.nextToken());
            }
        }

        // 경로의 수가 2^63 - 1까지 가능하므로 long 타입 필수
        long[][] dp = new long[n][n];
        dp[0][0] = 1;

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dp[i][j] == 0) continue;
                if (i == n - 1 && j == n - 1) continue; // 종점 도착

                int jump = map[i][j];

                // 오른쪽 점프
                if (j + jump < n) {
                    dp[i][j + jump] += dp[i][j];
                }
                // 아래쪽 점프
                if (i + jump < n) {
                    dp[i + jump][j] += dp[i][j];
                }
            }
        }

        System.out.println(dp[n - 1][n - 1]);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N^2)$ — $100 \times 100 = 10,000$회의 반복문으로 0.1초 이내 종료.
- **공간 복잡도**: $O(N^2)$ — $100 \times 100$ 크기의 `long` 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1890-jump/result.png)
