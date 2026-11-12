---
title: '[BOJ 2573] 빙산 (Java) - 동시 융해 큐 처리와 DFS 연결 요소 분리 탐색'
date: '2022-05-30'
category: PS/BOJ
tags:
  - BOJ
  - DFS
  - BFS
  - 시뮬레이션
  - 그래프탐색
  - Java
  - Gold IV
summary: >-
  백준 2573번(빙산) 문제에서 인접 바다 개수만큼 빙산이 동시에 녹을 때 발생하는 연쇄 갱신 오류를 큐(Queue)로 방지하고, DFS로 빙산 덩어리 분리 시점을 판별하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 2573번 - 빙산](https://www.acmicpc.net/problem/2573)
- **난이도**: Gold IV
- **시간 / 메모리 제한**: `1초` / `256 MB`

### 핵심 조건 요약

- `N × M` 2차원 배열에 빙산의 높이(`1 ~ 10`)와 바다(`0`)가 주어집니다.
- 매년 각 빙산 칸의 높이는 **동서남북 네 방향에 인접한 바다(`0`) 칸의 개수만큼** 줄어듭니다. (최소 `0`까지만 감소)
- 한 덩어리의 빙산이 **두 덩어리 이상으로 분리되는 최초의 시간(년)**을 출력합니다.
- 만약 **다 녹을 때까지 두 덩어리 이상으로 분리되지 않으면 `0`을 출력**합니다.

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 행/열 크기 `N, M` | `3 ≤ N, M ≤ 300` | 최대 90,000칸 |
| 빙산 칸 수 | `≤ 10,000` | 초기 높이는 `1 ~ 10` |
| 테두리 조건 | 첫/마지막 행·열은 항상 `0` | 바깥 테두리는 항상 바다 |

---

## 접근 아이디어

이 문제에서 가장 주의해야 할 포인트는 **"1년 동안의 융해는 모든 칸에서 동시에 일어난다"**는 점입니다.

### 1. 왜 녹을 높이를 바로 빼면 안 될까?

2차원 배열을 `(0, 0)`부터 순회하면서 빙산을 바로 녹여 `0`으로 만들어 버리면, **같은 해에 아직 탐색하지 않은 오른쪽/아래쪽 인접 빙산이 방금 녹아 `0`이 된 칸을 바다로 오인해 추가로 녹아버리는 문제**가 발생합니다.

따라서 1년 단위의 시뮬레이션은 반드시 다음 2단계로 분리해야 합니다.

1. **녹을 양 수집 (`Queue` 활용)**: 현재 맵 상태를 기준으로 모든 빙산 칸 `(x, y)`에 인접한 바다(`0`) 개수를 계산해 큐에 `(x, y, meltCount)` 형태로 담습니다.
2. **일괄 차감**: 큐에서 하나씩 꺼내 `map[y][x]`를 일괄 감소시킵니다. (만약 큐가 비어 있다면 빙산이 모두 녹았는데도 분리되지 않은 것이므로 `0`을 출력하고 종료합니다.)

### 2. 덩어리 분리 여부 판별 (`DFS` 연결 요소 카운트)

매년 루프 시작 시 `isSeparate()`를 호출하여 방문하지 않은 빙산 칸을 기준으로 DFS를 수행합니다.
- 연결 요소 개수 `cnt > 1`이 되는 순간 빙산이 두 덩어리 이상으로 분리된 것이므로 현재까지 흐른 시간 `answer`를 출력합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.LinkedList;
import java.util.StringTokenizer;
import java.util.stream.IntStream;

import static java.util.Arrays.stream;

public class Main {

    static int[] dx = {0, 0, 1, -1};
    static int[] dy = {1, -1, 0, 0};
    static int w, h;
    static int[][] map;
    static boolean[][] visit;

    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

    public static void main(String[] args) throws IOException {
        StringTokenizer st = new StringTokenizer(br.readLine(), " ");
        h = Integer.parseInt(st.nextToken());
        w = Integer.parseInt(st.nextToken());

        map = new int[h][w];
        for (int i = 0; i < h; i++) {
            map[i] = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
        }

        int answer = 0;

        while (!isSeparate()) {
            LinkedList<int[]> q = new LinkedList<>();

            // 1단계: 현재 상태 기준으로 각 빙산이 녹을 양을 계산해 큐에 저장
            for (int i = 0; i < h; i++) {
                for (int j = 0; j < w; j++) {
                    if (map[i][j] > 0) {
                        q.add(new int[]{j, i, countNearBy(j, i)});
                    }
                }
            }

            // 빙산이 모두 녹을 때까지 분리되지 않은 경우
            if (q.isEmpty()) {
                answer = 0;
                break;
            }

            // 2단계: 큐에 모은 녹을 양을 한꺼번에 반영
            while (!q.isEmpty()) {
                int[] cur = q.poll();
                int x = cur[0];
                int y = cur[1];
                int cnt = cur[2];
                map[y][x] = Math.max(0, map[y][x] - cnt);
            }
            answer++;
        }

        System.out.println(answer);
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < w && y < h;
    }

    static int countNearBy(int x, int y) {
        return (int) IntStream.range(0, 4)
                .filter(i -> isRange(x + dx[i], y + dy[i]))
                .filter(i -> map[y + dy[i]][x + dx[i]] == 0)
                .count();
    }

    static boolean isSeparate() {
        visit = new boolean[h][w];
        int cnt = 0;

        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                if (!visit[i][j] && map[i][j] != 0) {
                    dfs(j, i, visit);
                    cnt++;
                }
            }
        }
        return cnt > 1;
    }

    static void dfs(int x, int y, boolean[][] visit) {
        visit[y][x] = true;

        for (int i = 0; i < dx.length; i++) {
            int nextX = x + dx[i];
            int nextY = y + dy[i];

            if (isRange(nextX, nextY) && map[nextY][nextX] != 0 && !visit[nextY][nextX]) {
                dfs(nextX, nextY, visit);
            }
        }
    }
}
```

### 디테일 및 개선 포인트

- **인접 좌표 범위 검사 (`isRange(x + dx[i], y + dy[i])`)**: 문제 조건상 배열 테두리가 항상 `0`이기 때문에 `map[y][x] > 0`인 칸은 절대 테두리에 위치하지 않지만, `countNearBy`에서도 인접 좌표 자체의 범위를 검사하도록 작성하는 것이 방어적 프로그래밍 관점에서 훨씬 안전합니다.
- **최적화 팁**: 매 년 전체 `N × M` 격자를 순회하는 대신, **살아있는 빙산 좌표 리스트**만 따로 관리하면 빙산 칸 수가 최대 `10,000`개이므로 탐색 범위를 더욱 줄일 수 있습니다.

---

## 복잡도 분석

- **시간 복잡도**: 매 년 `O(N × M)` (최대 빙산 높이 `10` 이하, 주변 4방향이 녹는 속도를 고려하면 시뮬레이션 연수는 작음)
- **공간 복잡도**: `O(N × M)` — 격자 `map`, 방문 배열 `visit`, 융해 대기 큐 `q` 사용
