---
title: "[BOJ 11722] 가장 긴 감소하는 부분 수열 - Java (LDS 동적 계획법)"
date: "2021-09-23"
category: "PS/BOJ"
tags: ["BOJ","DP","LDS","동적계획법","Java"]
summary: "수열의 각 위치 i에 대해 자신보다 앞선 j 중 값이 더 큰 원소의 DP 값을 참조하여 가장 긴 감소하는 부분 수열(LDS)의 최대 길이를 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 가장 긴 감소하는 부분 수열 (백준 11722번 / 실버 2) |
| **플랫폼 / 난이도** | 백준 (실버 2, 11722번) |
| **문제 링크** | [백준 11722번](https://www.acmicpc.net/problem/11722) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 수열의 크기 $N \le 1,000$, 각 원소 $A_i \le 1,000$ |
| **핵심 규칙** | 수열에서 **가장 긴 감소하는 부분 수열(LDS)**의 길이 구하기 |

---

## 2. 접근 아이디어: 동적 계획법 (LDS DP)

- $dp[i]$: $A[i]$를 마지막 원소로 하는 가장 긴 감소하는 부분 수열의 길이.
- $0 \le j < i$에 대해 $A[j] > A[i]$인 경우:
  $$dp[i] = \max(dp[i], dp[j] + 1)$$
- 전체 $dp$ 배열의 최댓값을 출력합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] a = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            a[i] = Integer.parseInt(st.nextToken());
        }

        int[] dp = new int[n];
        int maxLen = 0;

        for (int i = 0; i < n; i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++) {
                if (a[j] > a[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLen = Math.max(maxLen, dp[i]);
        }

        System.out.println(maxLen);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N^2)$ — $N = 1,000$으로 0.1초 이내 완료.
- **공간 복잡도**: $O(N)$ — 배열 2개.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-11722-longest-decreasing-subsequence/result.png)
