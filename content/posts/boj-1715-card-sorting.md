---
title: "[BOJ 1715] 카드 정렬하기 - Java (최소 힙 PriorityQueue / 허프만 코딩)"
date: "2021-10-26"
category: "PS/BOJ"
tags: ["BOJ","그리디","우선순위 큐","힙","Java"]
summary: "항상 가장 작은 두 카드 묶음을 꺼내 합치고 다시 힙에 넣는 과정을 반복하여 누적 비교 횟수를 최소화하는 허프만 트리 구조의 그리디 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 카드 정렬하기 (백준 1715번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 1715번) |
| **문제 링크** | [백준 1715번](https://www.acmicpc.net/problem/1715) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 카드 묶음 수 $N \le 100,000$, 각 묶음 크기 $\le 1,000$ |
| **핵심 규칙** | 두 카드 묶음 $A, B$를 합칠 때 $A + B$번의 비교가 필요할 때, 최소 총 비교 횟수 계산 |

---

## 2. 접근 아이디어: 최소 힙(PriorityQueue) & 허프만 트리

### 항상 가장 작은 두 묶음 먼저 합치기
- 먼저 합쳐진 카드 묶음은 이후 다른 묶음과 합쳐질 때마다 누적해서 다시 비교됩니다.
- 따라서 **현재 존재하는 카드 묶음 중 가장 작은 2개를 골라 합치는 것**이 전체 누적 합을 최소화하는 최적 부분 구조를 이룹니다 (허프만 코딩과 동일 원리).
- **최소 힙(`PriorityQueue`)**을 사용하여 매번 가장 작은 2개를 꺼내 합친 뒤, 합친 묶음을 다시 힙에 넣습니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int i = 0; i < n; i++) {
            pq.add(Integer.parseInt(br.readLine()));
        }

        int totalComparisons = 0;

        while (pq.size() > 1) {
            int first = pq.poll();
            int second = pq.poll();
            int combined = first + second;

            totalComparisons += combined;
            pq.add(combined);
        }

        System.out.println(totalComparisons);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 총 $N-1$번 2개 poll 및 1개 add 수행. $N = 100,000$일 때 0.3초 이내에 매우 안정적으로 완료.
- **공간 복잡도**: $O(N)$ — 우선순위 큐 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1715-card-sorting/result.png)
