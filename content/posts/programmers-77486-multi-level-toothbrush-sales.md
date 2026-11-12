---
title: "[프로그래머스] 다단계 칫솔 판매 - Java (트리 구조 부모 전파 & 10% 분배)"
date: "2021-11-13"
category: "PS/Programmers"
tags: ["Programmers","트리","해시","재귀","시뮬레이션","Java"]
summary: "판매원 조직 트리에서 판매 수익의 10%를 추천인에게 반복 분배하며 1원 미만의 원 단위 절사 규칙을 반영하는 2021 Dev-Matching 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 다단계 칫솔 판매 (Level 3) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 3) / 2021 Dev-Matching |
| **문제 링크** | [프로그래머스 다단계 칫솔 판매 (Level 3)](https://school.programmers.co.kr/learn/courses/30/lessons/77486) |
| **입력 조건** | 판매원 수 $N \le 10,000$, 판매 기록 $M \le 100,000$, 칫솔 1개당 이익 100원 |
| **핵심 규칙** | 발생한 이익의 10%를 추천인에게 상납하고 90%를 자신이 취함. 단 10% 계산 시 **원 단위 절사(`1원 미만은 0원`)** |

---

## 2. 접근 아이디어: 트리 구조 & 1원 미만 조기 탈출 (Pruning)

### 추천인 트리와 상납 전파
- 모든 판매원은 단 하나의 추천인(부모)을 갖는 **트리 구조**를 이룹니다. 루트는 `center`(`"-"`)입니다.
- 판매가 발생하면 $profit = \text{amount} \times 100$을 시작으로:
  - 부모에게 넘길 금액: $parentShare = profit / 10$
  - 자신이 가질 금액: $myShare = profit - parentShare$
  - 다음 부모에게 넘겨줄 수익: $profit = parentShare$

### 💡 핵심 최적화: 1원 미만 조기 탈출
- 만약 $parentShare = 0$이 되면, 더 이상 상위 추천인에게 넘겨줄 돈이 없으므로 **루트까지 올라가지 않고 즉시 반복/재귀를 종료**해야 합니다.
- 10으로 계속 나누어 떨어지므로 최대 5~6번 전파되면 0원이 됩니다. 이를 통해 $O(M \times N)$이 아닌 $O(M \times \log_{10} \text{profit})$으로 극적인 최적화가 이루어집니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    public int[] solution(String[] enroll, String[] referral, String[] seller, int[] amount) {
        int n = enroll.length;
        Map<String, Integer> nameToIdx = new HashMap<>();
        int[] parent = new int[n]; // 부모 인덱스 (root center는 -1)
        int[] totalProfit = new int[n];

        for (int i = 0; i < n; i++) {
            nameToIdx.put(enroll[i], i);
        }

        for (int i = 0; i < n; i++) {
            if (referral[i].equals("-")) {
                parent[i] = -1;
            } else {
                parent[i] = nameToIdx.get(referral[i]);
            }
        }

        // 판매 기록 순회
        for (int i = 0; i < seller.length; i++) {
            int curIdx = nameToIdx.get(seller[i]);
            int money = amount[i] * 100;

            // 추천인 타고 상위로 분배 전파
            while (curIdx != -1 && money > 0) {
                int toParent = money / 10;
                int toMe = money - toParent;

                totalProfit[curIdx] += toMe;

                money = toParent; // 부모가 처리할 금액
                curIdx = parent[curIdx];
            }
        }

        return totalProfit;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(M \times \log_{10}(\max(amount) \times 100))$ — 최대 판매 금액은 $100 \times 100 = 10,000$원이므로 부모 전파는 최대 4회 이내에 종료. $M = 100,000$일 때 약 $40만$ 번의 연산으로 0.08초 이내 통과.
- **공간 복잡도**: $O(N)$ — 인덱스 매핑 해시맵 및 부모/수익 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-77486-multi-level-toothbrush-sales/result.png)
