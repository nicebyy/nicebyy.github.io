---
title: "[BOJ 14888] 연산자 끼워넣기 - Java (백트래킹 순열 & 최댓값/최솟값 갱신)"
date: "2021-08-20"
category: "PS/BOJ"
tags: ["BOJ","백트래킹","브루트포스","Java"]
summary: "덧셈, 뺄셈, 곱셈, 나눗셈 연산자 카드를 N-1개의 수 사이에 끼워넣는 모든 조합을 재귀 백트래킹으로 탐색하여 식의 계산 결과 최댓값과 최솟값을 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 연산자 끼워넣기 (백준 14888번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 14888번) |
| **문제 링크** | [백준 14888번](https://www.acmicpc.net/problem/14888) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 512MB |
| **입력 조건** | 수의 개수 $N \le 11$, $N$개의 정수, 연산자 개수 ($+, -, \times, \div$) |
| **핵심 규칙** | 주어진 연산자를 모두 끼워 넣어 만들 수 있는 계산 결과의 최댓값과 최솟값 구하기 (연산자 우선순위 무시, 앞에서부터 차례대로 계산) |

---

## 2. 접근 아이디어: 재귀 백트래킹(Backtracking / DFS)

### 탐색 공간 분석
- $N$이 최대 11이므로 사용해야 하는 연산자는 총 10개입니다.
- 최악의 경우에도 순열의 수는 $10! = 3,628,800$가지에 불과하므로, 백트래킹을 통한 완전 탐색이 가장 확실하고 직관적인 해법입니다.
- 각 연산자 카운트를 관리하며 재귀 함수 호출 후 카운트를 복원하는 백트래킹 패턴을 적용합니다.
- 음수 나눗셈 규칙은 Java의 정수 나눗셈(`/`) 동작(소수점 버림)과 일치하므로 언어 기본 연산자를 그대로 사용할 수 있습니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static int[] arr;
    static int[] operators = new int[4]; // +, -, *, /
    static int maxVal = Integer.MIN_VALUE;
    static int minVal = Integer.MAX_VALUE;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        arr = new int[n];
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            arr[i] = Integer.parseInt(st.nextToken());
        }

        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < 4; i++) {
            operators[i] = Integer.parseInt(st.nextToken());
        }

        dfs(1, arr[0]);

        System.out.println(maxVal);
        System.out.println(minVal);
    }

    private static void dfs(int index, int currentVal) {
        if (index == n) {
            maxVal = Math.max(maxVal, currentVal);
            minVal = Math.min(minVal, currentVal);
            return;
        }

        for (int i = 0; i < 4; i++) {
            if (operators[i] > 0) {
                operators[i]--;

                int nextVal = 0;
                if (i == 0) nextVal = currentVal + arr[index];
                else if (i == 1) nextVal = currentVal - arr[index];
                else if (i == 2) nextVal = currentVal * arr[index];
                else if (i == 3) nextVal = currentVal / arr[index];

                dfs(index + 1, nextVal);
                operators[i]++; // 백트래킹 복원
            }
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(4^{N-1})$ (실제 순열 상한 $10! = 3.6 \times 10^6$) — 2초 제한 대비 0.2초 이내로 실행됩니다.
- **공간 복잡도**: $O(N)$ — 재귀 스택 깊이 최대 11.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-14888-operator-insertion/result.png)
