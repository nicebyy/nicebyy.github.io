---
title: '[BOJ 3085] 사탕 게임 (Java) - 인접 칸 교환 후 전체 보드 최대 연속 길이 탐색'
date: '2022-05-06'
category: PS/BOJ
tags:
  - BOJ
  - 브루트포스
  - 구현
  - Java
  - Silver III
summary: >-
  백준 3085번(사탕 게임) 문제에서 N <= 50 제약을 근거로 인접한 사탕을 한 번 교환한 뒤 행과 열의 최대 연속 사탕 개수를 구하는 완전 탐색 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 3085번 - 사탕 게임](https://www.acmicpc.net/problem/3085)
- **난이도**: Silver III
- **시간 / 메모리 제한**: `1초` / `128 MB`

### 핵심 조건 요약

- `N × N` 크기의 보드에 4가지 색(`C, P, Z, Y`)의 사탕이 채워져 있습니다.
- 사탕의 색이 다른 인접한 두 칸(상하 또는 좌우)을 골라 **서로 교환(딱 한 번)**한 뒤, 모두 같은 색으로 이루어진 가장 긴 연속 부분(행 또는 열)의 길이를 구합니다.

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 보드 크기 `N` | `3 ≤ N ≤ 50` | 총 칸 수 최대 `2,500`칸 |

---

## 접근 아이디어

보드 크기 `N`이 최대 **`50`**으로 매우 작기 때문에 완전 탐색(Brute Force)으로 충분합니다.

1. **교환 쌍 중복 제거**: 모든 칸 `(x, y)`에 대해 **오른쪽 `(x + 1, y)`**과 **아래쪽 `(x, y + 1)`**만 교환해 보면 모든 인접 쌍(최대 `2 × N × (N - 1) ≈ 4,900`개)을 중복 없이 시도할 수 있습니다. (색이 다른 경우에만 교환하면 횟수를 더욱 줄일 수 있습니다.)
2. **연속 길이 탐색**: 교환 후 전체 보드의 모든 행과 열을 스캔해(`O(N^2)` = 최대 `2,500` 연산) 같은 색이 연속된 최대 길이를 `max`에 갱신한 뒤, 보드를 원래 상태로 복구합니다.
3. 전체 연산량은 대략 `4,900 × 2 × 2,500 ≈ 2.45 × 10^7` 수준이므로 `1초` 제한 내에 여유 있게 통과합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main {

    static int max = 1;
    static int n;
    static char[][] map;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        n = Integer.parseInt(br.readLine());
        map = new char[n][n];

        for (int i = 0; i < n; i++) {
            map[i] = br.readLine().toCharArray();
        }

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                // 오른쪽 사탕과 교환
                if (isRange(j + 1, i) && map[i][j] != map[i][j + 1]) {
                    swap(j, i, j + 1, i);
                }
                // 아래쪽 사탕과 교환
                if (isRange(j, i + 1) && map[i][j] != map[i + 1][j]) {
                    swap(j, i, j, i + 1);
                }
            }
        }

        System.out.println(max);
    }

    private static void swap(int x1, int y1, int x2, int y2) {
        char cur = map[y1][x1];
        char next = map[y2][x2];

        map[y1][x1] = next;
        map[y2][x2] = cur;

        search();

        // 원상 복구
        map[y1][x1] = cur;
        map[y2][x2] = next;
    }

    private static void search() {
        // 1. 행(가로) 방향 연속 사탕 탐색
        for (int i = 0; i < n; i++) {
            int cnt = 1;
            for (int j = 0; j < n - 1; j++) {
                if (map[i][j] == map[i][j + 1]) {
                    cnt++;
                    max = Math.max(max, cnt);
                } else {
                    cnt = 1;
                }
            }
        }

        // 2. 열(세로) 방향 연속 사탕 탐색
        for (int i = 0; i < n; i++) {
            int cnt = 1;
            for (int j = 0; j < n - 1; j++) {
                if (map[j][i] == map[j + 1][i]) {
                    cnt++;
                    max = Math.max(max, cnt);
                } else {
                    cnt = 1;
                }
            }
        }
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < n && y < n;
    }
}
```

> **개선 포인트**: 매 교환마다 전체 `N × N` 행/열을 다시 검사하는 대신, 교환이 일어난 **영향권 행(1~2개)과 열(1~2개)**만 검사하면 탐색 비용을 `O(N^2)`에서 `O(N)`으로 줄일 수 있습니다.

---

## 채점 결과

![백준 3085 사탕 게임 맞았습니다 결과](/images/posts/boj-3085-candy-game/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N^4)` (영향권 행·열만 검사 시 `O(N^3)`) — `N <= 50`이므로 `1초` 내 충분
- **공간 복잡도**: `O(N^2)` — `N × N` 문자 보드 저장 공간
