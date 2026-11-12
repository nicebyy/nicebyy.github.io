---
title: '[BOJ 13460] 구슬 탈출 2 (Java) - 4차원 방문 배열 BFS와 구슬 겹침 보정'
date: '2022-04-07'
category: PS/BOJ
tags:
  - BOJ
  - BFS
  - 구현
  - 시뮬레이션
  - 그래프탐색
  - Java
  - Gold I
summary: >-
  백준 13460번(구슬 탈출 2) 문제에서 빨간 구슬과 파란 구슬의 좌표를 함께 상태로 관리하는 4차원 방문 배열 BFS와, 두 구슬이 같은 칸에서 만났을 때 이동 전 좌표로 위치를 한 칸 보정하는 핵심 로직을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 13460번 - 구슬 탈출 2](https://www.acmicpc.net/problem/13460)
- **난이도**: Gold I
- **시간 / 메모리 제한**: `2초` / `512 MB`

### 핵심 조건 요약

- `N × M`(`3 ≤ N, M ≤ 10`) 보드에 빨간 구슬(`R`), 파란 구슬(`B`), 구멍(`O`), 벽(`#`)이 있습니다.
- 상·하·좌·우로 보드를 기울여 두 구슬을 동시에 벽에 닿을 때까지 굴립니다.
- **빨간 구슬만** 구멍에 빠뜨리는 최소 횟수를 출력하며, **파란 구슬이 구멍에 빠지면(동시 포함) 실패**, **10번 이하로 움직여 빼낼 수 없으면 `-1`**을 출력합니다.

---

## 접근 아이디어

최소 기울임 횟수를 구하는 문제이므로 **BFS**를 사용합니다. 단, 두 구슬의 위치가 서로 영향을 주기 때문에 다음 3가지를 정확히 설계해야 합니다.

### 1. 4차원 방문 배열 `visit[ry][rx][by][bx]`

빨간 구슬이 같은 칸에 있더라도 파란 구슬의 위치가 다르면 전혀 다른 보드 상태입니다. 따라서 `(red.y, red.x, blue.y, blue.x)` 4차원 좌표를 방문 키로 사용해야 합니다.

### 2. 이동 횟수 제한 (`move > 9` 중단)

`curBoard`의 현재 이동 횟수가 `10` 이상(`move > 9`)이면 여기서 한 번 더 굴릴 경우 `11`회가 되므로 즉시 탐색을 중단하고 `-1`을 반환합니다.

### 3. 구슬이 같은 칸에 겹칠 때의 위치 보정

벽(`#`)이나 구멍(`O`)을 만날 때까지 각 구슬을 독립적으로 굴린 뒤:
- **파란 구슬이 구멍에 빠진 경우** → 실패 상태이므로 `continue` (빨간 구슬이 함께 빠져도 실패!)
- **빨간 구슬만 구멍에 빠진 경우** → `curBoard.move + 1` 즉시 반환!
- **두 구슬이 같은 칸에 멈춘 경우** → 두 구슬은 한 칸에 동시에 있을 수 없으므로, **기울이기 직전 좌표(`curBoard`) 기준으로 더 뒤에 있던 구슬**을 이동 방향 반대쪽으로 한 칸 물러나게 보정합니다.
  - 예: 아래로 기울일 때(`dy = +1`), 직전 `y`좌표가 더 컸던(더 아래에 있던) 구슬이 먼저 도착하고, 뒤에 있던 구슬이 그 위(`y -= 1`)에 멈춥니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.LinkedList;

import static java.util.Arrays.stream;

public class Main {

    static char[][] map;
    // 0: 아래, 1: 위, 2: 오른쪽, 3: 왼쪽
    static int[] dx = {0, 0, 1, -1};
    static int[] dy = {1, -1, 0, 0};
    static int w, h;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        h = input[0];
        w = input[1];

        map = new char[h][w];
        Board board = new Board();

        for (int i = 0; i < h; i++) {
            map[i] = br.readLine().toCharArray();
            for (int j = 0; j < w; j++) {
                switch (map[i][j]) {
                    case 'R' -> board.red = new Point(j, i);
                    case 'B' -> board.blue = new Point(j, i);
                    case 'O' -> Board.hole = new Point(j, i);
                }
            }
        }

        System.out.println(bfs(board));
    }

    static int bfs(Board board) {
        boolean[][][][] visit = new boolean[h][w][h][w];
        LinkedList<Board> q = new LinkedList<>();
        q.add(board);
        visit[board.red.y][board.red.x][board.blue.y][board.blue.x] = true;

        while (!q.isEmpty()) {
            Board curBoard = q.poll();

            // 10번을 초과하여 이동할 수 없음
            if (curBoard.move > 9) {
                break;
            }

            for (int i = 0; i < dx.length; i++) {
                int nextRX = curBoard.red.x;
                int nextRY = curBoard.red.y;
                int nextBX = curBoard.blue.x;
                int nextBY = curBoard.blue.y;

                // 빨간 구슬을 벽 또는 구멍까지 굴리기
                while (isRange(nextRX + dx[i], nextRY + dy[i])) {
                    nextRX += dx[i];
                    nextRY += dy[i];
                    if (nextRX == Board.hole.x && nextRY == Board.hole.y) break;
                }

                // 파란 구슬을 벽 또는 구멍까지 굴리기
                while (isRange(nextBX + dx[i], nextBY + dy[i])) {
                    nextBX += dx[i];
                    nextBY += dy[i];
                    if (nextBX == Board.hole.x && nextBY == Board.hole.y) break;
                }

                // 파란 구슬이 구멍에 빠지면 무조건 실패
                if (Board.hole.x == nextBX && Board.hole.y == nextBY) {
                    continue;
                }
                // 빨간 구슬만 빠진 경우 성공
                if (Board.hole.x == nextRX && Board.hole.y == nextRY) {
                    return curBoard.move + 1;
                }

                // 두 구슬이 같은 칸에 멈췄다면 이동 전 위치 비교로 한 칸 보정
                if (nextRX == nextBX && nextRY == nextBY) {
                    switch (i) {
                        case 0 -> { // 아래
                            if (curBoard.red.y > curBoard.blue.y) nextBY -= 1;
                            else nextRY -= 1;
                        }
                        case 1 -> { // 위
                            if (curBoard.red.y < curBoard.blue.y) nextBY += 1;
                            else nextRY += 1;
                        }
                        case 2 -> { // 오른쪽
                            if (curBoard.red.x > curBoard.blue.x) nextBX -= 1;
                            else nextRX -= 1;
                        }
                        case 3 -> { // 왼쪽
                            if (curBoard.red.x < curBoard.blue.x) nextBX += 1;
                            else nextRX += 1;
                        }
                    }
                }

                if (!visit[nextRY][nextRX][nextBY][nextBX]) {
                    visit[nextRY][nextRX][nextBY][nextBX] = true;
                    q.add(new Board(new Point(nextBX, nextBY), new Point(nextRX, nextRY), curBoard.move + 1));
                }
            }
        }
        return -1;
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < w && y < h && map[y][x] != '#';
    }

    static class Point {
        int x, y;

        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }

    static class Board {
        Point blue, red;
        static Point hole;
        int move;

        public Board() {
            this.move = 0;
        }

        public Board(Point blue, Point red, int move) {
            this.blue = blue;
            this.red = red;
            this.move = move;
        }
    }
}
```

---

## 채점 결과

![백준 13460 구슬 탈출 2 맞았습니다 결과](/images/posts/boj-13460-marble-escape-2/result.png)

---

## 복잡도 분석

- **시간 복잡도**: 상태 수 `O((N × M)^2)` (`N, M ≤ 10`이므로 실제 빈 칸 상태 수는 매우 적고, 최대 깊이 `10`으로 제한되어 `2초` 내 여유롭게 통과)
- **공간 복잡도**: `O((N × M)^2)` — 4차원 방문 배열 저장 공간
