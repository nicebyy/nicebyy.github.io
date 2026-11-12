---
title: "[BOJ 5719] 거의 최단 경로 - Java (다익스트라 & 역추적 간선 삭제)"
date: "2021-10-02"
category: "PS/BOJ"
tags: ["BOJ","다익스트라","최단경로","역추적","BFS","Java"]
summary: "다익스트라로 시작점에서 도착점까지의 최단경로를 구한 뒤, 도착점에서 역방향 BFS를 수행하여 최단경로에 사용된 모든 간선을 삭제하고 다익스트라를 재실행하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 거의 최단 경로 (백준 5719번 / 플래티넘 5) |
| **플랫폼 / 난이도** | 백준 (플래티넘 5, 5719번) |
| **문제 링크** | [백준 5719번](https://www.acmicpc.net/problem/5719) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 장소 수 $N \le 500$, 도로 수 $M \le 10,000$, 시작점 $S$, 도착점 $D$ |
| **핵심 규칙** | 최단 경로에 포함되는 모든 간선을 완전히 제외했을 때, 새롭게 나오는 **거의 최단 경로의 길이** 구하기 (없으면 -1) |

---

## 2. 접근 아이디어: 다익스트라 2회 & 역방향 BFS 간선 제거

### ⚠️ 최단경로가 여러 개일 수 있음
- 시작점 $S$에서 도착점 $D$까지의 최단경로가 단 1개가 아니라 여러 개일 수 있습니다.
- 따라서 **최단경로에 사용된 '모든' 간선들을 모조리 제거**해야 합니다.

### 3단계 해결 알고리즘
1. **1차 다익스트라**: $S$에서 모든 정점으로의 최단거리 `dist[]`를 구하고, 각 정점으로 들어오는 최단경로 역방향 간선 목록(`parentList[v]`)을 기록합니다.
2. **역방향 BFS 간선 삭제**:
   - 도착점 $D$부터 시작하여 $dist[u] + cost == dist[v]$를 만족하는 모든 간선 $(u, v)$를 삭제(차단) 마킹합니다.
   - 큐를 이용해 거슬러 올라가며 중복 방문을 방지합니다.
3. **2차 다익스트라**: 삭제된 간선을 제외하고 다시 다익스트라를 돌려 새로운 최단거리를 구합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Edge implements Comparable<Edge> {
        int to, cost;
        Edge(int to, int cost) {
            this.to = to;
            this.cost = cost;
        }
        @Override
        public int compareTo(Edge o) {
            return this.cost - o.cost;
        }
    }

    static int n, m, s, d;
    static List<Edge>[] adj;
    static List<Integer>[] parent;
    static boolean[][] isRemoved;
    static int[] dist;
    static final int INF = 1_000_000_000;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();

        while (true) {
            String line = br.readLine();
            if (line == null || line.trim().isEmpty()) continue;
            StringTokenizer st = new StringTokenizer(line);
            n = Integer.parseInt(st.nextToken());
            m = Integer.parseInt(st.nextToken());
            if (n == 0 && m == 0) break;

            st = new StringTokenizer(br.readLine());
            s = Integer.parseInt(st.nextToken());
            d = Integer.parseInt(st.nextToken());

            adj = new ArrayList[n];
            parent = new ArrayList[n];
            for (int i = 0; i < n; i++) {
                adj[i] = new ArrayList<>();
                parent[i] = new ArrayList<>();
            }
            isRemoved = new boolean[n][n];

            for (int i = 0; i < m; i++) {
                st = new StringTokenizer(br.readLine());
                int u = Integer.parseInt(st.nextToken());
                int v = Integer.parseInt(st.nextToken());
                int p = Integer.parseInt(st.nextToken());
                adj[u].add(new Edge(v, p));
            }

            // 1. 1차 다익스트라
            dijkstra();

            // 2. 최단 경로 간선들 역추적 삭제
            removeShortestEdges(d);

            // 3. 2차 다익스트라
            dijkstra();

            sb.append(dist[d] == INF ? -1 : dist[d]).append("\n");
        }

        System.out.print(sb);
    }

    static void dijkstra() {
        dist = new int[n];
        Arrays.fill(dist, INF);
        dist[s] = 0;

        PriorityQueue<Edge> pq = new PriorityQueue<>();
        pq.add(new Edge(s, 0));

        while (!pq.isEmpty()) {
            Edge cur = pq.poll();
            if (cur.cost > dist[cur.to]) continue;

            for (Edge next : adj[cur.to]) {
                if (isRemoved[cur.to][next.to]) continue; // 삭제된 간선 제외

                if (dist[next.to] > dist[cur.to] + next.cost) {
                    dist[next.to] = dist[cur.to] + next.cost;
                    parent[next.to].clear();
                    parent[next.to].add(cur.to);
                    pq.add(new Edge(next.to, dist[next.to]));
                } else if (dist[next.to] == dist[cur.to] + next.cost) {
                    parent[next.to].add(cur.to); // 동일한 최단거리 부모 추가
                }
            }
        }
    }

    static void removeShortestEdges(int dest) {
        Queue<Integer> q = new LinkedList<>();
        boolean[] v = new boolean[n];
        q.add(dest);
        v[dest] = true;

        while (!q.isEmpty()) {
            int cur = q.poll();
            for (int prev : parent[cur]) {
                isRemoved[prev][cur] = true; // 간선 차단
                if (!v[prev]) {
                    v[prev] = true;
                    q.add(prev);
                }
            }
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(M \log N)$ — 다익스트라 2회 및 역방향 BFS $O(M)$. $N \le 500, M \le 10,000$으로 0.25초 이내에 완료.
- **공간 복잡도**: $O(N^2 + M)$ — 인접 리스트 및 간선 제거 2차원 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-5719-almost-shortest-path/result.png)
