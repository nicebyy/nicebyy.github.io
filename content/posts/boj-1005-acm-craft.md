---
title: "[BOJ 1005] ACM Craft - Java (위상 정렬 Topological Sort & DAG DP)"
date: "2021-09-28"
category: "PS/BOJ"
tags: ["BOJ","위상정렬","DP","그래프","Java"]
summary: "건물 건설 선후 관계 그래프(DAG)에서 진입차수가 0인 건물부터 큐에 넣고 위상 정렬을 수행하며 각 건물 완성에 필요한 최장 소요 시간을 갱신하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | ACM Craft (백준 1005번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 1005번) |
| **문제 링크** | [백준 1005번](https://www.acmicpc.net/problem/1005) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 512MB |
| **입력 조건** | 건물 수 $N \le 1,000$, 건설 순서 규칙 $K \le 100,000$, 건물별 소요 시간 $D_i$, 목표 건물 $W$ |
| **핵심 규칙** | 특정 건물을 짓기 위해 필요한 선행 건물들이 모두 완공되어야 할 때, **목표 건물 $W$가 완공되는 최소 시간** 계산 |

---

## 2. 접근 아이디어: 위상 정렬(Topological Sort) & DAG DP

### 최장 완료 시간 점화식
- 건물 $v$를 짓기 시작하려면, $v$의 모든 선행 건물 $u$들이 완료되어야 하므로:
  $$\text{totalTime}[v] = \max_{(u, v)} (\text{totalTime}[u]) + D_v$$
- 진입차수(in-degree)가 0인 건물부터 큐에 넣고 위상 정렬을 진행하며 전파합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());
        StringBuilder sb = new StringBuilder();

        while (tc-- > 0) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int n = Integer.parseInt(st.nextToken());
            int k = Integer.parseInt(st.nextToken());

            int[] buildTime = new int[n + 1];
            st = new StringTokenizer(br.readLine());
            for (int i = 1; i <= n; i++) {
                buildTime[i] = Integer.parseInt(st.nextToken());
            }

            List<Integer>[] adj = new ArrayList[n + 1];
            for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();
            int[] inDegree = new int[n + 1];

            for (int i = 0; i < k; i++) {
                st = new StringTokenizer(br.readLine());
                int u = Integer.parseInt(st.nextToken());
                int v = Integer.parseInt(st.nextToken());
                adj[u].add(v);
                inDegree[v]++;
            }

            int target = Integer.parseInt(br.readLine());

            int[] dp = new int[n + 1];
            Queue<Integer> q = new LinkedList<>();

            for (int i = 1; i <= n; i++) {
                if (inDegree[i] == 0) {
                    dp[i] = buildTime[i];
                    q.add(i);
                }
            }

            while (!q.isEmpty()) {
                int cur = q.poll();

                for (int next : adj[cur]) {
                    dp[next] = Math.max(dp[next], dp[cur] + buildTime[next]);
                    inDegree[next]--;
                    if (inDegree[next] == 0) {
                        q.add(next);
                    }
                }
            }

            sb.append(dp[target]).append("\n");
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — $N \le 1,000, K \le 100,000$ 규모에서 0.3초 이내에 빠르게 통과.
- **공간 복잡도**: $O(V + E)$ — 그래프 인접 리스트 및 DP 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1005-acm-craft/result.png)
