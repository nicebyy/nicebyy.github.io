---
title: '[BOJ 2980] 도로와 신호등 (Java) - 모듈러(%) 사이클 계산 시뮬레이션'
date: '2022-04-08'
category: PS/BOJ
tags:
  - BOJ
  - 구현
  - 시뮬레이션
  - 수학
  - Java
  - Silver IV
summary: >-
  백준 2980번(도로와 신호등) 문제에서 신호등의 (빨간불 + 초록불) 주기 대비 현재 경과 시각을 나머지 연산(%)으로 계산해 대기 시간을 합산하는 간단한 시뮬레이션 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 2980번 - 도로와 신호등](https://www.acmicpc.net/problem/2980)
- **난이도**: Silver IV
- **시간 / 메모리 제한**: `1초` / `128 MB`

### 핵심 조건 요약

- 트럭이 `0`미터에서 출발해 1초에 1미터씩 이동하며 길이 `L`(`1 ≤ L ≤ 1,000`)미터 도로 끝까지 갑니다.
- `N`(`1 ≤ N ≤ 100`)개의 신호등은 위치 `D` 증가 순으로 주어지며, 각각 빨간불 `R`초 · 초록불 `G`초(`1 ≤ R, G ≤ 100`)를 무한히 반복합니다. (출발 시 모든 신호등은 빨간불 시작)

---

## 접근 아이디어

신호등 위치 `D`가 오름차순으로 주어지므로, 이전 위치 `curPos`에서 다음 신호등 `D`까지 순서대로 이동하면서 경과 시간 `time`을 누적하면 됩니다.

1. **이동 시간 가산**: `time += D - curPos`, `curPos = D`
2. **현재 신호등 색상 판별**:
   - 신호등 한 사이클의 길이는 `R + G`입니다.
   - `section = time % (R + G)`를 구했을 때:
     - **`section < R`**: 현재 빨간불 구간이므로 초록불로 바뀔 때까지 **`R - section`초 대기** (`time += R - section`)
     - **`section >= R`**: 현재 초록불 구간이므로 대기 없이 통과
3. **마지막 신호등 이후 잔여 거리**: 모든 신호등을 지난 뒤 도로 끝 `L`까지 남은 거리 `L - curPos`를 더해 출력합니다.

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
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        int n = input[0], len = input[1];
        int curPos = 0, time = 0;

        for (int i = 0; i < n; i++) {
            int[] arr = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            // arr = { 위치 D, 빨간불 지속시간 R, 초록불 지속시간 G }
            time += arr[0] - curPos;
            curPos = arr[0];

            int section = time % (arr[1] + arr[2]);
            if (section < arr[1]) {
                time += arr[1] - section;
            }
        }

        // 마지막 신호등에서 도로 끝(len)까지 남은 이동 시간 합산
        System.out.println(time + len - curPos);
    }
}
```

---

## 채점 결과

![백준 2980 도로와 신호등 맞았습니다 결과](/images/posts/boj-2980-road-and-traffic-lights/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N)` — 신호등 개수 `N ≤ 100`만큼 한 번 순회
- **공간 복잡도**: `O(1)` — 별도 배열 없이 상수 공간만 사용
