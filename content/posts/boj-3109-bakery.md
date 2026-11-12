---
title: '[BOJ 3109] 빵집 (Java) - 그리디 방향 우선순위 DFS와 백트래킹 금지 원리'
date: '2022-03-07'
category: PS/BOJ
tags:
  - BOJ
  - 그리디
  - DFS
  - 그래프탐색
  - Java
  - Gold II
summary: >-
  백준 3109번(빵집) 문제에서 가스관과 빵집을 연결하는 파이프라인 개수를 최대화하기 위해 [우상 → 우 → 우하] 순서의 그리디 DFS를 적용하고, 실패한 경로조차 visit을 복구하지 않는 이유를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 3109번 - 빵집](https://www.acmicpc.net/problem/3109)
- **난이도**: Gold II
- **시간 / 메모리 제한**: `1초` / `256 MB`

### 핵심 조건 요약

- `R × C`(`1 ≤ R ≤ 10,000`, `5 ≤ C ≤ 500`) 격자에서 첫째 열(`0`열)에서 출발해 마지막 열(`C - 1`열)까지 파이프를 연결합니다.
- 이동 방향은 **오른쪽 위 대각선, 오른쪽, 오른쪽 아래 대각선** 3가지만 가능하며, 건물(`x`)은 지나갈 수 없습니다.
- **파이프라인은 서로 겹치거나 접할 수 없을 때**, 설치 가능한 **파이프라인의 최대 개수**를 구합니다.

---

## 접근 아이디어

이 문제는 단순 DFS 완전 탐색(백트래킹)이 아니라 **그리디(Greedy) + DFS** 문제입니다.

### 1. 왜 `[오른쪽 위 → 오른쪽 → 오른쪽 아래]` 순서여야 할까?

`0`번 행부터 `R - 1`번 행까지 위에서부터 차례로 출발한다고 생각해 봅시다.
만약 위쪽 행에서 출발한 파이프가 불필요하게 아래쪽으로 내려가 버리면, **뒤이어 출발하는 아래쪽 행들의 이동 공간을 가로막아** 전체 연결 개수가 줄어들 수 있습니다.
따라서 항상 **가능한 한 위쪽(오른쪽 위 대각선 → 오른쪽 → 오른쪽 아래 대각선)**으로 바짝 붙여서 연결하는 것이 아래쪽 행들에게 최대한 많은 여지를 남겨주는 최적의 그리디 선택입니다.

### 2. 왜 실패한 경로도 `visit[y][x] = false`로 되돌리면 안 될까?

- 이 문제는 한 번 탐색해서 **`w - 1`열에 도달하면 즉시 `return true`로 해당 행의 DFS를 종료**해야 합니다.
- 반대로 어떤 칸 `(x, y)`에서 출발해 끝까지 도달하지 못하고 실패(`return false`)했다면, **나중에 다른 출발 행에서 같은 칸 `(x, y)`에 도달하더라도 어차피 똑같이 막혀서 실패**할 수밖에 없습니다!
- 만약 실패 시 `visit[y][x] = false`로 되돌려 버리면, 뒤쪽 행들이 이미 막다른 길임이 증명된 칸들을 중복 탐색하면서 지수적인 시간 초과(`O(3^C)`)에 빠집니다. **방문 마킹을 유지해야만 모든 칸을 최대 한 번씩만 방문하는 `O(R × C)`가 보장**됩니다!

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static java.util.Arrays.stream;

public class Main {

    // 그리디 우선순위: 오른쪽 위(-1) → 오른쪽(0) → 오른쪽 아래(+1)
    static final int[] dx = {1, 1, 1};
    static final int[] dy = {-1, 0, 1};
    static int w, h, result = 0;
    static char[][] map;
    static boolean[][] visit;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        h = input[0];
        w = input[1];

        map = new char[h][w];
        visit = new boolean[h][w];
        for (int i = 0; i < h; i++) {
            map[i] = br.readLine().toCharArray();
        }

        // 맨 위 행(0)부터 차례대로 파이프라인 연결 시도
        for (int i = 0; i < h; i++) {
            dfs(0, i);
        }

        System.out.println(result);
    }

    static boolean dfs(int curX, int curY) {
        if (curX == w - 1) {
            result++;
            return true;
        }

        for (int i = 0; i < dx.length; i++) {
            int nextX = curX + dx[i];
            int nextY = curY + dy[i];

            if (!isRange(nextX, nextY)) continue;

            // 성공·실패 여부와 무관하게 한 번 밟은 칸은 영구 방문 처리 (중복 실패 방지)
            visit[nextY][nextX] = true;

            // 첫 번째 연결에 성공하면 다른 방향을 탐색하지 않고 즉시 종료
            if (dfs(nextX, nextY)) {
                return true;
            }
        }
        return false;
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < w && y < h && !visit[y][x] && map[y][x] == '.';
    }
}
```

---

## 채점 결과

![백준 3109 빵집 맞았습니다 결과](/images/posts/boj-3109-bakery/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(R × C)` — 모든 격자 칸(`≤ 5,000,000`)을 최대 한 번씩만 방문
- **공간 복잡도**: `O(R × C)` — 지도, 방문 배열 및 깊이 `C` 재귀 스택
