---
title: "[BOJ 11054] 가장 긴 바이토닉 부분 수열 - Java (LIS + LDS 동적 계획법)"
date: "2021-10-13"
category: "PS/BOJ"
tags: ["BOJ","DP","LIS","LDS","바이토닉","Java"]
summary: "왼쪽에서 오른쪽으로의 최장 증가 부분 수열(LIS)과 오른쪽에서 왼쪽으로의 최장 감소 부분 수열(LDS)의 길이를 각각 DP로 구해 합의 최댓값을 계산하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 가장 긴 바이토닉 부분 수열 (백준 11054번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 11054번) |
| **문제 링크** | [백준 11054번](https://www.acmicpc.net/problem/11054) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 수열의 크기 $N \le 1,000$, 각 원소 $A_i \le 1,000$ |
| **핵심 규칙** | 어떤 기준점 $k$까지는 엄격히 증가하고 이후로는 엄격히 감소하는 **가장 긴 바이토닉 부분 수열의 최대 길이** 구하기 |

---

## 2. 접근 아이디어: LIS + LDS 동적 계획법

### 바이토닉 수열의 구조
- 기준 원소 $A[k]$를 기준으로, 왼쪽은 $A[k]$로 끝나는 최장 증가 부분 수열(LIS), 오른쪽은 $A[k]$로 시작하는 최장 감소 부분 수열(LDS)이 합쳐진 형태입니다.
- 1. 정방향 LIS 계산: `lis[i]` = $i$번째 원소를 마지막으로 하는 LIS 길이.
- 2. 역방향 LDS 계산: `lds[i]` = $i$번째 원소부터 시작하는 LDS 길이 (오른쪽에서 왼쪽으로 LIS 계산).
- 3. 모든 기준점 $i$에 대해 $A[i]$가 두 번 중복 포함되므로:
  $$\text{MaxLength} = \max_{i} (lis[i] + lds[i] - 1)$$

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

        int[] lis = new int[n];
        int[] lds = new int[n];

        // 1. 왼쪽 -> 오른쪽 LIS 계산
        for (int i = 0; i < n; i++) {
            lis[i] = 1;
            for (int j = 0; j < i; j++) {
                if (a[j] < a[i]) {
                    lis[i] = Math.max(lis[i], lis[j] + 1);
                }
            }
        }

        // 2. 오른쪽 -> 왼쪽 LDS 계산
        for (int i = n - 1; i >= 0; i--) {
            lds[i] = 1;
            for (int j = n - 1; j > i; j--) {
                if (a[j] < a[i]) {
                    lds[i] = Math.max(lds[i], lds[j] + 1);
                }
            }
        }

        // 3. 최댓값 탐색
        int maxLen = 0;
        for (int i = 0; i < n; i++) {
            maxLen = Math.max(maxLen, lis[i] + lds[i] - 1);
        }

        System.out.println(maxLen);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N^2)$ — LIS 및 LDS $O(N^2)$ 계산. $N = 1,000$일 때 약 $10^6$ 연산으로 0.1초 이내 완료.
- **공간 복잡도**: $O(N)$ — 배열 3개 사용.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-11054-longest-bitonic-subsequence/result.png)
