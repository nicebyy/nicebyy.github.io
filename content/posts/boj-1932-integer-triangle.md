---
title: "[BOJ 1932] 정수 삼각형 - Java (동적 계획법 바텀업 DP)"
date: "2021-09-17"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","삼각형","Java"]
summary: "삼각형 꼭대기부터 아래로 내려가며 인접한 대각선 왼쪽/오른쪽 중 더 큰 값을 누적하여 바닥에서 최대 합 경로를 구하는 DP 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 정수 삼각형 (백준 1932번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 1932번) |
| **문제 링크** | [백준 1932번](https://www.acmicpc.net/problem/1932) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 삼각형 크기 $n \le 500$, 정수 $0 \le X \le 9,999$ |
| **핵심 규칙** | 꼭대기에서 바닥까지 대각선 왼쪽/오른쪽으로 내려오며 거쳐간 **숫자들의 최대 합** 계산 |

---

## 2. 접근 아이디어: 동적 계획법 (바텀업 DP)

- $dp[i][j]$: $(i, j)$ 위치에 도달했을 때의 최대 누적 합.
- $(i, j)$ 칸은 바로 윗 행의 대각선 왼쪽($(i-1, j-1)$) 또는 바로 위쪽($(i-1, j)$)에서만 내려올 수 있습니다:
  $$dp[i][j] = \max(dp[i-1][j-1], dp[i-1][j]) + val[i][j]$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[][] triangle = new int[n][n];
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int j = 0; j <= i; j++) {
                triangle[i][j] = Integer.parseInt(st.nextToken());
            }
        }

        for (int i = 1; i < n; i++) {
            for (int j = 0; j <= i; j++) {
                if (j == 0) {
                    triangle[i][j] += triangle[i - 1][j];
                } else if (j == i) {
                    triangle[i][j] += triangle[i - 1][j - 1];
                } else {
                    triangle[i][j] += Math.max(triangle[i - 1][j - 1], triangle[i - 1][j]);
                }
            }
        }

        int maxVal = 0;
        for (int j = 0; j < n; j++) {
            maxVal = Math.max(maxVal, triangle[n - 1][j]);
        }

        System.out.println(maxVal);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(n^2)$ — 삼각형 전체 원소 수는 약 $1.25 \times 10^5$개로 0.1초 이내 완료.
- **공간 복잡도**: $O(n^2)$ — 원본 배열 내 직접 누적 갱신.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1932-integer-triangle/result.png)
