---
title: "[BOJ 11266] 단절점 - Java (DFS Spanning Tree & Tarjan 알고리즘)"
date: "2021-10-31"
category: "PS/BOJ"
tags: ["BOJ","단절점","그래프","DFS","Tarjan","Java"]
summary: "무향 연결 그래프에서 특정 정점을 제거했을 때 그래프가 둘 이상으로 나뉘는지 DFS 방문 순서와 역방향 간선 도달 가능성을 비교하여 판별하는 단절점 알고리즘"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 단절점 (백준 11266번 / 플래티넘 4) |
| **플랫폼 / 난이도** | 백준 (플래티넘 4, 11266번) |
| **문제 링크** | [백준 11266번](https://www.acmicpc.net/problem/11266) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 정점 수 $V \le 10,000$, 간선 수 $E \le 100,000$ (무향 그래프, 여러 개의 연결 컴포넌트 가능) |
| **핵심 규칙** | 어떤 정점을 제거했을 때 그래프가 2개 이상으로 분리되는 **모든 단절점(Articulation Point)**을 오름차순 출력 |

---

## 2. 접근 아이디어: DFS Spanning Tree & Tarjan 단절점 판별법

### 단절점(Articulation Point / Cut Vertex) 판별 2대 원칙
무향 그래프에서 DFS를 수행하여 형성되는 **DFS 스패닝 트리**에서 특정 정점 $u$가 단절점인지 여부는 다음 두 조건으로 완벽히 판별됩니다:

1. **루트 노드인 경우**:
   - DFS 탐색의 시작점이 되는 루트 노드는 **자식 서브트리의 개수가 2개 이상**이면 단절점입니다. (스패닝 트리 상에서 루트가 끊어지면 두 자식 서브트리는 서로 연결될 경로가 없음)
2. **루트가 아닌 일반 노드인 경우**:
   - 정점 $u$의 어떤 자식 $v$에 대해, $v$와 그 서브트리 노드들이 역방향 간선(Back edge)을 타고 올라갈 수 있는 가장 높은 조상의 방문 순서 $low[v]$가
     $$low[v] \ge order[u]$$
     를 만족한다면, $v$의 서브트리는 $u$를 거치지 않고는 $u$의 부모나 그 조상으로 갈 수 없으므로 $u$는 **단절점**입니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int v, e;
    static List<Integer>[] adj;
    static int[] order;
    static boolean[] isCutPoint;
    static int timer = 1;

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
            adj[b].add(a);
        }

        order = new int[v + 1];
        isCutPoint = new boolean[v + 1];

        // 분리된 그래프가 있을 수 있으므로 모든 정점 확인
        for (int i = 1; i <= v; i++) {
            if (order[i] == 0) {
                dfs(i, true);
            }
        }

        int count = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= v; i++) {
            if (isCutPoint[i]) {
                count++;
                sb.append(i).append(" ");
            }
        }

        System.out.println(count);
        if (count > 0) {
            System.out.println(sb.toString().trim());
        }
    }

    static int dfs(int u, boolean isRoot) {
        order[u] = timer++;
        int low = order[u];
        int childCount = 0;

        for (int next : adj[u]) {
            if (order[next] > 0) {
                // 이미 방문한 노드 (역방향 간선)
                low = Math.min(low, order[next]);
            } else {
                childCount++;
                int childLow = dfs(next, false);

                // 비루트 노드 단절점 조건
                if (!isRoot && childLow >= order[u]) {
                    isCutPoint[u] = true;
                }

                low = Math.min(low, childLow);
            }
        }

        // 루트 노드 단절점 조건
        if (isRoot && childCount >= 2) {
            isCutPoint[u] = true;
        }

        return low;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — DFS 1회 순회로 모든 정점과 간선을 상수 횟수로 확인. $V = 10,000, E = 100,000$ 규모에서 0.3초 이내에 완료.
- **공간 복잡도**: $O(V + E)$ — 그래프 인접 리스트 및 방문 순서 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-11266-articulation-point/result.png)
