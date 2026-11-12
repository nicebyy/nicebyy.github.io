---
title: '[BOJ 1062] 가르침 (Java) - 백트래킹 조합 탐색과 비트마스킹 최적화'
date: '2022-06-01'
category: PS/BOJ
tags:
  - BOJ
  - 백트래킹
  - 완전탐색
  - 비트마스킹
  - 문자열
  - Java
  - Gold IV
summary: >-
  백준 1062번(가르침) 문제에서 필수 문자 5개(a, n, t, i, c)를 제외한 나머지 21개 알파벳 중 K - 5개를 선택하는 백트래킹 풀이와 비트마스킹 최적화 방법을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1062번 - 가르침](https://www.acmicpc.net/problem/1062)
- **난이도**: Gold IV
- **시간 / 메모리 제한**: `1초` / `128 MB`

### 핵심 조건 요약

- 남극언어의 모든 단어는 `"anta"`로 시작하고 `"tica"`로 끝납니다.
- 김지민 선생님이 `K`개의 글자만 가르칠 때, 학생들이 읽을 수 있는 단어 개수의 최댓값을 구해야 합니다.

| 변수 | 범위 | 비고 |
| :--- | :--- | :--- |
| 단어 개수 `N` | `1 ≤ N ≤ 50` | 중복 없음 |
| 가르칠 글자 수 `K` | `0 ≤ K ≤ 26` | `K < 5`이면 읽을 수 있는 단어는 항상 `0`개 |
| 단어 길이 | `8 ≤ 길이 ≤ 15` | 영어 소문자만 사용 |

---

## 접근 아이디어

1. **필수 글자 5개 고정 (`a`, `n`, `t`, `i`, `c`)**
   - 모든 단어에 `"anta"`와 `"tica"`가 포함되므로, 최소한 **`a, n, t, i, c` 5개의 글자**는 반드시 알아야 단 한 단어라도 읽을 수 있습니다.
   - 따라서 **`K < 5`인 경우 답은 무조건 `0`**입니다.
   - 반대로 `K == 26`이면 모든 알파벳을 배우므로 답은 `N`입니다.

2. **조합 백트래킹 경우의 수 계산**
   - 필수 5개를 방문 처리한 뒤, 남은 `21`개 알파벳 중에서 `K - 5`개를 고르는 조합을 탐색합니다.
   - 최악의 경우(`K - 5 = 10` 또는 `11`) 조합의 수는 `21C10 = 352,716`개입니다.
   - 각 조합마다 `N ≤ 50`개의 단어를 확인하므로, 접두사(`anta`)·접미사(`tica`)를 제외한 가운데 부분(최대 7글자)만 검사하면 `1초` 제한 내에 충분히 통과합니다.

---

## Java 풀이 코드 (정규식 + 백트래킹)

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {

    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    static int n, k;
    static int ans = 0;
    static String[] words;
    static boolean[] visit = new boolean[26];

    public static void main(String[] args) throws IOException {
        String[] input = br.readLine().split(" ");
        n = Integer.parseInt(input[0]);
        k = Integer.parseInt(input[1]);

        // 필수 알파벳 5개 사전 체크
        visit['a' - 'a'] = true;
        visit['n' - 'a'] = true;
        visit['t' - 'a'] = true;
        visit['i' - 'a'] = true;
        visit['c' - 'a'] = true;

        if (k < 5) {
            System.out.println(0);
            return;
        }
        if (k == 26) {
            System.out.println(n);
            return;
        }

        words = new String[n];
        k = k - 5;

        // "anta"와 "tica" 사이의 중간 문자열만 추출
        Pattern pattern = Pattern.compile("anta(.*)tica");
        for (int i = 0; i < n; i++) {
            Matcher matcher = pattern.matcher(br.readLine());
            if (matcher.find()) {
                words[i] = matcher.group(1);
            }
        }

        dfs(0, 0);
        System.out.println(ans);
    }

    static void dfs(int cur, int len) {
        if (len == k) {
            int cnt = 0;
            for (int i = 0; i < n; i++) {
                boolean read = true;
                for (int j = 0; j < words[i].length(); j++) {
                    if (!visit[words[i].charAt(j) - 'a']) {
                        read = false;
                        break;
                    }
                }
                if (read) cnt++;
            }
            ans = Math.max(ans, cnt);
            return;
        }

        for (int i = cur; i < 26; i++) {
            if (!visit[i]) {
                visit[i] = true;
                dfs(i + 1, len + 1); // 다음 인덱스부터 탐색해 중복 순회 방지
                visit[i] = false;
            }
        }
    }
}
```

---

## 개선 포인트: 비트마스킹(Bitmasking)을 통한 `O(1)` 단어 판별

알파벳 소문자는 총 26개이므로 `int`(32비트) 하나에 단어의 문자 집합과 현재 배운 문자 집합을 모두 담을 수 있습니다.

- 각 단어 `words[i]`를 비트마스크 `wordMask[i]`로 미리 변환해 둡니다.
- DFS 탐색 시 현재까지 배운 글자 집합을 `learnedMask` 하나로 관리합니다.
- 단어를 읽을 수 있는지 여부는 문자 순회 없이 **`(wordMask[i] & learnedMask) == wordMask[i]`** 단 한 번의 비트 연산으로 판별할 수 있어 실행 속도와 메모리 효율이 극적으로 향상됩니다.

---

## 복잡도 분석

- **시간 복잡도**: `O(C(21, K - 5) × N × L)` (비트마스킹 적용 시 `L` 제거되어 `O(C(21, K - 5) × N)`)
- **공간 복잡도**: `O(N × L + K)` — 단어 배열 및 백트래킹 재귀 스택(최대 깊이 `21`)
