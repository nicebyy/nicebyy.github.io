---
title: "[BOJ 1303] 전쟁 - 전투 - Java (BFS / DFS 연결 요소 뭉치 크기 제곱 합)"
date: "2021-08-21"
category: "PS/BOJ"
tags: ["BOJ","BFS","DFS","그래프","Java"]
summary: "우리 편(W)과 적국(B) 병사들이 상하좌우로 뭉쳐있을 때 N명이 뭉치면 N^2의 위력을 낼 때, BFS로 연결 컴포넌트 크기를 구해 각 진영의 위력 합을 계산"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 전쟁 - 전투 (백준 1303번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 1303번) |
| **문제 링크** | [백준 1303번](https://www.acmicpc.net/problem/1303) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 전쟁터 가로 $N$, 세로 $M$ ($N, M \le 100$), 아군 `W`, 적군 `B` |
| **핵심 규칙** | $K$명이 상하좌우로 뭉쳐있을 때 그 무리의 위력은 $K^2$. 아군과 적군의 총 위력을 각각 구하기 |

---

## 2. 접근 아이디어: 연결 요소(Connected Component) 크기 탐색 (DFS / BFS)

### 무리 크기와 위력 계산
- 전형적인 격자 그래프 탐색 문제입니다.
- 방문하지 않은 칸을 발견하면 DFS 또는 BFS를 시작하여, 상하좌우 인접한 칸 중 **같은 문자(`W` 또는 `B`)**를 가진 칸으로만 이동하며 무리의 크기 $K$를 카운트합니다.
- 탐색이 완료되면 그 진영의 위력 합계에 $K^2$을 누적합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n, m;
    static char[][] map;
    static boolean[][] visited;
    static int[] dy = {-1, 1, 0, 0};
    static int[] dx = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        n = Integer.parseInt(st.nextToken()); // 가로 (열)
        m = Integer.parseInt(st.nextToken()); // 세로 (행)

        map = new char[m][n];
        for (int i = 0; i < m; i++) {
            map[i] = br.readLine().toCharArray();
        }

        visited = new boolean[m][n];
        int whitePower = 0;
        int bluePower = 0;

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (!visited[i][j]) {
                    int count = dfs(i, j, map[i][j]);
                    int power = count * count;

                    if (map[i][j] == 'W') {
                        whitePower += power;
                    } else {
                        bluePower += power;
                    }
                }
            }
        }

        System.out.println(whitePower + " " + bluePower);
    }

    private static int dfs(int y, int x, char team) {
        visited[y][x] = true;
        int count = 1;

        for (int i = 0; i < 4; i++) {
            int ny = y + dy[i];
            int nx = x + dx[i];

            if (ny >= 0 && ny < m && nx >= 0 && nx < n) {
                if (!visited[ny][nx] && map[ny][nx] == team) {
                    count += dfs(ny, nx, team);
                }
            }
        }

        return count;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(M \times N)$ — 각 칸을 한 번씩만 방문하므로 $100 \times 100 = 10,000$ 연산으로 0.1초 이내 완료.
- **공간 복잡도**: $O(M \times N)$ — 방문 배열 및 DFS 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1303-war-battle/result.png)
