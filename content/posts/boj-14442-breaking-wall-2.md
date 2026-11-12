---
title: '[BOJ 14442] 벽 부수고 이동하기 2 (Java) - 3차원 방문 배열 BFS와 큐 메모리 최적화'
date: '2022-03-09'
category: PS/BOJ
tags:
  - BOJ
  - BFS
  - 그래프탐색
  - 최단경로
  - Java
  - Gold III
summary: >-
  백준 14442번(벽 부수고 이동하기 2) 문제에서 최대 K개의 벽을 부수는 상태를 3차원 visit[y][x][k] 배열로 관리하는 BFS 풀이와 큐 폭발(메모리 초과)을 막기 위한 삽입 직전 방문 마킹 최적화를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 14442번 - 벽 부수고 이동하기 2](https://www.acmicpc.net/problem/14442)
- **난이도**: Gold III
- **시간 / 메모리 제한**: `2초` / `512 MB`

### 핵심 조건 요약

- `N × M`(`1 ≤ N, M ≤ 1,000`) 맵에서 `0`은 이동 가능, `1`은 벽입니다.
- `(1, 1)`에서 `(N, M)`까지 최단 거리(시작 칸·끝 칸 포함)로 이동하되, **최대 `K`개(`1 ≤ K ≤ 10`)의 벽을 부수고 이동**할 수 있습니다.
- 도달이 불가능하면 `-1`을 출력합니다.

---

## 접근 아이디어

1. **왜 3차원 `visit[y][x][breakCount]`가 필요할까?**
   - 같은 좌표 `(x, y)`에 도착하더라도 **지금까지 벽을 몇 개 부수고 왔는지(`0 ~ K`)**에 따라 이후 남은 벽 부수기 기회가 달라집니다.
   - 예를 들어 벽을 `0`개 부수고 늦게 도착한 경로가, 벽을 `K`개 다 써서 먼저 도착한 경로보다 이후에 막힌 벽을 뚫고 목적지까지 갈 수 있는 가능성이 열려 있으므로 상태 차원을 `breakCount`까지 확장(`k + 1` 크기)해야 합니다.

2. **큐 폭발(메모리 초과) 방지 최적화**
   - `N, M ≤ 1,000`, `K ≤ 10`이면 상태 공간이 최대 `1,000 × 1,000 × 11 = 11,000,000`개입니다.
   - 만약 `q.poll()` 시점에 `visit = true`를 체크하면, 큐에서 꺼내기 전까지 상하좌우 인접 칸에서 같은 `(nextX, nextY, nextBreak)` 상태가 큐에 **중복 삽입**되어 메모리가 급증(`~386MB`)하고 실행 시간이 길어집니다.
   - **큐에 `add`하는 시점에 즉시 `visit[nextY][nextX][nextBreak] = true`를 설정**하면, 모든 상태가 큐에 **단 한 번씩만** 들어가 메모리와 속도를 크게 개선할 수 있습니다!

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.LinkedList;
import java.util.Queue;

import static java.util.Arrays.stream;

public class Main {

    static int w, h, k;
    static boolean[][][] visit;
    static int[][] map;
    static int[] dx = {0, 1, 0, -1};
    static int[] dy = {1, 0, -1, 0};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        h = input[0];
        w = input[1];
        k = input[2];

        visit = new boolean[h][w][k + 1];
        map = new int[h][w];

        for (int i = 0; i < h; i++) {
            String line = br.readLine();
            for (int j = 0; j < w; j++) {
                map[i][j] = line.charAt(j) - '0';
            }
        }

        System.out.println(bfs(new Node(0, 0, 1, 0)));
    }

    static int bfs(Node start) {
        Queue<Node> q = new LinkedList<>();
        visit[start.y][start.x][start.breakCount] = true;
        q.add(start);

        while (!q.isEmpty()) {
            Node cur = q.poll();

            // BFS 특성상 목표 지점에 가장 먼저 도달한 경로가 최단 거리
            if (cur.x == w - 1 && cur.y == h - 1) {
                return cur.depth;
            }

            for (int i = 0; i < dx.length; i++) {
                int nextX = cur.x + dx[i];
                int nextY = cur.y + dy[i];

                if (!isRange(nextX, nextY)) continue;

                // 빈 칸(0): 현재 부순 횟수 유지
                if (map[nextY][nextX] == 0 && !visit[nextY][nextX][cur.breakCount]) {
                    visit[nextY][nextX][cur.breakCount] = true;
                    q.add(new Node(nextX, nextY, cur.depth + 1, cur.breakCount));
                }
                // 벽(1): 아직 K번 미만 부쉈다면 벽을 부수고 이동
                else if (map[nextY][nextX] == 1 && cur.breakCount < k && !visit[nextY][nextX][cur.breakCount + 1]) {
                    visit[nextY][nextX][cur.breakCount + 1] = true;
                    q.add(new Node(nextX, nextY, cur.depth + 1, cur.breakCount + 1));
                }
            }
        }
        return -1;
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < w && y < h;
    }

    static class Node {
        int x, y, depth, breakCount;

        public Node(int x, int y, int depth, int breakCount) {
            this.x = x;
            this.y = y;
            this.depth = depth;
            this.breakCount = breakCount;
        }
    }
}
```

---

## 채점 결과

![백준 14442 벽 부수고 이동하기 2 맞았습니다 결과](/images/posts/boj-14442-breaking-wall-2/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N × M × K)` — 각 `(y, x, k)` 상태를 최대 한 번씩만 방문 (`≤ 1.1 × 10^7`)
- **공간 복잡도**: `O(N × M × K)` — 3차원 방문 배열 및 BFS 큐 공간
