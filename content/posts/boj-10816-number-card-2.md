---
title: "[BOJ 10816] 숫자 카드 2 - Java (Lower Bound & Upper Bound 이분 탐색)"
date: "2021-09-06"
category: "PS/BOJ"
tags: ["BOJ","이분탐색","LowerBound","UpperBound","해시","Java"]
summary: "상근이가 가진 숫자 카드를 정렬한 뒤, 찾고자 하는 수의 첫 등장 인덱스(Lower Bound)와 초과 인덱스(Upper Bound)의 차이로 개수를 O(log N)에 고속 계산하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 숫자 카드 2 (백준 10816번 / 실버 4) |
| **플랫폼 / 난이도** | 백준 (실버 4, 10816번) |
| **문제 링크** | [백준 10816번](https://www.acmicpc.net/problem/10816) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 상근이 카드 수 $N \le 500,000$, 구해야 할 수 $M \le 500,000$ |
| **핵심 규칙** | 각 수가 적힌 카드를 상근이가 **몇 개 가지고 있는지** 공백으로 구분하여 출력 |

---

## 2. 접근 아이디어: Lower Bound & Upper Bound 이분 탐색

- 상근이의 카드를 오름차순 정렬합니다.
- 특정 수 $target$의 개수는 다음 공식으로 $O(\log N)$에 정확히 구해집니다:
  $$\text{Count} = \text{upperBound}(target) - \text{lowerBound}(target)$$
- **`lowerBound`**: $target$ 이상의 값이 처음 나타나는 위치.
- **`upperBound`**: $target$을 초과하는 값이 처음 나타나는 위치.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] cards = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            cards[i] = Integer.parseInt(st.nextToken());
        }

        Arrays.sort(cards);

        int m = Integer.parseInt(br.readLine());
        st = new StringTokenizer(br.readLine());
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < m; i++) {
            int target = Integer.parseInt(st.nextToken());
            sb.append(upperBound(cards, target) - lowerBound(cards, target)).append(" ");
        }

        System.out.println(sb.toString().trim());
    }

    private static int lowerBound(int[] arr, int target) {
        int left = 0, right = arr.length;
        while (left < right) {
            int mid = (left + right) / 2;
            if (arr[mid] >= target) right = mid;
            else left = mid + 1;
        }
        return left;
    }

    private static int upperBound(int[] arr, int target) {
        int left = 0, right = arr.length;
        while (left < right) {
            int mid = (left + right) / 2;
            if (arr[mid] > target) right = mid;
            else left = mid + 1;
        }
        return left;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N + M \log N)$ — $500,000$ 규모에서 약 0.7초 이내 완료.
- **공간 복잡도**: $O(N)$ — 카드 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-10816-number-card-2/result.png)
