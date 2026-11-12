---
title: "[BOJ 1744] 수 묶기 - Java (그리디 정렬 & 양수/음수/0/1 분류)"
date: "2021-10-26"
category: "PS/BOJ"
tags: ["BOJ","그리디","정렬","수학","Java"]
summary: "양수는 큰 수끼리 곱하고, 1은 더하는 것이 이득이며, 음수는 절댓값이 큰 수끼리 곱하거나 0으로 상쇄시키는 수 묶기 최적화 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 수 묶기 (백준 1744번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 1744번) |
| **문제 링크** | [백준 1744번](https://www.acmicpc.net/problem/1744) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 수열의 크기 $N \le 50$, 각 수는 $-1,000 \le X \le 1,000$ |
| **핵심 규칙** | 수열의 두 수를 묶어 곱하거나 묶지 않고 더할 때, **수열의 합을 최대화** |

---

## 2. 접근 아이디어: 4가지 그룹 분할과 최적 묶기 전략

### 수의 특성에 따른 최적 연산
1. **1보다 큰 양수**:
   - 큰 수끼리 2개씩 묶어 곱하는 것이 무조건 더하는 것보다 큽니다 ($3 \times 4 = 12 > 3 + 4$).
2. **숫자 1**:
   - 1은 어떤 수와 곱하면 자기 자신이 되므로 곱하는 것보다 **더하는 것($1 + X > 1 \times X$)이 무조건 이득**입니다.
3. **음수**:
   - 절댓값이 큰 음수끼리 2개씩 곱하면 큰 양수가 됩니다 ($-5 \times -4 = 20$).
4. **숫자 0**:
   - 음수가 홀수 개 남아 1개가 남았을 때, 0이 있다면 **$0 \times (\text{음수}) = 0$으로 상쇄**시키는 것이 최적입니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        List<Integer> positives = new ArrayList<>();
        List<Integer> negatives = new ArrayList<>();
        int oneCount = 0;
        int zeroCount = 0;

        for (int i = 0; i < n; i++) {
            int val = Integer.parseInt(br.readLine());
            if (val > 1) {
                positives.add(val);
            } else if (val == 1) {
                oneCount++;
            } else if (val < 0) {
                negatives.add(val);
            } else {
                zeroCount++;
            }
        }

        // 양수는 내림차순, 음수는 오름차순(절댓값 큰 순서) 정렬
        positives.sort(Collections.reverseOrder());
        Collections.sort(negatives);

        int totalSum = oneCount; // 1은 그대로 더함

        // 양수 2개씩 묶기
        int pSize = positives.size();
        for (int i = 0; i < pSize; i += 2) {
            if (i + 1 < pSize) {
                totalSum += positives.get(i) * positives.get(i + 1);
            } else {
                totalSum += positives.get(i);
            }
        }

        // 음수 2개씩 묶기
        int nSize = negatives.size();
        for (int i = 0; i < nSize; i += 2) {
            if (i + 1 < nSize) {
                totalSum += negatives.get(i) * negatives.get(i + 1);
            } else {
                // 음수가 1개 남았을 때 0이 없으면 더함 (0이 있으면 곱해서 0으로 상쇄)
                if (zeroCount == 0) {
                    totalSum += negatives.get(i);
                }
            }
        }

        System.out.println(totalSum);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 정렬 시간. $N \le 50$으로 수 밀리초 내 즉시 완료.
- **공간 복잡도**: $O(N)$ — 그룹별 리스트.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1744-tie-numbers/result.png)
