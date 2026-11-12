---
title: "[BOJ 4196] 도미노 - Java (SCC 강한 연결 요소 & 진입차수 in-degree 카운트)"
date: "2021-11-23"
category: "PS/BOJ"
tags: ["BOJ","SCC","강한 연결 요소","위상 정렬","코사라주","Java"]
summary: "모든 도미노를 넘어뜨리기 위해 손으로 넘겨야 하는 최소 도미노 수는 SCC 압축 그래프에서 진입차수가 0인 컴포넌트의 수와 일치함을 이용한 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 도미노 (백준 4196번 / 플래티넘 4) |
| **플랫폼 / 난이도** | 백준 (플래티넘 4, 4196번) |
| **문제 링크** | [백준 4196번](https://www.acmicpc.net/problem/4196) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 테스트 케이스 수, 도미노 블록 수 $N \le 100,000$, 관계 수 $M \le 100,000$ |
| **핵심 규칙** | 모든 도미노를 넘어뜨리기 위해 **손으로 직접 넘겨야 하는 최소 도미노 블록 수** 구하기 |

---

## 2. 접근 아이디어: SCC 압축 & 진입차수(in-degree) 0 카운트

### 도미노와 SCC의 관계
- $A$가 쓰러지면 $B$가 쓰러지는 관계는 단방향 간선 $A \to B$로 표현됩니다.
- 만약 $A \to B \to C \to A$와 같은 사이클이 있다면, 이 사이클 내부의 도미노 중 **어느 하나만 손으로 쓰러뜨려도 사이클 내부의 모든 도미노가 연쇄적으로 쓰러집니다**.
- 따라서 사이클에 속한 도미노들을 **SCC(강한 연결 요소)**로 압축하여 하나의 거대한 도미노 블록으로 생각할 수 있습니다.

### 최소 횟수 = 진입차수가 0인 SCC의 개수
- 압축된 SCC DAG에서 다른 SCC로부터 쓰러뜨려질 수 있는(진입차수 $>0$) SCC는, 앞선 SCC가 쓰러질 때 자동으로 넘어갑니다.
- 하지만 **진입차수(in-degree)가 0인 SCC는 외부에서 넘어뜨려 주는 도미노가 없으므로**, 반드시 누군가 손으로 최소 한 번은 직접 쓰러뜨려 주어야 합니다.
- 따라서 문제의 정답은 **"압축된 SCC DAG에서 진입차수가 0인 컴포넌트의 총 개수"**가 됩니다!

---

## 3. Java 풀이 코드 (Kosaraju / Tarjan)

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

            order = new int[n + 1];
            sccId = new int[n + 1];
            finished = new boolean[n + 1];
            stack = new Stack<>();
            timer = 1;
            sccCount = 0;

            // 1. Tarjan 알고리즘으로 SCC 분리
            for (int i = 1; i <= n; i++) {
                if (order[i] == 0) dfs(i);
            }

            // 2. SCC 간 진입차수(in-degree) 계산
            int[] inDegree = new int[sccCount + 1];
            for (int u = 1; u <= n; u++) {
                for (int v : adj[u]) {
                    if (sccId[u] != sccId[v]) {
                        inDegree[sccId[v]]++;
                    }
                }
            }

            // 3. 진입차수가 0인 SCC 개수 합산
            int ans = 0;
            for (int i = 1; i <= sccCount; i++) {
                if (inDegree[i] == 0) ans++;
            }

            sb.append(ans).append("\n");
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

- **시간 복잡도**: $O(V + E)$ — Tarjan SCC 탐색 $O(V + E)$ + 진입차수 계산 $O(V + E)$. 각 테스트 케이스당 약 0.3초 이내 완료.
- **공간 복잡도**: $O(V + E)$ — 인접 리스트 및 정점 메타데이터 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-4196-domino/result.png)
