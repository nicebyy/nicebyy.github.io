---
title: '[BOJ 17136] 색종이 붙이기 (Java) - 그리디 반례와 백트래킹(DFS) 완전 탐색'
date: '2022-05-25'
category: PS/BOJ
tags:
  - BOJ
  - 백트래킹
  - DFS
  - 완전탐색
  - Java
  - Gold II
summary: >-
  백준 17136번(색종이 붙이기) 문제가 큰 색종이부터 붙이는 그리디로 풀리지 않는 반례를 살펴보고, 10x10 격자에서 좌상단부터 DFS 백트래킹으로 최소 색종이 개수를 찾는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 17136번 - 색종이 붙이기](https://www.acmicpc.net/problem/17136)
- **난이도**: Gold II
- **시간 / 메모리 제한**: `1초` / `512 MB`

### 핵심 조건 요약

- `10 × 10` 크기의 종이 각 칸에 `0` 또는 `1`이 적혀 있습니다.
- `1×1`, `2×2`, `3×3`, `4×4`, `5×5` 다섯 종류의 정사각형 색종이를 **각각 5장씩** 가지고 있습니다.
- `1`이 적힌 모든 칸을 색종이로 덮되, 경계를 벗어나거나 겹치면 안 되며 `0`이 적힌 칸에는 붙일 수 없습니다.
- 모든 `1`을 덮는 데 필요한 **색종이의 최소 개수**를 출력합니다. (불가능한 경우 `-1`)

---

## 접근 아이디어

### 1. 왜 그리디(큰 색종이 우선)로 풀 수 없을까?

언뜻 보면 가장 큰 `5×5` 색종이부터 우선 덮으면 최소 개수가 나올 것 같지만, 다음과 같은 반례가 존재합니다.

```text
0 0 0 0 0 0 0 0 0 0
0 0 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 0 0
0 0 1 1 1 1 1 1 0 0
0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 0
```

위 입력은 `6 × 6` 영역이 모두 `1`입니다.
- **그리디 선택**: `5×5` 색종이 1장을 먼저 붙이면 남은 테두리 `11`칸을 `1×1` 색종이로 메워야 해서 최소 **12장**이 됩니다. (심지어 `1×1`은 5장뿐이므로 실패합니다!)
- **정답**: `3×3` 색종이 **4장**으로 깔끔하게 덮을 수 있습니다.

따라서 가능한 모든 크기의 색종이를 시도해 보는 **백트래킹(완전 탐색)**이 필수입니다.

### 2. 백트래킹 탐색 설계

1. `find()`로 격자를 좌상단부터 순회하며 아직 덮이지 않은 첫 번째 `1`의 좌표 `(x, y)`를 찾습니다.
   - 만약 더 이상 `1`이 없다면(`(-1, -1)`), 사용한 색종이 수(`25 - sum(arr)`)로 최솟값 `min`을 갱신하고 종료합니다.
2. `(x, y)`를 좌상단 꼭짓점으로 삼아 `size = 5`부터 `1`까지 순회합니다.
   - 해당 크기의 색종이가 남아 있고(`arr[size] > 0`), `canAttach(x, y, size)`를 만족하면 색종이를 붙입니다.
   - 다음 재귀 `dfs()`를 호출한 뒤, 원상 복구(백트래킹)합니다.
3. **`attach()` 부호 반전 토글 트릭**:
   - 색종이를 붙일 영역의 값을 `map[i][j] *= -1`로 곱하면 `1 → -1`(붙이기), `-1 → 1`(떼기)이 한 메서드로 처리됩니다.
   - 동시에 `arr[size] += map[y][x]`를 수행하면 붙일 때는 `-1`이 더해져 잔여 개수가 감소하고, 뗄 때는 `+1`이 더해져 잔여 개수가 복구됩니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;

import static java.util.Arrays.stream;

public class Main {

    static int[][] map = new int[10][10];
    static int[] arr = new int[6];
    static int min = 26;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        for (int i = 0; i < 10; i++) {
            map[i] = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
        }
        Arrays.fill(arr, 5);
        arr[0] = 0;

        dfs();

        System.out.println(min > 25 ? -1 : min);
    }

    private static void dfs() {
        // 가지치기: 현재 사용한 색종이 수가 이미 최솟값 이상이면 탐색 중단
        int used = 25 - stream(arr).sum();
        if (used >= min) {
            return;
        }

        int[] point = find();

        // 모든 1을 다 덮은 경우 최솟값 갱신
        if (point[0] == -1 && point[1] == -1) {
            min = Math.min(min, used);
            return;
        }

        int x = point[0];
        int y = point[1];

        // 큰 색종이부터 시도해 빠르게 좋은 상한선(min) 확보
        for (int size = 5; size >= 1; size--) {
            if (arr[size] > 0 && canAttach(x, y, size)) {
                attach(x, y, size); // 붙이기 (1 -> -1)
                dfs();
                attach(x, y, size); // 떼기 (-1 -> 1)
            }
        }
    }

    private static int[] find() {
        for (int i = 0; i < 10; i++) {
            for (int j = 0; j < 10; j++) {
                if (map[i][j] == 1) {
                    return new int[]{j, i};
                }
            }
        }
        return new int[]{-1, -1};
    }

    private static void attach(int x, int y, int size) {
        for (int i = y; i < y + size; i++) {
            for (int j = x; j < x + size; j++) {
                map[i][j] *= -1;
            }
        }
        arr[size] += map[y][x];
    }

    private static boolean canAttach(int x, int y, int size) {
        for (int i = y; i < y + size; i++) {
            for (int j = x; j < x + size; j++) {
                // 0: 빈칸, -1: 이미 색종이가 덮인 칸
                if (!isRange(j, i) || map[i][j] != 1) {
                    return false;
                }
            }
        }
        return true;
    }

    private static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < 10 && y < 10;
    }
}
```

---

## 채점 결과

![백준 17136 색종이 붙이기 맞았습니다 결과](/images/posts/boj-17136-colored-paper/result.png)

---

## 복잡도 분석

- **시간 복잡도**: 격자 크기가 `10 × 10`으로 고정되어 있고, `5`가지 크기의 색종이 수 제한(각 5장)과 최솟값 가지치기(`used >= min`) 덕분에 실제 탐색 상태 공간은 `1초` 제한 내에 충분히 수렴합니다.
- **공간 복잡도**: `O(1)` — 고정 크기 `10 × 10` 격자 및 최대 깊이 `25`의 재귀 스택 사용
