---
title: '[BOJ 18405] 경쟁적 전염 (Java) - 시간·번호 우선순위 큐(PriorityQueue) BFS'
date: '2022-04-05'
category: PS/BOJ
tags:
  - BOJ
  - BFS
  - 우선순위큐
  - 구현
  - Java
  - Silver I
summary: >-
  백준 18405번(경쟁적 전염) 문제에서 매 초마다 번호가 낮은 바이러스부터 먼저 증식해야 하는 조건을 (time, type) 기준 우선순위 큐 BFS로 구현하는 방법을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 18405번 - 경쟁적 전염](https://www.acmicpc.net/problem/18405)
- **난이도**: Silver I
- **시간 / 메모리 제한**: `1초` / `256 MB`

### 핵심 조건 요약

- `N × N`(`1 ≤ N ≤ 200`) 시험관에 `1 ~ K`(`1 ≤ K ≤ 1,000`)번 종류의 바이러스들이 존재합니다.
- 모든 바이러스는 1초마다 상·하·좌·우로 증식하며, **매 초마다 번호가 낮은 종류의 바이러스부터 먼저 증식**합니다. (이미 바이러스가 있는 칸에는 진입 불가)
- `S`초가 지난 뒤 `(X, Y)`(1-based 행, 열)에 존재하는 바이러스 번호를 출력합니다. (비어 있으면 `0`)

---

## 접근 아이디어

일반 큐(`LinkedList`)에 초기 바이러스들을 입력 순서대로 넣으면, 같은 0초라도 번호가 큰 바이러스가 먼저 퍼져 버릴 수 있습니다.
따라서 큐에서 꺼내는 순서를 명확히 제어하기 위해 **`PriorityQueue<Virus>`**를 사용합니다.

1. **정렬 기준**:
   - **1순위**: `time` 오름차순 (이전 시간대 바이러스가 모두 퍼진 뒤 다음 초 진행)
   - **2순위**: `type` 오름차순 (같은 초에서는 번호가 작은 바이러스 우선)
2. **종료 조건**: `cur.time >= S`인 노드를 꺼내는 순간 `S`초까지의 증식이 모두 끝난 것이므로 탐색을 중단하고 `map[X][Y]`를 반환합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.PriorityQueue;
import java.util.Queue;

import static java.util.Arrays.stream;

public class Main {

    static int[][] map;
    static int[] dx = {0, 0, 1, -1};
    static int[] dy = {1, -1, 0, 0};
    static int n, k;
    static Queue<Virus> pq;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        n = input[0];
        k = input[1];
        map = new int[n + 1][n + 1];

        // 1순위: 시간(time) 오름차순, 2순위: 바이러스 번호(type) 오름차순
        pq = new PriorityQueue<>((v1, v2) ->
                v1.time == v2.time ? v1.type - v2.type : v1.time - v2.time);

        for (int i = 1; i <= n; i++) {
            map[i] = stream(("0 " + br.readLine()).split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();

            for (int j = 1; j <= n; j++) {
                if (map[i][j] != 0) {
                    pq.add(new Virus(j, i, map[i][j], 0));
                }
            }
        }

        int[] endCondition = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();

        System.out.println(bfs(endCondition));
    }

    private static int bfs(int[] end) {
        while (!pq.isEmpty()) {
            Virus cur = pq.poll();

            // S초에 도달하면 더 이상 증식하지 않고 종료
            if (cur.time >= end[0]) {
                break;
            }

            for (int i = 0; i < dx.length; i++) {
                int nextX = cur.x + dx[i];
                int nextY = cur.y + dy[i];

                if (!isRange(nextX, nextY) || map[nextY][nextX] != 0) {
                    continue;
                }

                map[nextY][nextX] = cur.type;
                pq.add(new Virus(nextX, nextY, cur.type, cur.time + 1));
            }
        }
        return map[end[1]][end[2]];
    }

    static boolean isRange(int x, int y) {
        return x > 0 && y > 0 && x <= n && y <= n;
    }

    static class Virus {
        int x, y, type, time;

        public Virus(int x, int y, int type, int time) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.time = time;
        }
    }
}
```

> **최적화 팁**: 초기 바이러스(`time = 0`)만 `type` 오름차순으로 정렬한 뒤 일반 `LinkedList`(FIFO 큐)에 넣으면, 이후에 새로 추가되는 바이러스들은 자연스럽게 `(time + 1, type 오름차순)` 순서를 유지하므로 `PriorityQueue`의 `log` 비용 없이 순수 `O(N^2)`으로 해결할 수 있습니다!

---

## 채점 결과

![백준 18405 경쟁적 전염 맞았습니다 결과](/images/posts/boj-18405-competitive-infection/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N^2 log N)` — 최대 `N^2 ≤ 40,000`칸이 우선순위 큐에 한 번씩 삽입·삭제됨
- **공간 복잡도**: `O(N^2)` — 시험관 격자 및 BFS 큐 저장 공간
