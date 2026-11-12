---
title: '[BOJ 2504] 괄호의 값 (Java) - 분배법칙과 스택(Stack)으로 괄호 수식 계산하기'
date: '2022-04-21'
category: PS/BOJ
tags:
  - BOJ
  - 스택
  - 구현
  - 자료구조
  - Java
  - Gold V
summary: >-
  백준 2504번(괄호의 값) 문제에서 중첩된 괄호의 곱셈·덧셈 계산을 분배법칙 원리로 풀어, 스택과 임시 가중치 변수 cur 하나로 한 번의 순회만에 값을 계산하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 2504번 - 괄호의 값](https://www.acmicpc.net/problem/2504)
- **난이도**: Gold V (작성 당시 Silver II)
- **시간 / 메모리 제한**: `1초` / `128 MB`

### 핵심 조건 요약

- 4개의 기호 `(`, `)`, `[`, `]`로 이루어진 길이 `1 ~ 30`의 괄호열이 주어집니다.
- 올바른 괄호열의 값 규칙:
  - `()` = `2`, `[]` = `3`
  - `(X)` = `2 × 값(X)`, `[X]` = `3 × 값(X)`
  - `XY` = `값(X) + 값(Y)`
- **올바르지 못한 괄호열이면 `0`을 출력**합니다.

---

## 접근 아이디어: 분배법칙을 이용한 단일 패스 계산

스택에 숫자(`int`)와 괄호를 섞어 넣는 방식도 있지만, **수학의 분배법칙**을 이용하면 훨씬 깔끔하게 계산할 수 있습니다.

예를 들어 `(()[[]])`의 값을 전개해 봅시다.
```text
(()[[]]) = 2 × (2 + 3 × 3)
         = (2 × 2) + (2 × 3 × 3)
```

즉, **현재까지 감싸고 있는 괄호들의 곱(`cur`)**을 계속 유지하다가, **가장 안쪽에서 괄호가 바로 닫히는 순간(`()` 또는 `[]`)**에만 `cur`를 정답에 더해주면 됩니다!

### 처리 규칙

1. **여는 괄호 `(`, `[`**:
   - `(` → `cur *= 2`, 스택에 `(` push
   - `[` → `cur *= 3`, 스택에 `[` push
2. **닫는 괄호 `)`, `]`**:
   - 스택이 비어 있거나 top이 짝이 맞지 않으면 → 잘못된 괄호이므로 즉시 `answer = 0` 후 종료
   - **직전 문자 `prev`가 짝이 맞는 여는 괄호(`(` 또는 `[`)인 경우** → 가장 안쪽의 `()` 또는 `[]`이므로 **`answer += cur`**
   - 공통 후처리: 스택에서 `pop` 하고, `)`이면 `cur /= 2`, `]`이면 `cur /= 3`으로 가중치를 되돌림
3. **종료 후 검증**:
   - 루프가 끝난 뒤에도 `stack`이 비어 있지 않다면(`(()`처럼 덜 닫힌 경우) `answer = 0` 처리

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Stack;

public class Main {

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();

        int answer = 0;
        Stack<Character> stack = new Stack<>();
        char prev = ' ';
        int cur = 1; // 현재 중첩 깊이의 곱셈 가중치

        loop:
        for (int i = 0; i < line.length(); i++) {
            char word = line.charAt(i);

            switch (word) {
                case '(' -> {
                    cur *= 2;
                    stack.push(word);
                }
                case '[' -> {
                    cur *= 3;
                    stack.push(word);
                }
                case ')' -> {
                    if (stack.isEmpty() || stack.peek() != '(') {
                        answer = 0;
                        break loop;
                    } else if (prev == '(') {
                        // 직전이 '('인 "()" 완성 시점에만 현재까지의 곱 cur을 정산
                        answer += cur;
                    }
                    stack.pop();
                    cur /= 2;
                }
                case ']' -> {
                    if (stack.isEmpty() || stack.peek() != '[') {
                        answer = 0;
                        break loop;
                    } else if (prev == '[') {
                        // 직전이 '['인 "[]" 완성 시점에만 현재까지의 곱 cur을 정산
                        answer += cur;
                    }
                    stack.pop();
                    cur /= 3;
                }
            }
            prev = word;
        }

        // 모든 문자를 순회한 후에도 닫히지 않은 괄호가 남아있으면 0
        if (!stack.isEmpty()) {
            answer = 0;
        }
        System.out.println(answer);
    }
}
```

---

## 채점 결과

![백준 2504 괄호의 값 맞았습니다 결과](/images/posts/boj-2504-value-of-parentheses/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(L)` — 문자열 길이 `L`(`≤ 30`)을 단 한 번 순회
- **공간 복잡도**: `O(L)` — 괄호 검증용 스택 공간
