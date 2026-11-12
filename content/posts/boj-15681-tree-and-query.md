---
title: "[BOJ 15681] 트리와 쿼리 - Java (트리 DP & 서브트리 정점 수 메모이제이션)"
date: "2021-11-10"
category: "PS/BOJ"
tags: ["BOJ","트리","트리DP","DFS","Java"]
summary: "루트가 있는 트리에서 후위 순회 DFS를 통해 각 정점을 루트로 하는 서브트리의 크기를 $O(V)$에 전처리하고 $O(1)$ 쿼리를 처리하는 트리 DP 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 트리와 쿼리 (백준 15681번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 15681번) |
| **문제 링크** | [백준 15681번](https://www.acmicpc.net/problem/15681) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 정점 수 $N \le 100,000$, 루트 $R$, 쿼리 수 $Q \le 100,000$ |
| **핵심 규칙** | 정점 $U$를 루트로 하는 서브트리에 속한 정점의 개수를 각 쿼리마다 출력 |

---

## 2. 접근 아이디어: 트리 DP (Tree Dynamic Programming)

### 서브트리 크기 점화식
- 루트가 있는 트리에서 정점 $u$를 루트로 하는 서브트리의 크기는 다음과 같습니다:
  $$size[u] = 1 + \sum_{v \in child(u)} size[v]$$
- 루트 $R$에서 시작하여 **후위 순회(Post-order) DFS**를 단 1회 수행하면, 모든 정점의 서브트리 크기를 $O(N)$에 전처리할 수 있습니다.
- 이후 주어지는 $Q$개의 쿼리에 대해 미리 계산된 `size[U]`를 $O(1)$에 출력합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n, r, q;
    static List<Integer>[] adj;
    static int[] subSize;
    static boolean[] visited;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        n = Integer.parseInt(st.nextToken());
        r = Integer.parseInt(st.nextToken());
        q = Integer.parseInt(st.nextToken());

        adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();

        for (int i = 0; i < n - 1; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            adj[u].add(v);
            adj[v].add(u);
        }

        subSize = new int[n + 1];
        visited = new boolean[n + 1];

        // 1. 루트 r에서 1회 DFS 전처리
        dfs(r);

        // 2. 쿼리 O(1) 처리
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            int queryNode = Integer.parseInt(br.readLine());
            sb.append(subSize[queryNode]).append("\n");
        }

        System.out.print(sb);
    }

    static int dfs(int u) {
        visited[u] = true;
        subSize[u] = 1; // 자기 자신 포함

        for (int v : adj[u]) {
            if (!visited[v]) {
                subSize[u] += dfs(v);
            }
        }

        return subSize[u];
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N + Q)$ — 1회 DFS 순회 $O(N)$ + $Q$개 쿼리 각각 $O(1)$. $N, Q \le 100,000$일 때 0.3초 이내에 매우 안정적으로 통과.
- **공간 복잡도**: $O(N)$ — 트리 인접 리스트 및 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-15681-tree-and-query/result.png)
