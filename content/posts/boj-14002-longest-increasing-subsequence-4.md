---
title: "[BOJ 14002] 가장 긴 증가하는 부분 수열 4 - Java (LIS DP & 역추적)"
date: "2021-09-27"
category: "PS/BOJ"
tags: ["BOJ","DP","LIS","역추적","Java"]
summary: "O(N^2) 동적 계획법으로 최장 증가 부분 수열의 길이와 각 원소의 이전 인덱스(prev)를 기록한 뒤, 역추적 스택을 통해 실제 LIS 원소들을 출력하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 가장 긴 증가하는 부분 수열 4 (백준 14002번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 14002번) |
| **문제 링크** | [백준 14002번](https://www.acmicpc.net/problem/14002) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 수열의 크기 $N \le 1,000$, 원소 $A_i \le 1,000$ |
| **핵심 규칙** | 가장 긴 증가하는 부분 수열(LIS)의 **길이와 실제 부분 수열**을 공백으로 구분하여 출력 |

---

## 2. 접근 아이디어: $O(N^2)$ LIS DP & 이전 인덱스(`prev[]`) 역추적

- $dp[i]$: $A[i]$를 마지막 원소로 하는 LIS의 길이.
- $prev[i]$: $A[i]$ 바로 앞에 연결된 원소의 인덱스.
- 최대 길이를 갖는 인덱스에서 시작하여 $prev$ 포인터를 타고 역방향으로 이동하며 스택에 담은 뒤 출력합니다.

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
        int[] prev = new int[n];
        int maxLen = 0;
        int maxIdx = 0;

        for (int i = 0; i < n; i++) {
            dp[i] = 1;
            prev[i] = -1;

            for (int j = 0; j < i; j++) {
                if (a[j] < a[i] && dp[i] < dp[j] + 1) {
                    dp[i] = dp[j] + 1;
                    prev[i] = j;
                }
            }

            if (dp[i] > maxLen) {
                maxLen = dp[i];
                maxIdx = i;
            }
        }

        System.out.println(maxLen);

        // 스택을 이용한 역추적
        Stack<Integer> stack = new Stack<>();
        int curr = maxIdx;
        while (curr != -1) {
            stack.push(a[curr]);
            curr = prev[curr];
        }

        StringBuilder sb = new StringBuilder();
        while (!stack.isEmpty()) {
            sb.append(stack.pop()).append(" ");
        }
        System.out.println(sb.toString().trim());
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N^2)$ — $N = 1,000$으로 약 $10^6$ 연산, 0.1초 이내 완료.
- **공간 복잡도**: $O(N)$ — 배열 및 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-14002-longest-increasing-subsequence-4/result.png)
