---
title: "[BOJ 2307] 도로검문 - Java (다익스트라 Dijkstra & 최단경로 간선 차단)"
date: "2021-11-05"
category: "PS/BOJ"
tags: ["BOJ","다익스트라","최단경로","역추적","그래프","Java"]
summary: "원래 최단경로에 속한 간선들만 하나씩 제거하며 다익스트라를 재수행하여 경찰이 검문으로 지연시킬 수 있는 최대 지연 시간을 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 도로검문 (백준 2307번 / 골드 1) |
| **플랫폼 / 난이도** | 백준 (골드 1, 2307번) |
| **문제 링크** | [백준 2307번](https://www.acmicpc.net/problem/2307) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 도시 수 $N \le 1,000$, 도로 수 $M \le 5,000$ |
| **핵심 규칙** | 경찰이 도로 1개를 차단하여 용의자의 탈출을 지연시킬 때, **최대로 지연시킬 수 있는 시간** 구하기 (탈출 불가 시 -1) |

---

## 2. 접근 아이디어: 다익스트라(Dijkstra) & 최단경로 간선만 차단

### ⚠️ 모든 간선을 차단해 보면 안 되는 이유
- 전체 도로 $M=5,000$개 각각에 대해 다익스트라를 돌리면 $5,000 \times (M \log N) \approx 3 \times 10^7$ 연산으로 아슬아슬할 수 있습니다.
- 하지만 **최단경로에 포함되지 않은 간선을 막아봤자 용의자의 최단 이동 시간은 1초도 지연되지 않습니다!**

### 💡 최단경로에 속한 간선만 선별 차단 ($N-1$개)
1. 도로를 전혀 막지 않은 원래 상태에서 $1 \to N$ 다익스트라를 수행하여 원본 최단거리 $origDist$를 구하고, `parent[]` 배열로 **최단경로를 역추적**합니다.
2. 최단경로를 구성하는 간선(최대 $N-1$개)들만 하나씩 순회하며:
   - 해당 간선을 차단(무시)한 상태로 다익스트라를 재수행합니다.
   - 만약 목적지 $N$에 도달할 수 없게 되면, 경찰이 영원히 탈출을 막을 수 있으므로 즉시 **`-1`**을 출력하고 종료합니다.
   - 도달 가능하다면 지연 시간($newDist - origDist$)의 최댓값을 갱신합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Edge implements Comparable<Edge> {
        int to, cost, idx;
        Edge(int to, int cost, int idx) {
            this.to = to;
            this.cost = cost;
            this.idx = idx;
        }
        @Override
        public int compareTo(Edge o) {
            return this.cost - o.cost;
        }
    }

    static int n, m;
    static List<Edge>[] adj;
    static int[] parentEdge;
    static int[] parentNode;
    static final int INF = 1_000_000_000;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        n = Integer.parseInt(st.nextToken());
        m = Integer.parseInt(st.nextToken());

        adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();

        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            int c = Integer.parseInt(st.nextToken());
            adj[u].add(new Edge(v, c, i));
            adj[v].add(new Edge(u, c, i));
        }

        parentEdge = new int[n + 1];
        parentNode = new int[n + 1];

        // 1. 차단 없이 원래 최단 경로 계산
        int origDist = dijkstra(-1, true);

        // 2. 최단 경로 간선들 수집
        List<Integer> pathEdges = new ArrayList<>();
        int curr = n;
        while (curr != 1) {
            pathEdges.add(parentEdge[curr]);
            curr = parentNode[curr];
        }

        // 3. 최단 경로 간선만 하나씩 차단하며 다익스트라 재수행
        int maxDelay = 0;
        for (int blockedEdge : pathEdges) {
            int newDist = dijkstra(blockedEdge, false);
            if (newDist == INF) {
                System.out.println(-1); // 탈출 불가
                return;
            }
            maxDelay = Math.max(maxDelay, newDist - origDist);
        }

        System.out.println(maxDelay);
    }

    static int dijkstra(int blockedIdx, boolean recordPath) {
        int[] dist = new int[n + 1];
        Arrays.fill(dist, INF);
        dist[1] = 0;

        PriorityQueue<Edge> pq = new PriorityQueue<>();
        pq.add(new Edge(1, 0, -1));

        while (!pq.isEmpty()) {
            Edge cur = pq.poll();

            if (cur.cost > dist[cur.to]) continue;

            for (Edge next : adj[cur.to]) {
                if (next.idx == blockedIdx) continue; // 차단된 도로

                if (dist[next.to] > dist[cur.to] + next.cost) {
                    dist[next.to] = dist[cur.to] + next.cost;
                    if (recordPath) {
                        parentEdge[next.to] = next.idx;
                        parentNode[next.to] = cur.to;
                    }
                    pq.add(new Edge(next.to, dist[next.to], next.idx));
                }
            }
        }

        return dist[n];
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V \times (E \log V))$ — 최단경로 간선 수(최대 $V-1 \le 1,000$)에 대해서만 다익스트라 수행. 실제 최단경로 길이는 보통 수십 개에 불과하므로 0.3초 이내에 매우 안정적으로 완료.
- **공간 복잡도**: $O(V + E)$ — 그래프 인접 리스트 및 역추적 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2307-road-checkpoint/result.png)
