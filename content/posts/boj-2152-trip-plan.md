---
title: "[BOJ 2152] 여행 계획 세우기 - Java (SCC 강한 연결 요소 & 위상 정렬 DP)"
date: "2021-12-01"
category: "PS/BOJ"
tags: ["BOJ","SCC","강한 연결 요소","타잔","위상 정렬","DP","Java"]
summary: "단방향 도시 그래프에서 사이클을 SCC로 묶어 DAG로 변환한 뒤, 출발 SCC에서 도착 SCC까지 방문 가능한 최대 도시 수를 구하는 DP"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 여행 계획 세우기 (백준 2152번 / 플래티넘 3) |
| **플랫폼 / 난이도** | 백준 (플래티넘 3, 2152번) |
| **문제 링크** | [백준 2152번](https://www.acmicpc.net/problem/2152) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 도시 수 $N \le 10,000$, 단방향 도로 수 $M \le 100,000$, 출발 도시 $S$, 도착 도시 $T$ |
| **핵심 규칙** | $S$에서 출발하여 $T$에 도달할 때 방문할 수 있는 **서로 다른 도시의 최대 개수** 구하기 (도달 불가 시 0) |

---

## 2. 접근 아이디어: SCC(강한 연결 요소) 압축 & DAG DP

### 사이클과 SCC (Strongly Connected Component)
- 단방향 도로망에 사이클(Cycle)이 존재한다면, 사이클 내부의 도시들은 상호 간에 무제한 방문할 수 있습니다.
- 따라서 **타잔(Tarjan) 알고리즘**을 사용하여 사이클에 속한 도시들을 하나의 **SCC(강한 연결 요소) 슈퍼 노드**로 압축합니다.
- 각 SCC 슈퍼 노드의 가중치는 **해당 SCC에 포함된 원래 도시의 개수**입니다.

### DAG 변환 후 동적 계획법 (DP)
- SCC로 묶인 컴포넌트 그래프는 **DAG (Directed Acyclic Graph, 방향 비순환 그래프)**가 됩니다.
- $S$가 속한 SCC를 시작점으로 설정하고, 위상 정렬 순서 또는 메모이제이션 DFS를 통해 $T$가 속한 SCC까지 경로 상의 SCC 크기 합의 최댓값을 계산합니다.
- 만약 $S$에서 $T$로 도달할 수 없다면 $0$을 출력합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n, m, s, t;
    static List<Integer>[] adj;
    static int[] order, sccId, sccSize;
    static boolean[] finished;
    static Stack<Integer> stack = new Stack<>();
    static int timer = 1, sccCount = 0;

    // 압축된 SCC DAG 그래프
    static List<Integer>[] sccAdj;
    static int[] inDegree;
    static int[] dp;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        n = Integer.parseInt(st.nextToken());
        m = Integer.parseInt(st.nextToken());
        s = Integer.parseInt(st.nextToken());
        t = Integer.parseInt(st.nextToken());

        adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();

        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            adj[u].add(v);
        }

        order = new int[n + 1];
        sccId = new int[n + 1];
        finished = new boolean[n + 1];
        sccSize = new int[n + 1];

        // 1. Tarjan 알고리즘으로 SCC 분리
        for (int i = 1; i <= n; i++) {
            if (order[i] == 0) dfs(i);
        }

        int startScc = sccId[s];
        int endScc = sccId[t];

        // 출발점과 도착점이 같은 SCC라면 해당 SCC의 도시 개수 반환
        if (startScc == endScc) {
            System.out.println(sccSize[startScc]);
            return;
        }

        // 2. SCC DAG 구축
        sccAdj = new ArrayList[sccCount + 1];
        for (int i = 1; i <= sccCount; i++) sccAdj[i] = new ArrayList<>();
        inDegree = new int[sccCount + 1];

        for (int u = 1; u <= n; u++) {
            for (int v : adj[u]) {
                if (sccId[u] != sccId[v]) {
                    sccAdj[sccId[u]].add(sccId[v]);
                    inDegree[sccId[v]]++;
                }
            }
        }

        // 3. 위상 정렬 기반 DP 수행
        dp = new int[sccCount + 1];
        Queue<Integer> q = new LinkedList<>();

        for (int i = 1; i <= sccCount; i++) {
            if (inDegree[i] == 0) q.add(i);
        }

        dp[startScc] = sccSize[startScc];

        while (!q.isEmpty()) {
            int cur = q.poll();

            for (int next : sccAdj[cur]) {
                // 출발 SCC로부터 도달 가능한 경로만 전파
                if (dp[cur] > 0) {
                    dp[next] = Math.max(dp[next], dp[cur] + sccSize[next]);
                }
                inDegree[next]--;
                if (inDegree[next] == 0) {
                    q.add(next);
                }
            }
        }

        System.out.println(dp[endScc]);
    }

    static int dfs(int u) {
        order[u] = timer++;
        stack.push(u);
        int parent = order[u];

        for (int v : adj[u]) {
            if (order[v] == 0) parent = Math.min(parent, dfs(v));
            else if (!finished[v]) parent = Math.min(parent, order[v]);
        }

        if (parent == order[u]) {
            sccCount++;
            int count = 0;
            while (true) {
                int node = stack.pop();
                finished[node] = true;
                sccId[node] = sccCount;
                count++;
                if (node == u) break;
            }
            sccSize[sccCount] = count;
        }

        return parent;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — Tarjan SCC 추출 $O(V + E)$ + DAG 위상 정렬 및 DP $O(V_{scc} + E_{scc})$. 전체 $V \le 10,000, E \le 100,000$이므로 0.3초 이내에 빠르게 통과.
- **공간 복잡도**: $O(V + E)$ — 그래프 인접 리스트 및 SCC 압축 그래프 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2152-trip-plan/result.png)
