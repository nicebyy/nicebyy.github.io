---
title: "[BOJ 2150] Strongly Connected Component - Java (Kosaraju & Tarjan SCC 기초)"
date: "2021-10-08"
category: "PS/BOJ"
tags: ["BOJ","SCC","강한연결요소","Kosaraju","Tarjan","Java"]
summary: "방향 그래프에서 상호 도달 가능한 정점들의 집합인 SCC(강한 연결 요소)를 코사라주 또는 타잔 알고리즘을 통해 O(V+E)로 분리하고 정렬 출력하는 기본 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | Strongly Connected Component (백준 2150번 / 플래티넘 5) |
| **플랫폼 / 난이도** | 백준 (플래티넘 5, 2150번) |
| **문제 링크** | [백준 2150번](https://www.acmicpc.net/problem/2150) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 정점 수 $V \le 10,000$, 간선 수 $E \le 100,000$ (방향 그래프) |
| **핵심 규칙** | 그래프의 모든 **SCC(강한 연결 요소)**를 구하고, 각 컴포넌트 내부 정점 오름차순 및 컴포넌트의 첫 번째 정점 오름차순으로 정렬 출력 |

---

## 2. 접근 아이디어: Tarjan SCC 분리 알고리즘

### 강한 연결 요소 (Strongly Connected Component)
- 유향 그래프에서 두 정점 $u, v$ 사이에 양방향으로 경로가 존재하는 극대 부분 그래프입니다.
- **Tarjan 알고리즘**:
  - DFS 순회 방문 순서(`order[u]`)를 기록하고 스택에 정점을 푸시합니다.
  - 인접한 정점들을 탐색하며 서브트리에서 도달 가능한 가장 높은 조상 순서 `low`를 계산합니다.
  - `low == order[u]`인 지점이 SCC의 루트이므로, 스택에서 $u$가 나올 때까지 pop하여 하나의 SCC 그룹을 생성합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int v, e;
    static List<Integer>[] adj;
    static int[] order;
    static boolean[] finished;
    static Stack<Integer> stack = new Stack<>();
    static int timer = 1;
    static List<List<Integer>> sccList = new ArrayList<>();

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
        }

        order = new int[v + 1];
        finished = new boolean[v + 1];

        for (int i = 1; i <= v; i++) {
            if (order[i] == 0) dfs(i);
        }

        // 각 SCC 내부 정점 오름차순 정렬
        for (List<Integer> component : sccList) {
            Collections.sort(component);
        }

        // 첫 번째 원소 기준 SCC 그룹 정렬
        sccList.sort(Comparator.comparingInt(a -> a.get(0)));

        StringBuilder sb = new StringBuilder();
        sb.append(sccList.size()).append("\n");
        for (List<Integer> comp : sccList) {
            for (int node : comp) {
                sb.append(node).append(" ");
            }
            sb.append("-1\n");
        }

        System.out.print(sb);
    }

    static int dfs(int u) {
        order[u] = timer++;
        stack.push(u);
        int parent = order[u];

        for (int next : adj[u]) {
            if (order[next] == 0) {
                parent = Math.min(parent, dfs(next));
            } else if (!finished[next]) {
                parent = Math.min(parent, order[next]);
            }
        }

        if (parent == order[u]) {
            List<Integer> component = new ArrayList<>();
            while (true) {
                int node = stack.pop();
                finished[node] = true;
                component.add(node);
                if (node == u) break;
            }
            sccList.add(component);
        }

        return parent;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — DFS 1회 순회로 모든 SCC 추출 후 정렬 $O(V \log V)$. 0.3초 이내에 매우 안정적으로 완료.
- **공간 복잡도**: $O(V + E)$ — 인접 리스트 및 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2150-strongly-connected-component/result.png)
