---
title: '[프로그래머스] 양과 늑대 (Level 3, Java) - 방문 가능 후보 리스트 기반 상태 DFS'
date: '2022-02-08'
category: PS/Programmers
tags:
  - Programmers
  - DFS
  - 백트래킹
  - 트리
  - 카카오기출
  - Java
  - Level 3
summary: >-
  2022 카카오 블라인드 공채 기출 '양과 늑대' 문제에서 부모 노드를 다시 거슬러 올라갈 수 있는 트리 탐색 특성을 해결하기 위해, 현재 방문 가능한 후보 노드 집합(nextPlan)을 상태로 전달하는 DFS 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [프로그래머스 - 양과 늑대 (92343)](https://school.programmers.co.kr/learn/courses/30/lessons/92343)
- **난이도**: Level 3 (`2022 KAKAO BLIND RECRUITMENT`)

### 핵심 조건 요약

- 이진 트리 모양 초원의 각 노드에 양(`0`) 또는 늑대(`1`)가 한 마리씩 있습니다. (`2 ≤ info.length ≤ 17`)
- 루트(`0`번)에서 출발해 노드를 방문할 때마다 해당 노드의 양 또는 늑대가 따라옵니다.
- **모은 양의 수 ≤ 늑대의 수**가 되는 순간 모든 양을 잡아먹히므로, 중간에 잡아먹히지 않으면서 모을 수 있는 **양의 최대 마릿수**를 구해야 합니다.
- 한 번 방문했던 노드를 지나쳐 **다른 서브트리로 되돌아가서 방문하는 것도 가능**합니다.

---

## 접근 아이디어

처음에는 일반 트리 DP나 단순 DFS로 접근하기 쉽지만, **"이미 방문했던 부모/조상 노드를 다시 지나 다른 자식 서브트리로 갈 수 있다"**는 조건 때문에 단순 부모-자식 순회로는 풀리지 않습니다.

### 핵심 전환: "지금까지 확보한 영역에서 다음에 갈 수 있는 모든 후보 노드(`curPlan`)"를 상태로 넘기기

- 어떤 노드 `cur`를 방문하면:
  1. `cur`의 양/늑대를 수확해 `sheep`, `wolf`를 갱신합니다.
  2. 만약 `wolf >= sheep`이면 더 이상 진행 불가하므로 즉시 `return`합니다.
  3. 안전하다면 `answer = Math.max(answer, sheep)`로 최댓값을 갱신합니다.
  4. 다음으로 이동할 수 있는 후보 집합 **`nextPlan`**은 다음과 같이 만듭니다:
     - 기존 방문 가능 후보 리스트 `curPlan`에서 **방금 방문한 `cur` 자신은 제거**하고,
     - **`cur`의 자식 노드들(`graph.get(cur)`)을 모두 `nextPlan`에 추가**합니다!
- 이제 `nextPlan`에 들어 있는 어떤 노드로든 이동할 수 있습니다. (이미 열려 있는 경로 위 조상의 다른 자식까지 모두 포함되어 있기 때문에!)

노드 개수가 최대 `17`개뿐이므로, 각 분기에서 이 후보 리스트를 복사해 재귀 탐색하면 모든 유효한 방문 순서를 빠짐없이 탐색할 수 있습니다.

---

## Java 풀이 코드

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;

class Solution {

    ArrayList<ArrayList<Integer>> graph;
    int answer;
    int[] info;

    public int solution(int[] info, int[][] edges) {
        initGraph(info, edges);
        answer = 0;

        List<Integer> plan = new ArrayList<>();
        plan.add(0);
        dfs(0, 0, 0, plan);

        return answer;
    }

    public void dfs(int cur, int sheep, int wolf, List<Integer> curPlan) {
        if (info[cur] == 0) {
            sheep++;
        } else {
            wolf++;
        }

        // 늑대 수가 양 수 이상이 되면 더 이상 진행 불가
        if (wolf >= sheep) {
            return;
        }
        answer = Math.max(sheep, answer);

        // 현재 방문 가능한 후보 목록 갱신: 자기 자신 제거 + 현재 노드의 자식 노드 추가
        List<Integer> nextPlan = new ArrayList<>(curPlan);
        nextPlan.remove((Integer) cur);
        nextPlan.addAll(graph.get(cur));

        for (Integer next : nextPlan) {
            dfs(next, sheep, wolf, nextPlan);
        }
    }

    private void initGraph(int[] info, int[][] edges) {
        graph = new ArrayList<>();
        IntStream.range(0, info.length)
                .forEach(e -> graph.add(new ArrayList<>()));

        Arrays.stream(edges)
                .forEach(e -> graph.get(e[0]).add(e[1]));
        this.info = info;
    }
}
```

> **참고**: `visited[bitmask]`를 추가로 두어 동일한 방문 노드 집합(`mask`)을 중복 방문하지 않도록 가지치기하면, `17`개 노드에서도 상태 수를 최대 `2^17` 이하로 제한해 훨씬 빠르게 동작합니다.

---

## 채점 결과

![프로그래머스 양과 늑대 통과 결과](/images/posts/programmers-92343-sheep-and-wolf/result.png)

---

## 복잡도 분석

- **시간 복잡도**: 노드 수 `N ≤ 17`의 부분 상태 탐색 (단순 DFS 기준 유효한 양>늑대 경로만 확장되어 테스트 케이스당 수 ms 내 통과)
- **공간 복잡도**: `O(N^2)` — 깊이 `N`의 재귀 스택 및 각 단계별 후보 리스트 `nextPlan` 공간
