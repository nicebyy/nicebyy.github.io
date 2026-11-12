---
title: "[BOJ 4013] ATM - Java (SCC 강한 연결 요소 & 위상 정렬 DAG DP)"
date: "2021-11-23"
category: "PS/BOJ"
tags: ["BOJ","SCC","강한 연결 요소","위상 정렬","DP","Java"]
summary: "현금 인출기 그래프에서 사이클을 하나의 노드로 묶는 SCC 압축을 수행하고, 위상 정렬 순서로 레스토랑 도달 가능 최대 금액을 구하는 DP"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | ATM (백준 4013번 / 플래티넘 2) |
| **플랫폼 / 난이도** | 백준 (플래티넘 2, 4013번) |
| **문제 링크** | [백준 4013번](https://www.acmicpc.net/problem/4013) |
| **제한 사항** | 시간 제한 4초, 메모리 제한 256MB |
| **입력 조건** | 교차로 수 $N \le 500,000$, 도로 수 $M \le 500,000$, 시작 교차로 $S$, 레스토랑 수 $P$ |
| **핵심 규칙** | $S$에서 출발하여 레스토랑이 있는 임의의 교차로에서 여정을 마칠 때, **인출할 수 있는 현금의 최댓값** 구하기 |

---

## 2. 접근 아이디어: SCC 압축 & 위상 정렬 DAG DP

### 사이클 내의 현금 전액 인출
- 단방향 도로망에서 사이클에 속한 교차로들은 얼마든지 반복해서 방문할 수 있습니다.
- 따라서 사이클에 포함된 모든 ATM의 현금을 한 번에 전부 인출할 수 있으므로, **Tarjan 알고리즘으로 SCC를 추출하여 하나의 정점으로 압축**합니다.
- 각 SCC 정점에는 **내부 교차로들의 현금 합계**와 **내부에 레스토랑이 포함되어 있는지 여부(`hasRestaurant`)**를 저장합니다.

### 위상 정렬 순서 DAG DP
- 압축된 그래프는 DAG이므로 위상 정렬 순서로 DP를 수행합니다:
  $$dp[next] = \max(dp[next], dp[cur] + sccCost[next])$$
- 시작점 $S$가 속한 SCC부터 도달 가능한 정점들만 DP 값을 갱신해야 합니다.
- 최종적으로 레스토랑이 존재하는 모든 SCC 중 $dp$ 값의 최댓값을 출력합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n, m;
    static List<Integer>[] adj;
    static int[] atm;
    static int startNode, p;
    static boolean[] isRestaurant;

    static int[] order, sccId;
    static boolean[] finished;
    static Stack<Integer> stack = new Stack<>();
    static int timer = 1, sccCount = 0;

    // SCC 압축 그래프
    static int[] sccAtm;
    static boolean[] sccHasRest;
    static Set<Integer>[] sccAdj;
    static int[] inDegree;

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
            adj[u].add(v);
        }

        atm = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            atm[i] = Integer.parseInt(br.readLine());
        }

        st = new StringTokenizer(br.readLine());
        startNode = Integer.parseInt(st.nextToken());
        p = Integer.parseInt(st.nextToken());

        isRestaurant = new boolean[n + 1];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < p; i++) {
            isRestaurant[Integer.parseInt(st.nextToken())] = true;
        }

        order = new int[n + 1];
        sccId = new int[n + 1];
        finished = new boolean[n + 1];

        // 1. Tarjan SCC 분리
        for (int i = 1; i <= n; i++) {
            if (order[i] == 0) dfs(i);
        }

        // 2. SCC 속성 집계
        sccAtm = new int[sccCount + 1];
        sccHasRest = new boolean[sccCount + 1];
        for (int i = 1; i <= n; i++) {
            int id = sccId[i];
            sccAtm[id] += atm[i];
            if (isRestaurant[i]) sccHasRest[id] = true;
        }

        // 3. SCC DAG 구축
        sccAdj = new HashSet[sccCount + 1];
        for (int i = 1; i <= sccCount; i++) sccAdj[i] = new HashSet<>();
        inDegree = new int[sccCount + 1];

        for (int u = 1; u <= n; u++) {
            for (int v : adj[u]) {
                if (sccId[u] != sccId[v] && sccAdj[sccId[u]].add(sccId[v])) {
                    inDegree[sccId[v]]++;
                }
            }
        }

        // 4. 위상 정렬 기반 DP 수행
        int startScc = sccId[startNode];
        int[] dp = new int[sccCount + 1];
        boolean[] reachable = new boolean[sccCount + 1];
        Queue<Integer> q = new LinkedList<>();

        for (int i = 1; i <= sccCount; i++) {
            if (inDegree[i] == 0) q.add(i);
        }

        dp[startScc] = sccAtm[startScc];
        reachable[startScc] = true;

        while (!q.isEmpty()) {
            int cur = q.poll();

            for (int next : sccAdj[cur]) {
                if (reachable[cur]) {
                    reachable[next] = true;
                    dp[next] = Math.max(dp[next], dp[cur] + sccAtm[next]);
                }
                inDegree[next]--;
                if (inDegree[next] == 0) {
                    q.add(next);
                }
            }
        }

        int maxCash = 0;
        for (int i = 1; i <= sccCount; i++) {
            if (reachable[i] && sccHasRest[i]) {
                maxCash = Math.max(maxCash, dp[i]);
            }
        }

        System.out.println(maxCash);
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
            while (true) {
                int node = stack.pop();
                finished[node] = true;
                sccId[node] = sccCount;
                if (node == u) break;
            }
        }

        return parent;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — Tarjan 알고리즘 $O(V + E)$ + 위상 정렬 DP $O(V_{scc} + E_{scc})$. $N, M \le 500,000$ 규모에서 약 1.5초 이내에 4초 시간 제한 내로 넉넉하게 통과.
- **공간 복잡도**: $O(V + E)$ — 대규모 그래프 및 SCC 인접 리스트.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-4013-atm/result.png)
