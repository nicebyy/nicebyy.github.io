---
title: '[BOJ 1032] 명령 프롬프트 (Java) - 열(Column) 단위 문자 일치 비교'
date: '2022-04-12'
category: PS/BOJ
tags:
  - BOJ
  - 문자열
  - 구현
  - Java
  - Bronze I
summary: >-
  백준 1032번(명령 프롬프트) 문제에서 길이가 모두 같은 N개의 파일 이름을 세로(열) 방향으로 비교해 불일치하는 위치만 '?'로 치환하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1032번 - 명령 프롬프트](https://www.acmicpc.net/problem/1032)
- **난이도**: Bronze I
- **시간 / 메모리 제한**: `2초` / `128 MB`

### 핵심 조건 요약

- 길이가 모두 같은 파일 이름 `N`개(`1 ≤ N ≤ 50`, 파일 이름 길이 `≤ 50`)가 주어집니다.
- 모든 파일 이름과 매칭되는 패턴을 만들되 `?`는 가능한 한 적게 사용해야 합니다.

---

## 접근 아이디어

파일 이름의 길이가 모두 동일하고 `?`를 최소화해야 하므로 각 인덱스(열) `i`마다 독립적으로 판단하면 됩니다.

1. 첫 번째 파일 이름의 `i`번째 문자 `arr[0][i]`를 기준 문자 `peek`로 잡습니다.
2. 나머지 파일들의 `i`번째 문자 `arr[j][i]`를 세로로 순회하면서, **단 하나라도 다른 문자가 발견되면 `peek = '?'`**로 치환하고 안쪽 루프를 탈출합니다.
3. 모두 같다면 원래 문자 `peek`를 그대로 `StringBuilder`에 추가합니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main {

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());
        char[][] arr = new char[n][];

        for (int i = 0; i < n; i++) {
            arr[i] = br.readLine().toCharArray();
        }

        StringBuilder ans = new StringBuilder();

        // 각 열(i)을 기준으로 세로(j) 방향 비교
        for (int i = 0; i < arr[0].length; i++) {
            char peek = arr[0][i];

            for (int j = 1; j < n; j++) {
                if (peek != arr[j][i]) {
                    peek = '?';
                    break;
                }
            }
            ans.append(peek);
        }

        System.out.println(ans);
    }
}
```

---

## 채점 결과

![백준 1032 명령 프롬프트 맞았습니다 결과](/images/posts/boj-1032-command-prompt/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N × L)` — 파일 개수 `N ≤ 50`, 길이 `L ≤ 50`으로 최대 `2,500`번 비교
- **공간 복잡도**: `O(N × L)` — 문자 2차원 배열 저장 공간
