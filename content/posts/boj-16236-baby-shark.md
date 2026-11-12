---
title: "[BOJ 16236] 아기 상어 - Java (BFS 최단거리 & 먹이 우선순위 시뮬레이션)"
date: "2021-10-22"
category: "PS/BOJ"
tags: ["BOJ","BFS","시뮬레이션","구현","Java"]
summary: "현재 크기보다 작은 물고기 중 최단거리, 가장 위, 가장 왼쪽 순으로 우선순위가 높은 먹이를 BFS로 찾아 이동하고 성장하는 전형적인 삼성 기출 시뮬레이션"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 아기 상어 (백준 16236번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 16236번) |
| **문제 링크** | [백준 16236번](https://www.acmicpc.net/problem/16236) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 512MB |
| **입력 조건** | 공간 크기 $N \le 20$, 물고기 크기 $1 \sim 6$, 아기 상어 초기 위치 `9` (초기 크기 2) |
| **핵심 규칙** | 먹을 수 있는 물고기(크기 < 상어 크기) 중 **1) 최단거리, 2) 가장 위(행 최소), 3) 가장 왼쪽(열 최소)** 우선순위로 이동하여 먹음. 자신의 크기만큼 먹으면 크기 +1 |

---

## 2. 접근 아이디어: BFS 탐색 & 우선순위 큐(PriorityQueue) 먹이 선별

### BFS와 먹이 우선순위 정렬
- 아기 상어는 자신보다 큰 물고기가 있는 칸은 지나갈 수 없으며, 크기가 같거나 빈 칸은 지나갈 수 있습니다.
- 매 턴마다 BFS를 수행하여 먹을 수 있는 모든 물고기를 탐색합니다.
- 거리가 같은 후보가 여러 마리일 수 있으므로, **(거리 오름차순, 행 오름차순, 열 오름차순)** 기준의 `PriorityQueue` 또는 정렬을 사용하여 최우선 물고기를 선정합니다.
- 물고기를 먹으면 그 위치로 상어가 이동하고, 경과 시간을 누적한 뒤, 다시 BFS를 반복합니다. 더 이상 먹을 수 있는 물고기가 없으면 누적 시간을 출력합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Fish implements Comparable<Fish> {
        int r, c, dist;
        Fish(int r, int c, int dist) {
            this.r = r;
            this.c = c;
            this.dist = dist;
        }
        @Override
        public int compareTo(Fish o) {
            if (this.dist != o.dist) return this.dist - o.dist; // 1. 거리 오름차순
            if (this.r != o.r) return this.r - o.r;             // 2. 가장 위(행 최소)
            return this.c - o.c;                                 // 3. 가장 왼쪽(열 최소)
        }
    }

    static int n;
    static int[][] map;
    static int sharkR, sharkC, sharkSize = 2, eaten = 0;
    static int totalTime = 0;
    static int[] dr = {-1, 1, 0, 0};
    static int[] dc = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());
        map = new int[n][n];

        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int j = 0; j < n; j++) {
                map[i][j] = Integer.parseInt(st.nextToken());
                if (map[i][j] == 9) {
                    sharkR = i;
                    sharkC = j;
                    map[i][j] = 0; // 상어 위치 빈 칸 처리
                }
            }
        }

        while (true) {
            Fish target = findTarget();
            if (target == null) break; // 더 이상 먹을 수 있는 물고기 없음

            // 상어 이동 및 먹기
            sharkR = target.r;
            sharkC = target.c;
            map[sharkR][sharkC] = 0;
            totalTime += target.dist;
            eaten++;

            // 성장 조건
            if (eaten == sharkSize) {
                sharkSize++;
                eaten = 0;
            }
        }

        System.out.println(totalTime);
    }

    static Fish findTarget() {
        Queue<int[]> q = new LinkedList<>();
        boolean[][] visited = new boolean[n][n];
        PriorityQueue<Fish> candidates = new PriorityQueue<>();

        q.add(new int[]{sharkR, sharkC, 0});
        visited[sharkR][sharkC] = true;

        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int r = cur[0], c = cur[1], d = cur[2];

            for (int i = 0; i < 4; i++) {
                int nr = r + dr[i];
                int nc = c + dc[i];

                if (nr < 0 || nr >= n || nc < 0 || nc >= n || visited[nr][nc]) continue;

                // 상어 크기 이하만 지나갈 수 있음
                if (map[nr][nc] <= sharkSize) {
                    visited[nr][nc] = true;
                    q.add(new int[]{nr, nc, d + 1});

                    // 먹을 수 있는 물고기인 경우 후보 등록
                    if (map[nr][nc] > 0 && map[nr][nc] < sharkSize) {
                        candidates.add(new Fish(nr, nc, d + 1));
                    }
                }
            }
        }

        return candidates.peek(); // 최우선 물고기 반환
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(K \times N^2)$ — 물고기 최대 개수 $K \le N^2 = 400$, 매 턴 BFS $O(N^2) = 400$이므로 최대 $1.6 \times 10^5$ 연산으로 0.15초 이내에 매우 여유롭게 통과.
- **공간 복잡도**: $O(N^2)$ — $20 \times 20$ 격자 및 BFS 큐.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-16236-baby-shark/result.png)
