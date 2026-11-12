---
title: "[프로그래머스] 전력망을 둘로 나누기 - Java (트리 간선 절단 & BFS 노드 수 차이 최소화)"
date: "2021-10-05"
category: "PS/Programmers"
tags: ["Programmers","트리","BFS","완전탐색","Java"]
summary: "N-1개의 전선(간선)을 하나씩 끊어보고 생성된 두 서브트리의 송전탑 개수를 BFS로 측정하여 두 전력망의 송전탑 개수 차이의 최솟값을 구하는 완전탐색 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 전력망을 둘로 나누기 (Level 2 / 위클리 챌린지 9주차) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) / 위클리 챌린지 9주차 |
| **문제 링크** | [프로그래머스 전력망을 둘로 나누기 (Level 2 / 위클리 챌린지 9주차)](https://school.programmers.co.kr/learn/courses/30/lessons/86971) |
| **입력 조건** | 송전탑 개수 $n \le 100$, 전선 정보 `wires` ($n-1$개) |
| **핵심 규칙** | 전선 하나를 끊어 전력망을 2개로 분할할 때, **두 전력망의 송전탑 개수 차이의 최솟값** 구하기 |

---

## 2. 접근 아이디어: 전선 1개씩 단선 & BFS 노드 카운트

- 전선의 개수가 $n - 1 \le 99$개로 매우 작습니다.
- $N-1$개의 간선 각각에 대해:
  - 해당 간선을 그래프에서 제외(단선)합니다.
  - 한쪽 노드에서 출발하여 BFS로 연결된 송전탑의 개수 $cnt$를 구합니다.
  - 나머지 전력망의 크기는 $n - cnt$가 되므로, 차이는 $|cnt - (n - cnt)| = |2 \times cnt - n|$입니다.
  - 모든 간선 단선 시뮬레이션 중 차이의 최솟값을 갱신합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    public int solution(int n, int[][] wires) {
        int minDiff = n;

        // 모든 전선을 하나씩 끊어봄
        for (int i = 0; i < wires.length; i++) {
            List<Integer>[] adj = new ArrayList[n + 1];
            for (int j = 1; j <= n; j++) adj[j] = new ArrayList<>();

            for (int j = 0; j < wires.length; j++) {
                if (i == j) continue; // i번째 간선 단선
                int u = wires[j][0];
                int v = wires[j][1];
                adj[u].add(v);
                adj[v].add(u);
            }

            int count = bfs(1, adj, n);
            int diff = Math.abs(count - (n - count));
            minDiff = Math.min(minDiff, diff);
        }

        return minDiff;
    }

    private int bfs(int start, List<Integer>[] adj, int n) {
        Queue<Integer> q = new LinkedList<>();
        boolean[] visited = new boolean[n + 1];

        q.add(start);
        visited[start] = true;
        int cnt = 1;

        while (!q.isEmpty()) {
            int cur = q.poll();
            for (int next : adj[cur]) {
                if (!visited[next]) {
                    visited[next] = true;
                    cnt++;
                    q.add(next);
                }
            }
        }

        return cnt;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times (V + E)) = O(N^2)$ — $N = 100$일 때 약 $10,000$ 연산으로 0.05초 미만에 즉시 완료.
- **공간 복잡도**: $O(N)$ — 그래프 인접 리스트.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-86971-dividing-power-grid/result.png)
