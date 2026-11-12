---
title: "[BOJ 5014] 스타트링크 - Java (1차원 너비 우선 탐색 BFS)"
date: "2021-06-28"
category: "PS/BOJ"
tags: ["BOJ","BFS","그래프","최단거리","Java"]
summary: "총 F층 건물에서 S층에서 G층으로 U층 위 또는 D층 아래로만 이동할 수 있는 엘리베이터를 탈 때 누르는 최소 버튼 수를 1차원 BFS로 탐색하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 스타트링크 (백준 5014번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 5014번) |
| **문제 링크** | [백준 5014번](https://www.acmicpc.net/problem/5014) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 최고 층수 $F$, 현재 층 $S$, 목표 층 $G$, 위로 $U$층, 아래로 $D$층 |
| **핵심 규칙** | $S$층에서 $G$층으로 가기 위해 눌러야 하는 버튼의 최소 횟수 구하기 (도달 불가 시 "use the stairs") |

---

## 2. 접근 아이디어: 1차원 BFS 최단 거리 탐색

### 엘리베이터 이동 모델링
- 1층부터 $F$층까지를 정점으로 하는 1차원 그래프에서의 최단 경로(BFS) 문제입니다.
- 각 층에서 이동 가능한 간선은 단 2가지입니다:
  - 위로 이동: `cur + U` (단, `cur + U <= F`)
  - 아래로 이동: `cur - D` (단, `cur - D >= 1`)
- `dist[]` 배열을 -1로 초기화하여 방문 여부와 최소 클릭 횟수를 동시에 관리합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int f = Integer.parseInt(st.nextToken());
        int s = Integer.parseInt(st.nextToken());
        int g = Integer.parseInt(st.nextToken());
        int u = Integer.parseInt(st.nextToken());
        int d = Integer.parseInt(st.nextToken());

        int[] dist = new int[f + 1];
        Arrays.fill(dist, -1);

        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(s);
        dist[s] = 0;

        while (!queue.isEmpty()) {
            int cur = queue.poll();

            if (cur == g) {
                System.out.println(dist[cur]);
                return;
            }

            // 위로 이동
            if (u > 0 && cur + u <= f && dist[cur + u] == -1) {
                dist[cur + u] = dist[cur] + 1;
                queue.offer(cur + u);
            }

            // 아래로 이동
            if (d > 0 && cur - d >= 1 && dist[cur - d] == -1) {
                dist[cur - d] = dist[cur] + 1;
                queue.offer(cur - d);
            }
        }

        System.out.println("use the stairs");
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(F)$ — 최대 $1,000,000$개의 층을 한 번씩만 방문하므로 약 0.2초 내에 해결됩니다.
- **공간 복잡도**: $O(F)$ — 크기 $F+1$의 거리 배열과 큐 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-5014-startlink/result.png)
