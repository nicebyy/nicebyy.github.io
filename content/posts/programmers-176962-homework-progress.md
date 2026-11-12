---
title: '[프로그래머스] 과제 진행하기 (Level 2, Java) - 스택(Stack) 기반 시간 시뮬레이션'
date: '2023-09-17'
category: PS/Programmers
tags:
  - Programmers
  - 스택
  - 구현
  - 시뮬레이션
  - Java
  - Level 2
summary: >-
  프로그래머스 Level 2 과제 진행하기 문제에서 시작 시각 순 정렬과 LIFO 스택을 결합해 중단된 과제를 우선순위에 맞게 이어서 처리하는 시뮬레이션 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [프로그래머스 - 과제 진행하기 (176962)](https://school.programmers.co.kr/learn/courses/30/lessons/176962)
- **난이도**: Level 2

### 핵심 조건 요약

- 과제 정보 `[name, start, playtime]` 배열 `plans`(`3 ≤ plans.length ≤ 1,000`)가 주어집니다. (시간순으로 정렬되어 있지 않을 수 있습니다.)
- `start`는 `"00:00"` ~ `"23:59"` 형식이며, **모든 과제의 시작 시각은 서로 다릅니다.** (`1 ≤ playtime ≤ 100`)
- 진행 규칙:
  1. 새 과제를 시작할 시각이 되면 기존 과제를 멈추고 새 과제를 시작합니다.
  2. 진행 중인 과제를 끝냈을 때 잠시 멈춘 과제가 있다면 이어서 진행합니다.
  3. **만약 과제를 끝낸 시각에 새로 시작해야 하는 과제와 멈춰둔 과제가 모두 있다면, 새 과제부터 진행합니다.**
  4. 멈춰둔 과제가 여러 개라면 **가장 최근에 멈춘 과제(LIFO)**부터 시작합니다.

---

## 접근 아이디어

과제 진행의 핵심 우선순위는 두 가지입니다.
1. **예정된 시작 시각이 가장 빠른 새 과제** (`LinkedList` / 정렬된 큐)
2. **가장 최근에 멈춘 과제** (`Stack` — LIFO 구조)

### 시뮬레이션 상태 전이 흐름

1. `plans`를 시작 시각(`start`) 기준 오름차순으로 정렬해 대기열 `list`에 담습니다.
2. 현재 처리할 과제 `plan`을 꺼냅니다.
   - 직전 과제를 끝낸 뒤 다음 새 과제 시작 시각까지 **여유 시간이 남았고**, 멈춘 과제 스택(`delayPlans`)이 비어 있지 않다면 `delayPlans.pop()`을 꺼내 처리합니다.
   - 그렇지 않다면 `list.poll()`로 다음 새 과제를 시작하고, `currentTime`을 해당 과제의 시작 시각으로 맞춥니다.
3. 대기열에 다음 새 과제(`nextPlan`)가 남아 있을 때, 현재 과제의 예상 완료 시각 `estimatedTime = currentTime + plan.duration`과 `nextPlan.time`을 비교합니다.
   - `estimatedTime > nextPlan.time`: 다음 과제 시작 전까지 끝내지 못하므로 **경과 시간(`nextPlan.time - currentTime`)만큼 `duration`을 차감한 뒤 `delayPlans` 스택에 푸시**합니다.
   - `estimatedTime <= nextPlan.time`: 현재 과제를 완료(`answer.add(plan.name)`)합니다. 이때 `estimatedTime < nextPlan.time`이고 멈춘 과제가 남아 있다면, `currentTime = estimatedTime`으로 갱신하고 다음 루프에서 스택의 과제를 이어서 처리합니다(`delayedPlanProcFlag = true`).
4. 새 과제 대기열 `list`가 모두 소진되었다면, 현재 과제를 완료한 뒤 `delayPlans` 스택에 남은 모든 과제를 `pop` 순서대로 `answer`에 추가합니다.

---

## Java 풀이 코드

```java
import java.time.LocalDateTime;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.Stack;
import java.util.stream.Collectors;

public class Solution {

    private LinkedList<Plan> list = new LinkedList<>();
    private Stack<Plan> delayPlans = new Stack<>();
    private ArrayList<String> answer = new ArrayList<>();

    public String[] solution(String[][] plans) {
        list = Arrays.stream(plans)
                .map(Plan::new)
                .sorted(Comparator.comparing(o -> o.time))
                .collect(Collectors.toCollection(LinkedList::new));

        LocalDateTime currentTime = null;
        boolean delayedPlanProcFlag = false;

        while (!list.isEmpty() || !delayPlans.isEmpty()) {
            Plan plan;

            if (delayedPlanProcFlag) {
                plan = delayPlans.pop();
                delayedPlanProcFlag = false;
            } else {
                plan = list.poll();
                currentTime = plan.time;
            }

            if (!list.isEmpty()) {
                Plan nextPlan = list.peek();
                LocalDateTime estimatedTime = currentTime.plusMinutes(plan.duration);

                int criteria = estimatedTime.compareTo(nextPlan.time);

                if (criteria > 0) {
                    // 다음 과제 시작 전까지 끝내지 못하면 진행된 시간만큼만 차감 후 스택에 보류
                    delayPlans.add(plan.processPlanPartial(currentTime, nextPlan.time));
                } else {
                    // 현재 과제 완료
                    answer.add(plan.name);

                    // 다음 과제 시작까지 여유 시간이 남았고 밀린 과제가 있다면 이어서 진행
                    if (criteria < 0 && !delayPlans.isEmpty()) {
                        delayedPlanProcFlag = true;
                        currentTime = estimatedTime;
                    }
                }
            } else {
                // 예정된 새 과제가 더 이상 없으므로 현재 과제 완료 후 스택에 남은 과제를 역순으로 모두 완료
                answer.add(plan.name);
                while (!delayPlans.isEmpty()) {
                    answer.add(delayPlans.pop().name);
                }
            }
        }

        return answer.toArray(String[]::new);
    }

    static class Plan {
        String name;
        LocalDateTime time;
        int duration;

        public Plan(String[] plan) {
            this.name = plan[0];
            String[] splitTime = plan[1].split(":");
            this.time = LocalDateTime.of(
                    0,
                    Month.JANUARY,
                    1,
                    Integer.parseInt(splitTime[0]),
                    Integer.parseInt(splitTime[1])
            );
            this.duration = Integer.parseInt(plan[2]);
        }

        public Plan processPlanPartial(LocalDateTime currentTime, LocalDateTime nextPlanTime) {
            long diff = Math.abs(ChronoUnit.MINUTES.between(nextPlanTime, currentTime));
            this.duration -= (int) diff;
            return this;
        }
    }
}
```

### 개선 포인트: 정수(분) 단위 시간 표현

위 코드에서는 `LocalDateTime`과 `ChronoUnit.MINUTES`를 사용해 자정을 넘어가는 계산까지 안전하게 처리했지만, 모든 `start` 시각이 `"00:00" ~ "23:59"` 사이로 주어지므로 다음과 같이 **`int` 분 단위(`hh * 60 + mm`)**로 변환하면 불필요한 날짜 객체 생성을 없애고 코드도 훨씬 간결해집니다.

```java
int startMinutes = Integer.parseInt(splitTime[0]) * 60 + Integer.parseInt(splitTime[1]);
```

---

## 복잡도 분석

- **시간 복잡도**: `O(N log N)` — `plans` 정렬 `O(N log N)`, 각 과제는 대기열/스택에 최대 한 번씩만 들어가고 나오므로 시뮬레이션은 `O(N)`
- **공간 복잡도**: `O(N)` — 정렬된 대기열, 중단 과제 스택, 정답 리스트 저장 공간
