---
title: "[BOJ 1920] 수 찾기 - Java (이분 탐색 Binary Search)"
date: "2021-09-06"
category: "PS/BOJ"
tags: ["BOJ","이분탐색","자료구조","Java"]
summary: "N개의 정수를 오름차순 정렬한 뒤, M개의 쿼리 숫자가 존재하는지 O(log N) 이분 탐색(Binary Search)으로 빠르게 판별하는 기본 탐색 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 수 찾기 (백준 1920번 / 실버 4) |
| **플랫폼 / 난이도** | 백준 (실버 4, 1920번) |
| **문제 링크** | [백준 1920번](https://www.acmicpc.net/problem/1920) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 자연수 $N \le 100,000$, 질의 개수 $M \le 100,000$ |
| **핵심 규칙** | $M$개의 각 수가 배열 $A$ 안에 존재하는지 여부(1 또는 0)를 판별하여 출력 |

---

## 2. 접근 아이디어: 정렬 후 이분 탐색(Binary Search) 또는 TreeSet

### 탐색 알고리즘 선택
- $N$개의 배열에서 $M$개의 수를 매번 순차 탐색($O(N)$)으로 찾으면 전체 시간 복잡도는 $O(N \times M) = 10^{10}$이 되어 시간 초과가 발생합니다.
- 따라서 $O(\log N)$ 안에 특정 원소의 존재 여부를 판별할 수 있는 자료구조나 알고리즘을 사용해야 합니다.
  1. **정렬 후 이분 탐색(Binary Search)**: 배열을 $O(N \log N)$에 오름차순 정렬한 뒤, 각 질의마다 $O(\log N)$ 이분 탐색을 수행 ($O(M \log N)$).
  2. **이진 탐색 트리 기반 컬렉션(`TreeSet`)**: 레드-블랙 트리 기반의 `TreeSet`에 원소를 저장하면 내부적으로 정렬 상태가 유지되며 `contains()` 질의를 $O(\log N)$에 처리할 수 있습니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        // N개의 수를 TreeSet에 삽입하여 자동 정렬 및 중복 제거
        TreeSet<Integer> set = new TreeSet<>();
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            set.add(Integer.parseInt(st.nextToken()));
        }

        int m = Integer.parseInt(br.readLine());
        st = new StringTokenizer(br.readLine());
        StringBuilder sb = new StringBuilder();

        // M개의 수에 대해 O(log N) 탐색 수행
        for (int i = 0; i < m; i++) {
            int target = Integer.parseInt(st.nextToken());
            if (set.contains(target)) {
                sb.append(1).append("\n");
            } else {
                sb.append(0).append("\n");
            }
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O((N + M) \log N)$ — $N, M \le 100,000$ 조건에서 약 $2 \times 10^5 \times 17 \approx 3.4 \times 10^6$ 연산으로 1초 제한 대비 충분히 안전하게 통과합니다.
- **공간 복잡도**: $O(N)$ — 최대 $100,000$개의 정수를 보관하는 `TreeSet` 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1920-finding-number/result.png)
