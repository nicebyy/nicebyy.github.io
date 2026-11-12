---
title: '[BOJ 1107] 리모컨 (Java) - 탐색 상한 999,999와 M=0 입력 예외 처리'
date: '2022-04-15'
category: PS/BOJ
tags:
  - BOJ
  - 브루트포스
  - 구현
  - Java
  - Gold V
summary: >-
  백준 1107번(리모컨) 문제에서 목표 채널이 최대 500,000임에도 999,999까지 완전 탐색해야 하는 이유와, 고장난 버튼이 0개(M=0)일 때 입력 줄이 주어지지 않아 발생하는 런타임 에러 방지 포인트를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1107번 - 리모컨](https://www.acmicpc.net/problem/1107)
- **난이도**: Gold V
- **시간 / 메모리 제한**: `2초` / `256 MB`

### 핵심 조건 요약

- 리모컨에는 숫자 버튼(`0 ~ 9`)과 `+`, `-` 버튼이 있으며, 현재 보고 있는 채널은 **`100`번**입니다.
- 목표 채널 `N`(`0 ≤ N ≤ 500,000`)으로 이동하기 위해 버튼을 **최소 몇 번** 눌러야 하는지 구해야 합니다.
- 고장 난 숫자 버튼의 개수 `M`(`0 ≤ M ≤ 10`)이 주어집니다.

---

## 접근 아이디어

목표 채널 `N`으로 가는 방법은 크게 두 가지입니다.

1. **숫자 버튼을 전혀 누르지 않고 `100`번에서 `+` / `-`만 눌러 이동**: `Math.abs(100 - N)`
2. **고장 나지 않은 숫자 버튼으로 임의의 채널 `i`를 직접 누른 뒤, `i`에서 `+` / `-`로 `N`까지 이동**: `digits(i) + Math.abs(i - N)`

### 1. 왜 `500,000`이 아니라 `999,999`까지 탐색할까?

예를 들어 목표 채널 `N = 500,000`이고, 고장 난 버튼이 `1, 2, 3, 4, 5`라고 가정해 봅시다.
`500,000` 이하의 채널 중 가장 가까운 `99,999`에서 올라가는 것(`5 + 400,001 = 400,006`회)보다, **`600,000`에서 `-`로 내려오는 것(`6 + 100,000 = 100,006`회)**이 훨씬 적습니다!
`N ≤ 500,000`일 때 `100`에서 `500,000`까지 `+`만 누르면 `499,900`번이므로, `1,000,000` 이상의 7자리 채널로 점프해서 내려오는 경우는 절대 최솟값이 될 수 없습니다. 따라서 **`0 ~ 999,999`** 범위만 완전 탐색하면 모든 최적 해를 빠짐없이 찾을 수 있습니다.

### 2. 주의할 입력 예외: `M == 0`인 경우

문제 조건에 *"고장난 버튼이 있는 경우에는 셋째 줄에는 고장난 버튼이 주어지며"*라고 명시되어 있습니다. 즉 **`M == 0`이면 셋째 줄 자체가 입력으로 들어오지 않습니다!**
이 조건을 확인하지 않고 `br.readLine()`을 무조건 호출하면 `NullPointerException`이 발생하므로 반드시 `if (m != 0)` 분기를 두어야 합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static java.util.Arrays.stream;

public class Main {

    static int m, target;
    static boolean[] isBroken = new boolean[10];

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        target = Integer.parseInt(br.readLine());
        m = Integer.parseInt(br.readLine());

        // 고장 난 버튼이 0개이면 셋째 줄 입력이 존재하지 않으므로 반드시 분기 처리
        if (m != 0) {
            stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .forEach(e -> isBroken[e] = true);
        }

        // 초기값: 100번 채널에서 +, - 버튼만으로 이동하는 횟수
        int ans = Math.abs(100 - target);

        // 0 ~ 999,999 채널을 직접 입력한 뒤 target까지 +/- 이동하는 최소 횟수 탐색
        for (int i = 0; i <= 999_999; i++) {
            String cur = Integer.toString(i);
            boolean hasBroken = false;

            for (int j = 0; j < cur.length(); j++) {
                if (isBroken[cur.charAt(j) - '0']) {
                    hasBroken = true;
                    break;
                }
            }

            if (!hasBroken) {
                ans = Math.min(ans, cur.length() + Math.abs(i - target));
            }
        }

        System.out.println(ans);
    }
}
```

> **팁**: `Integer.toString(i)` 대신 `i % 10`, `i /= 10` 나눗셈 루프로 자릿수를 판별하면 `1,000,000`개의 `String` 객체 생성을 없애 메모리와 실행 시간을 훨씬 절약할 수 있습니다. (단, `i == 0`일 때 길이가 `1`임에 유의!)

---

## 채점 결과

![백준 1107 리모컨 맞았습니다 결과](/images/posts/boj-1107-remote-control/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(K × D)` (`K = 1,000,000`, 최대 자릿수 `D = 6`) — 약 `6 × 10^6` 연산으로 `2초` 내 충분
- **공간 복잡도**: `O(1)` — 크기 `10`의 고장 여부 배열 사용
