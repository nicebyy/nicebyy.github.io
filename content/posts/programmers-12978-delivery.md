---
title: '[프로그래머스] 배달 (Level 2, Java) - 1번 마을 출발 다익스트라(Dijkstra)'
date: '2022-03-28'
category: PS/Programmers
tags:
  - Programmers
  - 다익스트라
  - 최단경로
  - 그래프
  - Java
  - Level 2
summary: >-
  프로그래머스 Level 2 배달 문제에서 1번 마을을 시작점으로 모든 마을까지의 최단 배달 시간을 다익스트라(PriorityQueue)로 구한 뒤 K 이하인 마을의 개수를 카운트하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [프로그래머스 - 배달 (12978)](https://school.programmers.co.kr/learn/courses/30/lessons/12978)
- **난이도**: Level 2

### 핵심 조건 요약

- `1`번부터 `N`(`1 ≤ N ≤ 50`)번까지 번호가 붙은 마을이 양방향 도로 `road`(`1 ≤ road.length ≤ 2,000`)로 연결되어 있습니다.
- 두 마을을 연결하는 도로는 **여러 개 존재할 수 있으며**, 도로마다 통행 시간(양의 가중치)이 다릅니다.
- **`1`번 마을**에서 음식 배달을 시작할 때, **`K`시간 이하**로 배달 가능한 마을의 개수를 반환합니다. (`1`번 마을 자기 자신 포함)

---

## 접근 아이디어

출발 정점이 **`1`번 마을로 고정**되어 있고 모든 도로의 가중치가 양수이므로, **다익스트라(Dijkstra) 알고리즘**을 사용해 `1`번 마을에서 각 마을까지의 최단 거리 배열 `distance[]`를 구하면 됩니다.

1. `road` 정보를 바탕으로 양방향 인접 리스트 `graph`를 구성합니다. (같은 두 마을 사이에 여러 도로가 주어지더라도 인접 리스트에 모두 추가하면 다익스트라가 자동으로 최단 간선을 선택합니다.)
2. `PriorityQueue<Node>`로 가장 거리가 짧은 정점부터 꺼내며 `distance`를 완화(Relaxation)합니다.
   - 이때 `if (distance[cur.node] < cur.weight) continue;` 처리를 통해 이미 더 짧은 경로가 확정된 오래된 큐 원소는 건너뛰어 불필요한 탐색을 막습니다.
3. 최종 `distance` 배열에서 `dist <= K`인 마을 수를 세어 반환합니다. (`distance[0]`은 `Integer.MAX_VALUE`로 남아 있으므로 카운트에서 자동 제외됩니다.)

---

## Java 풀이 코드

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.PriorityQueue;

import static java.util.Arrays.stream;

class Solution {

    ArrayList<ArrayList<Node>> graph = new ArrayList<>();

    public int solution(int N, int[][] road, int K) {
        for (int i = 0; i <= N; i++) {
            graph.add(new ArrayList<>());
        }

        // 양방향 도로 정보 구성
        for (int[] edge : road) {
            graph.get(edge[0]).add(new Node(edge[1], edge[2]));
            graph.get(edge[1]).add(new Node(edge[0], edge[2]));
        }

        return getTownCount(1, graph, K);
    }

    private int getTownCount(int start, ArrayList<ArrayList<Node>> graph, int k) {
        int[] distance = new int[graph.size()];
        Arrays.fill(distance, Integer.MAX_VALUE);

        PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(o -> o.weight));
        distance[start] = 0;
        pq.add(new Node(start, 0));

        while (!pq.isEmpty()) {
            Node cur = pq.poll();

            // 이미 더 짧은 경로로 처리된 정점이면 스킵
            if (distance[cur.node] < cur.weight) {
                continue;
            }

            for (Node next : graph.get(cur.node)) {
                if (distance[next.node] > distance[cur.node] + next.weight) {
                    distance[next.node] = distance[cur.node] + next.weight;
                    pq.add(new Node(next.node, distance[next.node]));
                }
            }
        }

        return (int) stream(distance)
                .filter(dist -> dist <= k)
                .count();
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

> **참고**: `N ≤ 50`으로 정점 수가 매우 작기 때문에 다익스트라 외에도 `O(N^3)` 플로이드-워셜(Floyd-Warshall)로도 간단하게 풀 수 있습니다.

---

## 채점 결과

![프로그래머스 배달 통과 결과](/images/posts/programmers-12978-delivery/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(E log V)` — `E ≤ 2,000`, `V ≤ 50`
- **공간 복잡도**: `O(V + E)` — 인접 리스트 및 최단 거리 배열 저장 공간
