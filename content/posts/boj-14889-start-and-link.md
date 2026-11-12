---
title: "[BOJ 14889] 스타트와 링크 - Java (백트래킹 & 팀 조합 시뮬레이션)"
date: "2021-11-29"
category: "PS/BOJ"
tags: ["BOJ","백트래킹","브루트포스","조합","Java"]
summary: "N명의 사람을 N/2명씩 두 팀으로 나누는 모든 조합을 백트래킹으로 생성하고 팀 능력치 차이의 최솟값을 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 스타트와 링크 (백준 14889번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 14889번) |
| **문제 링크** | [백준 14889번](https://www.acmicpc.net/problem/14889) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 512MB |
| **입력 조건** | 사람 수 $N$ ($4 \le N \le 20$, 항상 짝수), $N \times N$ 능력치 시너지 행렬 $S$ |
| **핵심 규칙** | 스타트 팀($N/2$명)과 링크 팀($N/2$명)의 능력치 합의 차이를 최소화 |

---

## 2. 접근 아이디어: 조합(Combination) & 백트래킹

### 조합 생성
- $N$명 중 $N/2$명을 뽑아 스타트 팀으로 지정하면, 나머지 $N/2$명은 자동으로 링크 팀이 됩니다.
- 전체 경우의 수는 $\binom{N}{N/2}$로, $N=20$일 때 최대 $\binom{20}{10} = 184,756$가지에 불과합니다.
- 첫 번째 사람(0번 사람)을 항상 스타트 팀에 고정하면 대칭성에 의해 경우의 수가 절반($92,378$)으로 줄어듭니다.

### 팀 점수 계산 및 가지치기
- 선택된 팀원 쌍 $(i, j)$에 대해 $S_{ij} + S_{ji}$를 누적하여 각 팀의 점수를 구합니다.
- 점수 차이가 `0`이 나오면 가능한 절대 최솟값이므로 즉시 0을 출력하고 조기 종료할 수 있습니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static int[][] s;
    static boolean[] selected;
    static int minDiff = Integer.MAX_VALUE;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        s = new int[n][n];
        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int j = 0; j < n; j++) {
                s[i][j] = Integer.parseInt(st.nextToken());
            }
        }

        selected = new boolean[n];
        // 0번 선수는 스타트 팀으로 고정 (대칭성 제거)
        selected[0] = true;
        comb(1, 1);

        System.out.println(minDiff);
    }

    static void comb(int idx, int count) {
        if (count == n / 2) {
            calculateDiff();
            return;
        }

        for (int i = idx; i < n; i++) {
            if (!selected[i]) {
                selected[i] = true;
                comb(i + 1, count + 1);
                selected[i] = false;
            }
        }
    }

    static void calculateDiff() {
        int startTeam = 0;
        int linkTeam = 0;

        for (int i = 0; i < n - 1; i++) {
            for (int j = i + 1; j < n; j++) {
                if (selected[i] && selected[j]) {
                    startTeam += s[i][j] + s[j][i];
                } else if (!selected[i] && !selected[j]) {
                    linkTeam += s[i][j] + s[j][i];
                }
            }
        }

        int diff = Math.abs(startTeam - linkTeam);
        if (diff == 0) {
            System.out.println(0);
            System.exit(0);
        }
        minDiff = Math.min(minDiff, diff);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O\left(\binom{N}{N/2} \times N^2\right)$ — 대칭성 제거 시 $N=20$에서 약 $92,378 \times 200 \approx 1.8 \times 10^7$ 연산으로 2초 제한 내에 0.2초 이내로 통과.
- **공간 복잡도**: $O(N^2)$ — $20 \times 20$ 정수 행렬과 재귀 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-14889-start-and-link/result.png)
