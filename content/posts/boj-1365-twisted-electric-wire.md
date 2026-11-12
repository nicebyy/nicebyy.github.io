---
title: "[BOJ 1365] 꼬인 전깃줄 - Java (LIS 이분 탐색 Binary Search O(N log N))"
date: "2021-09-24"
category: "PS/BOJ"
tags: ["BOJ","LIS","이분탐색","그리디","Java"]
summary: "전깃줄이 서로 꼬이지 않으려면 연결 번호가 증가 수열을 이루어야 하므로, O(N log N) 이분 탐색(lower bound) LIS를 구해 N - LIS_len을 잘라내는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 꼬인 전깃줄 (백준 1365번 / 골드 2) |
| **플랫폼 / 난이도** | 백준 (골드 2, 1365번) |
| **문제 링크** | [백준 1365번](https://www.acmicpc.net/problem/1365) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 전봇대 개수 $N \le 100,000$, 연결되는 전봇대 번호 순열 |
| **핵심 규칙** | 전깃줄이 교차하지 않게 만들기 위해 **잘라내야 하는 전깃줄의 최소 개수** 계산 |

---

## 2. 접근 아이디어: $O(N \log N)$ LIS (이분 탐색)

### 전깃줄 교차 방지와 LIS
- 전깃줄이 꼬이지 않으려면 연결되는 전봇대 번호들이 **단조 증가 수열(LIS)**을 이루어야 합니다.
- 따라서 **자를 전깃줄의 최소 개수 = 전체 전깃줄 수($N$) - 최장 증가 부분 수열의 길이(LIS)**.
- $N \le 100,000$이므로 $O(N^2)$ DP로는 시간 초과가 나며, 반드시 **이분 탐색(Lower Bound)을 활용한 $O(N \log N)$ LIS 알고리즘**을 사용해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] lis = new int[n];
        int len = 0;

        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            int val = Integer.parseInt(st.nextToken());

            int idx = Arrays.binarySearch(lis, 0, len, val);
            if (idx < 0) idx = -(idx + 1);

            lis[idx] = val;
            if (idx == len) len++;
        }

        System.out.println(n - len);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 각 원소당 이분 탐색 $O(\log N)$. $N = 100,000$일 때 0.25초 이내에 완료.
- **공간 복잡도**: $O(N)$ — LIS 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1365-twisted-electric-wire/result.png)
