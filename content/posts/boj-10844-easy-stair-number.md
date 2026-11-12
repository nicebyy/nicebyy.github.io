---
title: '[BOJ 10844] 쉬운 계단 수 (Java) - 2차원 DP 점화식과 모듈러 연산 주의점'
date: '2022-05-11'
category: PS/BOJ
tags:
  - BOJ
  - DP
  - 다이나믹프로그래밍
  - Java
  - Silver I
summary: >-
  백준 10844번(쉬운 계단 수) 문제에서 끝자리 숫자(0~9)를 기준으로 길이를 확장해 가는 2차원 DP 점화식 설계와 경계값(0, 9), 모듈러 연산 괄호 주의점을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 10844번 - 쉬운 계단 수](https://www.acmicpc.net/problem/10844)
- **난이도**: Silver I
- **시간 / 메모리 제한**: `1초` / `256 MB`

### 핵심 조건 요약

- `45656`처럼 **인접한 모든 자리의 차이가 `1`인 수**를 계단 수라고 합니다.
- `0`으로 시작하는 수는 계단 수가 아닙니다.
- 길이 `N`(`1 ≤ N ≤ 100`)인 계단 수의 총 개수를 **`1,000,000,000`으로 나눈 나머지**를 출력합니다.

---

## 접근 아이디어

길이가 `i`인 계단 수를 만들 때, **맨 마지막 자리에 어떤 숫자가 왔는지(`0 ~ 9`)**에 따라 다음에 붙일 수 있는 숫자가 결정됩니다.

### 1. 상태 정의 및 초기값

- `dp[i][j]`: **길이가 `i`이고, 마지막 자리 숫자가 `j`인 계단 수의 개수**
- 초기값(`i = 1`): 한 자리 수 중 `0`으로 시작할 수 없으므로 `dp[1][0] = 0`, `dp[1][1..9] = 1`입니다.

### 2. 점화식과 경계값(`0`, `9`) 처리

길이 `i`에서 마지막 숫자가 `j`가 되려면, 직전(`i - 1`자리)의 마지막 숫자는 `j - 1` 또는 `j + 1`이어야 합니다.

- **`j == 0`**: 앞자리에 `-1`은 올 수 없으므로 `1`만 가능 → `dp[i][0] = dp[i - 1][1]`
- **`j == 9`**: 앞자리에 `10`은 올 수 없으므로 `8`만 가능 → `dp[i][9] = dp[i - 1][8]`
- **`1 ≤ j ≤ 8`**: 양쪽 모두 가능 → `dp[i][j] = (dp[i - 1][j - 1] + dp[i - 1][j + 1]) % 1_000_000_000`

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;

import static java.util.Arrays.stream;

public class Main {

    static final int LIMIT = 1_000_000_000;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        long[][] dp = new long[n + 1][10];

        // 길이가 1일 때: 1~9는 각각 1개, 0으로 시작하는 수는 불가
        Arrays.fill(dp[1], 1);
        dp[1][0] = 0;

        for (int i = 2; i <= n; i++) {
            for (int j = 0; j < 10; j++) {
                long next = switch (j) {
                    case 0 -> dp[i - 1][1];
                    case 9 -> dp[i - 1][8];
                    default -> (dp[i - 1][j - 1] + dp[i - 1][j + 1]) % LIMIT;
                };
                dp[i][j] = next;
            }
        }

        long result = stream(dp[n])
                .reduce(0L, (sum, e) -> (sum + e) % LIMIT);

        System.out.println(result);
    }
}
```

### 주의할 점: 모듈러 연산의 연산자 우선순위

자바에서 `%` 연산자는 `+`보다 우선순위가 높습니다. 만약 `dp[i - 1][j - 1] + dp[i - 1][j + 1] % LIMIT`처럼 괄호를 빠뜨리면 오른쪽 항에만 `%`가 적용되어 합의 크기가 `2 * LIMIT`를 넘어 누적 시 오버플로우 위험이 생깁니다. 반드시 **`(a + b) % LIMIT`** 형태로 괄호를 감싸 매 단계에서 나머지를 유지해야 합니다.

---

## 채점 결과

![백준 10844 쉬운 계단 수 맞았습니다 결과](/images/posts/boj-10844-easy-stair-number/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N)` — `N × 10` 테이블을 한 번 채우는 연산
- **공간 복잡도**: `O(N)` — `long[N + 1][10]` DP 테이블 사용 (직전 행만 유지하면 `O(1)`으로도 가능)
