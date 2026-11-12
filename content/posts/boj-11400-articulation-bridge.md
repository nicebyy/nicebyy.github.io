---
title: "[BOJ 11400] 단절선 - Java (DFS Spanning Tree & Tarjan 알고리즘)"
date: "2021-10-31"
category: "PS/BOJ"
tags: ["BOJ","단절선","그래프","DFS","Tarjan","Java"]
summary: "무향 연결 그래프에서 DFS 스패닝 트리를 순회하며 자식 서브트리가 조상 노드로 우회할 수 없는 간선 ($low[v] > order[u]$)을 찾는 단절선 알고리즘"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 단절선 (백준 11400번 / 플래티넘 1) |
| **플랫폼 / 난이도** | 백준 (플래티넘 1, 11400번) |
| **문제 링크** | [백준 11400번](https://www.acmicpc.net/problem/11400) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 정점 수 $V \le 100,000$, 간선 수 $E \le 1,000,000$ (무향 연결 그래프) |
| **핵심 규칙** | 그래프에서 그 간선을 제거했을 때 그래프가 2개 이상으로 분리되는 **모든 단절선(Bridge)**을 찾아 오름차순 출력 |

---

## 2. 접근 아이디어: DFS Spanning Tree & Tarjan 단절선 판별

### 단절선(Articulation Bridge) 판별 조건
- 무향 연결 그래프에서 임의의 정점에서 DFS를 수행하면 **DFS 스패닝 트리**와 **역방향 간선(Back edge)**으로 분리됩니다.
- 트리 간선 $(u, v)$ (여기서 $u$가 $v$의 부모)에 대해, **$v$와 $v$의 서브트리 노드들이 역방향 간선을 타고 올라갈 수 있는 가장 높은 조상의 방문 순서**를 `low[v]`라고 합시다.
- 만약:
  $$low[v] > order[u]$$
  라면, $v$의 서브트리에서는 간선 $(u, v)$를 우회하여 $u$나 그 조상 노드로 도달할 수 있는 우회로가 전혀 없다는 뜻입니다.
- 따라서 간선 $(u, v)$는 제거 시 그래프가 분리되는 **단절선(Bridge)**이 됩니다!

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Edge implements Comparable<Edge> {
        int u, v;
        Edge(int u, int v) {
            this.u = Math.min(u, v);
            this.v = Math.max(u, v);
        }
        @Override
        public int compareTo(Edge o) {
            if (this.u == o.u) return this.v - o.v;
            return this.u - o.u;
        }
    }

    static int v, e;
    static List<Integer>[] adj;
    static int[] order;
    static int timer = 1;
    static List<Edge> bridges = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        v = Integer.parseInt(st.nextToken());
        e = Integer.parseInt(st.nextToken());

        adj = new ArrayList[v + 1];
        for (int i = 1; i <= v; i++) adj[i] = new ArrayList<>();

        for (int i = 0; i < e; i++) {
            st = new StringTokenizer(br.readLine());
            int a = Integer.parseInt(st.nextToken());
            int b = Integer.parseInt(st.nextToken());
            adj[a].add(b);
            adj[b].add(a);
        }

        order = new int[v + 1];

        for (int i = 1; i <= v; i++) {
            if (order[i] == 0) {
                dfs(i, 0);
            }
        }

        Collections.sort(bridges);

        StringBuilder sb = new StringBuilder();
        sb.append(bridges.size()).append("\n");
        for (Edge edge : bridges) {
            sb.append(edge.u).append(" ").append(edge.v).append("\n");
        }

        System.out.print(sb);
    }

    static int dfs(int u, int parent) {
        order[u] = timer++;
        int low = order[u];

        for (int next : adj[u]) {
            if (next == parent) continue; // 부모로 바로 돌아가는 간선 제외

            if (order[next] > 0) {
                // 이미 방문한 노드 (Back edge)
                low = Math.min(low, order[next]);
            } else {
                // 트리 간선
                int childLow = dfs(next, u);

                // 단절선 조건: 자식이 u의 조상으로 우회할 수 없음
                if (childLow > order[u]) {
                    bridges.add(new Edge(u, next));
                }

                low = Math.min(low, childLow);
            }
        }

        return low;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — DFS 1회 순회로 모든 단절선을 $O(V + E)$에 판별 + 결과 정렬 $O(K \log K)$. $V = 100,000, E = 1,000,000$ 규모에서 약 0.7초 이내에 1초 제한 내 통과.
- **공간 복잡도**: $O(V + E)$ — 인접 리스트 및 방문 순서 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-11400-articulation-bridge/result.png)
