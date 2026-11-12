---
title: "[BOJ 1041] 주사위 - Java (그리디 & 3면/2면/1면 노출 최솟값)"
date: "2021-10-24"
category: "PS/BOJ"
tags: ["BOJ","그리디","수학","Java"]
summary: "NxNxN 정육면체에서 꼭짓점(3면 노출 4개), 모서리(2면 노출), 면(1면 노출) 위치별로 마주보는 면을 피해 최소 눈금 조합을 곱해 합산하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 주사위 (백준 1041번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 1041번) |
| **문제 링크** | [백준 1041번](https://www.acmicpc.net/problem/1041) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 정육면체 크기 $N \le 1,000,000$, 주사위 눈금 6개 ($A, B, C, D, E, F$) |
| **핵심 규칙** | $N \times N \times N$ 주사위 탑을 쌓았을 때, 바닥을 제외한 5개 겉면에 보이는 **주사위 눈금의 합의 최솟값** 구하기 |

---

## 2. 접근 아이디어: 노출 면 종류별 최소 눈금 조합

### 노출 면의 3가지 유형
주사위 탑에서 겉으로 드러나는 주사위는 오직 3종류입니다:
1. **3면 노출 (꼭짓점)**: 항상 **4개**
2. **2면 노출 (모서리)**: $4(N - 1) + 4(N - 2)$개
3. **1면 노출 (면)**: $4(N - 1)(N - 2) + (N - 2)^2$개

### 마주보는 면의 최소값 선정
- 주사위에서 마주보는 면은 동시에 노출될 수 없습니다: $(A, F)$, $(B, E)$, $(C, D)$.
- 세 쌍 각각에서 더 작은 값을 골라 $m_1, m_2, m_3$이라고 하면:
  - 1면 최솟값: $\min(A, B, C, D, E, F)$
  - 2면 최솟값: $m_1 + m_2 + m_3 - \max(m_1, m_2, m_3)$ (작은 2개의 합)
  - 3면 최솟값: $m_1 + m_2 + m_3$
- $N = 1$일 때는 6면 중 가장 큰 값 1개를 제외한 5면의 합이 정답입니다.
- $N \le 10^6$이므로 계산 결과는 반드시 **`long`**을 사용해야 오버플로우가 나지 않습니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        long n = Long.parseLong(br.readLine());

        long[] dice = new long[6];
        StringTokenizer st = new StringTokenizer(br.readLine());
        long totalSum = 0;
        long maxFace = 0;

        for (int i = 0; i < 6; i++) {
            dice[i] = Long.parseLong(st.nextToken());
            totalSum += dice[i];
            maxFace = Math.max(maxFace, dice[i]);
        }

        // N = 1인 특별 케이스 (가장 큰 면 1개를 제외한 5개 면의 합)
        if (n == 1) {
            System.out.println(totalSum - maxFace);
            return;
        }

        // 마주보는 면 (0-5, 1-4, 2-3) 중 최솟값 3개 추출
        long[] pairMin = new long[3];
        pairMin[0] = Math.min(dice[0], dice[5]);
        pairMin[1] = Math.min(dice[1], dice[4]);
        pairMin[2] = Math.min(dice[2], dice[3]);
        Arrays.sort(pairMin);

        long min1 = pairMin[0];
        long min2 = pairMin[0] + pairMin[1];
        long min3 = pairMin[0] + pairMin[1] + pairMin[2];

        // 각 면 개수 계산
        long count3 = 4;
        long count2 = 4 * (n - 1) + 4 * (n - 2);
        long count1 = 4 * (n - 1) * (n - 2) + (n - 2) * (n - 2);

        long answer = count3 * min3 + count2 * min2 + count1 * min1;
        System.out.println(answer);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(1)$ — 단순 산술 공식 계산으로 수 밀리초 내 완료.
- **공간 복잡도**: $O(1)$ — 고정 크기 배열 사용.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1041-dice/result.png)
