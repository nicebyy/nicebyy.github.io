---
title: '[BOJ 18111] 마인크래프트 (Java) - 높이 범위 최적화 완전 탐색(Brute Force)'
date: '2022-04-20'
category: PS/BOJ
tags:
  - BOJ
  - 브루트포스
  - 구현
  - Java
  - Silver II
summary: >-
  백준 18111번(마인크래프트) 문제에서 땅의 최소·최대 높이 범위(fromHeight ~ toHeight)로 탐색 구간을 좁히고, 인벤토리 잔여 블록 조건과 최소 시간 타이브레이킹(가장 높은 땅)을 처리하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 18111번 - 마인크래프트](https://www.acmicpc.net/problem/18111)
- **난이도**: Silver II
- **시간 / 메모리 제한**: `1초 (추가 시간 없음)` / `1024 MB`

### 핵심 조건 요약

- `N × M` 집터의 땅 높이를 모두 같게 만들어야 합니다.
- 작업 비용:
  1. 블록 제거 후 인벤토리에 넣기: **`2초` 소요** (`inventory += 1`)
  2. 인벤토리에서 블록 꺼내 위에 놓기: **`1초` 소요** (`inventory -= 1`)
- 초기 인벤토리에는 `B`개의 블록이 있으며, 작업 후 최종 인벤토리 블록 수는 `0` 이상이어야 합니다.
- **최소 시간**과 그 경우의 땅 높이를 출력합니다. (최소 시간이 여러 개라면 **땅의 높이가 가장 높은 것** 선택)

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 세로·가로 `N, M` | `1 ≤ N, M ≤ 500` | 최대 `250,000`칸 |
| 초기 블록 `B` | `0 ≤ B ≤ 6.4 × 10^7` | `int` 범위 내 안전 |
| 땅 높이 | `0 ≤ 높이 ≤ 256` | `257 × 250,000 ≈ 6.4 × 10^7` |

---

## 접근 아이디어

땅의 높이가 `0 ~ 256`으로 제한되어 있고 맵 칸 수도 최대 `250,000`이므로, 모든 목표 높이 `height` 후보를 시도하는 **완전 탐색**으로 해결할 수 있습니다.

### 탐색 범위 압축 및 조기 종료 포인트

1. **높이 범위 좁히기 (`fromHeight ~ toHeight`)**: 입력의 최솟값보다 낮추거나 최댓값보다 높이는 것은 블록만 낭비하고 시간도 더 걸리므로, 실제 존재하는 `minHeight ~ maxHeight` 구간만 순회합니다.
2. **시간 계산과 인벤토리 정산**:
   - `diff = map[y][x] - height`
   - `diff > 0` (목표보다 높음 → 제거): `time += diff * 2`, `inventory += diff`
   - `diff < 0` (목표보다 낮음 → 쌓기): `time += (-diff)`, `inventory += diff` (음수가 더해지므로 감소)
   - 루프 도중 `time > minTime`이 되면 더 볼 필요 없이 조기 종료(`break`)합니다.
3. **인벤토리 유효성 및 동점 처리**:
   - 모든 칸을 계산한 뒤 `inventory < 0`이면 해당 높이는 만들 수 없으므로 건너뜁니다.
   - `height`를 오름차순으로 탐색하므로 **`time <= minTime`** 등호를 사용하면 시간이 같을 때 **자동으로 더 높은 `height`**가 `maxHeight`에 기록됩니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static java.util.Arrays.stream;

public class Main {

    static int[][] map;
    static int h, w, b;
    static int fromHeight = Integer.MAX_VALUE, toHeight = 0;
    static int minTime = Integer.MAX_VALUE, maxHeight;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        h = input[0];
        w = input[1];
        b = input[2];
        map = new int[h][w];

        for (int y = 0; y < h; y++) {
            map[y] = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            fromHeight = Math.min(stream(map[y]).min().getAsInt(), fromHeight);
            toHeight = Math.max(stream(map[y]).max().getAsInt(), toHeight);
        }

        for (int height = fromHeight; height <= toHeight; height++) {
            int time = 0;
            int inventory = b;

            outer:
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    if (time > minTime) {
                        break outer; // 이미 최소 시간 초과 시 조기 탈출
                    }

                    int diff = map[y][x] - height;
                    if (diff > 0) {
                        time += diff * 2;
                        inventory += diff;
                    } else if (diff < 0) {
                        time -= diff;
                        inventory += diff;
                    }
                }
            }

            // 블록이 부족하면 불가능한 높이
            if (inventory < 0) {
                continue;
            }

            // 높이가 오름차순이므로 time <= minTime 시 더 높은 height로 갱신
            if (time <= minTime) {
                maxHeight = height;
                minTime = time;
            }
        }

        System.out.println(minTime + " " + maxHeight);
    }
}
```

> **최적화 팁**: `map[y][x]`의 높이가 `0 ~ 256`뿐이므로, 각 높이별 칸 개수를 세는 **빈도수 배열 `count[257]`**을 미리 만들어 두면 내부 루프가 `500 × 500`이 아닌 `257`번으로 줄어 시간 복잡도를 **`O(N × M + 257^2)`**까지 극적으로 낮출 수 있습니다.

---

## 채점 결과

![백준 18111 마인크래프트 맞았습니다 결과](/images/posts/boj-18111-minecraft/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(H × N × M)` (`H ≤ 257`, `N × M ≤ 250,000`) — 빈도 배열 최적화 시 `O(N × M + H^2)`
- **공간 복잡도**: `O(N × M)` — 집터 높이 2차원 배열 저장 공간
