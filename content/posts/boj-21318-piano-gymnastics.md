---
title: '[BOJ 21318] 피아노 체조 (Java) - 구간 실수 횟수 누적합(Prefix Sum) 풀이'
date: '2024-06-22'
category: PS/BOJ
tags:
  - BOJ
  - 누적합
  - Java
  - Silver I
  - 알고리즘
summary: >-
  백준 21318번(피아노 체조) 문제에서 N과 Q가 최대 100,000이고 시간 제한이 0.5초일 때, 구간 내 실수 횟수를 누적합(Prefix Sum)으로 전처리해 O(N + Q)에 해결하는 방법을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 21318번 - 피아노 체조](https://www.acmicpc.net/problem/21318)
- **난이도**: Silver I
- **시간 / 메모리 제한**: `0.5초` / `1024 MB`

### 핵심 조건 요약

- `1`번부터 `N`번까지 총 `N`개의 악보가 있으며, 각 악보에는 난이도(`1 ~ 10^9`)가 주어집니다.
- `x`번부터 `y`번까지 번호 순서대로 연주할 때, **`i`번 악보의 난이도가 `i + 1`번 악보의 난이도보다 높으면(`arr[i] > arr[i + 1]`)** `i`번 악보에서 실수합니다.
- **중요 예외**: 구간의 **마지막으로 연주하는 `y`번 악보에서는 절대 실수하지 않습니다.**
- `Q`개의 질의 `(x, y)`에 대해 각 구간에서 실수하는 곡의 개수를 출력합니다.

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 악보 개수 `N` | `1 ≤ N ≤ 100,000` | 악보 난이도는 최대 `10^9` |
| 질문 개수 `Q` | `1 ≤ Q ≤ 100,000` | 매 쿼리 `O(N)` 순회 불가 |
| 구간 `[x, y]` | `1 ≤ x ≤ y ≤ N` | `x == y`이면 실수 횟수는 `0` |

---

## 접근 아이디어

질문 개수 `Q`와 악보 개수 `N`이 모두 최대 `100,000`이고 **시간 제한이 `0.5초`**로 매우 빡빡합니다.
매 쿼리마다 `x`부터 `y - 1`까지 직접 반복문을 돌면 최악의 경우 `O(N × Q) = 10^10` 연산이 발생해 즉시 시간 초과가 납니다.

하지만 각 위치 `i`에서 다음 곡 `i + 1`로 넘어갈 때 실수 여부(`0` 또는 `1`)는 **쿼리 구간과 무관하게 항상 고정**되어 있습니다.
따라서 **누적합(Prefix Sum)** 배열 `dp`를 한 번만 만들어 두면, 각 질의 `(x, y)`를 `O(1)` 시간에 답할 수 있습니다.

### 인덱스 오프셋 설계 (`dp[y - 1] - dp[x - 1]`)

여기서 가장 헷갈리기 쉬운 부분이 **구간의 끝점 `y` 처리**입니다.

- `mistake[i]`를 "`i`번 악보에서 `i + 1`번 악보로 넘어갈 때 실수하면 `1`, 아니면 `0`"이라고 정의합니다.
- `dp[k]`를 `1`번부터 `k`번 악보까지 연주하며 발생한 누적 실수 횟수(`mistake[1] + ... + mistake[k]`)로 둡니다.

구간 `[x, y]`를 연주할 때 실수가 발생할 수 있는 위치는 `x, x + 1, ..., y - 1`까지입니다. (`y`번 악보는 마지막 곡이므로 다음 곡과 비교하지 않고 실수하지 않습니다.)

따라서 구간 `[x, y]`의 총 실수 횟수는 다음과 같습니다.

```text
mistake[x] + mistake[x + 1] + ... + mistake[y - 1]
= dp[y - 1] - dp[x - 1]
```

> **Tip**: `x == y`인 경우에도 `dp[x - 1] - dp[x - 1] = 0`이 되어 별도 분기 없이 정확히 `0`이 나옵니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static java.util.Arrays.stream;

public class Main {

    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

    public static void main(String[] args) throws IOException {
        int n = Integer.parseInt(br.readLine());

        // 1-based 인덱싱을 위해 맨 앞에 더미 "0 " 추가
        int[] arr = stream(("0 " + br.readLine()).split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();

        int[] dp = new int[n + 1];
        // i = 1 비교 시 arr[1] < arr[0]이 false가 되도록 arr[0] = arr[1]로 맞춤
        arr[0] = arr[1];

        for (int i = 1; i <= n; i++) {
            if (arr[i] < arr[i - 1]) { // i-1번째 곡이 i번째 곡보다 어렵다면 i-1번째에서 실수 +1
                dp[i - 1]++;
            }
            dp[i] = dp[i - 1]; // 누적합 전파
        }

        int queryCount = Integer.parseInt(br.readLine());
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < queryCount; i++) {
            int[] query = stream(br.readLine().split(" "))
                    .mapToInt(e -> Integer.parseInt(e) - 1)
                    .toArray();

            // [x, y] 구간 실수 = dp[y - 1] - dp[x - 1]
            // - y번 곡(마지막 곡)에서는 실수하지 않으므로 y - 1까지만 포함
            // - x번 곡에서의 실수는 포함해야 하므로 x - 1까지의 누적합을 차감
            result.append(dp[query[1]] - dp[query[0]]).append('\n');
        }

        System.out.print(result);
    }
}
```

### 코드 핵심 포인트

1. **초기값 트릭 (`arr[0] = arr[1]`)**: 반복문을 `i = 1`부터 돌면서 `arr[i] < arr[i - 1]`을 검사할 때 `dp[0]`이 불필요하게 증가하지 않도록 방지합니다.
2. **`dp[i] = dp[i - 1]`의 의미**: 현재 인덱스 `i`에서의 실수는 다음 원소(`i + 1`)를 볼 때 `dp[i]`가 증가하는 구조이므로, 매 스텝마다 직전 누적합을 그대로 다음 칸으로 복사해 둡니다.
3. **`StringBuilder` 출력 모으기**: `Q`가 최대 `100,000`이므로 `System.out.println`을 매번 호출하지 않고 `StringBuilder`에 모아 한 번에 출력해 `0.5초` 제한을 여유 있게 통과합니다.

> **참고 (입출력 최적화)**: `stream(...split(" "))` 대신 `StringTokenizer`를 사용하면 10만 개 정수 파싱 시 객체 생성과 GC 부담을 더욱 줄일 수 있습니다.

---

## 복잡도 분석

- **시간 복잡도**: `O(N + Q)` — 누적합 배열 생성 `O(N)` + `Q`개 쿼리당 `O(1)` 응답
- **공간 복잡도**: `O(N)` — 크기 `N + 1`의 난이도 배열과 누적합 배열 사용
