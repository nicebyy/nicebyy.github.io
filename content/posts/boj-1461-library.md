---
title: "[BOJ 1461] 도서관 - Java (그리디 정렬 & 양수/음수 분할 탐색)"
date: "2021-11-01"
category: "PS/BOJ"
tags: ["BOJ","그리디","정렬","Java"]
summary: "음수 좌표와 양수 좌표를 분리하여 절대값이 큰 책부터 $M$권씩 묶어 왕복하고, 가장 멀리 있는 책은 돌아오지 않는 편도로 처리하여 이동 걸음을 최소화"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 도서관 (백준 1461번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 1461번) |
| **문제 링크** | [백준 1461번](https://www.acmicpc.net/problem/1461) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 책의 개수 $N \le 50$, 한 번에 들 수 있는 책의 개수 $M \le 50$, 책의 원래 위치 좌표 $X_i \in [-10,000, 10,000]$ |
| **핵심 규칙** | 0에서 출발하여 모든 책을 원래 위치에 두고 다시 0으로 돌아오지 않아도 됨. **최소 이동 걸음 수** 계산 |

---

## 2. 접근 아이디어: 음수/양수 분할 & 가장 먼 곳 편도 처리

### 최적 이동 전략
1. **음수와 양수의 독립 처리**:
   - 음수 책과 양수 책을 한 번에 들고 가면 원점을 왕복해야 하므로 동선이 낭비됩니다. 따라서 **음수 좌표와 양수 좌표를 완전히 분리**합니다.
2. **절대값이 큰 책부터 $M$권씩 묶기**:
   - 가장 먼 곳에 갈 때 다른 책들을 함께 가져다 놓는 것이 이득입니다. 따라서 절대값이 큰 순서대로 $M$권씩 묶어 왕복 거리($\times 2$)를 누적합니다.
3. **마지막 편도 할인**:
   - 모든 책을 제자리에 둔 뒤에는 원점으로 돌아올 필요가 없습니다.
   - 따라서 **전체 책 중 원점에서 가장 멀리 떨어진 책(절대값 최댓값)**을 가장 마지막에 방문하여, 그 거리만큼은 돌아오는 걸음($\text{maxDist}$)을 빼줍니다.

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
        int m = Integer.parseInt(st.nextToken());

        List<Integer> positive = new ArrayList<>();
        List<Integer> negative = new ArrayList<>();

        st = new StringTokenizer(br.readLine());
        int maxDist = 0;

        for (int i = 0; i < n; i++) {
            int pos = Integer.parseInt(st.nextToken());
            maxDist = Math.max(maxDist, Math.abs(pos));
            if (pos > 0) {
                positive.add(pos);
            } else {
                negative.add(-pos); // 양수로 변환하여 저장
            }
        }

        // 절대값 큰 순서(내림차순) 정렬
        positive.sort(Collections.reverseOrder());
        negative.sort(Collections.reverseOrder());

        int totalSteps = 0;

        // 양수 방향 처리
        for (int i = 0; i < positive.size(); i += m) {
            totalSteps += positive.get(i) * 2;
        }

        // 음수 방향 처리
        for (int i = 0; i < negative.size(); i += m) {
            totalSteps += negative.get(i) * 2;
        }

        // 가장 먼 곳은 돌아오지 않으므로 편도 1회분 차감
        totalSteps -= maxDist;

        System.out.println(totalSteps);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 좌표 정렬 시간. $N \le 50$으로 수 밀리초 내 즉시 완료.
- **공간 복잡도**: $O(N)$ — 양수 및 음수 리스트.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1461-library/result.png)
