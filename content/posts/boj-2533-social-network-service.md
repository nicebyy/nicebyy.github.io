---
title: "[BOJ 2533] 사회망 서비스(SNS) - Java (트리 DP & 최소 얼리어답터)"
date: "2021-09-30"
category: "PS/BOJ"
tags: ["BOJ","트리","트리DP","동적계획법","Java"]
summary: "정점 u가 얼리어답터일 때(자식의 최소 상태 합)와 아닐 때(자식은 반드시 얼리어답터)의 2가지 상태로 전이하는 전형적인 트리 동적 계획법(Tree DP) 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 사회망 서비스(SNS) (백준 2533번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 2533번) |
| **문제 링크** | [백준 2533번](https://www.acmicpc.net/problem/2533) |
| **제한 사항** | 시간 제한 3초, 메모리 제한 256MB |
| **입력 조건** | 정점 수 $N \le 1,000,000$, 트리 간선 $N-1$개 |
| **핵심 규칙** | 모든 사람이 아이디어를 수용하려면(얼리어답터이거나 모든 친구가 얼리어답터), 필요한 **최소 얼리어답터 수** 계산 |

---

## 2. 접근 아이디어: 트리 동적 계획법 (Tree DP)

### 2가지 상태 정의
임의의 노드를 루트(예: 1번 노드)로 잡고 후위 순회 DFS를 수행합니다:
- **`dp[u][0]`**: 노드 $u$가 **얼리어답터가 아닌 경우**
  - $u$가 얼리어답터가 아니므로, $u$의 **모든 자식 $v$는 반드시 얼리어답터**여야 합니다!
  $$dp[u][0] = \sum_{v \in child(u)} dp[v][1]$$
- **`dp[u][1]`**: 노드 $u$가 **얼리어답터인 경우**
  - 자식 $v$는 얼리어답터여도 되고 아니어도 되므로, 각 자식의 최솟값을 취하고 자기 자신(+1)을 더합니다:
  $$dp[u][1] = 1 + \sum_{v \in child(u)} \min(dp[v][0], dp[v][1])$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static List<Integer>[] adj;
    static int[][] dp;
    static boolean[] visited;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();

        for (int i = 0; i < n - 1; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            adj[u].add(v);
            adj[v].add(u);
        }

        dp = new int[n + 1][2];
        visited = new boolean[n + 1];

        dfs(1);

        System.out.println(Math.min(dp[1][0], dp[1][1]));
    }

    static void dfs(int u) {
        visited[u] = true;
        dp[u][0] = 0;
        dp[u][1] = 1; // 자기 자신 얼리어답터 카운트

        for (int v : adj[u]) {
            if (!visited[v]) {
                dfs(v);
                dp[u][0] += dp[v][1];
                dp[u][1] += Math.min(dp[v][0], dp[v][1]);
            }
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 모든 노드와 간선을 1회 순회. $N = 1,000,000$ 규모에서 0.7초 이내 통과.
- **공간 복잡도**: $O(N)$ — 인접 리스트 및 $N \times 2$ DP 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2533-social-network-service/result.png)
