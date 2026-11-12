---
title: "[프로그래머스] 디스크 컨트롤러 - Java (SJF 스케줄링 & 최소 힙 PriorityQueue)"
date: "2021-10-11"
category: "PS/Programmers"
tags: ["Programmers","우선순위 큐","그리디","스케줄링","Java"]
summary: "현재 시점에 요청이 들어와 있는 작업들 중 소요 시간이 가장 짧은 작업을 먼저 처리(SJF)하여 각 작업의 요청부터 종료까지 걸린 시간의 평균을 최소화하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 디스크 컨트롤러 (Level 3) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 3) |
| **문제 링크** | [프로그래머스 디스크 컨트롤러 (Level 3)](https://school.programmers.co.kr/learn/courses/30/lessons/42627) |
| **입력 조건** | 작업 목록 `jobs` ($1 \le N \le 500$), 각 작업 `[요청 시점, 소요 시간]` |
| **핵심 규칙** | 각 작업의 요청부터 종료까지 걸린 시간의 **평균을 가장 줄이는 스케줄링(SJF)** 후 평균 시간의 정수부 반환 |

---

## 2. 접근 아이디어: Shortest Job First (SJF) & 우선순위 큐

### 평균 대기 시간 최소화 원리
- 현재 CPU가 비어있을 때 실행 가능한 작업들 중, **소요 시간(작업 길이)이 가장 짧은 작업**을 먼저 실행해야 다른 대기 중인 작업들의 지연 시간을 최소화할 수 있습니다.
- 1. 전체 작업을 **요청 시점 오름차순**으로 정렬합니다.
- 2. 현재 시점 `currentTime` 이전에 요청된 모든 작업을 **소요 시간 오름차순의 최소 힙(`PriorityQueue`)**에 넣습니다.
- 3. 힙에서 가장 짧은 작업을 꺼내 수행하고 시간을 갱신합니다. 힙이 비어있다면 다음 작업의 요청 시점으로 점프합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    public int solution(int[][] jobs) {
        // 요청 시간 기준 오름차순 정렬
        Arrays.sort(jobs, Comparator.comparingInt(a -> a[0]));

        // 소요 시간 기준 최소 힙
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));

        int totalWaitTime = 0;
        int currentTime = 0;
        int jobIdx = 0;
        int completed = 0;

        while (completed < jobs.length) {
            // 현재 시점까지 요청된 모든 작업을 힙에 추가
            while (jobIdx < jobs.length && jobs[jobIdx][0] <= currentTime) {
                pq.add(jobs[jobIdx]);
                jobIdx++;
            }

            if (pq.isEmpty()) {
                // 대기 중인 작업이 없다면 다음 작업의 요청 시점으로 시간 점프
                currentTime = jobs[jobIdx][0];
            } else {
                int[] cur = pq.poll();
                currentTime += cur[1];
                totalWaitTime += (currentTime - cur[0]);
                completed++;
            }
        }

        return totalWaitTime / jobs.length;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 정렬 $O(N \log N)$ + 힙 연산 $O(N \log N)$. $N = 500$으로 0.05초 미만에 완료.
- **공간 복잡도**: $O(N)$ — 우선순위 큐 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-42627-disk-controller/result.png)
