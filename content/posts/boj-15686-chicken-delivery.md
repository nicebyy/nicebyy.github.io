---
title: '[BOJ 15686] 치킨 배달 (Java) - 치킨집 M개 조합 백트래킹과 맨해튼 거리'
date: '2022-03-25'
category: PS/BOJ
tags:
  - BOJ
  - 백트래킹
  - 브루트포스
  - 조합
  - Java
  - Gold V
summary: >-
  백준 15686번(치킨 배달) 문제에서 장애물이 없는 격자의 맨해튼 거리를 이용해 그래프 탐색 없이 치킨집 M개 조합(DFS)을 뽑아 도시 치킨 거리의 최솟값을 구하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 15686번 - 치킨 배달](https://www.acmicpc.net/problem/15686)
- **난이도**: Gold V
- **시간 / 메모리 제한**: `1초` / `512 MB`

### 핵심 조건 요약

- `N × N`(`2 ≤ N ≤ 50`) 도시 격자에서 `0`은 빈 칸, `1`은 집(`≤ 2N`), `2`는 치킨집(`M ≤ 개수 ≤ 13`)입니다.
- 두 칸 `(r1, c1)`과 `(r2, c2)` 사이의 거리는 **맨해튼 거리 `|r1 - r2| + |c1 - c2|`**로 정의됩니다.
- 치킨집 중 **최대 `M`개(`1 ≤ M ≤ 13`)**만 남기고 폐업시킬 때, 모든 집의 치킨 거리 합(**도시의 치킨 거리**)의 **최솟값**을 구합니다.

---

## 접근 아이디어

1. **그래프 탐색(BFS)이 필요 없는 이유**: 중간에 벽이나 장애물이 없고, 거리 정의가 순수 좌표 차이 `|x1 - x2| + |y1 - y2|`이므로 **집 목록 `house`**과 **치킨집 목록 `chicken`**의 좌표만 추출해 두면 `O(1)`에 거리를 계산할 수 있습니다.
2. **치킨집 `M`개 조합 선택 (백트래킹)**:
   - 전체 치킨집 수가 최대 `13`개뿐이므로 조합의 최대 개수는 `13C6 = 1,716`가지입니다.
   - `dfs`로 `M`개의 치킨집 인덱스를 고른 뒤, 각 집마다 선택된 `M`개 치킨집과의 거리 중 최솟값을 합산하여 `minSum`을 갱신합니다.
   - 참고로 치킨집을 더 많이 남길수록 각 집의 치킨 거리는 작아지거나 같아지므로, 정확히 `M`개를 선택하는 조합만 확인해도 항상 최솟값을 얻을 수 있습니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

import static java.util.Arrays.stream;

public class Main {

    static boolean[] visit;
    static ArrayList<int[]> house, chicken;
    static int[][] map;
    static int n, m, minSum = Integer.MAX_VALUE;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        n = input[0];
        m = input[1];

        map = new int[n][n];
        house = new ArrayList<>();
        chicken = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            map[i] = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            for (int j = 0; j < n; j++) {
                if (map[i][j] == 1) {
                    house.add(new int[]{j, i});
                } else if (map[i][j] == 2) {
                    chicken.add(new int[]{j, i});
                }
            }
        }

        visit = new boolean[chicken.size()];
        dfs(0, 0, new ArrayList<>());
        System.out.println(minSum);
    }

    static void dfs(int cur, int depth, ArrayList<Integer> indexList) {
        if (depth == m) {
            int distanceSum = 0;
            for (int[] housePos : house) {
                int minDistance = Integer.MAX_VALUE;
                for (Integer index : indexList) {
                    int[] chickenPos = chicken.get(index);
                    int dist = Math.abs(chickenPos[1] - housePos[1])
                             + Math.abs(chickenPos[0] - housePos[0]);
                    minDistance = Math.min(dist, minDistance);
                }
                distanceSum += minDistance;
            }
            minSum = Math.min(distanceSum, minSum);
            return;
        }

        for (int next = cur; next < chicken.size(); next++) {
            if (!visit[next]) {
                visit[next] = true;
                indexList.add(next);
                dfs(next + 1, depth + 1, indexList);
                visit[next] = false;
                // int 인덱스 값이 아닌 Object(Integer)로 제거되도록 형변환 주의
                indexList.remove((Integer) next);
            }
        }
    }
}
```

> **Java 실수 주의 포인트 (`List.remove`)**: `indexList.remove(next)`를 호출하면 `remove(int index)`가 호출되어 `IndexOutOfBoundsException`이 발생합니다! 반드시 `indexList.remove(Integer.valueOf(next))` (또는 `remove(indexList.size() - 1)`)를 사용해야 합니다.

---

## 채점 결과

![백준 15686 치킨 배달 맞았습니다 결과](/images/posts/boj-15686-chicken-delivery/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(C(K, M) × H × M)` (`K ≤ 13`, `H ≤ 2N ≤ 100`, 최대 `1,716 × 100 × 6 ≈ 10^6` 연산 수준)
- **공간 복잡도**: `O(N^2 + H + K)` — 지도 및 좌표 리스트 저장 공간
