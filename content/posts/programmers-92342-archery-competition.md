---
title: '[프로그래머스] 양궁대회 (Level 2, Java) - 중복 조합 DFS와 동점 우선순위 큐'
date: '2022-02-14'
category: PS/Programmers
tags:
  - Programmers
  - 백트래킹
  - 완전탐색
  - PriorityQueue
  - 카카오기출
  - Java
  - Level 2
summary: >-
  2022 카카오 블라인드 공채 기출 '양궁대회' 문제에서 라이언이 화살 n발을 쏘는 모든 중복 조합을 DFS로 탐색하고, 최대 점수 차가 같을 때 가장 낮은 점수를 많이 맞힌 조합을 PriorityQueue로 선별하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [프로그래머스 - 양궁대회 (92342)](https://school.programmers.co.kr/learn/courses/30/lessons/92342)
- **난이도**: Level 2 (`2022 KAKAO BLIND RECRUITMENT`)

### 핵심 조건 요약

- 어피치가 `10점 ~ 0점` 과녁에 맞힌 화살 수 배열 `info`와 화살 총 개수 `n`(`1 ≤ n ≤ 10`)이 주어집니다.
- 각 점수 `k`(`10 - i`)에 대해 **라이언이 어피치보다 더 많은 화살을 맞히면 라이언이 `k`점을 획득**, 같거나 적으면 **어피치가 `k`점을 획득**합니다. (둘 다 `0`발이면 아무도 점수 없음)
- 라이언이 **가장 큰 점수 차이**로 우승할 수 있는 과녁 배치 배열을 반환합니다. (우승 불가 시 `[-1]`)
- 동점 조합이 여러 개라면 **가장 낮은 점수를 더 많이 맞힌 경우**를 반환합니다.

---

## 접근 아이디어

과녁 칸이 `11`개(`10점 ~ 0점`)이고 화살 개수 `n`이 최대 `10`발이므로, `11`개의 과녁에 중복을 허용해 `n`발을 분배하는 **중복 조합(`H(11, 10) = C(20, 10) = 184,756`가지)**을 모두 탐색할 수 있습니다.

1. **중복 조합 DFS**: `dfs(cur, depth)`에서 `next = cur`부터 `10`까지 선택해 `ryan[next]++`를 늘려가며 `depth == n`에 도달하면 점수를 정산합니다.
2. **점수 정산 및 최댓값 갱신**:
   - `appeach[i] < ryan[i]` → `ryanSum += (10 - i)`
   - `else if (appeach[i] != 0)` → `appeachSum += (10 - i)`
   - `ryanSum <= appeachSum`이거나 기존 `max`보다 점수 차가 작으면 탈락
   - `ryanSum - appeachSum > max`이면 `max`를 갱신하고 `answer` 우선순위 큐를 `clear()`합니다.
3. **동점 타이브레이킹 (`PriorityQueue`)**:
   - `i = 10`(0점 과녁)부터 `0`(10점 과녁)까지 역순으로 비교해 `o2[i] - o1[i]`로 정렬하면, **가장 낮은 점수를 더 많이 맞힌 배열**이 큐의 맨 앞에 위치합니다.

---

## Java 풀이 코드

```java
import java.util.PriorityQueue;
import java.util.Queue;

class Solution {

    int[] appeach, ryan;
    int n, max;

    // 가장 낮은 점수(인덱스 10 → 0 순)를 많이 맞힌 배치가 우선되도록 정렬
    Queue<int[]> answer = new PriorityQueue<>((o1, o2) -> {
        for (int i = 10; i >= 0; i--) {
            if (o1[i] != o2[i]) {
                return o2[i] - o1[i];
            }
        }
        return 0;
    });

    public int[] solution(int n, int[] info) {
        init(n, info);
        dfs(0, 0);

        if (answer.isEmpty()) {
            return new int[]{-1};
        }
        return answer.poll();
    }

    private void init(int n, int[] info) {
        this.appeach = info.clone();
        this.ryan = new int[11];
        this.n = n;
        this.max = -1;
    }

    public void dfs(int cur, int depth) {
        if (depth == n) {
            int appeachSum = 0, ryanSum = 0;
            for (int i = 0; i <= 10; i++) {
                if (appeach[i] < ryan[i]) {
                    ryanSum += 10 - i;
                } else if (appeach[i] != 0) {
                    appeachSum += 10 - i;
                }
            }

            // 라이언이 이기지 못하거나 기존 최대 점수 차보다 작으면 무시
            if (ryanSum <= appeachSum || ryanSum - appeachSum < max) {
                return;
            }

            if (ryanSum - appeachSum > max) {
                max = ryanSum - appeachSum;
                answer.clear();
            }
            answer.add(ryan.clone());
            return;
        }

        for (int next = cur; next <= 10; next++) {
            ryan[next]++;
            dfs(next, depth + 1);
            ryan[next]--;
        }
    }
}
```

> **최적화 팁 (`O(2^11)`)**: 각 과녁 `i`에서 라이언이 선택할 수 있는 유의미한 행동은 딱 두 가지뿐입니다: **"어피치보다 1발 더 쏴서 점수를 가져오거나(`info[i] + 1`), `0`발 쏴서 포기하거나"**. (남은 화살은 모두 0점(`ryan[10]`)에 몰아줍니다.) 이 방식은 탐색 횟수가 최대 **`2^11 = 2,048`번**으로 줄어 훨씬 빠르게 동작합니다.

---

## 채점 결과

![프로그래머스 양궁대회 통과 결과](/images/posts/programmers-92342-archery-competition/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(H(11, n))` — `n = 10`일 때 약 `184,756` 상태 탐색 (이진 선택 최적화 시 `O(2^11)`)
- **공간 복잡도**: `O(n)` — 크기 `11` 과녁 배열 및 깊이 `n` 재귀 스택
