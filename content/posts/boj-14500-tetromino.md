---
title: '[BOJ 14500] 테트로미노 (Java) - 깊이 4 DFS와 T(ㅗ) 블록 별도 탐색 기법'
date: '2022-04-14'
category: PS/BOJ
tags:
  - BOJ
  - 브루트포스
  - DFS
  - 구현
  - Java
  - Gold IV
summary: >-
  백준 14500번(테트로미노) 문제에서 5가지 테트로미노 중 4가지는 깊이 4 DFS로 탐색하고, 일필휘지로 그릴 수 없는 T(ㅗ, ㅜ, ㅏ, ㅓ) 블록만 중심 칸 기준 4방 합산에서 1칸을 빼는 방식으로 구하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 14500번 - 테트로미노](https://www.acmicpc.net/problem/14500)
- **난이도**: Gold IV (작성 당시 Gold V)
- **시간 / 메모리 제한**: `2초` / `512 MB`

### 핵심 조건 요약

- 크기가 `N × M`(`4 ≤ N, M ≤ 500`)인 종이 각 칸에 `1,000` 이하의 자연수가 쓰여 있습니다.
- 정사각형 4개를 변끼리 이어 붙인 **5가지 테트로미노** 중 하나를(회전/대칭 허용) 종이 위에 놓아 **덮인 칸 수들의 합의 최댓값**을 구합니다.

---

## 접근 아이디어

5가지 테트로미노의 회전·대칭 모양을 일일이 하드코딩할 수도 있지만, **그래프 탐색(DFS)**을 활용하면 훨씬 간결하게 모든 모양을 커버할 수 있습니다.

### 1. 왜 `T` 블록(`ㅗ, ㅜ, ㅏ, ㅓ`)만 DFS로 못 만들까?

- `ㅣ`, `ㅁ`, `ㄴ`, `ㄹ` 모양의 4가지 테트로미노(및 모든 회전·대칭 형태)는 한 칸에서 시작해 상하좌우로 **되돌아가지 않고 연속 4칸(깊이 4 DFS)**을 이동하면 모두 만들어집니다!
- 반면 **`ㅗ` 모양(T 블록)**은 중심 칸에서 세 방향으로 갈라져야 하므로 일반적인 깊이 4 DFS 경로로는 생성할 수 없습니다.

### 2. 중심 칸 기반 T 블록 4방향 한 번에 계산하기

중심 좌표 `(x, y)`를 기준으로 상하좌우 인접 칸을 살펴보면:
- **인접한 유효 칸이 `4`개 모두 있는 경우**: `(중심 + 4칸 합)`에서 **4칸 중 하나씩을 뺀 값**이 곧 `ㅗ, ㅜ, ㅏ, ㅓ` 4가지 모양의 합입니다! (최솟값 1칸만 빼면 되므로 더욱 빠릅니다.)
- **인접한 유효 칸이 `3`개인 경우** (종이 가장자리): 그 3칸 + 중심 칸 자체가 유일한 T 블록 1개가 됩니다.
- **인접한 유효 칸이 `2`개 이하인 경우** (꼭짓점): T 블록을 놓을 수 없습니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.LinkedList;

import static java.util.Arrays.stream;

public class Main {

    static int w, h, max = 0;
    static int[][] map;
    static boolean[][] visit;
    static int[] dx = {0, 0, 1, -1};
    static int[] dy = {1, -1, 0, 0};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        h = input[0];
        w = input[1];

        map = new int[h][w];
        visit = new boolean[h][w];
        for (int i = 0; i < h; i++) {
            map[i] = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
        }

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                visit[y][x] = true;
                dfs(x, y, 1, map[y][x]); // 일필휘지 가능한 4종류 블록 탐색
                checkTBlock(x, y);       // T(ㅗ) 블록 4가지 모양 탐색
                visit[y][x] = false;
            }
        }

        System.out.println(max);
    }

    private static void dfs(int x, int y, int depth, int sum) {
        if (depth == 4) {
            max = Math.max(max, sum);
            return;
        }

        for (int dir = 0; dir < dx.length; dir++) {
            int nextX = dx[dir] + x;
            int nextY = dy[dir] + y;

            if (!isRange(nextX, nextY) || visit[nextY][nextX]) {
                continue;
            }

            visit[nextY][nextX] = true;
            dfs(nextX, nextY, depth + 1, sum + map[nextY][nextX]);
            visit[nextY][nextX] = false;
        }
    }

    private static void checkTBlock(int x, int y) {
        int sum = map[y][x];
        LinkedList<Integer> tBlocks = new LinkedList<>();

        for (int dir = 0; dir < dx.length; dir++) {
            int nextX = dx[dir] + x;
            int nextY = dy[dir] + y;

            if (!isRange(nextX, nextY)) {
                continue;
            }

            tBlocks.add(map[nextY][nextX]);
            sum += map[nextY][nextX];
        }

        if (tBlocks.size() == 4) {
            // 4방향 모두 범위 내라면 그중 한 칸을 제외한 4가지 T 모양 확인
            for (Integer t : tBlocks) {
                max = Math.max(max, sum - t);
            }
        } else if (tBlocks.size() == 3) {
            // 경계선에 붙어 3방향만 가능하면 T 모양은 1가지
            max = Math.max(max, sum);
        }
    }

    private static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < w && y < h;
    }
}
```

> **최적화 팁**: 입력 단계에서 종이 전체 칸의 최댓값 `maxCell`을 기록해 두고, `dfs`에서 `if (sum + maxCell * (4 - depth) <= max) return;` 가지치기를 추가하면 실행 속도가 수 배 빨라집니다.

---

## 채점 결과

![백준 14500 테트로미노 맞았습니다 결과](/images/posts/boj-14500-tetromino/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N × M)` — 각 칸(`≤ 250,000`)에서 깊이 4짜리 상수 횟수 DFS 및 4방 체크만 수행
- **공간 복잡도**: `O(N × M)` — `map` 및 `visit` 배열 저장 공간
