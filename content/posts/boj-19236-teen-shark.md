---
title: '[BOJ 19236] 청소년 상어 (Java) - 2차원 상태 복제와 백트래킹 시뮬레이션'
date: '2022-05-11'
category: PS/BOJ
tags:
  - BOJ
  - 구현
  - 시뮬레이션
  - DFS
  - 백트래킹
  - Java
  - Gold II
summary: >-
  백준 19236번(청소년 상어) 문제에서 번호순 물고기 이동과 상어의 다중 칸 이동을 DFS 백트래킹으로 구현할 때, 2차원 map 배열과 Fish 객체 배열을 깊은 복사로 원상 복구하는 방법을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 19236번 - 청소년 상어](https://www.acmicpc.net/problem/19236)
- **난이도**: Gold II
- **시간 / 메모리 제한**: `1초` / `512 MB`

### 핵심 조건 요약

- `4 × 4` 격자에 `1 ~ 16`번 물고기가 각각 `8`방향(1부터 반시계 방향 45도씩)을 가지고 1마리씩 배치되어 있습니다.
- 시작 시 상어는 `(0, 0)` 물고기를 먹고 해당 물고기의 방향을 얻습니다.
- 이후 매 턴은 다음 순서로 진행됩니다.
  1. **물고기 이동**: `1`번부터 `16`번까지 살아있는 물고기가 순서대로 이동합니다. 이동 가능 칸(빈칸 또는 다른 물고기)이 나올 때까지 45도 반시계 회전하며, 상어 칸이나 격자 밖으로는 이동할 수 없습니다. 다른 물고기 칸으로 이동할 때는 서로 위치를 맞바꿉니다(`swap`).
  2. **상어 이동**: 현재 방향에 있는 칸 중 물고기가 있는 칸으로 **한 번에 여러 칸** 이동할 수 있습니다. (지나가는 칸의 물고기는 먹지 않으며, 빈칸으로는 이동 불가)
- 상어가 더 이상 이동할 수 없으면 종료하며, **먹을 수 있는 물고기 번호 합의 최댓값**을 구합니다.

---

## 접근 아이디어

격자 크기가 `4 × 4`로 매우 작고, 상어가 한 번에 선택할 수 있는 이동 후보는 최대 `3`칸뿐이므로 **DFS 완전 탐색(백트래킹)**으로 모든 시나리오를 탐색할 수 있습니다.

### 핵심 구현 포인트: 상태 스냅샷과 깊은 복사(Deep Copy)

상어가 어느 물고기를 먹느냐에 따라 **그 다음 턴의 물고기 16마리 전체의 위치와 방향(`fish[]`, `map[][]`)이 완전히 달라집니다.**
따라서 DFS 재귀 호출 전 현재 상태를 반드시 별도 복사본에 보관해야 합니다.

1. `cloneFish` 배열(각 `Fish` 객체를 `new Fish(...)`로 **새로 생성해 깊은 복사**)과 `cloneMap` 2차원 배열(`map[i].clone()`)을 저장합니다.
2. `moveFish(x, y)`로 물고기들을 이동시킵니다.
3. 상어의 현재 방향 `d`에 대해 `i = 1, 2, 3`칸 앞을 확인하며, 살아있는 물고기가 있으면 먹은 상태로 다음 `dfs(...)`를 호출합니다.
4. 상어의 모든 선택지 탐색이 끝나면, **물고기 이동 전 스냅샷(`cloneFish`, `cloneMap`)으로 상태를 완전히 원상 복구**합니다.

---

## Java 풀이 코드

```java
import java.util.Scanner;

public class Main {

    static Fish[] fish = new Fish[17];
    static int[][] map = new int[4][4];
    static int max = 0;

    // 1~8번 방향: ↑, ↖, ←, ↙, ↓, ↘, →, ↗ (행/열 기준 반시계 45도 회전)
    static int[] dx = {0, -1, -1, 0, 1, 1, 1, 0, -1};
    static int[] dy = {0, 0, -1, -1, -1, 0, 1, 1, 1};

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                int fishNum = sc.nextInt();
                int fishDir = sc.nextInt();
                map[i][j] = fishNum;
                fish[fishNum] = new Fish(i, j, fishDir, true);
            }
        }

        // (0, 0) 위치의 물고기를 먹고 시작
        int fishNum = map[0][0];
        fish[fishNum].alive = false;
        map[0][0] = -1;

        dfs(0, 0, fish[fishNum].dir, fishNum);
        System.out.println(max);
    }

    // 상어 현재 위치 (x, y)
    public static void moveFish(int x, int y) {
        for (int i = 1; i <= 16; i++) {
            Fish moveFish = fish[i];
            if (!moveFish.alive) {
                continue;
            }

            // 현재 방향부터 최대 8방향 회전하며 이동 가능한 칸 탐색
            for (int j = 0; j < 8; j++) {
                int nextDir = (moveFish.dir + j) >= 9 ? (moveFish.dir + j) % 8 : (moveFish.dir + j);
                int nextX = moveFish.x + dx[nextDir];
                int nextY = moveFish.y + dy[nextDir];

                // 격자 밖이거나 상어가 있는 칸이면 회전
                if (!isRange(nextX, nextY) || (nextX == x && nextY == y)) {
                    continue;
                }

                if (map[nextX][nextY] != -1) {
                    // 다른 살아있는 물고기와 위치 교환(swap)
                    Fish otherFish = fish[map[nextX][nextY]];
                    map[moveFish.x][moveFish.y] = map[nextX][nextY];
                    map[nextX][nextY] = i;
                    otherFish.x = moveFish.x;
                    otherFish.y = moveFish.y;
                } else {
                    // 빈칸으로 단순 이동
                    map[moveFish.x][moveFish.y] = -1;
                    map[nextX][nextY] = i;
                }

                moveFish.x = nextX;
                moveFish.y = nextY;
                moveFish.dir = nextDir;
                break;
            }
        }
    }

    public static void dfs(int x, int y, int d, int sum) {
        if (max < sum) {
            max = sum;
        }

        // 물고기 이동 전 상태 스냅샷 저장 (깊은 복사)
        Fish[] cloneFish = new Fish[17];
        for (int i = 1; i < 17; i++) {
            cloneFish[i] = new Fish(fish[i].x, fish[i].y, fish[i].dir, fish[i].alive);
        }
        int[][] cloneMap = new int[4][4];
        for (int i = 0; i < 4; i++) {
            cloneMap[i] = map[i].clone();
        }

        moveFish(x, y);

        // 상어는 현재 방향으로 1~3칸 이동 가능
        for (int i = 1; i < 4; i++) {
            int nextX = x + dx[d] * i;
            int nextY = y + dy[d] * i;

            if (!isRange(nextX, nextY)) {
                continue;
            }

            int fishNum = map[nextX][nextY];
            if (fishNum != -1) {
                fish[fishNum].alive = false;
                map[nextX][nextY] = -1;

                dfs(nextX, nextY, fish[fishNum].dir, sum + fishNum);

                // 상어 선택 백트래킹
                fish[fishNum].alive = true;
                map[nextX][nextY] = fishNum;
            }
        }

        // 물고기 이동 전 상태로 완전 복구
        fish = cloneFish.clone();
        for (int i = 0; i < 4; i++) {
            map[i] = cloneMap[i].clone();
        }
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < 4 && y < 4;
    }

    public static class Fish {
        int x, y, dir;
        boolean alive;

        public Fish(int x, int y, int dir, boolean alive) {
            this.x = x;
            this.y = y;
            this.dir = dir;
            this.alive = alive;
        }
    }
}
```

> **주의할 점 (2차원 배열과 객체 배열 복사)**: Java에서 `map.clone()`은 1차원 행 참조만 복사하는 얕은 복사(Shallow Copy)이고, `fish.clone()` 역시 내부 `Fish` 인스턴스를 공유합니다. 반드시 행 단위 `.clone()`과 `new Fish(...)` 재생성으로 깊은 복사를 해야 백트래킹 시 상태 오염이 발생하지 않습니다.

---

## 채점 결과

![백준 19236 청소년 상어 맞았습니다 결과](/images/posts/boj-19236-teen-shark/result.png)

---

## 복잡도 분석

- **시간 복잡도**: 격자가 `4 × 4` 고정이며, 최대 16번의 턴마다 상어의 선택지가 최대 3개이므로 전체 탐색 경우의 수가 적어 `1초` 제한 내에 여유 있게 동작합니다.
- **공간 복잡도**: `O(1)` — 재귀 깊이 최대 `16`, 각 깊이당 고정 크기 `4 × 4` 맵 및 길이 `17`의 물고기 배열 복제본 사용
