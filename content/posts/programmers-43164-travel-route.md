---
title: "[프로그래머스] 여행경로 - Java (DFS 백트래킹 & 알파벳 사전순 경로)"
date: "2021-11-03"
category: "PS/Programmers"
tags: ["Programmers","DFS","백트래킹","정렬","Java"]
summary: "주어진 모든 항공권을 남김없이 사용하여 'ICN'에서 출발하는 여행 경로 중 알파벳 순서가 가장 앞서는 완주 경로를 DFS로 탐색하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 여행경로 (Level 3) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 3) |
| **문제 링크** | [프로그래머스 여행경로 (Level 3)](https://school.programmers.co.kr/learn/courses/30/lessons/43164) |
| **입력 조건** | 항공권 수 $\le 10,000$, 모든 티켓은 `[출발지, 도착지]` 형태 |
| **핵심 규칙** | 항상 `"ICN"`에서 출발하여 모든 티켓을 사용해야 하며, 가능한 경로가 여러 개라면 **알파벳 사전순이 가장 앞서는 경로** 출력 |

---

## 2. 접근 아이디어: DFS 백트래킹 & 사전순 조기 종료

### 사전순 우선순위 확보
- 가능한 완주 경로 중 알파벳 순서가 가장 앞서는 것을 골라야 합니다.
- 항공권 목록을 먼저 **도착지 알파벳 오름차순**으로 정렬해 두면, DFS를 돌릴 때 가장 먼저 완성된 유효 경로가 자동으로 사전순 최우선 경로가 됩니다!

### 오일러 경로(Eulerian Path) 탐색
- 모든 티켓(간선)을 정확히 1번씩 사용하는 백트래킹 탐색을 수행합니다.
- 항공권을 모두 사용한 첫 번째 완주 경로를 찾으면 플래그(`found`)를 켜고 나머지 모든 재귀 호출을 즉시 리턴하여 시간을 절약합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private boolean[] visited;
    private List<String> answer = new ArrayList<>();
    private boolean found = false;

    public String[] solution(String[][] tickets) {
        // 도착지 기준 사전순 정렬
        Arrays.sort(tickets, (a, b) -> {
            if (a[0].equals(b[0])) return a[1].compareTo(b[1]);
            return a[0].compareTo(b[0]);
        });

        visited = new boolean[tickets.length];
        List<String> path = new ArrayList<>();
        path.add("ICN");

        dfs(tickets, "ICN", 0, path);

        return answer.toArray(new String[0]);
    }

    private void dfs(String[][] tickets, String current, int count, List<String> path) {
        if (found) return;

        // 모든 티켓을 사용 완료한 경우
        if (count == tickets.length) {
            answer = new ArrayList<>(path);
            found = true;
            return;
        }

        for (int i = 0; i < tickets.length; i++) {
            if (!visited[i] && tickets[i][0].equals(current)) {
                visited[i] = true;
                path.add(tickets[i][1]);

                dfs(tickets, tickets[i][1], count + 1, path);

                visited[i] = false;
                path.remove(path.size() - 1);
            }
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N + N!)$ — 항공권 정렬 후 사전순 최우선 경로를 탐색하므로 대다수의 테스트 케이스에서 첫 탐색 경로가 완주되어 $O(N)$에 즉시 종료.
- **공간 복잡도**: $O(N)$ — 방문 배열 및 경로 리스트.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-43164-travel-route/result.png)
