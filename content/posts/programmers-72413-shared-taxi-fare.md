---
title: "[프로그래머스] 합승 택시 요금 - Java (다익스트라 & 플로이드 워셜 최단경로)"
date: "2021-11-13"
category: "PS/Programmers"
tags: ["Programmers","최단경로","다익스트라","플로이드워셜","카카오","Java"]
summary: "출발점 S에서 합승 종료 지점 X까지 동승 후 각각 목적지 A, B로 이동하는 경로의 최소 요금을 다익스트라(Dijkstra)로 탐색하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 합승 택시 요금 (Level 3) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 3) / 2021 KAKAO BLIND RECRUITMENT |
| **문제 링크** | [프로그래머스 합승 택시 요금 (Level 3)](https://school.programmers.co.kr/learn/courses/30/lessons/72413) |
| **입력 조건** | 지점 수 $N$ ($3 \le N \le 200$), 출발 지점 $S$, 도착 지점 $A$, $B$, 택시 요금 간선 `fares` |
| **핵심 규칙** | $S$에서 출발하여 어느 합승 하차 지점 $X$까지 동승 후, 각자 $A, B$로 이동할 때의 **최소 총 요금** 계산 |

---

## 2. 접근 아이디어: 합승 분기점 $X$와 다익스트라(Dijkstra)

### 문제의 수식화
- $S$에서 $X$까지는 둘이 함께 택시를 타고 이동하고, $X$부터는 각자 다른 택시를 타고 $A$와 $B$로 이동합니다.
- 지점 $X$ ($1 \le X \le N$)를 합승 분기점으로 정했을 때의 총 택시 요금은 다음과 같습니다:
  $$\text{TotalCost}(X) = \text{dist}(S, X) + \text{dist}(X, A) + \text{dist}(X, B)$$
- 만약 $X = S$라면 처음부터 합승하지 않고 각자 이동하는 경우를 포함합니다.
- 무향 그래프이므로 $\text{dist}(X, A) = \text{dist}(A, X)$, $\text{dist}(X, B) = \text{dist}(B, X)$입니다.

### 💡 효율적인 최단거리 계산: 다익스트라 3회
1. 출발점 $S$에서의 최단거리 배열 `distS[]` 다익스트라 계산
2. 목적지 $A$에서의 최단거리 배열 `distA[]` 다익스트라 계산
3. 목적지 $B$에서의 최단거리 배열 `distB[]` 다익스트라 계산
4. 모든 지점 $X \in [1, N]$에 대해 $\min(\text{distS}[X] + \text{distA}[X] + \text{distB}[X])$를 취하면 끝!

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    static class Node implements Comparable<Node> {
        int to, cost;
        Node(int to, int cost) {
            this.to = to;
            this.cost = cost;
        }
        @Override
        public int compareTo(Node o) {
            return this.cost - o.cost;
        }
    }

    private static final int INF = 200_000_000;
    private List<Node>[] adj;

    public int solution(int n, int s, int a, int b, int[][] fares) {
        adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();

        for (int[] fare : fares) {
            int u = fare[0];
            int v = fare[1];
            int c = fare[2];
            adj[u].add(new Node(v, c));
            adj[v].add(new Node(u, c));
        }

        // S, A, B 각각을 시작점으로 다익스트라 3회 수행
        int[] distS = dijkstra(s, n);
        int[] distA = dijkstra(a, n);
        int[] distB = dijkstra(b, n);

        int minTotal = INF;
        for (int x = 1; x <= n; x++) {
            if (distS[x] != INF && distA[x] != INF && distB[x] != INF) {
                minTotal = Math.min(minTotal, distS[x] + distA[x] + distB[x]);
            }
        }

        return minTotal;
    }

    private int[] dijkstra(int start, int n) {
        int[] dist = new int[n + 1];
        Arrays.fill(dist, INF);
        dist[start] = 0;

        PriorityQueue<Node> pq = new PriorityQueue<>();
        pq.add(new Node(start, 0));

        while (!pq.isEmpty()) {
            Node cur = pq.poll();

            if (cur.cost > dist[cur.to]) continue;

            for (Node next : adj[cur.to]) {
                if (dist[next.to] > dist[cur.to] + next.cost) {
                    dist[next.to] = dist[cur.to] + next.cost;
                    pq.add(new Node(next.to, dist[next.to]));
                }
            }
        }

        return dist;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: 다익스트라 3회 실행 $O(3 \times (V + E) \log V)$. $V \le 200, E \le 10,000$이므로 0.05초 이내에 매우 빠르게 통과.
- **공간 복잡도**: $O(V + E)$ — 그래프 인접 리스트 및 거리 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-72413-shared-taxi-fare/result.png)
