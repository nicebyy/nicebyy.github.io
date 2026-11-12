---
title: "[BOJ 2146] 다리 만들기 - Java (BFS 섬 라벨링 & 최단 다리 건설)"
date: "2021-10-14"
category: "PS/BOJ"
tags: ["BOJ","BFS","그래프","최단거리","Java"]
summary: "DFS/BFS로 각 섬을 고유 번호로 라벨링한 뒤, 모든 섬의 해안선에서 동시 멀티 소스 BFS를 확장하여 서로 다른 섬을 잇는 가장 짧은 다리 길이를 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 다리 만들기 (백준 2146번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 2146번) |
| **문제 링크** | [백준 2146번](https://www.acmicpc.net/problem/2146) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 192MB |
| **입력 조건** | 지도 크기 $N \le 100$, 육지(1), 바다(0) |
| **핵심 규칙** | 서로 다른 두 섬을 연결하는 **가장 짧은 다리의 길이** 구하기 |

---

## 2. 접근 아이디어: 섬 라벨링 & 동시 멀티 소스 BFS

### 2단계 해결 알고리즘
1. **1단계: 섬 라벨링 (DFS/BFS)**
   - 연결된 육지들을 각각 1, 2, 3... 고유한 섬 번호로 라벨링합니다.
   - 바다와 맞닿아 있는 해안선 좌표들을 큐에 모두 넣습니다.
2. **2단계: 최단 다리 탐색 (멀티 소스 BFS)**
   - 모든 섬의 해안선에서 동시에 바다를 향해 1칸씩 영역을 확장해 나갑니다.
   - 특정 바다 칸에서 서로 다른 섬 번호로부터 확장되어 온 전선이 만나는 순간, 두 거리의 합이 최소 다리 길이가 됩니다.
   - 또는 각 섬의 해안선에서 다른 섬 번호를 만날 때까지 개별 BFS를 수행해도 $N \le 100$이므로 매우 여유롭습니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static int[][] map;
    static boolean[][] visited;
    static int[] dx = {1, -1, 0, 0};
    static int[] dy = {0, 0, 1, -1};
    static int minBridge = Integer.MAX_VALUE;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());
        map = new int[n][n];

        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int j = 0; j < n; j++) {
                map[i][j] = Integer.parseInt(st.nextToken());
            }
        }

        // 1. 섬 라벨링 (2번부터 번호 부여)
        int islandId = 2;
        visited = new boolean[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (map[i][j] == 1 && !visited[i][j]) {
                    labelIsland(i, j, islandId++);
                }
            }
        }

        // 2. 각 섬의 해안가에서 다른 섬으로의 최단 다리 BFS
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (map[i][j] > 1) {
                    findBridge(i, j, map[i][j]);
                }
            }
        }

        System.out.println(minBridge);
    }

    static void labelIsland(int startX, int startY, int id) {
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{startX, startY});
        visited[startX][startY] = true;
        map[startX][startY] = id;

        while (!q.isEmpty()) {
            int[] cur = q.poll();
            for (int d = 0; d < 4; d++) {
                int nx = cur[0] + dx[d];
                int ny = cur[1] + dy[d];
                if (nx >= 0 && nx < n && ny >= 0 && ny < n) {
                    if (map[nx][ny] == 1 && !visited[nx][ny]) {
                        visited[nx][ny] = true;
                        map[nx][ny] = id;
                        q.add(new int[]{nx, ny});
                    }
                }
            }
        }
    }

    static void findBridge(int startX, int startY, int myIsland) {
        Queue<int[]> q = new LinkedList<>();
        boolean[][] v = new boolean[n][n];

        q.add(new int[]{startX, startY, 0});
        v[startX][startY] = true;

        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int x = cur[0], y = cur[1], dist = cur[2];

            if (dist >= minBridge) break; // 가지치기

            for (int d = 0; d < 4; d++) {
                int nx = x + dx[d];
                int ny = y + dy[d];

                if (nx >= 0 && nx < n && ny >= 0 && ny < n && !v[nx][ny]) {
                    v[nx][ny] = true;

                    // 다른 섬에 도착한 경우
                    if (map[nx][ny] > 0 && map[nx][ny] != myIsland) {
                        minBridge = Math.min(minBridge, dist);
                        return;
                    }

                    // 바다인 경우 계속 다리 건설
                    if (map[nx][ny] == 0) {
                        q.add(new int[]{nx, ny, dist + 1});
                    }
                }
            }
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N^4)$ 최악이라도 $N = 100$이므로 강력한 가지치기를 통해 0.2초 이내에 매우 안정적으로 통과.
- **공간 복잡도**: $O(N^2)$ — $100 \times 100$ 격자 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2146-bridge-making/result.png)
