---
title: '[BOJ 17413] 단어 뒤집기 2 (Java) - 상태 플래그와 StringBuilder를 활용한 O(N) 파싱'
date: '2022-05-05'
category: PS/BOJ
tags:
  - BOJ
  - 문자열
  - 구현
  - 파싱
  - Java
  - Silver III
summary: >-
  백준 17413번(단어 뒤집기 2) 문제에서 <태그> 내부 문자열은 유지하고 태그 외부 단어만 공백과 태그 경계에서 뒤집어 출력하는 O(N) 문자열 파싱 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 17413번 - 단어 뒤집기 2](https://www.acmicpc.net/problem/17413)
- **난이도**: Silver III
- **시간 / 메모리 제한**: `1초` / `512 MB`

### 핵심 조건 요약

- 문자열 `S`(길이 `≤ 100,000`)는 알파벳 소문자, 숫자, 공백, `<`, `>`로 이루어져 있습니다.
- `<`로 시작해 `>`로 끝나는 **태그는 뒤집지 않고 그대로 유지**하며, **태그 외부의 단어만 공백 기준으로 뒤집어** 출력해야 합니다.
- 태그와 단어 사이에는 공백이 없을 수도 있습니다 (예: `<open>tag<close>` → `<open>gat<close>`).

---

## 접근 아이디어

문자열 길이가 최대 `100,000`이므로 한 글자씩 순회하면서 **현재 태그 내부인지(`inTag`)** 여부를 플래그로 관리하고, 단어 버퍼(`reverseStr`)를 모았다가 경계에서 한 번에 뒤집어 붙이는 `O(N)` 파싱이 가장 깔끔합니다.

### 문자별 상태 전이 규칙

1. **`<`를 만난 경우**: 태그가 시작되므로 그 직전까지 `reverseStr`에 모아둔 단어를 `reverse()`해 결과 `sb`에 먼저 반영한 뒤, `<`를 추가하고 `inTag = true`로 전환합니다.
2. **`>`를 만난 경우**: 태그가 끝나므로 `>`를 추가하고 `inTag = false`로 되돌립니다.
3. **`inTag == true`인 경우**: 태그 내부 문자이므로 뒤집지 않고 그대로 `sb`에 추가합니다.
4. **공백(`' '`)을 만난 경우**: 단어의 끝이므로 `reverseStr.reverse()`를 `sb`에 붙인 뒤 공백을 추가하고 버퍼를 비웁니다.
5. **일반 문자**: `reverseStr`에 누적합니다.
6. **루프 종료 후**: 마지막 단어가 태그로 끝나지 않았을 때 `reverseStr`에 남아 있는 문자를 마저 뒤집어 `sb`에 붙입니다.

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main {

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String input = br.readLine();

        boolean inTag = false;
        StringBuilder sb = new StringBuilder();
        StringBuilder reverseStr = new StringBuilder();

        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);

            if (ch == '<') {
                // 태그 시작 전 누적된 단어가 있다면 뒤집어서 출력 버퍼에 반영
                sb.append(reverseStr.reverse());
                sb.append(ch);
                reverseStr.setLength(0);
                inTag = true;
            } else if (ch == '>') {
                sb.append(ch);
                inTag = false;
            } else if (inTag) {
                // 태그 내부는 정방향 그대로 유지
                sb.append(ch);
            } else if (ch == ' ') {
                // 공백을 만나면 직전 단어 뒤집기
                sb.append(reverseStr.reverse());
                sb.append(ch);
                reverseStr.setLength(0);
            } else {
                reverseStr.append(ch);
            }
        }

        // 문자열 끝에 남아 있는 마지막 단어 처리
        sb.append(reverseStr.reverse());
        System.out.println(sb);
    }
}
```

> **개선 포인트**: `br.readLine().split("")`로 길이 `100,000`짜리 `String[]` 배열을 만드는 대신 `input.charAt(i)`로 순회하고, `new StringBuilder()`를 매번 새로 할당하는 대신 `reverseStr.setLength(0)`으로 버퍼를 재사용하면 불필요한 GC와 메모리 사용량을 크게 줄일 수 있습니다.

---

## 채점 결과

![백준 17413 단어 뒤집기 2 맞았습니다 결과](/images/posts/boj-17413-reverse-words-2/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N)` — 각 문자는 최대 한 번 추가되고 한 번 뒤집히므로 선형 시간 내에 처리됩니다.
- **공간 복잡도**: `O(N)` — 출력 버퍼 `StringBuilder` 공간 사용
