---
title: '[BOJ 1445] 일요일 아침의 데이트 (Java) - 다중 우선순위 다익스트라(PriorityQueue)'
date: '2022-04-08'
category: PS/BOJ
tags:
  - BOJ
  - 다익스트라
  - 그래프탐색
  - PriorityQueue
  - Java
  - Gold II
summary: >-
  백준 1445번(일요일 아침의 데이트) 문제에서 쓰레기 칸 통과 최소화를 1순위, 쓰레기 인접 칸 경유 최소화를 2순위로 두는 우선순위 큐 탐색과 S/F 예외 처리 방법을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1445번 - 일요일 아침의 데이트](https://www.acmicpc.net/problem/1445)
- **난이도**: Gold II
- **시간 / 메모리 제한**: `2초` / `128 MB`

### 핵심 조건 요약

- `N × M`(`3 ≤ N, M ≤ 50`) 숲 지도에서 시작점 `S`부터 꽃 위치 `F`까지 이동합니다.
- 우선순위:
  1. **쓰레기(`g`)가 있는 칸을 지나는 횟수**를 최소화합니다.
  2. 위 횟수가 같다면 **쓰레기 옆(인접한 빈 칸)을 지나는 횟수**를 최소화합니다.
- **중요 예외**: 시작 칸 `S`와 도착 칸 `F`는 쓰레기와 인접해 있더라도 카운트하지 않습니다.

---

## 접근 아이디어

일반 BFS는 "이동 칸 수"만 최단으로 보장하지만, 이 문제는 **(쓰레기 통과 수 `gCnt`, 쓰레기 인접 칸 수 `mCnt`)** 두 가지 가중치를 우선순위로 최소화해야 하므로 **우선순위 큐(`PriorityQueue`)를 사용한 다익스트라(최소 비용 우선 탐색)**가 적합합니다.

### 구현 단계

1. **쓰레기 인접 칸(`m`) 사전 마킹**:
   - 입력을 받을 때 쓰레기(`g`) 좌표를 `gList`에 모아 둡니다.
   - `setNearby()`에서 각 `g`의 상하좌우 칸 중 **빈 칸(`.`)인 경우만 `'m'`으로 변경**합니다.
   - 이렇게 하면 `S`와 `F`는 자연스럽게 `'m'`으로 바뀌지 않아 문제의 예외 조건(`S, F` 미포함)을 별도 분기 없이 처리할 수 있습니다!
2. **우선순위 큐 정렬 기준**:
   - `o1.gCnt == o2.gCnt ? o1.mCnt - o2.mCnt : o1.gCnt - o2.gCnt`
3. **도착 시 즉시 반환**:
   - 가장 비용이 작은 상태부터 `poll()`되므로, `map[cur.y][cur.x] == 'F'`를 처음 꺼낸 순간이 곧 최적해입니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.LinkedList;
import java.util.PriorityQueue;
import java.util.Queue;

import static java.util.Arrays.stream;

public class Main {

    static int[] dx = {0, 0, 1, -1};
    static int[] dy = {1, -1, 0, 0};
    static char[][] map;
    static Point start;
    static int w, h;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        h = input[0];
        w = input[1];
        map = new char[h][w];

        LinkedList<Point> gList = new LinkedList<>();
        for (int i = 0; i < h; i++) {
            map[i] = br.readLine().toCharArray();
            for (int j = 0; j < w; j++) {
                if (map[i][j] == 'S') {
                    start = new Point(j, i, 0, 0);
                } else if (map[i][j] == 'g') {
                    gList.add(new Point(j, i));
                }
            }
        }

        setNearby(gList);
        Point result = bfs(start);
        System.out.println(result.gCnt + " " + result.mCnt);
    }

    static void setNearby(LinkedList<Point> gList) {
        for (Point point : gList) {
            for (int i = 0; i < dx.length; i++) {
                int nextX = point.x + dx[i];
                int nextY = point.y + dy[i];

                // 빈 칸('.')만 'm'으로 변경하여 S, F, g가 덮어씌워지지 않도록 처리
                if (isRange(nextX, nextY) && map[nextY][nextX] == '.') {
                    map[nextY][nextX] = 'm';
                }
            }
        }
    }

    static Point bfs(Point start) {
        Queue<Point> q = new PriorityQueue<>((o1, o2) ->
                o1.gCnt == o2.gCnt ? o1.mCnt - o2.mCnt : o1.gCnt - o2.gCnt);
        boolean[][] visit = new boolean[h][w];

        q.add(start);

        while (!q.isEmpty()) {
            Point cur = q.poll();

            if (visit[cur.y][cur.x]) {
                continue;
            }
            visit[cur.y][cur.x] = true;

            if (map[cur.y][cur.x] == 'F') {
                return cur;
            }

            for (int i = 0; i < dx.length; i++) {
                int nextX = cur.x + dx[i];
                int nextY = cur.y + dy[i];

                if (!isRange(nextX, nextY) || visit[nextY][nextX]) {
                    continue;
                }

                switch (map[nextY][nextX]) {
                    case 'g' -> q.add(new Point(nextX, nextY, cur.gCnt + 1, cur.mCnt));
                    case 'm' -> q.add(new Point(nextX, nextY, cur.gCnt, cur.mCnt + 1));
                    default -> q.add(new Point(nextX, nextY, cur.gCnt, cur.mCnt));
                }
            }
        }
        return null;
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && y < h && x < w;
    }

    static class Point {
        int x, y, gCnt, mCnt;

        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        public Point(int x, int y, int gCnt, int mCnt) {
            this.x = x;
            this.y = y;
            this.gCnt = gCnt;
            this.mCnt = mCnt;
        }
    }
}
```

> **구현 팁 (방문 처리 위치)**: 우선순위 큐 기반 다익스트라에서는 큐에 넣는(`add`) 시점이 아니라 **큐에서 꺼내는(`poll`) 시점에 `visit[cur.y][cur.x] = true`를 체크**해야, 더 낮은 비용의 우회 경로가 뒤늦게 큐에 들어오더라도 막히지 않고 최단 비용으로 정상 선택됩니다.

---

## 채점 결과

![백준 1445 일요일 아침의 데이트 맞았습니다 결과](/images/posts/boj-1445-sunday-morning-date/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N × M log(N × M))` — 격자 크기 `N × M ≤ 2,500`
- **공간 복잡도**: `O(N × M)` — 지도 배열, 방문 배열, 우선순위 큐 저장 공간
