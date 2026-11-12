---
title: "[프로그래머스] 등굣길 - Java (동적 계획법 DP)"
date: "2021-11-27"
category: "PS/Programmers"
tags: ["Programmers","동적계획법","DP","최단경로","Java"]
summary: "물에 잠긴 지역을 피해 집에서 학교까지 최단 경로의 개수를 구하는 2차원 격자 DP 풀이 (1,000,000,007 모듈러 연산)"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 등굣길 (Level 3) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 3) |
| **문제 링크** | [프로그래머스 등굣길 (Level 3)](https://school.programmers.co.kr/learn/courses/30/lessons/42898) |
| **입력 조건** | 격자 크기 $m$ (가로/열), $n$ (세로/행) ($1 \le m, n \le 100$), 물에 잠긴 웅덩이 좌표 배열 `puddles` |
| **핵심 규칙** | 집(1, 1)에서 학교(m, n)까지 최단 경로의 수를 $1,000,000,007$로 나눈 나머지 구하기 |

---

## 2. 접근 아이디어 및 주의점

### 동적 계획법 (DP) 점화식
- 오른쪽과 아래쪽으로만 이동할 수 있으므로, 격자의 각 칸 $(r, c)$에 도달하는 최단 경로 수는 위쪽 칸과 왼쪽 칸의 경로 수의 합입니다.
  $$dp[r][c] = (dp[r - 1][c] + dp[r][c - 1]) \pmod{1,000,000,007}$$
- 웅덩이가 있는 칸은 $dp[r][c] = 0$으로 고정하여 경로 전파를 차단합니다.

### ⚠️ 좌표 표기 함정 주의
- 문제에서 $m$은 **가로(열, x)**, $n$은 **세로(행, y)**입니다.
- `puddles` 배열의 각 원소 역시 `[x, y]` 즉 `[열, 행]` 순서로 주어지므로, 2차원 배열 인덱싱 시 `puddle[1]`(행)과 `puddle[0]`(열)을 정확히 매핑해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private static final int MOD = 1_000_000_007;

    public int solution(int m, int n, int[][] puddles) {
        // dp[r][c] : 1행 1열부터 시작하기 위해 (n+1) x (m+1) 선언
        int[][] dp = new int[n + 1][m + 1];

        // 웅덩이 위치를 -1로 마킹 (주의: puddle[0]=열, puddle[1]=행)
        for (int[] p : puddles) {
            dp[p[1]][p[0]] = -1;
        }

        // 시작점 경로 수 초기화
        dp[1][1] = 1;

        for (int r = 1; r <= n; r++) {
            for (int c = 1; c <= m; c++) {
                // 시작점이거나 웅덩이인 경우 건너뜀
                if (dp[r][c] == -1) {
                    dp[r][c] = 0;
                    continue;
                }
                if (r == 1 && c == 1) continue;

                // 위쪽 칸과 왼쪽 칸의 경로 수 합산
                dp[r][c] = (dp[r - 1][c] + dp[r][c - 1]) % MOD;
            }
        }

        return dp[n][m];
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(n \times m)$ — 최대 $100 \times 100 = 10,000$칸을 1회 순회하므로 0.05초 이내 즉시 완료.
- **공간 복잡도**: $O(n \times m)$ — $101 \times 101$ 정수 DP 테이블 사용.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-42898-way-to-school/result.png)
