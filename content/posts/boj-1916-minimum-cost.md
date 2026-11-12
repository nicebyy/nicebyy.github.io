---
title: "[BOJ 1916] 최소비용 구하기 - Java (다익스트라 Dijkstra 최단경로)"
date: "2021-09-02"
category: "PS/BOJ"
tags: ["BOJ","다익스트라","최단경로","그래프","Java"]
summary: "도시 간 버스 비용이 주어졌을 때, 출발 도시에서 도착 도시까지 이동하는 최소 비용을 우선순위 큐(PriorityQueue) 기반 다익스트라로 해결하는 기본 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 최소비용 구하기 (백준 1916번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 1916번) |
| **문제 링크** | [백준 1916번](https://www.acmicpc.net/problem/1916) |
| **제한 사항** | 시간 제한 0.5초, 메모리 제한 128MB |
| **입력 조건** | 도시 수 $N \le 1,000$, 버스 수 $M \le 100,000$, 출발지와 도착지 |
| **핵심 규칙** | 출발 도시에서 도착 도시까지 이동하는 최소 버스 비용 계산 (단방향, 가중치 $\ge 0$) |

---

## 2. 접근 아이디어: 우선순위 큐를 활용한 다익스트라 최단 경로

### 다익스트라 최단 경로 기본기
- 음수 가중치가 없는 단일 출발점 최단 경로 문제의 표준 알고리즘은 **다익스트라(Dijkstra)**입니다.
- 정점 수 $N \le 1,000$에 간선 수 $M \le 100,000$이므로, $O(V^2)$ 방식 대신 Min-Heap(`PriorityQueue`)을 활용한 $O(E \log V)$ 방식으로 접근합니다.
- 동일 노선 사이에 여러 대의 버스(중복 간선)가 있을 수 있으므로, 이미 더 짧은 경로로 방문한 정점은 `dist[cur] < curCost` 조건으로 가지치기(Pruning)하여 큐의 불필요한 확산을 방지합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Edge implements Comparable<Edge> {
        int to, cost;

        public Edge(int to, int cost) {
            this.to = to;
            this.cost = cost;
        }

        @Override
        public int compareTo(Edge o) {
            return Integer.compare(this.cost, o.cost);
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());
        int m = Integer.parseInt(br.readLine());

        List<List<Edge>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) {
            graph.add(new ArrayList<>());
        }

        StringTokenizer st;
        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            int w = Integer.parseInt(st.nextToken());
            graph.get(u).add(new Edge(v, w));
        }

        st = new StringTokenizer(br.readLine());
        int start = Integer.parseInt(st.nextToken());
        int end = Integer.parseInt(st.nextToken());

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[start] = 0;

        PriorityQueue<Edge> pq = new PriorityQueue<>();
        pq.offer(new Edge(start, 0));

        while (!pq.isEmpty()) {
            Edge cur = pq.poll();

            if (dist[cur.to] < cur.cost) continue;
            if (cur.to == end) break; // 도착지 도달 시 조기 종료 가능

            for (Edge next : graph.get(cur.to)) {
                if (dist[next.to] > cur.cost + next.cost) {
                    dist[next.to] = cur.cost + next.cost;
                    pq.offer(new Edge(next.to, dist[next.to]));
                }
            }
        }

        System.out.println(dist[end]);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(M \log N)$ — $100,000 \times \log_2(1,000) \approx 10^6$ 연산 수준으로 0.5초 제한 내에 신속하게 처리됩니다.
- **공간 복잡도**: $O(N + M)$ — 인접 리스트 및 거리 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1916-minimum-cost/result.png)
