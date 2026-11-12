---
title: "[BOJ 17831] 대기업 승범이네 - Java (트리 DP & 최대 가중치 매칭)"
date: "2021-11-08"
category: "PS/BOJ"
tags: ["BOJ","트리","트리DP","동적계획법","Java"]
summary: "회사 조직 트리에서 멘토-멘티 쌍의 곱의 합을 최대화하기 위해, 노드가 멘토링에 포함될 때와 아닐 때의 상태를 나누어 전이하는 트리 DP 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 대기업 승범이네 (백준 17831번 / 골드 2) |
| **플랫폼 / 난이도** | 백준 (골드 2, 17831번) |
| **문제 링크** | [백준 17831번](https://www.acmicpc.net/problem/17831) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 직원 수 $N \le 200,000$, 트리 구조, 직원별 실력 가중치 $W_i \le 1,000$ |
| **핵심 규칙** | 사수와 직속 부하 간 멘토링 쌍을 맺을 때(한 사람은 최대 1개의 멘토링만 가능), 각 쌍의 시너지($W_u \times W_v$)의 총합 최댓값 구하기 |

---

## 2. 접근 아이디어: 2가지 상태를 갖는 트리 DP

### 상태 정의
각 노드 $u$에 대해 2가지 상태를 정의합니다:
- **`dp[u][0]`**: 노드 $u$가 **자신의 어떤 자식과도 멘토링 관계를 맺지 않았을 때** 서브트리의 최댓값.
  - 이 경우 각 자식 $v$는 멘토링을 맺어도 되고 안 맺어도 되므로, 자유롭게 최댓값을 취합니다:
    $$dp[u][0] = \sum_{v \in child(u)} \max(dp[v][0], dp[v][1])$$
- **`dp[u][1]`**: 노드 $u$가 **특정 자식 $v^*$와 멘토링 관계를 맺었을 때** 서브트리의 최댓값.
  - $v^*$는 이미 부모 $u$와 짝이 되었으므로, $v^*$의 서브트리에서는 $v^*$가 자식과 짝을 맺을 수 없습니다($dp[v^*][0]$ 강제).
  - 나머지 자식들은 자유롭게 최댓값을 유지합니다:
    $$dp[u][1] = \max_{v^* \in child(u)} \left( dp[u][0] - \max(dp[v^*][0], dp[v^*][1]) + dp[v^*][0] + (W_u \times W_{v^*}) \right)$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static List<Integer>[] children;
    static int[] weight;
    static int[][] dp;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        children = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) children[i] = new ArrayList<>();

        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 2; i <= n; i++) {
            int parent = Integer.parseInt(st.nextToken());
            children[parent].add(i);
        }

        weight = new int[n + 1];
        st = new StringTokenizer(br.readLine());
        for (int i = 1; i <= n; i++) {
            weight[i] = Integer.parseInt(st.nextToken());
        }

        dp = new int[n + 1][2];
        dfs(1);

        System.out.println(Math.max(dp[1][0], dp[1][1]));
    }

    static void dfs(int u) {
        dp[u][0] = 0;
        dp[u][1] = 0;

        // 1. 자식 노드들 먼저 탐색
        for (int v : children[u]) {
            dfs(v);
            dp[u][0] += Math.max(dp[v][0], dp[v][1]);
        }

        // 2. u가 자식 v 중 하나와 멘토링을 맺는 경우 중 최댓값 탐색
        for (int v : children[u]) {
            int candidate = dp[u][0] - Math.max(dp[v][0], dp[v][1]) + dp[v][0] + (weight[u] * weight[v]);
            dp[u][1] = Math.max(dp[u][1], candidate);
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 모든 노드와 간선을 DFS로 1회 순회하며 각 자식당 상수 시간 전이 연산 수행. $N = 200,000$일 때 0.3초 이내에 가볍게 통과.
- **공간 복잡도**: $O(N)$ — 트리 자식 리스트 및 $N \times 2$ DP 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-17831-corporate-seungbeom/result.png)
