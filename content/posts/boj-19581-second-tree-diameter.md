---
title: "[BOJ 19581] 두 번째 트리의 지름 - Java (트리 지름 양 끝점 2회 BFS/DFS)"
date: "2021-10-04"
category: "PS/BOJ"
tags: ["BOJ","트리","트리지름","BFS","Java"]
summary: "임의의 노드에서 가장 먼 점 u, u에서 가장 먼 점 v를 찾아 트리의 지름을 구성한 뒤, u를 제외한 트리 지름과 v를 제외한 트리 지름 중 최댓값으로 두 번째 지름을 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 두 번째 트리의 지름 (백준 19581번 / 골드 1) |
| **플랫폼 / 난이도** | 백준 (골드 1, 19581번) |
| **문제 링크** | [백준 19581번](https://www.acmicpc.net/problem/19581) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 1024MB |
| **입력 조건** | 트리의 노드 수 $N \le 100,000$, 가중치 있는 간선 $N-1$개 |
| **핵심 규칙** | 트리의 모든 단순 경로 중 **두 번째로 긴 경로의 길이(두 번째 트리의 지름)** 구하기 |

---

## 2. 접근 아이디어: 트리의 지름 양 끝점 배제 탐색

### 트리의 지름 성질
1. 임의의 정점(예: 1번)에서 가장 먼 정점 $A$를 찾습니다.
2. $A$에서 가장 먼 정점 $B$를 찾습니다. 경로 $(A, B)$가 트리의 가장 긴 지름입니다.

### 두 번째 트리의 지름 구하기
- 트리의 가장 긴 지름 $(A, B)$ 다음으로 긴 경로는 반드시 **$A$ 또는 $B$를 한쪽 끝점으로 갖거나**, 둘 중 하나를 제외했을 때 나옵니다.
- 따라서 다음 두 경로의 최댓값을 구하면 됩니다:
  1. **$A$를 제외했을 때** 트리의 지름 (즉, $B$에서 $A$를 제외하고 가장 먼 점까지의 거리)
  2. **$B$를 제외했을 때** 트리의 지름 (즉, $A$에서 $B$를 제외하고 가장 먼 점까지의 거리)
- 두 후보 거리 중 더 큰 값이 바로 **두 번째 트리의 지름**입니다!

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Edge {
        int to, cost;
        Edge(int to, int cost) {
            this.to = to;
            this.cost = cost;
        }
    }

    static int n;
    static List<Edge>[] adj;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();

        for (int i = 0; i < n - 1; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            int c = Integer.parseInt(st.nextToken());
            adj[u].add(new Edge(v, c));
            adj[v].add(new Edge(u, c));
        }

        // 1. 임의의 1번 노드에서 가장 먼 점 A 탐색
        int[] res1 = bfs(1, -1);
        int nodeA = res1[0];

        // 2. A에서 가장 먼 점 B 탐색 (A-B가 1번째 지름)
        int[] res2 = bfs(nodeA, -1);
        int nodeB = res2[0];

        // 3. A를 제외하고 B에서 가장 먼 거리
        int distExA = bfs(nodeB, nodeA)[1];

        // 4. B를 제외하고 A에서 가장 먼 거리
        int distExB = bfs(nodeA, nodeB)[1];

        System.out.println(Math.max(distExA, distExB));
    }

    // excludeNode를 제외하고 start에서 가장 먼 노드와 거리 반환
    static int[] bfs(int start, int excludeNode) {
        Queue<Integer> q = new LinkedList<>();
        int[] dist = new int[n + 1];
        Arrays.fill(dist, -1);

        q.add(start);
        dist[start] = 0;

        int maxNode = start;
        int maxDist = 0;

        while (!q.isEmpty()) {
            int cur = q.poll();

            if (dist[cur] > maxDist) {
                maxDist = dist[cur];
                maxNode = cur;
            }

            for (Edge e : adj[cur]) {
                if (e.to == excludeNode) continue; // 제외할 노드 건너뜀

                if (dist[e.to] == -1) {
                    dist[e.to] = dist[cur] + e.cost;
                    q.add(e.to);
                }
            }
        }

        return new int[]{maxNode, maxDist};
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — BFS 총 4회 실행으로 $N = 100,000$일 때 0.5초 이내에 매우 안정적으로 통과.
- **공간 복잡도**: $O(V + E)$ — 트리 인접 리스트 및 거리 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-19581-second-tree-diameter/result.png)
