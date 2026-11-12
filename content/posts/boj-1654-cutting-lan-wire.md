---
title: "[BOJ 1654] 랜선 자르기 - Java (매개 변수 탐색 Parametric Search & 이분 탐색)"
date: "2021-09-06"
category: "PS/BOJ"
tags: ["BOJ","이분탐색","매개변수탐색","Java"]
summary: "길이 L로 랜선을 잘랐을 때 N개 이상을 만들 수 있는가?라는 결정 문제로 변환하여, L의 최댓값을 1부터 2^31-1까지 long 범위 이분 탐색으로 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 랜선 자르기 (백준 1654번 / 실버 2) |
| **플랫폼 / 난이도** | 백준 (실버 2, 1654번) |
| **문제 링크** | [백준 1654번](https://www.acmicpc.net/problem/1654) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 가지고 있는 랜선 수 $K \le 10,000$, 필요한 랜선 수 $N \le 1,000,000$, 랜선 길이 $\le 2^{31}-1$ |
| **핵심 규칙** | 랜선을 모두 같은 길이로 잘라 $N$개 이상을 만들 때, **랜선의 최대 길이** 구하기 |

---

## 2. 접근 아이디어: 매개 변수 탐색 (Parametric Search)

### 결정 문제로의 변환
- "랜선의 길이를 $L$로 잘랐을 때, 총 만들어지는 랜선의 개수가 $N$개 이상인가?" $\to$ `true/false` 단조성 만족.
- 랜선 길이가 최대 $2^{31}-1$이므로 탐색 범위는 `low = 1`, `high = maxLen`이며, `mid` 계산 시 오버플로우 방지를 위해 **반드시 `long` 자료형**을 사용해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int k = Integer.parseInt(st.nextToken());
        int n = Integer.parseInt(st.nextToken());

        long[] lines = new long[k];
        long maxLen = 0;

        for (int i = 0; i < k; i++) {
            lines[i] = Long.parseLong(br.readLine());
            maxLen = Math.max(maxLen, lines[i]);
        }

        long left = 1;
        long right = maxLen;
        long answer = 0;

        while (left <= right) {
            long mid = (left + right) / 2;
            long count = 0;

            for (long line : lines) {
                count += (line / mid);
            }

            if (count >= n) {
                answer = mid; // N개 이상 생성 가능 -> 길이 늘리기
                left = mid + 1;
            } else {
                right = mid - 1; // 길이 줄이기
            }
        }

        System.out.println(answer);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(K \log(\max L))$ — 최대 $10,000 \times 31 \approx 3 \times 10^5$ 연산으로 0.1초 이내 완료.
- **공간 복잡도**: $O(K)$ — 랜선 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1654-cutting-lan-wire/result.png)
