---
title: "[BOJ 1162] 도로포장 - Java (다익스트라 Dijkstra & 2차원 DP 상태 공간)"
date: "2021-09-02"
category: "PS/BOJ"
tags: ["BOJ","다익스트라","최단경로","DP","Java"]
summary: "최대 K개의 도로를 포장하여 비용을 0으로 만들 수 있을 때, dist[정점][포장한 도로 수] 2차원 상태 공간을 정의하여 다익스트라로 최소 시간을 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 도로포장 (백준 1162번 / 골드 1) |
| **플랫폼 / 난이도** | 백준 (골드 1, 1162번) |
| **문제 링크** | [백준 1162번](https://www.acmicpc.net/problem/1162) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 도시 수 $N \le 10,000$, 도로 수 $M \le 50,000$, 포장 도로 수 $K \le 20$ |
| **핵심 규칙** | 최대 $K$개의 도로를 포장(시간 0으로 단축)할 수 있을 때, 1번 도시에서 $N$번 도시로 가는 최소 이동 시간 |

---

## 2. 접근 아이디어: 2차원 다익스트라(Dijkstra + DP 상태 공간)

### 상태 정의와 다익스트라 확장
- 일반적인 최단경로 다익스트라는 `dist[node]` 1차원 배열을 사용하지만, 이 문제는 **"현재까지 몇 개의 도로를 포장했는가($k$)"**라는 상태가 추가됩니다.
- 따라서 상태를 **2차원 배열 `dist[node][cnt]`**(도로를 $cnt$번 포장하여 $node$번에 도달하는 최단 시간)로 정의하고 우선순위 큐로 다익스트라를 진행합니다.
- 다음 노드로 이동할 때 분기는 2가지입니다:
  1. **도로를 포장하지 않고 이동**: 현재 포장 횟수 $cnt$ 유지, 가중치 $w$ 그대로 추가.
  2. **도로를 포장하고 이동 ($cnt < K$)**: 포장 횟수 $cnt + 1$로 증가, 가중치는 0으로 처리.

### 주의점: 자료형 오버플로우
- 도시 수 $N \le 10,000$, 간선 가중치 최대 $1,000,000$이므로 누적 이동 시간은 $10,000 \times 1,000,000 = 10^{10}$으로 32비트 정수 범위를 초과합니다.
- 따라서 누적 비용 및 `dist` 배열은 반드시 **`long` 타입**을 사용해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Node implements Comparable<Node> {
        int to;
        long cost;
        int pavedCount;

        public Node(int to, long cost, int pavedCount) {
            this.to = to;
            this.cost = cost;
            this.pavedCount = pavedCount;
        }

        @Override
        public int compareTo(Node o) {
            return Long.compare(this.cost, o.cost);
        }
    }

    static class Edge {
        int to;
        int cost;

        public Edge(int to, int cost) {
            this.to = to;
            this.cost = cost;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());

        List<List<Edge>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) {
            graph.add(new ArrayList<>());
        }

        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            int w = Integer.parseInt(st.nextToken());
            graph.get(u).add(new Edge(v, w));
            graph.get(v).add(new Edge(u, w));
        }

        // dist[노드][포장한 도로 수]
        long[][] dist = new long[n + 1][k + 1];
        for (int i = 0; i <= n; i++) {
            Arrays.fill(dist[i], Long.MAX_VALUE);
        }

        PriorityQueue<Node> pq = new PriorityQueue<>();
        pq.offer(new Node(1, 0, 0));
        dist[1][0] = 0;

        while (!pq.isEmpty()) {
            Node cur = pq.poll();

            if (dist[cur.to][cur.pavedCount] < cur.cost) continue;

            for (Edge next : graph.get(cur.to)) {
                // 분기 1: 포장하지 않고 이동
                if (dist[next.to][cur.pavedCount] > cur.cost + next.cost) {
                    dist[next.to][cur.pavedCount] = cur.cost + next.cost;
                    pq.offer(new Node(next.to, dist[next.to][cur.pavedCount], cur.pavedCount));
                }

                // 분기 2: 포장하고 이동 (k회 미만일 때)
                if (cur.pavedCount < k && dist[next.to][cur.pavedCount + 1] > cur.cost) {
                    dist[next.to][cur.pavedCount + 1] = cur.cost;
                    pq.offer(new Node(next.to, dist[next.to][cur.pavedCount + 1], cur.pavedCount + 1));
                }
            }
        }

        long ans = Long.MAX_VALUE;
        for (int c = 0; c <= k; c++) {
            ans = Math.min(ans, dist[n][c]);
        }

        System.out.println(ans);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(K \cdot M \log(K \cdot N))$ — 정점 상태 수 $N(K+1) = 210,000$, 간선 상태 수 $M(K+1) = 1,050,000$ 규모의 우선순위 큐 다익스트라로 2초 제한 내에 여유 있게 통과합니다.
- **공간 복잡도**: $O(K \cdot N + M)$ — 2차원 최단거리 테이블 `dist[10001][21]`과 양방향 그래프 인접 리스트.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1162-paving-road/result.png)
