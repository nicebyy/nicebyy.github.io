---
title: "[BOJ 1753] 최단경로 - Java (단일 시작점 다익스트라 Dijkstra)"
date: "2021-09-01"
category: "PS/BOJ"
tags: ["BOJ","다익스트라","최단경로","그래프","Java"]
summary: "방향 그래프에서 주어진 시작점에서 다른 모든 정점으로의 최단 경로를 우선순위 큐 기반 다익스트라 알고리즘으로 O((V+E)log V)에 구하는 대표 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 최단경로 (백준 1753번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 1753번) |
| **문제 링크** | [백준 1753번](https://www.acmicpc.net/problem/1753) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 정점 수 $V \le 20,000$, 간선 수 $E \le 300,000$, 시작 정점 $K$ |
| **핵심 규칙** | 시작 정점 $K$에서 다른 모든 정점으로의 최단 경로 값을 각각 출력 (경로 없으면 `INF`) |

---

## 2. 접근 아이디어: 인접 리스트와 우선순위 큐 기반 다익스트라

### 정점과 간선 규모에 따른 구조 설계
- 정점 $V$가 최대 20,000이므로 2차원 인접 행렬(`int[20001][20001]`)을 생성하면 $400 \text{MB}$ 이상의 메모리가 필요해 메모리 초과가 발생합니다.
- 반드시 연결된 간선만 보관하는 **인접 리스트(`List<Edge>[]`)**를 사용해야 합니다.
- 우선순위 큐(Min-Heap)를 통해 가장 누적 거리가 짧은 정점부터 확장하며, 방문 여부 또는 `dist[cur] < curCost` 체크로 중복 탐색을 배제합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Node implements Comparable<Node> {
        int to, weight;

        public Node(int to, int weight) {
            this.to = to;
            this.weight = weight;
        }

        @Override
        public int compareTo(Node o) {
            return Integer.compare(this.weight, o.weight);
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int v = Integer.parseInt(st.nextToken());
        int e = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(br.readLine());

        List<List<Node>> graph = new ArrayList<>();
        for (int i = 0; i <= v; i++) {
            graph.add(new ArrayList<>());
        }

        for (int i = 0; i < e; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int to = Integer.parseInt(st.nextToken());
            int w = Integer.parseInt(st.nextToken());
            graph.get(u).add(new Node(to, w));
        }

        int[] dist = new int[v + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;

        PriorityQueue<Node> pq = new PriorityQueue<>();
        pq.offer(new Node(k, 0));

        while (!pq.isEmpty()) {
            Node cur = pq.poll();

            if (dist[cur.to] < cur.weight) continue;

            for (Node next : graph.get(cur.to)) {
                if (dist[next.to] > cur.weight + next.weight) {
                    dist[next.to] = cur.weight + next.weight;
                    pq.offer(new Node(next.to, dist[next.to]));
                }
            }
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= v; i++) {
            if (dist[i] == Integer.MAX_VALUE) {
                sb.append("INF\n");
            } else {
                sb.append(dist[i]).append("\n");
            }
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(E \log V)$ — $300,000 \times \log_2(20,000) \approx 4.3 \times 10^6$ 연산으로 1초 이내 완료.
- **공간 복잡도**: $O(V + E)$ — $V$개의 정점 리스트와 $E$개의 간선 인접 리스트.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1753-shortest-path/result.png)
