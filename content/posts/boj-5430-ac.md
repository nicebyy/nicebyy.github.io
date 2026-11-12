---
title: "[BOJ 5430] AC - Java (덱 Deque 기반 R/D 연산 최적화)"
date: "2022-01-31"
category: "PS/BOJ"
tags: ["BOJ","자료구조","덱","Deque","파싱","Java"]
summary: "매 뒤집기 연산(R) 시 실제 배열을 뒤집지 않고 방향 플래그와 양방향 Deque를 활용해 O(N)으로 해결하는 문제"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | AC (백준 5430번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 5430번) |
| **문제 링크** | [백준 5430번](https://www.acmicpc.net/problem/5430) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 테스트 케이스 $T \le 100$, 수행할 함수 $P$ 길이 $\le 100,000$, 배열 크기 $N \le 100,000$, $\sum (P + N) \le 700,000$ |
| **핵심 명령어** | `R`(뒤집기: 순서 뒤집기), `D`(버리기: 첫 번째 수 버리기, 빈 배열일 때 에러) |

---

## 2. 접근 아이디어: R 연산 시뮬레이션의 함정과 Deque 최적화

### ⚠️ 왜 단순 뒤집기는 시간 초과인가?
- 길이 $N$인 배열에 대해 `R`이 들어올 때마다 실제로 원소들을 뒤집으면 $O(N)$이 소요됩니다.
- 명령어 $P$에 `R`이 연속으로 여러 번 주어질 경우 최악 $O(P \times N) \approx 100,000 \times 100,000 = 10^{10}$으로 1초 시간 제한을 아득히 초과합니다.

### 💡 해결책: 방향 플래그와 양방향 덱(Deque)
1. **방향 플래그 (`isReversed`)**:
   - `R` 명령이 들어오면 실제로 원소를 조작하지 않고, 방향 상태(`direction = -direction`)만 $O(1)$에 뒤집습니다.
2. **양방향 삭제 (`ArrayDeque`)**:
   - 정방향일 때 `D` 명령: 앞에서 제거 (`pollFirst()`)
   - 역방향일 때 `D` 명령: 뒤에서 제거 (`pollLast()`)
   - 원소가 비어있는데 `D`를 수행해야 하면 즉시 `error` 플래그를 켜고 테스트 케이스를 종료합니다.
3. **최종 출력 포맷**:
   - 최종 방향 상태에 맞추어 앞 또는 뒤에서 꺼내며 `[x1,x2,...,xn]` 형태로 문자열을 생성합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        int tc = Integer.parseInt(br.readLine());

        while (tc-- > 0) {
            String commands = br.readLine();
            int n = Integer.parseInt(br.readLine());
            String arrStr = br.readLine();

            ArrayDeque<Integer> deque = parseArray(arrStr);
            boolean isReversed = false;
            boolean isError = false;

            for (int i = 0; i < commands.length(); i++) {
                char cmd = commands.charAt(i);
                if (cmd == 'R') {
                    isReversed = !isReversed;
                } else if (cmd == 'D') {
                    if (deque.isEmpty()) {
                        isError = true;
                        break;
                    }
                    if (isReversed) {
                        deque.pollLast();
                    } else {
                        deque.pollFirst();
                    }
                }
            }

            if (isError) {
                sb.append("error\n");
            } else {
                sb.append(formatDeque(deque, isReversed)).append("\n");
            }
        }

        System.out.print(sb);
    }

    // 대괄호와 쉼표를 파싱하여 Deque에 삽입
    private static ArrayDeque<Integer> parseArray(String s) {
        ArrayDeque<Integer> deque = new ArrayDeque<>();
        s = s.substring(1, s.length() - 1); // '['와 ']' 제거
        if (s.isEmpty()) return deque;

        String[] tokens = s.split(",");
        for (String token : tokens) {
            deque.addLast(Integer.parseInt(token.trim()));
        }
        return deque;
    }

    // 방향에 맞게 출력 문자열 생성
    private static String formatDeque(ArrayDeque<Integer> deque, boolean isReversed) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        while (!deque.isEmpty()) {
            sb.append(isReversed ? deque.pollLast() : deque.pollFirst());
            if (!deque.isEmpty()) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(P + N)$ — 각 명령은 $O(1)$에 수행되며, 파싱 및 출력 역시 각 원소당 $O(1)$에 완료됩니다. 전체 테스트케이스 합 $\sum(P+N) \le 700,000$이므로 약 0.3초 내에 여유 있게 통과.
- **공간 복잡도**: $O(N)$ — 덱에 최대 $10만$ 개의 정수를 저장하므로 256MB 제한 내에서 매우 안정적.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-5430-ac/result.png)
