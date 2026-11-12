---
title: '[BOJ 15486] 퇴사 2 (Java) - O(N) 상향식 동적 계획법(DP) 풀이'
date: '2023-10-06'
category: PS/BOJ
tags:
  - BOJ
  - DP
  - 다이나믹프로그래밍
  - Java
  - Gold V
summary: >-
  백준 15486번(퇴사 2) 문제에서 N이 최대 1,500,000일 때 브루트포스 대신 O(N) 상향식 DP와 누적 최대 수익(maxPay)으로 최대 수익을 구하는 점화식 설계를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 15486번 - 퇴사 2](https://www.acmicpc.net/problem/15486)
- **난이도**: Gold V
- **시간 / 메모리 제한**: `2초` / `512 MB`

### 핵심 조건 요약

- 오늘부터 `N + 1`일째 되는 날 퇴사하기 위해 남은 `N`일 동안 최대한 많은 수익을 내야 합니다.
- `i`일(`1 ≤ i ≤ N`)에 잡혀 있는 상담은 완료하는 데 걸리는 기간 `T_i`와 완료 시 받는 금액 `P_i`로 이루어져 있습니다.
- 상담 기간이 겹치면 동시에 진행할 수 없으며, **`i + T_i > N + 1`인 상담(퇴사일 이후에 끝나는 상담)은 진행할 수 없습니다.**

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 일수 `N` | `1 ≤ N ≤ 1,500,000` | **완전 탐색(`O(2^N)`) 절대 불가**, `O(N)` 필수 |
| 상담 기간 `T_i` | `1 ≤ T_i ≤ 50` | `i + T_i`는 최대 `N + 50`까지 가능 (범위 체크 필요) |
| 상담 금액 `P_i` | `1 ≤ P_i ≤ 1,000` | 최대 누적 수익 `1.5 × 10^9` (`int` 범위 내 안전) |

---

## 접근 아이디어

비슷한 문제인 [퇴사 (14501번)](https://www.acmicpc.net/problem/14501)은 `N ≤ 15`여서 재귀 완전 탐색으로도 풀리지만, **퇴사 2**는 `N`이 최대 **`1,500,000`**이므로 반드시 **`O(N)` 동적 계획법(DP)**으로 풀어야 합니다.

### 상태 정의와 점화식 (상향식 Push DP)

- `dp[k]`: **`k`일째에 정산(도착)했을 때 얻을 수 있는 최대 수익**
- `maxPay`: **1일부터 현재 `i`일까지 도달하면서 기록한 누적 최대 수익**

`1`일부터 `N + 1`일까지 하루씩 순차적으로 전진하면서 다음 두 가지를 수행합니다.

1. **현재일까지의 최대 수익 갱신**: `i`일 시점에 아무 상담도 하지 않고 쉬어 왔을 수도 있으므로, 지금까지의 최대 수익 `maxPay`와 `dp[i]`를 비교해 갱신합니다.
   ```java
   maxPay = Math.max(maxPay, dp[i]);
   ```
2. **상담 진행 시 미래 정산일에 수익 전파 (Push)**: `i`일의 상담이 퇴사일(`N + 1`일) 이내에 끝난다면(`i + T_i <= N + 1`), 상담이 끝나는 날의 DP 값을 갱신합니다.
   ```java
   dp[i + T_i] = Math.max(dp[i + T_i], maxPay + P_i);
   ```

### 왜 `i`를 `N + 1`까지 순회하고 `maxPay`를 별도로 유지할까?

- `N`일에 끝나는(또는 `i + T_i == N + 1`이 되는) 상담의 수익은 **`dp[N + 1]`에 기록**됩니다. 따라서 `i = N + 1`까지 루프를 돌며 `maxPay = Math.max(maxPay, dp[N + 1])`를 확인하면 최종 정답이 자동으로 `maxPay`에 수렴합니다.
- 만약 `dp[k]`만 믿고 `dp[i]`를 앞선 날에서 끌어오지 않으면, 중간에 상담을 건너뛰어 빈 날짜가 생길 때 이전 최대 수익이 전파되지 않을 수 있습니다. `maxPay` 변수를 두면 직전까지의 최댓값을 항상 `O(1)`로 이어받을 수 있습니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;

public class Main {

    static int n;
    static int[] dp;
    static Consult[] arr;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        n = Integer.parseInt(br.readLine());
        dp = new int[n + 2];
        arr = new Consult[n + 2];

        for (int i = 1; i <= n; i++) {
            arr[i] = new Consult(br.readLine());
        }
        // N + 1일(퇴사일) 정산 시 NullPointerException 방지를 위한 센티넬 더미
        arr[n + 1] = new Consult("0 0");

        int maxPay = Integer.MIN_VALUE;
        for (int i = 1; i <= n + 1; i++) {
            // 현재 i일까지 도달 가능한 최대 수익 갱신
            if (maxPay < dp[i]) {
                maxPay = dp[i];
            }

            // 퇴사일(n + 1)을 넘어가는 상담은 진행 불가
            if (arr[i].days + i > n + 1) {
                continue;
            }

            // i일 상담을 선택했을 때 종료 시점(i + days)의 최대 수익 갱신
            dp[arr[i].days + i] = Math.max(dp[arr[i].days + i], maxPay + arr[i].pays);
        }

        System.out.println(maxPay);
    }

    static class Consult {
        int days;
        int pays;

        public Consult(String in) {
            int[] input = Arrays.stream(in.split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            this.days = input[0];
            this.pays = input[1];
        }
    }
}
```

> **성능 개선 팁**: `N = 1,500,000`으로 입력 줄 수가 매우 많기 때문에 `Arrays.stream(in.split(" "))` 대신 `StringTokenizer`를 사용하면 메모리 사용량(현재 약 360MB)과 실행 시간(1500ms)을 크게 줄일 수 있습니다.

---

## 채점 결과

![백준 15486 퇴사 2 맞았습니다 결과](/images/posts/boj-15486-resignation-2/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N)` — `1`일부터 `N + 1`일까지 단 한 번 선형 탐색
- **공간 복잡도**: `O(N)` — 크기 `N + 2`의 `dp` 배열과 `Consult` 배열 사용
