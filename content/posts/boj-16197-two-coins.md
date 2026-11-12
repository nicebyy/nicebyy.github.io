---
title: "[BOJ 16197] 두 동전 - Java (BFS / 백트래킹 4방향 이동)"
date: "2021-08-25"
category: "PS/BOJ"
tags: ["BOJ","BFS","백트래킹","시뮬레이션","Java"]
summary: "두 동전을 동시에 4방향으로 움직여 정확히 하나의 동전만 보드 밖으로 떨어뜨리는 최소 버튼 클릭 횟수를 BFS/백트래킹(최대 10회)으로 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 두 동전 (백준 16197번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 16197번) |
| **문제 링크** | [백준 16197번](https://www.acmicpc.net/problem/16197) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 512MB |
| **입력 조건** | 보드 크기 $N, M \le 20$, 두 동전의 위치 `o`, 벽 `#`, 빈칸 `.` |
| **핵심 규칙** | 상하좌우 버튼을 눌러 **오직 하나의 동전만** 보드 밖으로 떨어뜨리는 최소 버튼 조작 횟수 (10번 초과 시 -1) |

---

## 2. 접근 아이디어: 4차원 방문 체크와 BFS / 백트래킹

### 상태 표현과 종료 조건
- 두 동전의 위치 $(y_1, x_1)$과 $(y_2, x_2)$를 동시에 상태로 다루어야 합니다.
- **종료 및 분기 조건**:
  1. 버튼을 눌렀을 때 두 동전이 동시에 격자 밖으로 떨어지면: 실패 (해당 탐색 가지 중단).
  2. **오직 한 동전만** 격자 밖으로 떨어지면: **목표 달성!** 즉시 현재 이동 횟수 반환.
  3. 두 동전 모두 격자 안에 머물면:
     - 벽(`#`)인 동전은 제자리에 유지, 빈칸인 동전은 이동.
     - 두 동전이 같은 위치에 겹칠 수는 있으나(문제 규칙상 가능), 둘 다 떨어지지 않고 조작 횟수가 10번 미만인 경우에만 다음 큐에 추가.
- 중복 탐색을 방지하기 위해 `visited[y1][x1][y2][x2]` 4차원 불리언 배열을 활용합니다.

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

    static class State {
        Point c1, c2;
        int count;

        State(Point c1, Point c2, int count) {
            this.c1 = c1;
            this.c2 = c2;
            this.count = count;
        }
    }

    static int n, m;
    static char[][] map;
    static int[] dy = {-1, 1, 0, 0};
    static int[] dx = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        n = Integer.parseInt(st.nextToken());
        m = Integer.parseInt(st.nextToken());

        map = new char[n][m];
        List<Point> coins = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            String line = br.readLine();
            for (int j = 0; j < m; j++) {
                map[i][j] = line.charAt(j);
                if (map[i][j] == 'o') {
                    coins.add(new Point(i, j));
                    map[i][j] = '.';
                }
            }
        }

        System.out.println(bfs(coins.get(0), coins.get(1)));
    }

    private static int bfs(Point coin1, Point coin2) {
        Queue<State> queue = new ArrayDeque<>();
        boolean[][][][] visited = new boolean[n][m][n][m];

        queue.offer(new State(coin1, coin2, 0));
        visited[coin1.y][coin1.x][coin2.y][coin2.x] = true;

        while (!queue.isEmpty()) {
            State cur = queue.poll();

            if (cur.count >= 10) return -1;

            for (int i = 0; i < 4; i++) {
                int ny1 = cur.c1.y + dy[i];
                int nx1 = cur.c1.x + dx[i];
                int ny2 = cur.c2.y + dy[i];
                int nx2 = cur.c2.x + dx[i];

                boolean drop1 = isOut(ny1, nx1);
                boolean drop2 = isOut(ny2, nx2);

                // 둘 다 떨어지면 무효
                if (drop1 && drop2) continue;

                // 하나만 떨어지면 성공!
                if (drop1 || drop2) {
                    return cur.count + 1;
                }

                // 둘 다 안 떨어졌을 때: 벽 처리
                if (map[ny1][nx1] == '#') {
                    ny1 = cur.c1.y;
                    nx1 = cur.c1.x;
                }
                if (map[ny2][nx2] == '#') {
                    ny2 = cur.c2.y;
                    nx2 = cur.c2.x;
                }

                if (!visited[ny1][nx1][ny2][nx2]) {
                    visited[ny1][nx1][ny2][nx2] = true;
                    queue.offer(new State(new Point(ny1, nx1), new Point(ny2, nx2), cur.count + 1));
                }
            }
        }

        return -1;
    }

    private static boolean isOut(int y, int x) {
        return y < 0 || y >= n || x < 0 || x >= m;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(4^{10})$ (최대 깊이 10 탐색) — 4차원 방문 체크로 동일 상태가 배제되어 실제 상태 수는 수만 개 미만으로 2초 내에 여유 있게 완료됩니다.
- **공간 복잡도**: $O(N^2 M^2)$ — `visited[20][20][20][20] = 160,000` 바이트로 1MB 미만입니다.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-16197-two-coins/result.png)
