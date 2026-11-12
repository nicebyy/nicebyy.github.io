---
title: "[BOJ 2957] 이진 탐색 트리 - Java (TreeSet 기반 삽입 깊이 계산)"
date: "2021-11-11"
category: "PS/BOJ"
tags: ["BOJ","이진탐색트리","TreeSet","자료구조","Java"]
summary: "실제 이진 탐색 트리를 생성하지 않고, TreeSet의 lower/higher 연산으로 부모 후보를 찾아 깊이(depth)를 $O(log N)$에 갱신하는 문제"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 이진 탐색 트리 (백준 2957번 / 플래티넘 5) |
| **플랫폼 / 난이도** | 백준 (플래티넘 5, 2957번) |
| **문제 링크** | [백준 2957번](https://www.acmicpc.net/problem/2957) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 삽입할 수열의 크기 $N \le 300,000$ (1부터 $N$까지 정수 1번씩 주어짐) |
| **핵심 규칙** | 수를 하나씩 이진 탐색 트리에 삽입할 때, 발생하는 노드 비교 횟수의 누적 합 $C$를 매 단계마다 출력 |

---

## 2. 접근 아이디어: 편향 트리의 함정과 TreeSet 깊이 계산

### ⚠️ 왜 직접 BST를 구현하면 TLE인가?
- 수열이 이미 정렬되어 있거나 역정렬된 경우, 트리가 한쪽으로 일렬로 늘어지는 편향 트리(Skewed Tree)가 발생합니다.
- 이 경우 삽입 연산당 $O(N)$이 걸려 전체 시간 복잡도는 $O(N^2) \approx 9 \times 10^{10}$으로 1초 시간 제한을 아득히 초과합니다.

### 💡 핵심 수학적 발견: 부모 후보와 깊이(Depth)
- 새로운 수 $X$가 BST에 삽입될 때, $X$의 부모가 될 수 있는 노드는 오직 둘 중 하나입니다:
  1. 현재 트리에서 $X$보다 작은 값 중 최댓값 (`lower`)
  2. 현재 트리에서 $X$보다 큰 값 중 최솟값 (`higher`)
- $X$는 이 두 후보 중 **더 깊은 곳에 위치한 노드**의 자식으로 삽입됩니다:
  $$depth[X] = \max(depth[lower], depth[higher]) + 1$$
- `TreeSet<Integer>`의 `lower()`와 `higher()`를 사용하면 부모 후보를 **$O(log N)$**에 찾아 깊이를 즉시 계산할 수 있습니다!

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();

        int n = Integer.parseInt(br.readLine());
        long totalCount = 0;

        TreeSet<Integer> set = new TreeSet<>();
        int[] depth = new int[n + 2];

        // 경계값 0과 n+1을 depth 0으로 세팅 (Null 방지)
        depth[0] = -1;
        depth[n + 1] = -1;
        set.add(0);
        set.add(n + 1);

        for (int i = 0; i < n; i++) {
            int val = Integer.parseInt(br.readLine());

            int lower = set.lower(val);
            int higher = set.higher(val);

            // 두 후보 중 더 깊은 노드의 자식으로 삽입
            depth[val] = Math.max(depth[lower], depth[higher]) + 1;
            set.add(val);

            totalCount += depth[val];
            sb.append(totalCount).append("\n");
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N log N)$ — 각 원소당 TreeSet의 `lower()`, `higher()`, `add()` $O(log N)$. $N = 300,000$일 때 약 0.5초 이내에 여유 있게 통과.
- **공간 복잡도**: $O(N)$ — TreeSet 및 깊이 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2957-binary-search-tree/result.png)
