---
title: "[BOJ 1194] 달이 차오른다, 가자. - Java (BFS & 비트마스킹 열쇠 상태 공간)"
date: "2021-08-30"
category: "PS/BOJ"
tags: ["BOJ","BFS","비트마스킹","시뮬레이션","Java"]
summary: "열쇠(a~f) 보유 상태를 6비트 정수로 표현하여 visited[r][c][keyState] 3차원 방문 배열을 관리하며 탈출구에 도달하는 최단 이동 횟수 BFS 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 달이 차오른다, 가자. (백준 1194번 / 골드 1) |
| **플랫폼 / 난이도** | 백준 (골드 1, 1194번) |
| **문제 링크** | [백준 1194번](https://www.acmicpc.net/problem/1194) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 미로 크기 $N, M \le 50$, 시작점 `0`, 출구 `1`, 열쇠 `a-f`, 문 `A-F` |
| **핵심 규칙** | 미로를 탈출하는 최소 이동 횟수 구하기 (탈출 불가능 시 -1) |

---

## 2. 접근 아이디어: BFS + 비트마스킹(Bitmasking) 3차원 상태 공간

### 열쇠 보유 상태의 비트 표현
- 2차원 BFS에서 열쇠를 얻기 전과 얻은 후의 방문 상태는 완전히 다릅니다. 이전에 지나쳤던 문을 열쇠를 얻은 뒤 다시 열고 지나가야 하기 때문입니다.
- 열쇠는 총 6종류(`a` ~ `f`)이므로, $2^6 = 64$가지의 상태를 비트로 나타낼 수 있습니다:
  - 열쇠 `a` 획득: `keys | (1 << 0)`
  - 문 `A` 통과 조건: `(keys & (1 << 0)) != 0`
- 방문 배열을 **3차원 `visited[h][w][64]`**로 정의하여, 동일한 열쇠 조합을 가진 상태에서의 중복 방문만 차단하며 최단 경로(BFS)를 탐색합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class State {
        int y, x, keys, dist;

        public State(int y, int x, int keys, int dist) {
            this.y = y;
            this.x = x;
            this.keys = keys;
            this.dist = dist;
        }
    }

    static int[] dy = {-1, 1, 0, 0};
    static int[] dx = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int n = Integer.parseInt(st.nextToken());
        int m = Integer.parseInt(st.nextToken());

        char[][] map = new char[n][m];
        int startY = 0, startX = 0;

        for (int i = 0; i < n; i++) {
            String line = br.readLine();
            for (int j = 0; j < m; j++) {
                map[i][j] = line.charAt(j);
                if (map[i][j] == '0') {
                    startY = i;
                    startX = j;
                    map[i][j] = '.'; // 시작점도 빈칸 처리
                }
            }
        }

        // visited[y][x][열쇠상태(0~63)]
        boolean[][][] visited = new boolean[n][m][64];
        Queue<State> queue = new ArrayDeque<>();

        queue.offer(new State(startY, startX, 0, 0));
        visited[startY][startX][0] = true;

        int answer = -1;

        while (!queue.isEmpty()) {
            State cur = queue.poll();

            // 출구 도달
            if (map[cur.y][cur.x] == '1') {
                answer = cur.dist;
                break;
            }

            for (int i = 0; i < 4; i++) {
                int ny = cur.y + dy[i];
                int nx = cur.x + dx[i];

                if (ny < 0 || ny >= n || nx < 0 || nx >= m) continue;
                char nextCell = map[ny][nx];

                if (nextCell == '#') continue; // 벽

                int nextKeys = cur.keys;

                // 문을 만난 경우
                if (nextCell >= 'A' && nextCell <= 'F') {
                    int doorBit = 1 << (nextCell - 'A');
                    if ((cur.keys & doorBit) == 0) continue; // 열쇠 없음
                }

                // 열쇠를 만난 경우
                if (nextCell >= 'a' && nextCell <= 'f') {
                    nextKeys |= (1 << (nextCell - 'a'));
                }

                if (!visited[ny][nx][nextKeys]) {
                    visited[ny][nx][nextKeys] = true;
                    queue.offer(new State(ny, nx, nextKeys, cur.dist + 1));
                }
            }
        }

        System.out.println(answer);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times M \times 2^6)$ — $50 \times 50 \times 64 = 160,000$개의 상태 노드를 BFS로 탐색하므로 약 0.1초 내에 완벽하게 해결됩니다.
- **공간 복잡도**: $O(N \times M \times 2^6)$ — 3차원 불리언 방문 배열 크기.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1194-moon-is-rising/result.png)
