---
title: '[BOJ 1935] 후위 표기식2 (Java) - Stack 기반 수식 계산과 피연산자 순서 주의'
date: '2022-05-05'
category: PS/BOJ
tags:
  - BOJ
  - 스택
  - 자료구조
  - 구현
  - Java
  - Silver III
summary: >-
  백준 1935번(후위 표기식2) 문제에서 피연산자 매핑(A~Z)과 스택을 활용한 후위 표기식 계산 순서(op2 op op1), 그리고 소수점 둘째 자리 출력 처리 방법을 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1935번 - 후위 표기식2](https://www.acmicpc.net/problem/1935)
- **난이도**: Silver III
- **시간 / 메모리 제한**: `2초` / `128 MB`

### 핵심 조건 요약

- 피연산자의 개수 `N`(`1 ≤ N ≤ 26`)과 후위 표기식(길이 ≤ 100)이 주어집니다.
- 피연산자는 `A`부터 순서대로 `N`개의 영대문자만 사용되며, 각 문자에 대응하는 자연수 값(`≤ 100`)이 주어집니다.
- 계산 결과를 **소수점 둘째 자리까지** 출력합니다. (중간 및 최종 결과는 `-20억 ~ 20억` 범위)

---

## 접근 아이디어

후위 표기식(Postfix Notation)은 괄호나 연산자 우선순위 고민 없이 **스택(Stack)** 하나로 앞에서부터 순차 계산할 수 있습니다.

1. **피연산자(`A ~ Z`)**: 대응하는 실수(`double`) 값을 스택에 `push`합니다.
2. **연산자(`+, -, *, /`)**: 스택에서 숫자 2개를 `pop`하여 연산한 뒤 결과를 다시 `push`합니다.

### 주의할 점: `pop` 순서 (`op2 [연산자] op1`)

`-`와 `/`는 교환법칙이 성립하지 않으므로 **먼저 꺼낸 값(`op1`)이 오른쪽 피연산자**, **나중에 꺼낸 값(`op2`)이 왼쪽 피연산자**가 되어야 합니다!
- 예: 중위 표기 `A - B` → 후위 표기 `AB-`
- 스택 상태: `[A, B]` (top: `B`)
- `op1 = stack.pop()` (`B`), `op2 = stack.pop()` (`A`) → **`op2 - op1` (`A - B`)**

---

## Java 풀이 코드

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Stack;

public class Main {

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int operandCount = Integer.parseInt(br.readLine());
        HashMap<Character, Double> operands = new HashMap<>();
        Stack<Double> stack = new Stack<>();

        char[] equations = br.readLine().toCharArray();

        for (int i = 0; i < operandCount; i++) {
            double value = Double.parseDouble(br.readLine());
            operands.put((char) ('A' + i), value);
        }

        for (char ch : equations) {
            if (!isOperator(ch)) {
                // 피연산자면 매핑된 값을 스택에 삽입
                stack.push(operands.get(ch));
            } else {
                // 연산자면 먼저 꺼낸 값이 오른쪽 피연산자(op1)
                double op1 = stack.pop();
                double op2 = stack.pop();

                double result = switch (ch) {
                    case '+' -> op2 + op1;
                    case '-' -> op2 - op1;
                    case '/' -> op2 / op1;
                    case '*' -> op2 * op1;
                    default -> 0.0;
                };
                stack.push(result);
            }
        }

        System.out.printf("%.2f%n", stack.pop());
    }

    static boolean isOperator(char ch) {
        return ch < 'A' || ch > 'Z';
    }
}
```

---

## 복잡도 분석

- **시간 복잡도**: `O(L)` — 수식 길이 `L`(`≤ 100`)을 한 번 선형 탐색
- **공간 복잡도**: `O(N + L)` — 피연산자 매핑 맵(`≤ 26`) 및 계산 스택
