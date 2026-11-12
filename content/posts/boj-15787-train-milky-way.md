---
title: '[BOJ 15787] 기차가 어둠을 헤치고 은하수를 (Java) - 20비트 마스킹 시뮬레이션'
date: '2022-05-19'
category: PS/BOJ
tags:
  - BOJ
  - 비트마스킹
  - 구현
  - 시뮬레이션
  - Java
  - Silver II
summary: >-
  백준 15787번(기차가 어둠을 헤치고 은하수를) 문제에서 N과 M이 최대 100,000일 때 기차 20개 좌석 상태를 int 비트마스크 하나로 압축해 4가지 명령을 O(1)로 처리하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 15787번 - 기차가 어둠을 헤치고 은하수를](https://www.acmicpc.net/problem/15787)
- **난이도**: Silver II
- **시간 / 메모리 제한**: `1초` / `512 MB`

### 핵심 조건 요약

- `N`개의 기차가 있으며, 각 기차에는 **20개의 일렬 좌석(`1 ~ 20`번)**이 있습니다.
- `M`개의 명령을 순서대로 수행한 뒤, 1번 기차부터 차례로 은하수를 건너며 **승객 배치 상태가 중복되지 않은 기차의 수**를 구해야 합니다.

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 기차 수 `N` | `1 ≤ N ≤ 100,000` | — |
| 명령 수 `M` | `1 ≤ M ≤ 100,000` | 매 명령당 좌석 전체 시프트 시에도 `O(1)` 필요 |
| 좌석 번호 `x` | `1 ≤ x ≤ 20` | `int` 32비트 중 `1 ~ 20`번 비트 활용 |

---

## 접근 아이디어

기차 수 `N`과 명령 수 `M`이 각각 최대 `100,000`입니다.
만약 기차 좌석을 `boolean[N][20]`으로 두고 `3`, `4`번 명령(전체 승객 한 칸씩 이동)마다 20번 루프를 돌며 마지막에 문자열로 직렬화해 중복 검사까지 하면 번거롭고 느려질 수 있습니다.

좌석 수가 **20개**뿐이므로 **`int` 정수 하나(32비트)에 기차 한 대의 전체 좌석 상태를 비트마스크로 압축**하면 모든 명령과 중복 제거를 매우 빠르게 처리할 수 있습니다.

### 1. 좌석 번호와 비트 위치 매핑 (`1 ~ 20`번 비트)

좌석 번호 `x`가 `1`부터 `20`까지 주어지므로 인덱스 변환 없이 그대로 `1 << x` 비트를 `x`번 좌석으로 매핑합니다. (총 `0 ~ 20`번까지 21비트 중 `1 ~ 20`번 비트를 사용하며, `0`번 비트는 항상 `0`으로 유지합니다.)

### 2. 4가지 명령의 비트 연산

| 명령 | 의미 | 비트 연산 | 설명 |
| :--- | :--- | :--- | :--- |
| `1 i x` | `x`번 좌석 승차 | `trains[i] |= (1 << x)` | `x`번 비트를 `1`로 설정 |
| `2 i x` | `x`번 좌석 하차 | `trains[i] &= ~(1 << x)` | `x`번 비트만 `0`으로 해제 |
| `3 i` | 모두 한 칸 뒤로 (`k -> k+1`) | `trains[i] <<= 1;`<br>`trains[i] &= ((1 << 21) - 1);` | 왼쪽 시프트 후 `21`번 이상 비트 마스킹 제거 (20번 좌석 하차) |
| `4 i` | 모두 한 칸 앞으로 (`k -> k-1`) | `trains[i] >>= 1;`<br>`trains[i] &= ~1;` | 오른쪽 시프트 후 `0`번 비트(`~1`) 제거 (1번 좌석 하차) |

### 3. 자주 쓰는 비트마스크 기본 연산 정리

| 연산 | 사용 예시 (Java) |
| :--- | :--- |
| 공집합 / 꽉 찬 집합(`n`비트) | `A = 0;` / `A = (1 << n) - 1;` |
| 원소 추가 | `A |= (1 << k);` |
| 원소 삭제 | `A &= ~(1 << k);` |
| 원소 포함 여부 확인 | `if ((A & (1 << k)) != 0)` |
| 원소 토글 (Toggle) | `A ^= (1 << k);` |
| 집합 크기 (켜진 비트 수) | `Integer.bitCount(A)` |
| 최소 원소(최하위 `1`비트) 찾기 | `int lsb = A & (-A);` |
| 최소 원소 지우기 | `A &= (A - 1);` |

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static java.util.Arrays.stream;

public class Main {

    static int n, m;
    static int[] trains;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        n = input[0];
        m = input[1];
        trains = new int[n + 1];

        for (int i = 0; i < m; i++) {
            input = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();

            int command = input[0];
            int index = input[1];
            int seat = input.length == 2 ? 0 : input[2];

            switch (command) {
                case 1 -> trains[index] |= (1 << seat);
                case 2 -> trains[index] &= ~(1 << seat);
                case 3 -> {
                    trains[index] <<= 1;
                    trains[index] &= ((1 << 21) - 1); // 20번 좌석 초과 비트(21번 비트 이상) 제거
                }
                case 4 -> {
                    trains[index] >>= 1;
                    trains[index] &= ~1; // 1번 좌석에서 0번 비트로 밀려난 승객 하차 처리
                }
            }
        }

        // 1번부터 N번 기차까지 중복되지 않은 상태의 개수 카운트
        int ans = (int) stream(trains, 1, n + 1)
                .distinct()
                .count();

        System.out.println(ans);
    }
}
```

---

## 채점 결과

![백준 15787 기차가 어둠을 헤치고 은하수를 맞았습니다 결과](/images/posts/boj-15787-train-milky-way/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(M + N)` — 각 명령을 비트 연산 `O(1)`로 처리하고, `distinct()` 역시 내부 `HashSet` 기반으로 `O(N)`에 동작합니다.
- **공간 복잡도**: `O(N)` — `N + 1` 크기의 `int` 배열 및 중복 제거용 해시 집합 공간 사용
