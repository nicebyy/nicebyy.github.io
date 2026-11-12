---
title: "[프로그래머스] 피로도 - Java (완전 탐색 & 순열 백트래킹)"
date: "2021-10-25"
category: "PS/Programmers"
tags: ["Programmers","완전탐색","백트래킹","순열","Java"]
summary: "던전 수가 최대 8개이므로 가능한 모든 방문 순서(8! = 40,320가지)를 백트래킹으로 탐색하여 유저가 탐험할 수 있는 최대 던전 수를 계산하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 피로도 (Level 2 / 위클리 챌린지 12주차) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) / 위클리 챌린지 12주차 |
| **문제 링크** | [프로그래머스 피로도 (Level 2 / 위클리 챌린지 12주차)](https://school.programmers.co.kr/learn/courses/30/lessons/87946) |
| **입력 조건** | 초기 피로도 $k \le 5,000$, 던전 수 $N \le 8$, `[최소 필요 피로도, 소모 피로도]` |
| **핵심 규칙** | 유저가 탐험할 수 있는 **최대 던전 수** 계산 |

---

## 2. 접근 아이디어: 완전 탐색(Brute Force) & 순열 백트래킹

- 던전의 개수 $N$이 최대 **8개**로 매우 작습니다.
- 가능한 모든 던전 방문 순서의 경우의 수는 최대 $8! = 40,320$가지에 불과합니다.
- 따라서 **백트래킹(DFS)**을 이용하여 모든 순열을 탐색하며, 현재 피로도로 방문 가능한 던전 수의 최댓값을 갱신합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private int maxCount = 0;
    private boolean[] visited;

    public int solution(int k, int[][] dungeons) {
        visited = new boolean[dungeons.length];
        dfs(k, dungeons, 0);
        return maxCount;
    }

    private void dfs(int currentK, int[][] dungeons, int count) {
        maxCount = Math.max(maxCount, count);

        for (int i = 0; i < dungeons.length; i++) {
            if (!visited[i] && currentK >= dungeons[i][0]) {
                visited[i] = true;
                dfs(currentK - dungeons[i][1], dungeons, count + 1);
                visited[i] = false; // 백트래킹 원복
            }
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N!)$ — $N = 8$일 때 약 4만 회 재귀 호출로 0.02초 이내에 즉시 완료.
- **공간 복잡도**: $O(N)$ — 방문 배열 및 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-87946-fatigue/result.png)
