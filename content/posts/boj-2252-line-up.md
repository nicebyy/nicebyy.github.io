---
title: "[BOJ 2252] 줄 세우기 - Java (위상 정렬 Topological Sort)"
date: "2021-09-09"
category: "PS/BOJ"
tags: ["BOJ","위상정렬","그래프","큐","Java"]
summary: "키 비교 결과로 주어지는 학생 간 선후 관계(DAG)에서 진입차수가 0인 학생부터 큐에 넣고 순서대로 방문하여 전체 학생을 일렬로 줄 세우는 기본 위상 정렬 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 줄 세우기 (백준 2252번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 2252번) |
| **문제 링크** | [백준 2252번](https://www.acmicpc.net/problem/2252) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 학생 수 $N \le 32,000$, 키 비교 횟수 $M \le 100,000$ |
| **핵심 규칙** | 학생들의 키 비교 결과를 만족하도록 **학생들을 앞에서부터 줄을 세운 순서** 출력 |

---

## 2. 접근 아이디어: 위상 정렬 (Topological Sort)

- 학생 $A$가 $B$보다 앞에 서야 한다는 정보는 유향 간선 $A \to B$로 표현됩니다.
- 사이클이 없는 방향 그래프(DAG)에서 모든 간선의 선후 관계를 만족하는 일렬 배치를 찾는 전형적인 **위상 정렬** 문제입니다.
- 진입차수(in-degree)가 0인 학생들을 큐에 넣고 하나씩 꺼내며 연결된 간선을 제거하는 방식으로 해결합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());

        List<Integer>[] adj = new ArrayList[n + 1];
        for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();
        int[] inDegree = new int[n + 1];

        for (int i = 0; i < m; i++) {
            st = new StringTokenizer(br.readLine());
            int u = Integer.parseInt(st.nextToken());
            int v = Integer.parseInt(st.nextToken());
            adj[u].add(v);
            inDegree[v]++;
        }

        Queue<Integer> q = new LinkedList<>();
        for (int i = 1; i <= n; i++) {
            if (inDegree[i] == 0) q.add(i);
        }

        StringBuilder sb = new StringBuilder();
        while (!q.isEmpty()) {
            int cur = q.poll();
            sb.append(cur).append(" ");

            for (int next : adj[cur]) {
                inDegree[next]--;
                if (inDegree[next] == 0) {
                    q.add(next);
                }
            }
        }

        System.out.println(sb.toString().trim());
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(V + E)$ — $N = 32,000, M = 100,000$에서 0.2초 이내 완료.
- **공간 복잡도**: $O(V + E)$ — 인접 리스트 및 진입차수 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2252-line-up/result.png)
