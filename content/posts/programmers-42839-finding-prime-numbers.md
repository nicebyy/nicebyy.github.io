---
title: "[프로그래머스] 소수 찾기 - Java (순열 조합 & 에라토스테네스의 체)"
date: "2021-10-20"
category: "PS/Programmers"
tags: ["Programmers","완전탐색","소수","순열","Set","Java"]
summary: "주어진 숫자 조각들로 만들 수 있는 모든 수열을 백트래킹 순열로 생성하여 Set에 담고, 각 숫자가 소수인지 판별하여 개수를 세는 완전탐색 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 소수 찾기 (Level 2) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) |
| **문제 링크** | [프로그래머스 소수 찾기 (Level 2)](https://school.programmers.co.kr/learn/courses/30/lessons/42839) |
| **입력 조건** | 흩어진 숫자 조각 문자열 `numbers` (길이 $1 \sim 7$) |
| **핵심 규칙** | 숫자 조각을 조합하여 만들 수 있는 **서로 다른 소수의 개수** 구하기 |

---

## 2. 접근 아이디어: 순열(Permutation) 백트래킹 & 소수 판별

### 단계별 해결 알고리즘
1. **순열 생성**: 길이 1부터 $N$까지 가능한 모든 자릿수의 숫자 조합을 DFS 백트래킹으로 생성합니다.
2. **중복 제거**: `"011"`과 같이 중복된 숫자 조합(11)이 생길 수 있으므로, 생성된 정수를 **`HashSet<Integer>`**에 저장하여 중복을 자동 제거합니다.
3. **소수 판별**: Set에 담긴 각 숫자에 대해 $2$부터 $\sqrt{X}$까지 나누어 떨어지는지 검사하여 소수 개수를 집계합니다 ($0$과 $1$은 소수에서 제외).

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private Set<Integer> numberSet = new HashSet<>();
    private boolean[] visited;

    public int solution(String numbers) {
        visited = new boolean[numbers.length()];
        dfs(numbers, "", 0);

        int count = 0;
        for (int num : numberSet) {
            if (isPrime(num)) count++;
        }

        return count;
    }

    private void dfs(String numbers, String current, int depth) {
        if (!current.isEmpty()) {
            numberSet.add(Integer.parseInt(current));
        }

        if (depth == numbers.length()) return;

        for (int i = 0; i < numbers.length(); i++) {
            if (!visited[i]) {
                visited[i] = true;
                dfs(numbers, current + numbers.charAt(i), depth + 1);
                visited[i] = false;
            }
        }
    }

    private boolean isPrime(int n) {
        if (n <= 1) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(\sum_{k=1}^N P(N, k) + K \sqrt{M})$ — 최대 $N=7$일 때 총 순열 수 약 13,699가지로 0.05초 미만에 즉시 완료.
- **공간 복잡도**: $O(N!)$ — 해시셋 및 방문 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-42839-finding-prime-numbers/result.png)
