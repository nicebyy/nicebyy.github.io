---
title: '[BOJ 1865] 웜홀 (Java) - 벨만-포드(Bellman-Ford)로 그래프 전체 음수 사이클 탐지하기'
date: '2022-04-04'
category: PS/BOJ
tags:
  - BOJ
  - 벨만포드
  - 그래프
  - 음수사이클
  - Java
  - Gold III
summary: >-
  백준 1865번(웜홀) 문제에서 시작점이 정해지지 않은 그래프 전체의 음수 사이클 존재 여부를 판별하기 위해 벨만-포드 거리 배열 distance[]를 INF가 아닌 0으로 초기화하는 원리를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1865번 - 웜홀](https://www.acmicpc.net/problem/1865)
- **난이도**: Gold III
- **시간 / 메모리 제한**: `2초` / `128 MB`

### 핵심 조건 요약

- 테스트 케이스 `TC`(`1 ≤ TC ≤ 5`)마다 지점 수 `N`(`1 ≤ N ≤ 500`), **양방향 도로** `M`(`1 ≤ M ≤ 2,500`, 양수 시간), **단방향 웜홀** `W`(`1 ≤ W ≤ 200`, 시간이 거꾸로 가는 음수 가중치)가 주어집니다.
- 한 지점에서 출발해 다시 출발 위치로 돌아왔을 때 **출발했을 때보다 시간이 되돌아가 있는 경우(음수 사이클 존재)**가 있으면 `YES`, 없으면 `NO`를 출력합니다.

---

## 접근 아이디어

음수 가중치 간선이 존재하므로 다익스트라는 사용할 수 없고, **벨만-포드(Bellman-Ford) 알고리즘**으로 음수 사이클(Negative Cycle) 존재 여부를 판별해야 합니다.

### 왜 `distance[]`를 `INF`가 아니라 `0`으로 초기화할까?

일반적인 단일 시작점 벨만-포드에서는 `distance[1] = 0`, 나머지를 `INF`로 초기화하고 `distance[cur] != INF`일 때만 완화(Relaxation)를 수행합니다.
하지만 이 문제에는 두 가지 중요한 함정이 있습니다.

1. **시작점이 정해져 있지 않습니다**: 1번 정점과 연결되지 않은 **독립된 컴포넌트(예: 4-5-6번 정점)에 음수 사이클이 존재**할 수도 있습니다! 만약 1번에서 시작해 `INF` 체크를 걸면 그 컴포넌트의 음수 사이클을 아예 발견하지 못합니다.
2. **목표는 최단 거리가 아니라 음수 사이클의 유무뿐입니다**:
   - 모든 정점의 초기 거리 `distance[1..N] = 0`으로 두는 것은, 수학적으로 **"모든 정점에 가중치 `0`으로 연결된 가상의 슈퍼 소스(0번 노드)에서 동시에 출발"**하는 것과 완전히 동일합니다!
   - 음수 사이클이 없다면 최대 `N - 1`번의 라운드 안에 모든 간선 완화가 멈춥니다.
   - 만약 **`N`번째 라운드에서도 거리 갱신(`update == true`)이 일어난다면**, 그래프 어딘가에 음수 사이클이 반드시 존재한다는 뜻입니다! (또한 `update == false`인 라운드가 나오면 더 돌 필요 없이 조기 종료 가능!)

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.stream.IntStream;

import static java.util.Arrays.stream;

public class Main {

    static ArrayList<ArrayList<Node>> graph = new ArrayList<>();
    static int n;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());

        while (tc-- > 0) {
            int[] input = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            n = input[0];
            int m = input[1], w = input[2];

            graph = new ArrayList<>();
            IntStream.rangeClosed(0, n).forEach(e -> graph.add(new ArrayList<>()));

            for (int i = 0; i < m + w; i++) {
                input = stream(br.readLine().split(" "))
                        .mapToInt(Integer::parseInt)
                        .toArray();
                if (i < m) {
                    // 도로는 무방향(양방향) 양수 가중치
                    graph.get(input[0]).add(new Node(input[1], input[2]));
                    graph.get(input[1]).add(new Node(input[0], input[2]));
                } else {
                    // 웜홀은 단방향 음수 가중치
                    graph.get(input[0]).add(new Node(input[1], -input[2]));
                }
            }

            System.out.println(bellmanFord() ? "YES" : "NO");
        }
    }

    private static boolean bellmanFord() {
        // 모든 정점을 가상 시작점으로 취급해 비연결 컴포넌트의 음수 사이클까지 탐지
        int[] distance = new int[n + 1];
        boolean update = false;

        // N - 1번 완화 후 N번째 라운드에서도 갱신이 발생하면 음수 사이클 존재
        for (int i = 1; i <= n; i++) {
            update = false;
            for (int cur = 1; cur <= n; cur++) {
                for (Node next : graph.get(cur)) {
                    if (distance[next.node] > distance[cur] + next.weight) {
                        distance[next.node] = distance[cur] + next.weight;
                        update = true;
                    }
                }
            }
            // 더 이상 갱신이 일어나지 않으면 음수 사이클 없음 → 조기 종료
            if (!update) {
                break;
            }
        }
        return update;
    }

    static class Node {
        int node, weight;

        public Node(int node, int weight) {
            this.node = node;
            this.weight = weight;
        }
    }
}
```

---

## 채점 결과

![백준 1865 웜홀 맞았습니다 결과](/images/posts/boj-1865-wormhole/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(TC × N × (M + W))` — `N ≤ 500`, 간선 수 `2M + W ≤ 5,200`, `TC ≤ 5`이므로 최악 약 `1.3 × 10^7` 연산 수준
- **공간 복잡도**: `O(N + M + W)` — 인접 리스트 및 거리 배열 사용
