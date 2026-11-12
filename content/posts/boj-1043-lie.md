---
title: '[BOJ 1043] 거짓말 (Java) - 유니온 파인드(Union-Find)로 진실 전파 집합 분리하기'
date: '2022-04-02'
category: PS/BOJ
tags:
  - BOJ
  - 유니온파인드
  - 분리집합
  - 그래프
  - Java
  - Gold IV
summary: >-
  백준 1043번(거짓말) 문제에서 여러 파티를 거치며 전파되는 진실 그룹을 Union-Find(Disjoint Set)로 묶어 과장된 이야기를 할 수 있는 파티의 최댓값을 구하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1043번 - 거짓말](https://www.acmicpc.net/problem/1043)
- **난이도**: Gold IV
- **시간 / 메모리 제한**: `2초` / `128 MB`

### 핵심 조건 요약

- 사람 수 `N`과 파티 수 `M`(`1 ≤ N, M ≤ 50`)이 주어집니다.
- 처음에 진실을 아는 사람 목록이 주어지고, 각 파티에 참석하는 사람 목록이 주어집니다.
- 어떤 사람이 **어느 파티에서는 진실을, 다른 파티에서는 거짓(과장)을 들으면 거짓말쟁이**로 알려지므로, 한 파티에 진실을 아는 사람(또는 그와 같은 파티에 참석했던 사람)이 한 명이라도 있으면 그 파티에서는 진실만 말해야 합니다.
- 지민이가 **거짓말을 할 수 있는 파티의 최대 개수**를 출력합니다.

---

## 접근 아이디어

파티 순서가 뒤쪽 파티에서 진실 그룹과 연결되더라도 앞쪽 파티까지 소급해 영향을 미치므로, **사람들을 "진실을 아는 집합"으로 병합해 나가는 분리 집합(Union-Find)**이 딱 들어맞습니다.

### 1. `0`번 가상 노드를 "진실 그룹" 대표로 활용

- 초기 `parent[i] = i` (`1 ≤ i ≤ N`), 그리고 **`0`번 노드를 진실을 아는 사람들의 대표 루트**로 둡니다.
- 처음에 진실을 아는 사람들을 모두 `union(0, person)`으로 `0`번 집합에 합칩니다.

### 2. 진실 전파 및 카운트

- 파티들을 순회하면서 파티 참석자 중 `findRoot(member) == findRoot(0)`인 사람이 한 명이라도 있으면:
  - 그 파티의 모든 참석자를 `0`번 집합에 `union(0, member)`하고, 거짓말 불가 파티로 확정(`ans++`, `visit[i] = true`)합니다.
  - 방금 새로 진실 집합에 편입된 사람 때문에 **이전에 지나온 파티들도 거짓말이 불가능해질 수 있으므로**, 더 이상 새로운 파티가 전파되지 않을 때까지(`condition == false`) 반복합니다.
- 최종 정답은 `M - ans`가 됩니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

import static java.util.Arrays.stream;

public class Main {

    static int n, m;
    static int[] parent;
    static ArrayList<ArrayList<Integer>> party = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        n = input[0];
        m = input[1];

        parent = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            parent[i] = i;
        }

        // 진실을 아는 사람들을 0번(가상 진실 그룹)에 편입
        input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();
        if (input[0] != 0) {
            for (int i = 1; i <= input[0]; i++) {
                union(0, input[i]);
            }
        }

        for (int i = 0; i < m; i++) {
            ArrayList<Integer> p = new ArrayList<>();
            input = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();

            for (int j = 1; j <= input[0]; j++) {
                p.add(input[j]);
            }
            party.add(p);
        }

        solve();
    }

    static void solve() {
        int ans = 0;
        boolean condition = true;
        boolean[] visit = new boolean[m];

        // 새로 진실 그룹에 합류한 사람이 있으면 연쇄적으로 파티들을 다시 확인
        while (condition) {
            condition = false;

            for (int i = 0; i < m; i++) {
                if (visit[i]) continue;

                ArrayList<Integer> partyList = party.get(i);
                for (Integer member : partyList) {
                    if (findRoot(member) == findRoot(0)) {
                        partyList.forEach(e -> union(0, e));
                        condition = true;
                        visit[i] = true;
                        ans++;
                        break;
                    }
                }
            }
        }
        System.out.println(m - ans);
    }

    static void union(int x, int y) {
        int xRoot = findRoot(x);
        int yRoot = findRoot(y);

        if (xRoot != yRoot) {
            parent[yRoot] = xRoot;
        }
    }

    static int findRoot(int x) {
        if (x == parent[x]) {
            return x;
        }
        return parent[x] = findRoot(parent[x]);
    }
}
```

### 개선 포인트

1. **`parent[yRoot] = xRoot;` 연결**: `union(x, y)`에서 `parent[yRoot] = x`가 아닌 루트 `xRoot`에 붙여야 트리가 깊어지지 않고 경로 압축(`findRoot`)이 온전히 작동합니다.
2. **단일 패스(`while` 제거) 구현**: 각 파티를 입력받을 때 **파티 내 첫 번째 참석자와 나머지 모든 참석자를 먼저 `union`** 해두면, 파티 목록을 딱 1번만 다시 순회하며 `findRoot(firstMember) != findRoot(0)`인 파티 수를 세어 `O(M · α(N))`으로 끝낼 수 있습니다.

---

## 복잡도 분석

- **시간 복잡도**: `O(M^2 × N × α(N))` (`N, M ≤ 50`으로 매우 빠르며, 사전 병합 방식 사용 시 `O((N + M) · α(N))`)
- **공간 복잡도**: `O(N + M × N)` — 부모 배열 및 파티 참석자 목록 저장 공간
