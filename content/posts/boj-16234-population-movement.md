---
title: '[BOJ 16234] 인구 이동 (Java) - 다중 BFS 연합 탐색과 평균 인구 분배 시뮬레이션'
date: '2022-03-10'
category: PS/BOJ
tags:
  - BOJ
  - BFS
  - 구현
  - 시뮬레이션
  - 그래프탐색
  - Java
  - Gold V
summary: >-
  백준 16234번(인구 이동) 문제에서 하루 단위로 국경선이 열리는 모든 연합을 BFS로 찾아 인구를 평균값으로 재분배하고, 더 이상 연합이 생성되지 않을 때까지 반복하는 시뮬레이션 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 16234번 - 인구 이동](https://www.acmicpc.net/problem/16234)
- **난이도**: Gold V (작성 당시 Silver / Gold 전환 문제)
- **시간 / 메모리 제한**: `2초` / `512 MB`

### 핵심 조건 요약

- `N × N`(`1 ≤ N ≤ 50`) 격자의 각 칸에 나라의 인구수가 주어집니다. (`0 ≤ 인구수 ≤ 100`)
- 하루 동안 다음 과정이 진행됩니다.
  1. 인접한 두 나라의 인구 차이가 **`L` 이상 `R` 이하**(`1 ≤ L ≤ R ≤ 100`)이면 국경선을 엽니다.
  2. 국경선이 열린 나라들은 하나의 **연합**이 되며, 각 칸의 인구는 **`(연합 총 인구수) / (연합 칸 수)`(소수점 버림)**로 바뀝니다.
  3. 연합을 해체하고 모든 국경선을 닫습니다.
- **인구 이동이 며칠 동안 발생하는지** 출력합니다. (최대 `2,000`일 이하)

---

## 접근 아이디어

하루에 여러 개의 독립된 연합이 동시에 생길 수 있으므로, 매일 `visit = new boolean[n][n]`을 초기화한 뒤 **방문하지 않은 모든 칸에서 BFS**를 시작합니다.

1. **연합 수집 (`target` 큐)**: BFS로 `L <= |A - B| <= R` 조건을 만족하는 연결 요소를 탐색하면서, 연합에 속한 좌표들을 `target` 리스트(큐)에 함께 담고 인구 합 `sum`을 구합니다.
2. **인구 이동 발생 여부 판별**:
   - `target.size() > 1`이면 실제로 국경선이 열려 연합이 형성된 것이므로 `avg = sum / target.size()`로 각 칸을 갱신하고 `true`를 반환합니다.
   - `target.size() == 1`이면 주변 어느 나라와도 국경을 열지 못한 것이므로 `false`를 반환합니다.
3. **종료 조건**: 하루 전체 `N × N` 탐색에서 단 하나의 연합도 만들어지지 않으면(`condition == false`) 루프를 종료하고 누적 일수 `day`를 출력합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.LinkedList;

import static java.util.Arrays.stream;

public class Main {

    static int[] dx = {0, 0, 1, -1};
    static int[] dy = {1, -1, 0, 0};
    static int[][] map;
    static boolean[][] visit;
    static int n, l, r;
    static LinkedList<int[]> target, q;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        n = input[0];
        l = input[1];
        r = input[2];

        map = new int[n][n];
        for (int i = 0; i < n; i++) {
            map[i] = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
        }

        int day = 0;
        while (true) {
            visit = new boolean[n][n];
            boolean moved = false;

            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (!visit[i][j] && bfs(j, i)) {
                        moved = true;
                    }
                }
            }

            if (!moved) {
                break;
            }
            day++;
        }

        System.out.println(day);
    }

    static boolean bfs(int x, int y) {
        target = new LinkedList<>();
        target.add(new int[]{x, y});
        int sum = map[y][x];

        q = new LinkedList<>();
        visit[y][x] = true;
        q.add(new int[]{x, y});

        while (!q.isEmpty()) {
            int[] cur = q.poll();

            for (int i = 0; i < dx.length; i++) {
                int nextX = cur[0] + dx[i];
                int nextY = cur[1] + dy[i];
                if (!isRange(nextX, nextY) || visit[nextY][nextX]) {
                    continue;
                }

                int diff = Math.abs(map[nextY][nextX] - map[cur[1]][cur[0]]);
                if (diff >= l && diff <= r) {
                    visit[nextY][nextX] = true;
                    q.add(new int[]{nextX, nextY});
                    target.add(new int[]{nextX, nextY});
                    sum += map[nextY][nextX];
                }
            }
        }

        // 2개 이상의 나라가 연합을 이룬 경우에만 인구 갱신
        if (target.size() > 1) {
            int avg = sum / target.size();
            while (!target.isEmpty()) {
                int[] poll = target.poll();
                map[poll[1]][poll[0]] = avg;
            }
            return true;
        }
        return false;
    }

    static boolean isRange(int x, int y) {
        return x >= 0 && y >= 0 && x < n && y < n;
    }
}
```

> **참고**: `bfs()` 내부에서 `map` 값을 변경하더라도 이미 `visit[y][x] = true`로 마킹된 연합 칸들은 같은 날 다른 BFS에서 다시 방문하지 않으며, 아직 방문하지 않은 인접 칸들은 `visit` 여부가 아니라 방금 갱신되지 않은 기존 칸들과만 비교해야 할 때 주의가 필요합니다. 다행히 **연합 외부에서 연합 내부 칸으로 들어오려 할 때는 이미 `visit[nextY][nextX] == true`이므로 차단**되어, 같은 날 다른 연합에 영향을 주지 않고 안전하게 동작합니다!

---

## 채점 결과

![백준 16234 인구 이동 맞았습니다 결과](/images/posts/boj-16234-population-movement/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(D × N^2)` (`D ≤ 2,000`, `N ≤ 50` → 하루당 `2,500`칸 탐색)
- **공간 복잡도**: `O(N^2)` — 격자, 방문 배열, BFS/연합 큐 저장 공간
