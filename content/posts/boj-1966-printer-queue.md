---
title: "[BOJ 1966] 프린터 큐 - Java (큐 Queue 시뮬레이션)"
date: "2021-08-26"
category: "PS/BOJ"
tags: ["BOJ","자료구조","큐","시뮬레이션","Java"]
summary: "대기 중인 문서들 중 중요도가 더 높은 문서가 있다면 큐의 뒤로 재배치하는 우선순위 인쇄 큐 시뮬레이션 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 프린터 큐 (백준 1966번 / 실버 3) |
| **플랫폼 / 난이도** | 백준 (실버 3, 1966번) |
| **문제 링크** | [백준 1966번](https://www.acmicpc.net/problem/1966) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 테스트 케이스 수, 문서 개수 $N \le 100$, 타깃 문서 인덱스 $M$ |
| **핵심 규칙** | 현재 문서보다 중요도가 높은 문서가 대기열에 하나라도 있으면 뒤로 보낼 때, 타깃 문서가 출력되는 순서 구하기 |

---

## 2. 접근 아이디어: 큐(Queue) 회전 시뮬레이션

### 단순 우선순위 큐(PQ)의 함정과 해결책
- 단순 PriorityQueue를 사용하면 동일한 중요도를 가진 문서 간의 **FIFO(선입선출) 순서 보장**이 깨지게 됩니다.
- 따라서 문서의 원래 위치와 중요도를 담는 `Doc(index, priority)` 객체를 정의하고, **`LinkedList` 기반 큐**를 사용합니다:
  1. 큐의 맨 앞 문서 `cur`를 `poll()`합니다.
  2. 큐에 남아 있는 문서들 중 `cur`보다 높은 중요도를 가진 문서가 하나라도 존재하는지 검사합니다.
  3. 더 높은 문서가 있다면 `cur`를 큐의 맨 뒤에 다시 `offer()`합니다.
  4. 더 높은 문서가 없다면 출력 처리(출력 순서 카운트 증가)하고, 만약 이 문서가 타깃 인덱스 $M$이라면 카운트를 반환하고 종료합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Doc {
        int index;
        int priority;

        public Doc(int index, int priority) {
            this.index = index;
            this.priority = priority;
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());

        StringBuilder sb = new StringBuilder();
        while (tc-- > 0) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int n = Integer.parseInt(st.nextToken());
            int m = Integer.parseInt(st.nextToken());

            LinkedList<Doc> queue = new LinkedList<>();
            st = new StringTokenizer(br.readLine());

            for (int i = 0; i < n; i++) {
                int priority = Integer.parseInt(st.nextToken());
                queue.offer(new Doc(i, priority));
            }

            int printOrder = 0;

            while (!queue.isEmpty()) {
                Doc cur = queue.poll();
                boolean hasHigher = false;

                // 큐에 더 높은 중요도의 문서가 있는지 선형 탐색
                for (Doc doc : queue) {
                    if (doc.priority > cur.priority) {
                        hasHigher = true;
                        break;
                    }
                }

                if (hasHigher) {
                    queue.offer(cur); // 뒤로 재배치
                } else {
                    printOrder++;
                    if (cur.index == m) {
                        sb.append(printOrder).append("\n");
                        break;
                    }
                }
            }
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(T \times N^2)$ — $N \le 100$이므로 케이스당 최대 약 $10,000$ 연산으로 밀리초 단위로 실행됩니다.
- **공간 복잡도**: $O(N)$ — 문서 큐 크기.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1966-printer-queue/result.png)
