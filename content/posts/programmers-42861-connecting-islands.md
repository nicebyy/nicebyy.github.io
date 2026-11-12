---
title: "[프로그래머스] 섬 연결하기 - Java (최소 신장 트리 MST & 크루스칼 Kruskal)"
date: "2021-08-09"
category: "PS/Programmers"
tags: ["Programmers","MST","크루스칼","UnionFind","그리디","Java"]
summary: "모든 섬이 서로 통행 가능하도록 다리를 건설하는 최소 비용을 간선 가중치 오름차순 정렬 및 Union-Find를 활용한 크루스칼 알고리즘으로 해결하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 섬 연결하기 (Level 3) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 3) |
| **문제 링크** | [프로그래머스 42861번](https://school.programmers.co.kr/learn/courses/30/lessons/42861) |
| **제한 사항** | 섬의 개수 $n \le 100$, 다리 건설 비용 배열 `costs` |
| **입력 조건** | `costs[i] = [섬1, 섬2, 비용]` |
| **핵심 규칙** | 모든 섬이 서로 통행 가능하도록 다리를 놓을 때의 최소 비용 (최소 스패닝 트리, MST) |

---

## 2. 접근 아이디어: 크루스칼 알고리즘(Kruskal's Algorithm)과 Union-Find

### 최소 비용 신장 트리(MST) 기본 원리
- 모든 노드를 최소의 간선 가중치 합으로 연결하는 전형적인 **최소 신장 트리(MST)** 문제입니다.
- $n \le 100$으로 작으므로 간선 중심의 **크루스칼(Kruskal) 알고리즘**을 적용합니다:
  1. 모든 다리(간선)를 건설 비용 기준 **오름차순 정렬**합니다.
  2. 가중치가 가장 작은 간선부터 순회하며 두 섬의 부모 노드가 같은지(`find`) 확인합니다.
  3. 부모가 다르다면 사이클이 형성되지 않으므로, 두 섬을 합치고(`union`) 해당 다리 비용을 총합에 가산합니다.
  4. 선택된 간선 수가 $n - 1$개가 되면 전체 연결이 완료됩니다.

---

## 3. Java 풀이 코드

```java
import java.util.*;

class Solution {
    static int[] parent;

    public int solution(int n, int[][] costs) {
        // 1. 비용 오름차순 정렬
        Arrays.sort(costs, (a, b) -> Integer.compare(a[2], b[2]));

        // 2. Union-Find 초기화
        parent = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }

        int totalCost = 0;
        int edgeCount = 0;

        for (int[] edge : costs) {
            int u = edge[0];
            int v = edge[1];
            int cost = edge[2];

            // 사이클이 형성되지 않는 경우에만 선택
            if (find(u) != find(v)) {
                union(u, v);
                totalCost += cost;
                edgeCount++;

                if (edgeCount == n - 1) break;
            }
        }

        return totalCost;
    }

    private int find(int x) {
        if (parent[x] == x) return x;
        return parent[x] = find(parent[x]); // 경로 압축
    }

    private void union(int a, int b) {
        int rootA = find(a);
        int rootB = find(b);
        if (rootA != rootB) {
            parent[rootB] = rootA;
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(E \log E)$ — 간선 정렬 비용이 지배적이며, $n \le 100$, $E \le 5,000$ 규모에서 1ms 이내로 해결됩니다.
- **공간 복잡도**: $O(V)$ — $n$ 크기의 `parent` 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-42861-connecting-islands/result.png)
