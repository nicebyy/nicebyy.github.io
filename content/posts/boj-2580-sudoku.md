---
title: "[BOJ 2580] 스도쿠 - Java (백트래킹 & 가지치기)"
date: "2021-12-05"
category: "PS/BOJ"
tags: ["BOJ","백트래킹","구현","Java"]
summary: "9x9 스도쿠 판에서 빈 칸을 행/열/3x3 미니 박스 유효성 검증을 거쳐 백트래킹으로 탐색 및 완성하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 스도쿠 (백준 2580번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 2580번) |
| **문제 링크** | [백준 2580번](https://www.acmicpc.net/problem/2580) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 9x9 스도쿠 판 (빈 칸은 0으로 주어짐, 최대 81칸) |
| **핵심 규칙** | 행, 열, 3x3 미니 박스에 1부터 9까지의 숫자가 중복 없이 정확히 한 번씩 채워져야 함 |

---

## 2. 접근 아이디어: 백트래킹(Backtracking)과 유효성 검증

### 백트래킹 전략
1. **빈 칸 좌표 수집**: 스도쿠 판에서 값이 `0`인 좌표를 리스트(`List<Point>`)에 순서대로 수집합니다.
2. **후보 숫자 대입**: 1부터 9까지의 숫자 중 현재 칸에 들어갈 수 있는 숫자를 검사합니다:
   - **행 검증**: 같은 행($row$)에 해당 숫자가 이미 있는가?
   - **열 검증**: 같은 열($col$)에 해당 숫자가 이미 있는가?
   - **3x3 박스 검증**: $(row/3)*3, (col/3)*3$ 시작점의 $3 \times 3$ 영역에 해당 숫자가 이미 있는가?
3. **재귀 탐색 및 원복**: 유효한 숫자를 찾으면 칸에 배치하고 다음 빈 칸으로 재귀 호출합니다. 만약 해를 찾지 못하고 되돌아오면 칸을 다시 `0`으로 원복합니다.
4. **조기 종료**: 빈 칸을 모두 채운 첫 번째 해를 찾으면 스도쿠 판 전체를 출력한 뒤 `System.exit(0)`으로 즉시 종료합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int[][] board = new int[9][9];
    static List<int[]> blanks = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        for (int i = 0; i < 9; i++) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int j = 0; j < 9; j++) {
                board[i][j] = Integer.parseInt(st.nextToken());
                if (board[i][j] == 0) {
                    blanks.add(new int[]{i, j});
                }
            }
        }

        solve(0);
    }

    static void solve(int depth) {
        // 모든 빈 칸을 채운 경우 완성된 스도쿠 출력 후 종료
        if (depth == blanks.size()) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 9; i++) {
                for (int j = 0; j < 9; j++) {
                    sb.append(board[i][j]).append(" ");
                }
                sb.append("\n");
            }
            System.out.print(sb);
            System.exit(0);
        }

        int[] cur = blanks.get(depth);
        int r = cur[0];
        int c = cur[1];

        // 1부터 9까지 가능한 숫자 대입
        for (int num = 1; num <= 9; num++) {
            if (isValid(r, c, num)) {
                board[r][c] = num;
                solve(depth + 1);
                board[r][c] = 0; // 백트래킹 원복
            }
        }
    }

    // 행, 열, 3x3 미니 박스 유효성 검사
    static boolean isValid(int r, int c, int num) {
        // 행 & 열 검사
        for (int i = 0; i < 9; i++) {
            if (board[r][i] == num || board[i][c] == num) {
                return false;
            }
        }

        // 3x3 사각형 검사
        int startR = (r / 3) * 3;
        int startC = (c / 3) * 3;
        for (int i = startR; i < startR + 3; i++) {
            for (int j = startC; j < startC + 3; j++) {
                if (board[i][j] == num) {
                    return false;
                }
            }
        }

        return true;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: 최악의 경우 $O(9^K)$ ($K$는 빈 칸 수, 최대 81)이지만, 행/열/박스 3중 제약에 의해 대다수의 가지가 초기에 잘려나가므로(가지치기 Pruning), 실제 탐색 연산 수는 매우 적어 약 0.2초 이내에 완료됩니다.
- **공간 복잡도**: $O(1)$ — 고정된 9x9 판 및 최대 81 깊이의 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-2580-sudoku/result.png)
