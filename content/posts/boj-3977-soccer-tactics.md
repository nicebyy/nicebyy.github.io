---
title: "[BOJ 3977] 축구 전술 - Java (SCC 강한 연결 요소 & 진입차수 0 판별)"
date: "2021-11-25"
category: "PS/BOJ"
tags: ["BOJ","SCC","강한 연결 요소","타잔","위상 정렬","Java"]
summary: "모든 구역에 도달할 수 있는 시작 구역을 찾기 위해, SCC 압축 후 진입차수(in-degree)가 0인 컴포넌트가 유일한지 판별하는 문제"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 축구 전술 (백준 3977번 / 플래티넘 4) |
| **플랫폼 / 난이도** | 백준 (플래티넘 4, 3977번) |
| **문제 링크** | [백준 3977번](https://www.acmicpc.net/problem/3977) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 테스트 케이스 수, 각 케이스마다 구역 수 $N \le 100,000$, 패스 경로 $M \le 100,000$ |
| **핵심 규칙** | 모든 구역에 도달할 수 있는 시작 구역들을 찾아 오름차순 출력. 불가능할 경우 `Confused` 출력 |

---

## 2. 접근 아이디어: SCC(강한 연결 요소) & 진입차수(in-degree) 0 판별

### 문제의 본질
- 어떤 구역에서 시작하여 다른 모든 구역에 도달하려면, 그래프를 컴포넌트로 축약했을 때 **"모든 다른 컴포넌트의 조상이 되는 유일한 루트 컴포넌트"**가 존재해야 합니다.
- 유향 그래프에 사이클이 있을 수 있으므로 먼저 **Tarjan 알고리즘**으로 SCC(강한 연결 요소)를 묶어 DAG로 만듭니다.

### 핵심 판별 로직
1. SCC 압축 그래프에서 **진입차수(in-degree)가 0인 SCC**를 찾습니다.
2. 만약 **진입차수가 0인 SCC가 2개 이상**이라면:
   - 두 개 이상의 서로 다른 독립적인 시작점이 존재하므로, 그 어떤 곳에서 시작해도 다른 쪽 시작점 영역으로 갈 수 없습니다. 따라서 **`Confused`**를 출력합니다.
3. 만약 **진입차수가 0인 SCC가 정확히 1개**라면:
   - 해당 SCC에 속한 모든 원래 정점들을 오름차순으로 출력합니다. (이 SCC 내부의 모든 정점은 서로 자유롭게 왕래 가능하며, 그래프의 유일한 시작점이므로 다른 모든 구역에 도달 가능)

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n, m;
    static List<Integer>[] adj;
    static int[] order, sccId;
    static boolean[] finished;
    static Stack<Integer> stack;
    static int timer, sccCount;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());
        StringBuilder sb = new StringBuilder();

        while (tc-- > 0) {
            String line = br.readLine();
            while (line != null && line.trim().isEmpty()) {
                line = br.readLine();
            }
            if (line == null) break;

            StringTokenizer st = new StringTokenizer(line);
            n = Integer.parseInt(st.nextToken());
            m = Integer.parseInt(st.nextToken());

            adj = new ArrayList[n];
            for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();

            for (int i = 0; i < m; i++) {
                st = new StringTokenizer(br.readLine());
                int u = Integer.parseInt(st.nextToken());
                int v = Integer.parseInt(st.nextToken());
                adj[u].add(v);
            }

            order = new int[n];
            sccId = new int[n];
            finished = new boolean[n];
            stack = new Stack<>();
            timer = 1;
            sccCount = 0;

            // 1. Tarjan 알고리즘 수행
            for (int i = 0; i < n; i++) {
                if (order[i] == 0) dfs(i);
            }

            // 2. SCC 그래프 진입차수(in-degree) 계산
            int[] inDegree = new int[sccCount + 1];
            for (int u = 0; u < n; u++) {
                for (int v : adj[u]) {
                    if (sccId[u] != sccId[v]) {
                        inDegree[sccId[v]]++;
                    }
                }
            }

            // 3. in-degree가 0인 SCC 카운트
            int zeroInCount = 0;
            int targetScc = -1;
            for (int i = 1; i <= sccCount; i++) {
                if (inDegree[i] == 0) {
                    zeroInCount++;
                    targetScc = i;
                }
            }

            // 4. 결과 판정
            if (zeroInCount != 1) {
                sb.append("Confused\n");
            } else {
                for (int i = 0; i < n; i++) {
                    if (sccId[i] == targetScc) {
                        sb.append(i).append("\n");
                    }
                }
            }
            sb.append("\n");
        }

        System.out.print(sb);
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

- **시간 복잡도**: $O(V + E)$ — 테스트케이스당 Tarjan 알고리즘 $O(V + E)$ + 진입차수 계산 $O(V + E)$. $N, M \le 100,000$이므로 1초 이내에 빠르게 통과.
- **공간 복잡도**: $O(V + E)$ — 그래프 인접 리스트 및 SCC 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-3977-soccer-tactics/result.png)
