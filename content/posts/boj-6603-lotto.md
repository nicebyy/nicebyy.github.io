---
title: "[BOJ 6603] 로또 - Java (백트래킹 조합 재귀 탐색)"
date: "2021-11-29"
category: "PS/BOJ"
tags: ["BOJ","백트래킹","재귀","조합","Java"]
summary: "주어진 k개의 숫자 중 6개를 오름차순으로 선택하는 모든 조합을 사전식 순서로 탐색하는 백트래킹 기초 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 로또 (백준 6603번 / 실버 2) |
| **플랫폼 / 난이도** | 백준 (실버 2, 6603번) |
| **문제 링크** | [백준 6603번](https://www.acmicpc.net/problem/6603) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | 집합 크기 $k$ ($6 < k < 13$), 각 정수 집합 $S$ (오름차순 주어짐), 입력 마지막 줄은 `0` |
| **핵심 규칙** | 주어진 $k$개의 숫자 중 6개를 골라 오름차순 사전순으로 모두 출력 |

---

## 2. 접근 아이디어: 백트래킹(Backtracking) 조합

- 독일 로또 번호 49개 중 $k$개의 수를 골라 그중 6개를 뽑는 모든 조합을 출력하는 문제입니다.
- $k < 13$이므로 최대 경우의 수는 $\binom{12}{6} = 924$가지로 매우 작습니다.
- 사전식 순서 출력을 위해 이미 정렬되어 주어진 배열에서 인덱스 오름차순으로 6개를 뽑는 재귀 백트래킹(`dfs(start, depth)`)을 수행합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int k;
    static int[] s;
    static int[] picked = new int[6];
    static StringBuilder sb = new StringBuilder();

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            String line = br.readLine();
            if (line == null || line.equals("0")) break;

            StringTokenizer st = new StringTokenizer(line);
            k = Integer.parseInt(st.nextToken());
            s = new int[k];
            for (int i = 0; i < k; i++) {
                s[i] = Integer.parseInt(st.nextToken());
            }

            comb(0, 0);
            sb.append("\n");
        }

        System.out.print(sb);
    }

    static void comb(int start, int depth) {
        if (depth == 6) {
            for (int i = 0; i < 6; i++) {
                sb.append(picked[i]).append(" ");
            }
            sb.append("\n");
            return;
        }

        for (int i = start; i < k; i++) {
            picked[depth] = s[i];
            comb(i + 1, depth + 1);
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O\left(\binom{k}{6}\right)$ — $k \le 12$일 때 각 케이스당 최대 924회 탐색으로 0.1초 이내에 통과.
- **공간 복잡도**: $O(k)$ — 크기 $k$의 배열 및 최대 깊이 6의 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-6603-lotto/result.png)
