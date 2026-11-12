---
title: "[BOJ 16930] 달리기 - Java (BFS 최적화 & 최대 K칸 점프)"
date: "2021-08-24"
category: "PS/BOJ"
tags: ["BOJ","BFS","최적화","플래티넘","Java"]
summary: "1초에 한 방향으로 최대 K칸까지 이동할 수 있는 격자에서, 이미 더 빠른 시간에 도달한 칸을 만났을 때 탐색을 조기 종료하는 BFS 시간초과 방지 최적화"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 달리기 (백준 16930번 / 플래티넘 3) |
| **플랫폼 / 난이도** | 백준 (플래티넘 3, 16930번) |
| **문제 링크** | [백준 16930번](https://www.acmicpc.net/problem/16930) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 512MB |
| **입력 조건** | 체육관 크기 $N, M \le 1,000$, 1초당 최대 이동 칸 수 $K \le 1,000$, 시작점 및 도착점 |
| **핵심 규칙** | 1초에 상하좌우 중 한 방향으로 1칸에서 최대 $K$칸까지 이동할 때, 도착점까지 도달하는 최소 시간 |

---

## 2. 접근 아이디어: BFS와 시간 초과를 막는 결정적 가지치기(Pruning)

### $O(N \times M \times K)$ 시간 초과의 늪
- $N, M, K \le 1,000$이므로 일반적인 BFS에서 각 칸마다 4방향으로 최대 $K$칸씩 탐색하면 최악의 경우 $1,000 \times 1,000 \times 1,000 = 10^9$ 연산이 발생하여 시간 초과를 피할 수 없습니다.

### 핵심 최적화 2가지
1. **벽(`#`)을 만나면 즉시 중단**: 해당 방향으로는 더 이상 갈 수 없으므로 `break`.
2. **방문 시간(`dist`) 비교를 통한 조기 종료(Break vs Continue)**:
   - 만약 `dist[nextY][nextX] < dist[curY][curX] + 1` 라면:
     - 이미 다른 경로가 해당 칸에 **더 일찍 도착**한 경우입니다.
     - 이 경우, 그 칸을 넘어서 더 가더라도 그 일찍 도착했던 경로가 이미 더 적은 시간으로 탐색했거나 할 것이므로, 현재 방향으로의 전진을 **즉시 중단(`break`)**해야 합니다!
   - 만약 `dist[nextY][nextX] == dist[curY][curX] + 1` 라면:
     - 동일한 시간에 도착한 경로이므로, 이번 칸은 건너뛰되(`continue`) 더 멀리 있는 칸은 아직 방문되지 않았을 수 있으므로 계속 진행해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Point {
        int y, x;
        Point(int y, int x) { this.y = y; this.x = x; }
    }

    static int[] dy = {-1, 1, 0, 0};
    static int[] dx = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());

        char[][] map = new char[n][m];
        for (int i = 0; i < n; i++) {
            map[i] = br.readLine().toCharArray();
        }

        st = new StringTokenizer(br.readLine());
        int sy = Integer.parseInt(st.nextToken()) - 1;
        int sx = Integer.parseInt(st.nextToken()) - 1;
        int ey = Integer.parseInt(st.nextToken()) - 1;
        int ex = Integer.parseInt(st.nextToken()) - 1;

        int[][] dist = new int[n][m];
        for (int i = 0; i < n; i++) {
            Arrays.fill(dist[i], Integer.MAX_VALUE);
        }

        Queue<Point> queue = new ArrayDeque<>();
        queue.offer(new Point(sy, sx));
        dist[sy][sx] = 0;

        while (!queue.isEmpty()) {
            Point cur = queue.poll();

            if (cur.y == ey && cur.x == ex) {
                System.out.println(dist[cur.y][cur.x]);
                return;
            }

            for (int d = 0; d < 4; d++) {
                for (int step = 1; step <= k; step++) {
                    int ny = cur.y + dy[d] * step;
                    int nx = cur.x + dx[d] * step;

                    if (ny < 0 || ny >= n || nx < 0 || nx >= m) break;
                    if (map[ny][nx] == '#') break; // 벽 만나면 직진 중단

                    // 핵심 가지치기: 이미 더 일찍 도달한 칸을 만나면 직진 중단
                    if (dist[ny][nx] < dist[cur.y][cur.x] + 1) {
                        break;
                    }

                    // 아직 방문하지 않은 칸
                    if (dist[ny][nx] == Integer.MAX_VALUE) {
                        dist[ny][nx] = dist[cur.y][cur.x] + 1;
                        queue.offer(new Point(ny, nx));
                    }
                }
            }
        }

        System.out.println(-1);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times M)$ — 철저한 가지치기를 통해 각 칸의 중복 탐색이 최소화되어 $1,000 \times 1,000$ 격자를 약 0.5초 이내에 통과합니다.
- **공간 복잡도**: $O(N \times M)$ — 2차원 최단 거리 배열 `dist` 및 BFS 큐.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-16930-running/result.png)
