---
title: '[BOJ 1800] 인터넷 설치 (Java) - 이분 탐색(Parametric Search) + 다익스트라'
date: '2022-04-13'
category: PS/BOJ
tags:
  - BOJ
  - 다익스트라
  - 이분탐색
  - 매개변수탐색
  - 그래프
  - Java
  - Gold I
summary: >-
  백준 1800번(인터넷 설치) 문제에서 경로 비용의 합이 아니라 'K개의 무료 케이블을 제외하고 남은 최대 케이블 비용'을 최소화하기 위해 이분 탐색과 다익스트라(dist = 상한선 초과 간선 수)를 결합하는 방법을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1800번 - 인터넷 설치](https://www.acmicpc.net/problem/1800)
- **난이도**: Gold I
- **시간 / 메모리 제한**: `2초` / `128 MB`

### 핵심 조건 요약

- `1`번부터 `N`번까지 컴퓨터가 있고, 양방향 케이블 `P`개마다 연결 비용이 다릅니다.
- `1`번은 인터넷 서버에 연결되어 있으며, **`N`번 컴퓨터를 인터넷에 연결**하는 것이 목표입니다.
- `K`개의 케이블은 무료로 연결해 주고, 나머지 연결한 케이블 중 **가장 비싼 케이블 1개의 가격만 지불**합니다.
- 원장 선생님이 내야 하는 **최소 비용**을 구합니다. (`N`번 연결이 불가능하면 `-1`)

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 컴퓨터 수 `N` | `1 ≤ N ≤ 1,000` | — |
| 케이블 수 `P` | `1 ≤ P ≤ 10,000` | 케이블 가격 `1 ~ 1,000,000` |
| 무료 제공 `K` | `0 ≤ K < N` | 가장 비싼 `K`개 간선을 무료 처리 가능 |

---

## 접근 아이디어

일반적인 최단 경로 문제처럼 "비용의 합"을 구하는 것이 아니라, **"경로 위에서 가장 비싼 `K`개 간선을 공짜로 바꾼 뒤 남은 간선 중 최댓값"**을 최소화해야 합니다.
어느 간선을 무료로 처리할지 조합을 전부 따지면 경우의 수가 폭발하므로, **발상을 전환해 매개 변수 탐색(Parametric Search)**으로 접근합니다!

### 1. 결정 문제로 바꾸기: "원장님이 최대 `estimate`원만 내고 `N`번에 도달할 수 있을까?"

비용 상한선 `estimate`를 하나 정해 두면(이분 탐색의 `mid`), 경로상의 모든 간선 `w`는 두 가지로만 나뉩니다.
- `w <= estimate`: `estimate` 이하이므로 비용을 내고 그냥 통과 가능 (**가중치 `0`**)
- `w > estimate`: `estimate`를 초과하므로 **반드시 공짜 회선 `1`개를 소모해야 통과 가능** (**가중치 `1`**)

### 2. 다익스트라 `dist[]` 배열의 재정의

따라서 다익스트라의 `dist[node]`를 비용 합이 아닌 **"`1`번에서 `node`까지 갈 때 `estimate`보다 비싸서 공짜 회선으로 전환한 최소 간선 개수"**로 정의합니다!

- `isArrive(estimate)` 실행 결과 **`dist[N] <= K`**이면, 공짜 회선 `K`개 이하만 쓰고도 `estimate` 이하의 비용으로 `N`번에 도달할 수 있다는 뜻입니다!
- 도달 가능(`true`) → 더 작은 비용도 가능한지 확인하기 위해 `maxEstimate = mid - 1`
- 도달 불가능(`false`) → 상한선을 높여야 하므로 `minEstimate = mid + 1`

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.PriorityQueue;

import static java.util.Arrays.stream;

public class Main {

    static int n, e, k;
    static int minEstimate = 0, maxEstimate = 0;
    static ArrayList<ArrayList<Node>> graph = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        n = input[0];
        e = input[1];
        k = input[2];

        for (int i = 0; i <= n; i++) {
            graph.add(new ArrayList<>());
        }

        for (int i = 0; i < e; i++) {
            input = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            graph.get(input[0]).add(new Node(input[1], input[2]));
            graph.get(input[1]).add(new Node(input[0], input[2]));
            maxEstimate = Math.max(maxEstimate, input[2]);
        }

        int ans = -1;

        // 비용 상한선(estimate)에 대한 이분 탐색
        while (minEstimate <= maxEstimate) {
            int midEstimate = (minEstimate + maxEstimate) / 2;

            if (isArrive(midEstimate)) {
                ans = midEstimate;
                maxEstimate = midEstimate - 1; // 더 낮은 비용 시도
            } else {
                minEstimate = midEstimate + 1; // 비용 상한선 상향
            }
        }

        System.out.println(ans);
    }

    static boolean isArrive(int estimate) {
        // dist[v] = v번 정점까지 오면서 estimate를 초과해 공짜 처리한 간선의 최소 개수
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[1] = 0;

        PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(o -> o.weight));
        pq.add(new Node(1, 0));

        while (!pq.isEmpty()) {
            Node cur = pq.poll();

            if (dist[cur.node] < cur.weight) {
                continue;
            }

            for (Node next : graph.get(cur.node)) {
                int nextCount = cur.weight;

                // 상한선 estimate보다 비싼 케이블은 공짜 회선 1개 소모
                if (estimate < next.weight) {
                    nextCount++;
                }

                if (dist[next.node] > nextCount) {
                    dist[next.node] = nextCount;
                    pq.add(new Node(next.node, nextCount));
                }
            }
        }

        return dist[n] <= k;
    }

    static class Node {
        int node, weight;

        public Node(int node, int weight) {
            this.node = node;
            this.weight = weight;
        }
    }
}
```

> **심화 팁 (0-1 BFS)**: 간선 가중치가 오직 `0` (`w <= estimate`) 또는 `1` (`w > estimate`)뿐이므로, 우선순위 큐(`PriorityQueue`) 대신 **`Deque`를 이용한 0-1 BFS**(`0`이면 `addFirst`, `1`이면 `addLast`)를 적용하면 다익스트라의 `log P` 계수를 없애 `O((N + P) log W)`로 더욱 최적화할 수 있습니다.

---

## 채점 결과

![백준 1800 인터넷 설치 맞았습니다 결과](/images/posts/boj-1800-internet-installation/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(P log N · log W)` (`W ≤ 1,000,000`, `log2(W) ≈ 20`회 다익스트라 수행)
- **공간 복잡도**: `O(N + P)` — 인접 리스트 그래프 및 거리 배열 사용
