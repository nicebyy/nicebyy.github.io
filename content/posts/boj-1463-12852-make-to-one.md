---
title: "[BOJ 1463 & 12852] 1로 만들기 1, 2 - Java (동적 계획법 & 경로 역추적)"
date: "2021-09-14"
category: "PS/BOJ"
tags: ["BOJ","DP","동적계획법","역추적","Java"]
summary: "정수 N을 3으로 나누기, 2로 나누기, 1 빼기 3가지 연산으로 1을 만드는 최소 연산 횟수 DP와 이전 숫자를 역추적하여 실제 연산 경로를 출력하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 1로 만들기 (백준 1463번 & 12852번) |
| **플랫폼 / 난이도** | 백준 (실버 3, 1463번 & 골드 4, 12852번) |
| **문제 링크** | [백준 12852번](https://www.acmicpc.net/problem/12852) |
| **제한 사항** | 시간 제한 0.5초, 메모리 제한 512MB |
| **입력 조건** | 정수 $N \le 1,000,000$ |
| **핵심 규칙** | 1) 3으로 나누기, 2) 2로 나누기, 3) 1 빼기 세 연산으로 1을 만드는 **최소 연산 횟수 및 실제 경로** 출력 |

---

## 2. 접근 아이디어: 동적 계획법 & 이전 노드(`prev[]`) 역추적

- $dp[i]$: 숫자 $i$를 1로 만드는 최소 연산 횟수.
- $prev[i]$: $i$에서 최소 연산을 적용하여 전이된 다음 숫자.
- 1부터 $N$까지 바텀업으로 최솟값을 채운 뒤, $N$부터 $prev$ 포인터를 따라가며 1까지의 경로를 출력합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] dp = new int[n + 1];
        int[] prev = new int[n + 1];

        for (int i = 2; i <= n; i++) {
            // 1. 1을 빼는 경우
            dp[i] = dp[i - 1] + 1;
            prev[i] = i - 1;

            // 2. 2로 나누어 떨어지는 경우
            if (i % 2 == 0 && dp[i] > dp[i / 2] + 1) {
                dp[i] = dp[i / 2] + 1;
                prev[i] = i / 2;
            }

            // 3. 3으로 나누어 떨어지는 경우
            if (i % 3 == 0 && dp[i] > dp[i / 3] + 1) {
                dp[i] = dp[i / 3] + 1;
                prev[i] = i / 3;
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append(dp[n]).append("\n");

        int curr = n;
        while (curr > 0) {
            sb.append(curr).append(" ");
            curr = prev[curr];
        }

        System.out.println(sb.toString().trim());
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — $N = 1,000,000$일 때 0.15초 이내 완료.
- **공간 복잡도**: $O(N)$ — 크기 $N+1$ 배열 2개.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1463-12852-make-to-one/result.png)
