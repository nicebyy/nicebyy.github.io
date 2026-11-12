---
title: "[BOJ 13904] 과제 - Java (그리디 & 역순 배치 / 우선순위 큐)"
date: "2021-10-29"
category: "PS/BOJ"
tags: ["BOJ","그리디","우선순위 큐","정렬","Java"]
summary: "점수가 높은 과제부터 마감일에 가장 가까운 빈 날짜에 우선 배정하거나, 마감일 기준 최소 힙으로 최적 과제를 선별하는 탐욕법 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 과제 (백준 13904번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 13904번) |
| **문제 링크** | [백준 13904번](https://www.acmicpc.net/problem/13904) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 과제 수 $N \le 1,000$, 마감일 $d \le 1,000$, 점수 $w \le 100$ |
| **핵심 규칙** | 하루에 1개씩 과제를 할 수 있을 때 얻을 수 있는 **최대 점수** 계산 |

---

## 2. 접근 아이디어: 점수 내림차순 & 마감일 역순 배정

### 탐욕법(Greedy) 설계
1. **점수 기준 내림차순 정렬**:
   - 점수가 큰 과제는 무조건 수행하는 것이 이득입니다.
2. **가능한 가장 늦은 날짜에 배정**:
   - 마감일이 $d$인 과제를 1일차나 2일차에 미리 해버리면, 마감일이 촉박한 다른 과제를 할 수 없게 됩니다.
   - 따라서 $d$일차부터 시작하여 $1$일차까지 역순으로 검사하며, **비어있는 날짜 중 가장 늦은 날**에 과제를 배정합니다.
3. 배정할 빈 날짜가 남아있지 않다면 해당 과제는 포기합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Task implements Comparable<Task> {
        int day, score;
        Task(int day, int score) {
            this.day = day;
            this.score = score;
        }
        @Override
        public int compareTo(Task o) {
            return o.score - this.score; // 점수 내림차순
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        Task[] tasks = new Task[n];
        int maxDay = 0;

        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int d = Integer.parseInt(st.nextToken());
            int w = Integer.parseInt(st.nextToken());
            tasks[i] = new Task(d, w);
            maxDay = Math.max(maxDay, d);
        }

        Arrays.sort(tasks);

        int[] schedule = new int[maxDay + 1];
        int totalScore = 0;

        for (Task t : tasks) {
            // 마감일부터 1일까지 거꾸로 빈 날짜 탐색
            for (int d = t.day; d >= 1; d--) {
                if (schedule[d] == 0) {
                    schedule[d] = t.score;
                    totalScore += t.score;
                    break;
                }
            }
        }

        System.out.println(totalScore);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N + N \times D)$ — 정렬 $O(N \log N)$ + 최대 $1,000 \times 1,000 = 10^6$번 순회로 0.1초 이내 즉시 통과.
- **공간 복잡도**: $O(N + D)$ — 과제 배열 및 일정 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-13904-assignment/result.png)
