---
title: "[BOJ 9252] LCS 2 - Java (최장 공통 부분 수열 & DP 테이블 역추적)"
date: "2021-09-29"
category: "PS/BOJ"
tags: ["BOJ","DP","LCS","문자열","역추적","Java"]
summary: "2차원 DP 테이블로 두 문자열의 최장 공통 부분 수열(LCS) 길이를 구한 뒤, (len1, len2)에서 역방향으로 대각선 전이를 추적하여 실제 LCS 문자열을 복원하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | LCS 2 (백준 9252번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 9252번) |
| **문제 링크** | [백준 9252번](https://www.acmicpc.net/problem/9252) |
| **제한 사항** | 시간 제한 0.4초, 메모리 제한 256MB |
| **입력 조건** | 두 문자열 (최대 1,000글자) |
| **핵심 규칙** | 두 문자열의 최장 공통 부분 수열(LCS)의 **길이와 실제 문자열**을 모두 출력 |

---

## 2. 접근 아이디어: 2차원 DP & 역추적(Backtracking)

### LCS 2차원 점화식
- $s_1[i-1] == s_2[j-1]$이면: $dp[i][j] = dp[i-1][j-1] + 1$
- 다르면: $dp[i][j] = \max(dp[i-1][j], dp[i][j-1])$

### 실제 문자열 역추적
- $(len_1, len_2)$ 위치부터 시작하여:
  - $s_1[i-1] == s_2[j-1]$이면: 공통 문자를 스택에 넣고 $(i-1, j-1)$로 대각선 이동.
  - 다르면: $dp[i-1][j]$와 $dp[i][j-1]$ 중 더 큰 값을 가진 쪽으로 이동.
- 스택에서 꺼내며 문자열을 복원합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s1 = br.readLine();
        String s2 = br.readLine();

        int n = s1.length();
        int m = s2.length();

        int[][] dp = new int[n + 1][m + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        int lcsLen = dp[n][m];
        System.out.println(lcsLen);

        if (lcsLen == 0) return;

        // 역추적으로 실제 문자열 복원
        StringBuilder sb = new StringBuilder();
        int i = n, j = m;
        while (i > 0 && j > 0) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                sb.append(s1.charAt(i - 1));
                i--;
                j--;
            } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }

        System.out.println(sb.reverse().toString());
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times M)$ — $1,000 \times 1,000 = 10^6$ 연산으로 0.1초 이내 완료.
- **공간 복잡도**: $O(N \times M)$ — $1001 \times 1001$ 정수 DP 테이블.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-9252-lcs-2/result.png)
