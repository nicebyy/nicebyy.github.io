---
title: '[BOJ 16198] 에너지 모으기 (Java) - 경로 압축(next[])을 접목한 백트래킹 풀이'
date: '2022-04-27'
category: PS/BOJ
tags:
  - BOJ
  - 백트래킹
  - DFS
  - 브루트포스
  - Java
  - Silver I
summary: >-
  백준 16198번(에너지 모으기) 문제에서 구슬 개수 N <= 10 제약을 이용한 DFS 백트래킹을 구현하면서, ArrayList 삭제 대신 Union-Find 방식의 좌우 인덱스 점프(next[])를 활용한 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 16198번 - 에너지 모으기](https://www.acmicpc.net/problem/16198)
- **난이도**: Silver I
- **시간 / 메모리 제한**: `1초` / `512 MB`

### 핵심 조건 요약

- `N`(`3 ≤ N ≤ 10`)개의 에너지 구슬이 일렬로 놓여 있으며, 각 구슬의 무게는 `W_i`(`1 ≤ W_i ≤ 1,000`)입니다.
- 첫 번째와 마지막 구슬을 제외한 `x`번째 구슬을 골라 제거하고 `W_{x-1} × W_{x+1}`의 에너지를 모읍니다.
- 구슬이 2개 남을 때까지 반복할 때 모을 수 있는 **에너지 합의 최댓값**을 구합니다.

---

## 접근 아이디어

`N ≤ 10`이므로 선택 가능한 구슬 순서의 최대 경우의 수는 `(10 - 2)! = 8! = 40,320`가지뿐입니다.
따라서 모든 제거 순서를 시도하는 **백트래킹(DFS)**으로 넉넉히 해결할 수 있습니다.

### `List.remove()` 대신 `visit[]` + 경로 점프(`next[]`) 활용

보통 `ArrayList`에서 원소를 삭제(`remove`)했다가 백트래킹 시 `add(i, val)`로 복구하는 방식을 많이 씁니다.
여기서는 배열에서 실제 원소를 빼지 않고도 양옆에 살아있는 구슬을 빠르게 찾기 위해 **Union-Find의 경로 압축과 유사한 `findLeft` / `findRight` + `next[]` 점프 배열**을 적용했습니다.

- `visit[i] == true`이면 해당 구슬은 이미 제거된 상태입니다.
- `i`번째 구슬을 선택할 때 `findLeft(i - 1)`(또는 `findLeft(i)`)와 `findRight(i)`로 가장 가까운 미방문 좌/우 구슬의 인덱스를 찾아 `energy[left] * energy[right]`를 더합니다.
- 재귀가 끝나고 백트래킹할 때는 `visit[i] = false;`와 함께 `next[i] = i;`로 인덱스를 원래대로 복구합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static java.util.Arrays.stream;

public class Main {

    static int maxEnergy = Integer.MIN_VALUE;
    static int n;
    static int[] energy;
    static boolean[] visit;
    static int[] next;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        n = Integer.parseInt(br.readLine());
        energy = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();

        visit = new boolean[n];
        next = new int[n];
        for (int i = 0; i < n; i++) {
            next[i] = i;
        }

        getEnergy(0, 0);
        System.out.println(maxEnergy);
    }

    public static void getEnergy(int depth, int totalEnergy) {
        // 양 끝(0번, n-1번) 구슬 2개만 남으면 종료
        if (depth == n - 2) {
            maxEnergy = Math.max(totalEnergy, maxEnergy);
            return;
        }

        for (int i = 1; i < n - 1; i++) {
            if (!visit[i]) {
                visit[i] = true;
                int right = findRight(i);
                int left = findLeft(i);
                getEnergy(depth + 1, totalEnergy + energy[right] * energy[left]);
                visit[i] = false;
                next[i] = i;
            }
        }
    }

    public static int findRight(int x) {
        if (!visit[x]) {
            return x;
        }
        return next[x] = findRight(x + 1);
    }

    public static int findLeft(int x) {
        if (!visit[x]) {
            return x;
        }
        return next[x] = findLeft(x - 1);
    }
}
```

> **주의 및 참고**: 위 `findLeft`/`findRight`에서 `next[x]`를 캐싱해 두었다면, 백트래킹 시 다른 중간 노드들의 `next` 값이 함께 갱신되어 있을 수 있지만 `if (!visit[x]) return x;`가 먼저 검사되고 양방향 모두 `visit[x] == true`일 때만 `x + 1`/`x - 1`로 이동하므로 항상 정상 동작합니다. (사실 `next[]` 캐싱 없이 `while (visit[left]) left--;`로 구현해도 `N <= 10`이라 동일하게 빠르고 더 단순합니다.)

---

## 채점 결과

![백준 16198 에너지 모으기 맞았습니다 결과](/images/posts/boj-16198-gathering-energy/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O((N - 2)! × N)` — `N = 10`일 때 `8! × 10 ≈ 4 × 10^5` 연산 수준
- **공간 복잡도**: `O(N)` — `energy`, `visit`, `next` 배열 및 최대 깊이 `N - 2` 재귀 스택
