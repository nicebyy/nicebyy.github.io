---
title: '[BOJ 13458] 시험 감독 (Java) - 그리디 나눗셈과 long 오버플로우 주의사항'
date: '2022-05-30'
category: PS/BOJ
tags:
  - BOJ
  - 수학
  - 구현
  - 그리디
  - Java
  - Bronze II
summary: >-
  백준 13458번(시험 감독) 문제에서 시험장별 총감독관 1명 필수 배치 조건과 부감독관 올림 나눗셈 처리, 그리고 최대 10^12까지 커지는 정답에 long 타입을 사용해야 하는 이유를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 13458번 - 시험 감독](https://www.acmicpc.net/problem/13458)
- **난이도**: Bronze II
- **시간 / 메모리 제한**: `2초` / `512 MB`

### 핵심 조건 요약

- 총 `N`개의 시험장이 있으며, `i`번 시험장의 응시자 수는 `A_i`명입니다.
- **총감독관**: 한 시험장에서 최대 `B`명 감시 가능 (**각 시험장마다 오직 1명만 반드시 배치**)
- **부감독관**: 한 시험장에서 최대 `C`명 감시 가능 (**여러 명 배치 가능**)
- 모든 시험장의 응시생을 감시하기 위해 필요한 **감독관 수의 최솟값**을 구해야 합니다.

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 시험장 개수 `N` | `1 ≤ N ≤ 1,000,000` | — |
| 응시자 수 `A_i` | `1 ≤ A_i ≤ 1,000,000` | — |
| 감시 가능 인원 `B, C` | `1 ≤ B, C ≤ 1,000,000` | 최악의 경우 결과값 `10^12` (**`long` 필수**) |

---

## 접근 아이디어

시험장끼리 서로 영향을 주지 않으므로 각 시험장마다 독립적으로 최소 감독관 수를 계산해 합산하면 됩니다.

1. **총감독관 1명 우선 배치**: 모든 시험장에는 총감독관이 **반드시 1명** 들어가야 합니다.
   - `A_i -= B`
   - `answer += 1`
2. **남은 인원에 대한 부감독관 배치**:
   - 만약 `A_i <= 0`이라면 총감독관 1명만으로 충분하므로 부감독관이 필요 없습니다.
   - `A_i > 0`이라면 남은 인원을 부감독관 감시 인원 `C`로 나눈 올림값만큼 부감독관을 추가합니다.
     - `answer += A_i / C`
     - `if (A_i % C > 0) answer++`

### 핵심 함정: `int` 오버플로우

- `N = 1,000,000`개의 시험장에 각각 `A_i = 1,000,000`명의 응시자가 있고, `B = 1, C = 1`이라면 필요한 감독관 수는 **`1,000,000 × 1,000,000 = 10^12`명**입니다.
- Java의 `int` 최댓값은 약 `2.14 × 10^9`이므로 정답 변수 `answer`는 반드시 **`long`**으로 선언해야 합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static java.util.Arrays.stream;

public class Main {

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] arr = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();

        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        int b = input[0];
        int c = input[1];

        // 최악의 경우 10^12까지 커질 수 있으므로 반드시 long 사용
        long answer = 0;

        for (int i = 0; i < n; i++) {
            // 1. 각 시험장에 총감독관 1명 필수 배치
            arr[i] -= b;
            answer++;

            if (arr[i] <= 0) {
                continue;
            }

            // 2. 남은 응시자 수를 부감독관 감시 인원 C로 올림 나눗셈
            answer += arr[i] / c;
            if (arr[i] % c > 0) {
                answer++;
            }
        }

        System.out.println(answer);
    }
}
```

> **참고**: 시험장 간 순서가 결과에 영향을 미치지 않으므로 입력 배열을 정렬할 필요가 없으며, `O(N)` 선형 순회만으로 충분합니다.

---

## 복잡도 분석

- **시간 복잡도**: `O(N)` — `N`개의 시험장을 한 번씩 순회
- **공간 복잡도**: `O(N)` — 시험장 인원 배열 저장 (`StringTokenizer`로 읽으면서 즉시 계산하면 `O(1)` 공간으로도 가능)
