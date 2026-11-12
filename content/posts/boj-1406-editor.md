---
title: '[BOJ 1406] 에디터 (Java) - 0.3초 시간 초과 해결을 위한 두 개의 스택(Two Stacks)'
date: '2022-04-26'
category: PS/BOJ
tags:
  - BOJ
  - 스택
  - 자료구조
  - 구현
  - Java
  - Silver II
summary: >-
  백준 1406번(에디터) 문제에서 0.3초의 빡빡한 시간 제한으로 인해 LinkedList 인덱스 접근이 시간 초과되는 이유를 분석하고, 커서 기준 좌·우 두 개의 스택으로 모든 명령을 O(1)에 처리하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [백준 1406번 - 에디터](https://www.acmicpc.net/problem/1406)
- **난이도**: Silver II
- **시간 / 메모리 제한**: `0.3초 (Java 추가 시간 없음)` / `512 MB`

### 핵심 조건 요약

- 초기 문자열(길이 `N ≤ 100,000`)과 명령어 개수 `M`(`1 ≤ M ≤ 500,000`)이 주어지며, 명령어 수행 전 커서는 문장의 맨 뒤에 위치합니다.
- 지원 명령어:
  - `L`: 커서를 왼쪽으로 한 칸 이동 (맨 앞이면 무시)
  - `D`: 커서를 오른쪽으로 한 칸 이동 (맨 뒤이면 무시)
  - `B`: 커서 왼쪽 문자 삭제 (맨 앞이면 무시)
  - `P $`: `$` 문자를 커서 왼쪽에 추가

---

## 트러블슈팅: 왜 `LinkedList` / `StringBuilder.insert`는 시간 초과가 날까?

![백준 1406 LinkedList 시간 초과 기록](/images/posts/boj-1406-editor/tle.png)

처음에는 중간 삽입/삭제가 `O(1)`이라는 점만 보고 `LinkedList`를 사용했지만 연달아 시간 초과가 발생했습니다.

- **`LinkedList.add(index, element)` / `remove(index)`의 함정**: 연결 리스트는 노드 포인터를 가지고 있을 때만 삽입/삭제가 `O(1)`이지, 인덱스 `cursor`를 넘겨 접근하면 매번 처음(또는 끝)부터 노드를 따라가야 하므로 **`O(N)`**이 걸립니다!
- **`StringBuilder.insert(cursor, ...)` / `deleteCharAt(cursor)`**: 내부 배열을 시프트해야 하므로 마찬가지로 **`O(N)`**이 소요됩니다.
- 명령어 개수 `M = 500,000`, 문자열 길이 최대 `600,000`이므로 `O(M × N)`은 **0.3초** 제한에서 무조건 시간 초과가 됩니다.

---

## 접근 아이디어: 커서를 기준으로 좌·우 두 개의 스택(`left`, `right`)

커서의 이동과 편집을 모두 **`O(1)`**로 처리하려면 **커서 왼쪽 문자열을 담는 `left` 스택**과 **커서 오른쪽 문자열을 담는 `right` 스택** 두 개를 두면 됩니다.

```text
예시: "abc|de" (커서가 c와 d 사이)
left  스택 (bottom → top): [a, b, c]
right 스택 (top → bottom): [d, e]
```

| 명령 | 동작 | 시간 복잡도 |
| :--- | :--- | :--- |
| `L` | `left`에서 `pop`하여 `right`에 `push` | `O(1)` |
| `D` | `right`에서 `pop`하여 `left`에 `push` | `O(1)` |
| `B` | `left`에서 `pop` (버림) | `O(1)` |
| `P $` | `left`에 `$`를 `push` | `O(1)` |

모든 명령 처리가 끝난 뒤에는 `left` 스택의 원소를 바닥부터 순서대로 붙이고, `right` 스택은 `pop`하면서 이어 붙이면 완성된 문자열이 됩니다.

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

        Stack<Character> left = new Stack<>();
        Stack<Character> right = new Stack<>();

        String init = br.readLine();
        for (int i = 0; i < init.length(); i++) {
            left.push(init.charAt(i));
        }

        int queryCount = Integer.parseInt(br.readLine());

        for (int i = 0; i < queryCount; i++) {
            String line = br.readLine();
            char query = line.charAt(0);

            if (query == 'L' && !left.isEmpty()) {
                right.push(left.pop());
            } else if (query == 'D' && !right.isEmpty()) {
                left.push(right.pop());
            } else if (query == 'B' && !left.isEmpty()) {
                left.pop();
            } else if (query == 'P') {
                left.push(line.charAt(2));
            }
        }

        StringBuilder ans = new StringBuilder();
        for (Character ch : left) {
            ans.append(ch);
        }
        while (!right.isEmpty()) {
            ans.append(right.pop());
        }

        System.out.println(ans);
    }
}
```

> **성능 팁**: `Stack<Character>` 대신 `ArrayDeque<Character>`를 쓰면 동기화(`synchronized`) 오버헤드가 없어 더 빠르고, `ListIterator`를 활용한 `LinkedList` 역시 커서 포인터를 직접 유지하므로 `O(M)`에 통과할 수 있습니다.

---

## 채점 결과

![백준 1406 에디터 맞았습니다 결과](/images/posts/boj-1406-editor/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(N + M)` — 초기 문자열 적재 `O(N)` + `M`개 명령당 `O(1)` + 최종 출력 `O(N + M)`
- **공간 복잡도**: `O(N + M)` — 두 스택에 저장되는 최대 문자 수 `N + M`
