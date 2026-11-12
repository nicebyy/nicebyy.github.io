---
title: "[프로그래머스] 더 맵게 - Java (우선순위 큐 PriorityQueue / 힙 Heap)"
date: "2022-01-12"
category: "PS/Programmers"
tags: ["Programmers","우선순위 큐","PriorityQueue","힙","Java"]
summary: "최소 힙(PriorityQueue)을 이용하여 가장 작은 두 스코빌 지수를 반복 혼합하며 목표 지수를 달성하는 그리디/힙 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 더 맵게 (Level 2) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) |
| **문제 링크** | [프로그래머스 더 맵게 (Level 2)](https://school.programmers.co.kr/learn/courses/30/lessons/42626) |
| **입력 조건** | 음식 수 $N$ ($2 \le N \le 1,000,000$), 목표 스코빌 지수 $K$ ($0 \le K \le 1,000,000,000$), 각 음식 스코빌 $\le 1,000,000$ |
| **혼합 공식** | $\text{섞은 음식} = \text{가장 안 매운 음식} + (\text{두 번째로 안 매운 음식} \times 2)$ |

---

## 2. 접근 아이디어 및 자료구조 선택

### 왜 우선순위 큐(PriorityQueue, 최소 힙)인가?
- 매 섞기 단계마다 현재 음식들 중 **가장 작은 2개**의 스코빌 지수를 찾아야 합니다.
- 일반 배열이나 리스트를 매번 정렬하면 $O(N^2 \log N)$으로 $100만$ 개의 데이터에서 즉시 시간 초과(TLE)가 발생합니다.
- **최소 힙(Min Heap)**을 사용하면 최솟값 추출과 새로운 원소 삽입을 모두 **$O(\log N)$**에 수행할 수 있습니다.

### 종료 조건 및 예외 처리
1. 힙의 루트 원소(`peek()`)가 $K$ 이상이면 모든 음식이 $K$ 이상이므로 즉시 현재 섞은 횟수를 반환합니다.
2. 힙의 크기가 1개인데 그 값이 $K$ 미만이라면 더 이상 섞을 수 없으므로 **`-1`**을 반환합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    public int solution(int[] scoville, int K) {
        int answer = 0;
        // 최소 힙(PriorityQueue) 선언
        PriorityQueue<Integer> pq = new PriorityQueue<>();

        for (int s : scoville) {
            pq.add(s);
        }

        // 가장 작은 값이 K 미만일 때 반복
        while (pq.peek() < K) {
            // 더 이상 섞을 수 없는 경우
            if (pq.size() < 2) {
                return -1;
            }

            int first = pq.poll();
            int second = pq.poll();
            int mixed = first + (second * 2);

            pq.add(mixed);
            answer++;
        }

        return answer;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 최대 $N-1$번 섞을 수 있으며, 매 섞기마다 힙에서 2회 poll 및 1회 add하므로 총 $3 \log N$ 연산 소요. $N = 1,000,000$일 때 약 $2 \times 10^7$ 연산으로 1초 이내 안전 통과.
- **공간 복잡도**: $O(N)$ — 우선순위 큐에 $N$개의 원소 적재.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-42626-more-spicy/result.png)
