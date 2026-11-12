---
title: "[BOJ 3273] 두 수의 합 - Java (정렬 & 양 끝 투 포인터 Two Pointers)"
date: "2021-09-08"
category: "PS/BOJ"
tags: ["BOJ","투포인터","정렬","Java"]
summary: "서로 다른 n개의 정수를 오름차순 정렬한 뒤, 양 끝단에 포인터(left, right)를 두고 합을 x와 비교하여 범위를 좁히며 O(N log N)으로 쌍의 수를 찾는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 두 수의 합 (백준 3273번 / 실버 3) |
| **플랫폼 / 난이도** | 백준 (실버 3, 3273번) |
| **문제 링크** | [백준 3273번](https://www.acmicpc.net/problem/3273) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 수열 크기 $n \le 100,000$, 각 자연수 $\le 1,000,000$, 목표 합 $x \le 2,000,000$ |
| **핵심 규칙** | $a_i + a_j = x$ ($1 \le i < j \le n$)을 만족하는 **쌍의 개수** 구하기 |

---

## 2. 접근 아이디어: 정렬 & 양 끝 투 포인터

1. 수열을 **오름차순 정렬**합니다.
2. `left = 0`, `right = n - 1`로 설정합니다:
   - $arr[left] + arr[right] == x$: 쌍 발견! `count++`, `left++`, `right--`
   - $arr[left] + arr[right] < x$: 합이 작으므로 `left++`
   - $arr[left] + arr[right] > x$: 합이 크므로 `right--`

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] arr = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            arr[i] = Integer.parseInt(st.nextToken());
        }

        int x = Integer.parseInt(br.readLine());

        Arrays.sort(arr);

        int left = 0, right = n - 1;
        int count = 0;

        while (left < right) {
            int sum = arr[left] + arr[right];
            if (sum == x) {
                count++;
                left++;
                right--;
            } else if (sum < x) {
                left++;
            } else {
                right--;
            }
        }

        System.out.println(count);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 정렬 후 $O(N)$ 투 포인터. 0.2초 이내 완료.
- **공간 복잡도**: $O(N)$ — 배열 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-3273-sum-of-two-numbers/result.png)
