---
title: "[BOJ 1781] 컵라면 - Java (그리디 & 최소 힙 PriorityQueue)"
date: "2021-11-02"
category: "PS/BOJ"
tags: ["BOJ","그리디","우선순위 큐","PriorityQueue","정렬","Java"]
summary: "데드라인 오름차순으로 정렬한 뒤 문제를 최소 힙에 추가하고, 힙 크기가 데드라인을 초과할 때마다 최소 라면 문제를 방출하는 그리디 접근법"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 컵라면 (백준 1781번 / 골드 2) |
| **플랫폼 / 난이도** | 백준 (골드 2, 1781번) |
| **문제 링크** | [백준 1781번](https://www.acmicpc.net/problem/1781) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 256MB |
| **입력 조건** | 숙제 수 $N \le 200,000$, 데드라인 $D \le N$, 컵라면 수 $C \le 2^{31}-1$ |
| **핵심 규칙** | 1단위 시간에 1문제를 풀 수 있을 때, 받을 수 있는 **최대 컵라면 수** 구하기 |

---

## 2. 접근 아이디어: 데드라인 정렬 & 최소 힙(PriorityQueue)

### 탐욕법(Greedy) 설계
1. 숙제들을 **데드라인 오름차순**으로 정렬합니다.
2. 각 숙제를 순회하며 컵라면 수를 **최소 힙(`PriorityQueue`)**에 넣습니다.
3. 힙의 크기는 **"현재까지 선택하여 풀기로 한 문제의 수(소요 일수)"**입니다.
4. 만약 **`pq.size() > deadline`**이 되면, 마감일 내에 모든 문제를 풀 수 없으므로 지금까지 고른 문제 중 **가장 컵라면을 적게 주는 문제(`pq.poll()`)를 포기**합니다.
5. 마지막에 힙에 남아있는 모든 컵라면 수를 합산하면 최댓값이 됩니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Problem implements Comparable<Problem> {
        int deadline, ramen;
        Problem(int deadline, int ramen) {
            this.deadline = deadline;
            this.ramen = ramen;
        }
        @Override
        public int compareTo(Problem o) {
            if (this.deadline == o.deadline) {
                return o.ramen - this.ramen;
            }
            return this.deadline - o.deadline;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        Problem[] problems = new Problem[n];
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            problems[i] = new Problem(Integer.parseInt(st.nextToken()), Integer.parseInt(st.nextToken()));
        }

        Arrays.sort(problems);

        PriorityQueue<Integer> pq = new PriorityQueue<>();

        for (Problem p : problems) {
            pq.add(p.ramen);
            if (pq.size() > p.deadline) {
                pq.poll(); // 가장 적은 컵라면 문제 제거
            }
        }

        long totalRamen = 0;
        while (!pq.isEmpty()) {
            totalRamen += pq.poll();
        }

        System.out.println(totalRamen);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 정렬 $O(N \log N)$ + 각 문제당 힙 삽입/삭제 $O(\log N)$. $N = 200,000$일 때 약 0.5초 이내 완료.
- **공간 복잡도**: $O(N)$ — 배열 및 우선순위 큐 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1781-cup-ramen/result.png)
