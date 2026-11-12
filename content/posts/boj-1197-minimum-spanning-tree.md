---
title: "[BOJ 1197] 최소 스패닝 트리 - Java (크루스칼 Kruskal & 프림 Prim MST)"
date: "2021-09-09"
category: "PS/BOJ"
tags: ["BOJ","MST","크루스칼","프림","UnionFind","Java"]
summary: "그래프의 모든 정점을 최소 비용으로 연결하는 최소 신장 트리(MST)를 간선 가중치 오름차순 정렬 및 Union-Find를 활용한 크루스칼(Kruskal) 알고리즘으로 해결"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 최소 스패닝 트리 (백준 1197번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 1197번) |
| **문제 링크** | [백준 1197번](https://www.acmicpc.net/problem/1197) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 정점 수 $V \le 10,000$, 간선 수 $E \le 100,000$ (음수 가중치 가능) |
| **핵심 규칙** | 모든 정점을 연결하는 **최소 신장 트리(MST)의 총 가중치** 구하기 |

---

## 2. 접근 아이디어: 크루스칼(Kruskal) & Union-Find

1. 모든 간선을 **가중치 오름차순**으로 정렬합니다.
2. 가중치가 가장 작은 간선부터 순회하며, 간선의 두 정점 $u, v$의 부모를 확인합니다.
3. 두 정점이 아직 연결되어 있지 않다면(`find(u) != find(v)`):
   - 트리에 사이클이 발생하지 않으므로 간선을 선택하고 가중치를 합산합니다.
   - `union(u, v)`로 두 정점 집합을 병합합니다.
4. 선택된 간선의 수가 $V - 1$개가 되면 즉시 종료합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Edge implements Comparable<Edge> {
        int u, v, cost;
        Edge(int u, int v, int cost) {
            this.u = u;
            this.v = v;
            this.cost = cost;
        }
        @Override
        public int compareTo(Edge o) {
            return this.cost - o.cost;
        }
    }

    static int[] parent;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int v = Integer.parseInt(st.nextToken());
        int e = Integer.parseInt(st.nextToken());

        Edge[] edges = new Edge[e];
        for (int i = 0; i < e; i++) {
            st = new StringTokenizer(br.readLine());
            edges[i] = new Edge(
                Integer.parseInt(st.nextToken()),
                Integer.parseInt(st.nextToken()),
                Integer.parseInt(st.nextToken())
            );
        }

        Arrays.sort(edges);

        parent = new int[v + 1];
        for (int i = 1; i <= v; i++) parent[i] = i;

        int totalWeight = 0;
        int count = 0;

        for (Edge edge : edges) {
            if (union(edge.u, edge.v)) {
                totalWeight += edge.cost;
                count++;
                if (count == v - 1) break;
            }
        }

        System.out.println(totalWeight);
    }

    static int find(int x) {
        if (parent[x] == x) return x;
        return parent[x] = find(parent[x]);
    }

    static boolean union(int a, int b) {
        int rootA = find(a);
        int rootB = find(b);
        if (rootA == rootB) return false;
        parent[rootB] = rootA;
        return true;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(E \log E)$ — 간선 정렬 시간 지배. $E = 100,000$에서 0.35초 이내 완료.
- **공간 복잡도**: $O(V + E)$ — 간선 배열 및 유니온 파인드 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1197-minimum-spanning-tree/result.png)
