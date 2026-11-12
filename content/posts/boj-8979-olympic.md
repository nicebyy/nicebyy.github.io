---
title: '[BOJ 8979] 올림픽 (Java) - Comparable과 TreeMap을 활용한 공동 등수 산출'
date: '2022-04-07'
category: PS/BOJ
tags:
  - BOJ
  - 정렬
  - 구현
  - TreeMap
  - Java
  - Silver V
summary: >-
  백준 8979번(올림픽) 문제에서 금·은·동 메달 기준 내림차순 정렬을 Comparable과 TreeMap으로 구성해 공동 등수와 다음 등수 건너뛰기를 깔끔하게 처리하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 8979번 - 올림픽](https://www.acmicpc.net/problem/8979)
- **난이도**: Silver V
- **시간 / 메모리 제한**: `1초` / `128 MB`

### 핵심 조건 요약

- 국가 수 `N`(`1 ≤ N ≤ 1,000`)과 등수를 알고 싶은 국가 번호 `K`(`1 ≤ K ≤ N`)가 주어집니다.
- 순위 우선순위: **1. 금메달 수 → 2. 은메달 수 → 3. 동메달 수** (내림차순)
- 금·은·동 개수가 모두 같다면 공동 등수가 되며, 그다음 등수는 공동 수상 국가 수만큼 건너뜁니다. (예: 공동 2등이 2개국이면 다음은 4등)

---

## 접근 아이디어

1. `Medal` 클래스에 `Comparable<Medal>`을 구현해 `(금, 은, 동)` 내림차순 기준을 정의합니다.
2. `TreeMap<Medal, ArrayList<Integer>>`을 사용하면 **메달 점수가 동일한 국가들이 자동으로 같은 Key의 리스트에 묶이고**, Key 순서 역시 높은 점수부터 정렬됩니다!
3. `TreeMap`을 앞에서부터 순회하며 현재 묶음(`nations`)에 `query` 국가가 포함되어 있다면 `ans + 1`을 출력하고, 아니라면 `ans += nations.size()`로 공동 등수 수만큼 등수를 건너뛰면 됩니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.TreeMap;

import static java.util.Arrays.stream;

public class Main {

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int[] input = stream(br.readLine().split(" "))
                .mapToInt(Integer::parseInt)
                .toArray();

        int n = input[0];
        int query = input[1];

        // 메달 순위 내림차순으로 동점 국가들을 그룹핑
        TreeMap<Medal, ArrayList<Integer>> ranking = new TreeMap<>();

        for (int i = 0; i < n; i++) {
            int[] info = stream(br.readLine().split(" "))
                    .mapToInt(Integer::parseInt)
                    .toArray();
            Medal score = new Medal(info[1], info[2], info[3]);

            ranking.computeIfAbsent(score, k -> new ArrayList<>()).add(info[0]);
        }

        int ans = 0;
        for (var entry : ranking.entrySet()) {
            ArrayList<Integer> nations = entry.getValue();

            if (nations.contains(query)) {
                System.out.println(ans + 1);
                break;
            } else {
                ans += nations.size();
            }
        }
    }

    static class Medal implements Comparable<Medal> {
        int gold, silver, bronze;

        public Medal(int gold, int silver, int bronze) {
            this.gold = gold;
            this.silver = silver;
            this.bronze = bronze;
        }

        @Override
        public int compareTo(Medal o) {
            if (o.gold == this.gold) {
                if (o.silver == this.silver) {
                    return Integer.compare(o.bronze, this.bronze);
                }
                return Integer.compare(o.silver, this.silver);
            }
            return Integer.compare(o.gold, this.gold);
        }
    }
}
```

> **더 간단한 대안 (`O(N)`)**: 한 국가의 등수는 **"자신보다 잘한 나라의 수 + 1"**과 같으므로, `K`번 국가의 메달 수만 기억해 둔 뒤 나머지 모든 국가와 1:1 비교해 `K`보다 성적이 높은 나라 개수만 세면 정렬 없이 `O(N)`에 해결할 수도 있습니다.

---

## 채점 결과

![백준 8979 올림픽 100점 결과](/images/posts/boj-8979-olympic/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N log N)` — `TreeMap` 삽입 및 순회 (`N ≤ 1,000`)
- **공간 복잡도**: `O(N)` — 국가별 메달 객체 및 리스트 저장 공간
