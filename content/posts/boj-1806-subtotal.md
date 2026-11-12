---
title: "[BOJ 1806] 부분합 - Java (투 포인터 Two Pointers & 연속 부분합)"
date: "2021-09-08"
category: "PS/BOJ"
tags: ["BOJ","투포인터","누적합","부분합","Java"]
summary: "연속된 수열의 부분합이 S 이상이 되는 가장 짧은 부분합 구간 길이를 두 포인터(left, right)의 선형 전진을 통해 O(N)으로 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 부분합 (백준 1806번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 1806번) |
| **문제 링크** | [백준 1806번](https://www.acmicpc.net/problem/1806) |
| **제한 사항** | 시간 제한 0.5초, 메모리 제한 128MB |
| **입력 조건** | 수열 크기 $N \le 100,000$, 목표 부분합 $S \le 100,000,000$ |
| **핵심 규칙** | 연속된 수들의 부분합 중 그 합이 $S$ 이상이 되는 것 중, **가장 짧은 것의 길이** 구하기 (불가능 시 0) |

---

## 2. 접근 아이디어: 투 포인터 (Two Pointers)

### $O(N)$ 선형 탐색
- 두 개의 포인터 `left`, `right`를 $0$에서 시작합니다:
  - 현재 부분합 `sum >= S`이면: 현재 구간 길이($right - left$)로 최솟값을 갱신하고, 구간을 줄이기 위해 `sum -= arr[left++]` 수행.
  - 현재 부분합 `sum < S`이면: 구간을 늘리기 위해 `sum += arr[right++]` 수행.
- `left`와 `right`가 각각 최대 $N$번만 전진하므로 $O(N)$에 해결됩니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int n = Integer.parseInt(st.nextToken());
        int s = Integer.parseInt(st.nextToken());

        int[] arr = new int[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            arr[i] = Integer.parseInt(st.nextToken());
        }

        int left = 0, right = 0;
        int sum = 0;
        int minLen = Integer.MAX_VALUE;

        while (true) {
            if (sum >= s) {
                minLen = Math.min(minLen, right - left);
                sum -= arr[left++];
            } else if (right == n) {
                break;
            } else {
                sum += arr[right++];
            }
        }

        System.out.println(minLen == Integer.MAX_VALUE ? 0 : minLen);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 0.15초 이내 즉시 완료.
- **공간 복잡도**: $O(N)$ — 크기 $N$ 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1806-subtotal/result.png)
