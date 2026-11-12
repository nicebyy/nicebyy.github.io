---
title: "[BOJ 1937] 욕심쟁이 판다 - Java (DFS & 2차원 DP 메모이제이션)"
date: "2021-06-14"
category: "PS/BOJ"
tags: ["BOJ","DFS","DP","메모이제이션","Java"]
summary: "판다가 대나무가 더 많은 인접 칸으로만 이동할 수 있을 때, dp[r][c]를 해당 칸에서 출발하여 살 수 있는 최대 일수로 메모이제이션하여 최장 경로를 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 욕심쟁이 판다 (백준 1937번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 1937번) |
| **문제 링크** | [백준 1937번](https://www.acmicpc.net/problem/1937) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 256MB |
| **입력 조건** | 대나무 숲 크기 $n \le 500$, 각 칸의 대나무 양 ($1 \le \text{bamboo} \le 1,000,000$) |
| **핵심 규칙** | 판다는 현재 칸보다 대나무가 더 많은 칸으로만 이동 가능. 판다가 살 수 있는 최대 이동 칸 수 구하기 |

---

## 2. 접근 아이디어: DFS + 2차원 DP 메모이제이션 (DAG 최장 경로)

### 단순 DFS의 지수 시간 초과와 메모이제이션
- 모든 칸에서 시작하여 DFS로 갈 수 있는 길을 탐색하면 동일한 칸을 여러 경로에서 중복 방문하게 되어 $O(4^{n^2})$의 시간 초과가 발생합니다.
- 대나무 양이 항상 증가하는 방향으로만 이동하므로 순환 사이클이 없는 **DAG(Directed Acyclic Graph)**입니다.
- 따라서 **`dp[y][x]`**(칸 $(y, x)$에서 출발했을 때 판다가 이동할 수 있는 최대 칸 수)에 계산 결과를 메모이제이션합니다:
  - 이미 `dp[y][x] > 0`이면 계산된 값을 즉시 반환.
  - 상하좌우 중 $map[ny][nx] > map[y][x]$를 만족하는 다음 칸에 대해:
    $$dp[y][x] = \max(dp[y][x], 1 + \text{dfs}(ny, nx))$$
  - 모든 칸 $(y, x)$에 대해 한 번씩 계산되므로 전체 복잡도는 $O(n^2)$으로 최적화됩니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static int[][] map;
    static int[][] dp;
    static int[] dy = {-1, 1, 0, 0};
    static int[] dx = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        map = new int[n][n];
        dp = new int[n][n];

        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int j = 0; j < n; j++) {
                map[i][j] = Integer.parseInt(st.nextToken());
            }
        }

        int maxLife = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                maxLife = Math.max(maxLife, dfs(i, j));
            }
        }

        System.out.println(maxLife);
    }

    private static int dfs(int y, int x) {
        // 이미 계산된 경우 즉시 반환 (메모이제이션)
        if (dp[y][x] != 0) {
            return dp[y][x];
        }

        dp[y][x] = 1; // 최소 1칸(현재 칸) 보장

        for (int i = 0; i < 4; i++) {
            int ny = y + dy[i];
            int nx = x + dx[i];

            if (ny >= 0 && ny < n && nx >= 0 && nx < n) {
                if (map[ny][nx] > map[y][x]) {
                    dp[y][x] = Math.max(dp[y][x], 1 + dfs(ny, nx));
                }
            }
        }

        return dp[y][x];
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(n^2)$ — 모든 칸은 최대 한 번만 계산되므로 $500 \times 500 = 2.5 \times 10^5$ 연산으로 약 0.3초 내에 완료됩니다.
- **공간 복잡도**: $O(n^2)$ — 대나무 맵과 2차원 DP 테이블 및 최대 깊이 $n^2$의 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1937-greedy-panda/result.png)
