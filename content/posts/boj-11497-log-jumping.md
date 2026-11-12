---
title: "[BOJ 11497] 통나무 건너뛰기 - Java (그리디 정렬 & 양방향 지그재그 배치)"
date: "2021-10-30"
category: "PS/BOJ"
tags: ["BOJ","그리디","정렬","Java"]
summary: "원형으로 배치된 통나무들 사이의 인접 높이 차를 최소화하기 위해, 정렬된 통나무를 좌우 번갈아 가며 배치하는 그리디 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 통나무 건너뛰기 (백준 11497번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 11497번) |
| **문제 링크** | [백준 11497번](https://www.acmicpc.net/problem/11497) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 테스트 케이스 수 $T$, 통나무 개수 $N \le 10,000$, 높이 $L_i \le 100,000$ |
| **핵심 규칙** | 원형으로 세운 통나무들 사이의 인접 높이 차이의 최댓값(난이도)을 최소화 |

---

## 2. 접근 아이디어: 지그재그 양방향 배치와 2칸 차이

### 왜 2칸 차이($L[i] - L[i-2]$)인가?
- 원형 배열에서 높이 차를 최소화하려면, 통나무를 오름차순으로 정렬한 뒤 **가장 큰 통나무를 가운데에 두고 좌우로 번갈아가며 배치**하는 산 모양(Mountain shape)을 만들어야 합니다:
  $$\dots, L_4, L_2, L_0, L_1, L_3, L_5, \dots$$
- 이렇게 배치하면 원형에서 인접하게 되는 두 통나무는 원래 정렬된 배열에서 **인덱스가 2칸 차이**나는 원소들이 됩니다:
  $$(L_2, L_0), (L_4, L_2), \dots \text{ 및 } (L_1, L_0), (L_3, L_1), \dots$$
- 따라서 굳이 새 배열을 만들지 않고도, 정렬된 배열에서 **$\max_{i} (L[i] - L[i - 2])$**를 구하면 그것이 곧 최솟값이 됩니다!

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());
        StringBuilder sb = new StringBuilder();

        while (tc-- > 0) {
            int n = Integer.parseInt(br.readLine());
            int[] l = new int[n];

            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int i = 0; i < n; i++) {
                l[i] = Integer.parseInt(st.nextToken());
            }

            Arrays.sort(l);

            int maxDiff = 0;
            // 2칸 차이나는 원소들 간의 높이 차이 최댓값 탐색
            for (int i = 2; i < n; i++) {
                maxDiff = Math.max(maxDiff, l[i] - l[i - 2]);
            }

            sb.append(maxDiff).append("\n");
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 각 테스트 케이스마다 정렬 1회 수행. $N = 10,000$일 때 0.2초 이내에 매우 안정적으로 완료.
- **공간 복잡도**: $O(N)$ — 통나무 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-11497-log-jumping/result.png)
