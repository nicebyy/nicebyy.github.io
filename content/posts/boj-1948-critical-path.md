---
title: "[BOJ 1948] 임계경로 - Java (위상 정렬 Topological Sort & 역추적 Backtracking)"
date: "2021-11-21"
category: "PS/BOJ"
tags: ["BOJ","위상 정렬","역추적","그래프","Java"]
summary: "모든 사람이 도착점에 도달하는 최장 소요 시간을 위상 정렬로 구한 뒤, 도착점부터 역방향 BFS/DFS로 1분도 쉬지 않고 달려야 하는 모든 도로(임계 간선)를 중복 없이 카운트"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 임계경로 (백준 1948번 / 플래티넘 5) |
| **플랫폼 / 난이도** | 백준 (플래티넘 5, 1948번) |
| **문제 링크** | [백준 1948번](https://www.acmicpc.net/problem/1948) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 256MB |
| **입력 조건** | 도시 수 $n \le 10,000$, 도로 수 $m \le 100,000$, 시작 도시 $S$, 도착 도시 $E$ (모든 도로는 일방통행이며 사이클 없음 - DAG) |
| **핵심 출력** | 1) 모든 사람이 도착점에 도달하는 최장 소요 시간, 2) 1분도 쉬지 않고 달려야 하는 도로(임계 도로)의 총 개수 |

---

## 2. 접근 아이디어: 위상 정렬(Topological Sort) & 역방향 BFS 역추적

### 1단계: 최장 소요 시간 계산 (정방향 위상 정렬)
- 그래프에 사이클이 없으므로(DAG), 위상 정렬을 이용하여 각 도시 $v$에 도달하는 최장 시간 `maxDist[v]`를 구합니다:
  $$maxDist[v] = \max(maxDist[v], maxDist[u] + cost)$$

### 2단계: 1분도 쉬지 않고 달려야 하는 도로 개수 (역방향 역추적)
- 도착 도시 $E$부터 시작하여 **역방향 간선**을 타고 거슬러 올라가는 BFS를 수행합니다.
- 정점 $cur$에서 역방향 간선을 통해 이전 도시 $prev$로 갈 때,
  $$maxDist[cur] - cost == maxDist[prev]$$
  가 성립한다면, 해당 도로 $(prev \to cur)$는 **임계 경로에 포함되는 도로(임계 도로)**입니다.
- **⚠️ 중복 카운트 방지 주의점**:
  - 서로 다른 경로에서 동일한 도시를 재방문할 수 있습니다.
  - 도시 방문 여부(`visited[node]`)를 관리하여 이미 방문한 도시의 역방향 간선들을 중복으로 큐에 넣지 않도록 해야 도로 수가 중복 카운트되는 오류와 시간 초과를 방지할 수 있습니다.

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

    static int n, m;
    static List<Edge>[] forwardAdj;
    static List<Edge>[] backwardAdj;
    static int[] inDegree;
    static int[] maxDist;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());
        m = Integer.parseInt(br.readLine());

        forwardAdj = new ArrayList[n + 1];
        backwardAdj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) {
            forwardAdj[i] = new ArrayList<>();
            backwardAdj[i] = new ArrayList<>();
        }

        inDegree = new int[n + 1];

        for (int i = 0; i < m; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            int cost = Integer.parseInt(st.nextToken());
            forwardAdj[u].add(new Edge(v, cost));
            backwardAdj[v].add(new Edge(u, cost)); // 역방향 간선 저장
            inDegree[v]++;
        }

        StringTokenizer st = new StringTokenizer(br.readLine());
        int start = Integer.parseInt(st.nextToken());
        int end = Integer.parseInt(st.nextToken());

        // 1. 정방향 위상 정렬로 최장 소요 시간 계산
        maxDist = new int[n + 1];
        Queue<Integer> q = new LinkedList<>();
        q.add(start);

        while (!q.isEmpty()) {
            int cur = q.poll();

            for (Edge e : forwardAdj[cur]) {
                if (maxDist[e.to] < maxDist[cur] + e.cost) {
                    maxDist[e.to] = maxDist[cur] + e.cost;
                }
                inDegree[e.to]--;
                if (inDegree[e.to] == 0) {
                    q.add(e.to);
                }
            }
        }

        // 2. 도착점부터 역방향 BFS로 임계 간선 카운트
        int criticalEdgeCount = 0;
        boolean[] visited = new boolean[n + 1];
        Queue<Integer> reverseQ = new LinkedList<>();

        reverseQ.add(end);
        visited[end] = true;

        while (!reverseQ.isEmpty()) {
            int cur = reverseQ.poll();

            for (Edge e : backwardAdj[cur]) {
                // 임계 경로 조건 만족 검사
                if (maxDist[cur] - e.cost == maxDist[e.to]) {
                    criticalEdgeCount++;
                    // 정점 중복 방문 방지
                    if (!visited[e.to]) {
                        visited[e.to] = true;
                        reverseQ.add(e.to);
                    }
                }
            }
        }

        System.out.println(maxDist[end]);
        System.out.println(criticalEdgeCount);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — 정방향 위상 정렬 $O(V + E)$ + 역방향 BFS $O(V + E)$. $N \le 10,000, M \le 100,000$ 규모에서 0.3초 이내에 빠르게 통과.
- **공간 복잡도**: $O(V + E)$ — 정방향 및 역방향 인접 리스트 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1948-critical-path/result.png)
