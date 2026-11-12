---
title: '[BOJ 17124] 두 개의 배열 (Java) - TreeSet의 lower/higher를 활용한 근삿값 탐색'
date: '2022-05-14'
category: PS/BOJ
tags:
  - BOJ
  - 이분탐색
  - TreeSet
  - Java
  - Silver III
summary: >-
  백준 17124번(두 개의 배열) 문제에서 A의 각 원소와 가장 가까운 B의 원소를 찾기 위해 TreeSet의 lower/higher 메서드를 활용하는 방법과 정렬+이분 탐색 최적화 포인트를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 17124번 - 두 개의 배열](https://www.acmicpc.net/problem/17124)
- **난이도**: Silver III
- **시간 / 메모리 제한**: `2초` / `512 MB`

### 핵심 조건 요약

- 서로 다른 양의 정수로 이루어진 길이 `n`의 배열 `A`와 길이 `m`의 배열 `B`가 주어집니다.
- 새로운 배열 `C`의 각 원소 `C[i]`는 **배열 `B`에서 `A[i]`와 절댓값 차이가 가장 작은 값**으로 정의합니다.
- 차이가 같은 값이 두 개 존재한다면 **더 작은 값**을 선택합니다.
- 각 테스트 케이스마다 배열 `C`의 모든 원소 합을 출력합니다.

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 테스트 케이스 `T` | `1 ≤ T ≤ 10` | — |
| 배열 크기 `n, m` | `1 ≤ n, m ≤ 10^6` | `O(n × m)` 불가, `O((n + m) log m)` 필요 |
| 원소 크기 | `1 ≤ 값 ≤ 10^9` | 원소 합은 최대 `10^15` 가능 (**`long` 필수**) |

---

## 접근 아이디어

`n, m`이 최대 `10^6`이므로, `A`의 원소마다 `B` 전체를 선형 탐색하면 `O(n × m)`으로 시간 초과가 발생합니다.
배열 `B`를 정렬 또는 균형 이진 탐색 트리(`TreeSet`)에 넣어 두면, `A[i]`가 들어갈 위치의 **바로 앞 원소(`lower`)**와 **바로 뒤 원소(`higher`)**만 비교해 `O(log m)`에 가장 가까운 값을 찾을 수 있습니다.

### `TreeSet`의 `lower` / `higher` 활용 흐름

1. 기준 배열 `B`의 모든 원소를 `TreeSet<Integer>` `setB`에 삽입합니다.
2. `listA`의 각 원소 `e`를 순회하며 다음을 판별합니다.
   - **`setB.contains(e)`인 경우**: 차이가 `0`이므로 `result = e`
   - **없는 경우**: `setB`에 임시로 `e`를 추가한 뒤 `lower(e)`(미만 최대), `higher(e)`(초과 최소)를 조회합니다. (또는 삽입 없이 `floor(e)`/`ceiling(e)`로도 동일하게 조회 가능)
     - `lower == null` → `e`가 최솟값이므로 `result = higher`
     - `higher == null` → `e`가 최댓값이므로 `result = lower`
     - 둘 다 존재 → `Math.abs(e - lower) <= Math.abs(e - higher)`이면 **더 작은 값 우선 규칙**에 따라 `lower`, 아니면 `higher` 선택
   - 임시로 넣은 `e`는 다시 제거합니다.
3. 구한 `result`를 `long sum`에 누적합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.TreeSet;
import java.util.stream.Collectors;

import static java.util.Arrays.stream;

public class Main {

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int tc = Integer.parseInt(br.readLine());
        while (tc-- > 0) {
            br.readLine(); // n, m 줄 스킵

            // 최대 10^6 * 10^9 = 10^15까지 합산될 수 있으므로 long 사용
            long sum = 0L;

            ArrayList<Integer> listA = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .boxed()
                    .collect(Collectors.toCollection(ArrayList::new));

            TreeSet<Integer> setB = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .boxed()
                    .collect(Collectors.toCollection(TreeSet::new));

            for (Integer e : listA) {
                int result = e;

                if (!setB.contains(e)) {
                    setB.add(e);
                    Integer lower = setB.lower(e);
                    Integer higher = setB.higher(e);

                    if (lower == null) {
                        result = higher;
                    } else if (higher == null) {
                        result = lower;
                    } else {
                        // 거리가 같을 때는 더 작은 값(lower) 선택
                        result = Math.abs(e - lower) <= Math.abs(e - higher) ? lower : higher;
                    }

                    setB.remove(e);
                }
                sum += result;
            }
            System.out.println(sum);
        }
    }
}
```

### 성능 개선 포인트

- **`floor(e)` / `ceiling(e)` 활용**: `setB.add(e)`와 `setB.remove(e)`를 매번 호출하면 트리 균형 회전이 반복되므로, 삽입/삭제 없이 **`setB.floor(e)`**(이하 최대)와 **`setB.ceiling(e)`**(이상 최소)를 호출하면 훨씬 빠릅니다.
- **`int[]` + `Arrays.sort()` + `Arrays.binarySearch()`**: `TreeSet`은 노드 객체 박싱 오버헤드(메모리 약 305MB)가 크므로, `B`를 `int[]`로 정렬한 뒤 이분 탐색하면 메모리와 시간을 대폭 절약할 수 있습니다.

---

## 채점 결과

![백준 17124 두 개의 배열 맞았습니다 결과](/images/posts/boj-17124-two-arrays/result.png)

---

## 복잡도 분석

- **시간 복잡도**: 테스트 케이스당 `O((n + m) log m)`
- **공간 복잡도**: `O(n + m)` — 배열 `A`와 `TreeSet<Integer>` `B` 저장 공간
