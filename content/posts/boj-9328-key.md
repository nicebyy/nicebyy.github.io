---
title: "[BOJ 9328] 열쇠 - Java (BFS & 비트마스킹 / 대기 큐 열쇠 시뮬레이션)"
date: "2021-07-12"
category: "PS/BOJ"
tags: ["BOJ","BFS","비트마스킹","그래프","Java"]
summary: "빌딩 외곽을 패딩하여 어디서든 진입 가능하게 하고, 열쇠가 없어 못 열었던 문을 새로운 열쇠 획득 시 대기 큐에서 꺼내 재진입하는 BFS 문서 훔치기 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 열쇠 (백준 9328번 / 골드 1) |
| **플랫폼 / 난이도** | 백준 (골드 1, 9328번) |
| **문제 링크** | [백준 9328번](https://www.acmicpc.net/problem/9328) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 지도 높이 $h$, 너비 $w$ ($h, w \le 100$), 초기 소지 열쇠 문자열 |
| **핵심 규칙** | 건물 밖에서 출발하여 훔칠 수 있는 문서(`$`)의 최대 개수 구하기 |

---

## 2. 접근 아이디어: 외곽 패딩 BFS와 대기 큐(Pending Doors) 최적화

### 건물 외부 진입을 우아하게 처리하는 '패딩' 기법
- 문제에서는 상근이가 지도의 가장자리 어디로든 진입할 수 있다고 주어집니다.
- 가장자리 모든 좌표를 큐에 넣는 대신, **지도 크기를 $(h + 2) \times (w + 2)$로 확장하고 테두리를 빈칸(`.`)으로 감싸면**, $(0, 0)$ 단 한 점에서 BFS를 시작하는 것만으로 모든 외부 진입로가 자동으로 처리됩니다!

### 열쇠 획득 시 재탐색 최적화 (문 대기 큐)
- 탐색 도중 문(`A-Z`)을 만났는데 열쇠가 없다면, 그 문의 좌표를 **`doorQueue[door - 'A']`**에 저장해 둡니다.
- 이후 탐색 도중 해당 열쇠를 새로 획득하면, 그동안 대기하고 있던 모든 해당 문의 좌표를 **즉시 BFS 큐에 다시 밀어 넣어** 탐색을 이어갑니다.
- 이 방식을 사용하면 전체 지도를 매번 처음부터 재탐색할 필요 없이 **단 한 번의 선형 BFS**로 문제를 해결할 수 있습니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Point {
        int y, x;
        Point(int y, int x) { this.y = y; this.x = x; }
    }

    static int h, w;
    static char[][] map;
    static boolean[][] visited;
    static boolean[] hasKey;
    static List<Point>[] doorPending;
    static int[] dy = {-1, 1, 0, 0};
    static int[] dx = {0, 0, -1, 1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());

        StringBuilder sb = new StringBuilder();
        while (tc-- > 0) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            h = Integer.parseInt(st.nextToken());
            w = Integer.parseInt(st.nextToken());

            // 외곽 패딩을 위해 (h+2) x (w+2) 크기로 할당
            map = new char[h + 2][w + 2];
            visited = new boolean[h + 2][w + 2];
            hasKey = new boolean[26];
            doorPending = new ArrayList[26];
            for (int i = 0; i < 26; i++) {
                doorPending[i] = new ArrayList<>();
            }

            for (int i = 0; i < h + 2; i++) {
                Arrays.fill(map[i], '.');
            }

            for (int i = 1; i <= h; i++) {
                String line = br.readLine();
                for (int j = 1; j <= w; j++) {
                    map[i][j] = line.charAt(j - 1);
                }
            }

            String initKeys = br.readLine();
            if (!initKeys.equals("0")) {
                for (char k : initKeys.toCharArray()) {
                    hasKey[k - 'a'] = true;
                }
            }

            sb.append(bfs()).append("\n");
        }

        System.out.print(sb);
    }

    private static int bfs() {
        Queue<Point> queue = new ArrayDeque<>();
        queue.offer(new Point(0, 0));
        visited[0][0] = true;
        int docCount = 0;

        while (!queue.isEmpty()) {
            Point cur = queue.poll();

            for (int i = 0; i < 4; i++) {
                int ny = cur.y + dy[i];
                int nx = cur.x + dx[i];

                if (ny < 0 || ny >= h + 2 || nx < 0 || nx >= w + 2) continue;
                if (visited[ny][nx] || map[ny][nx] == '*') continue;

                char cell = map[ny][nx];
                visited[ny][nx] = true;

                // 1. 문을 만난 경우
                if (cell >= 'A' && cell <= 'Z') {
                    int kIdx = cell - 'A';
                    if (!hasKey[kIdx]) {
                        doorPending[kIdx].add(new Point(ny, nx));
                        continue; // 열쇠가 없으면 일단 멈춤
                    }
                }

                // 2. 열쇠를 주운 경우
                if (cell >= 'a' && cell <= 'z') {
                    int kIdx = cell - 'a';
                    hasKey[kIdx] = true;

                    // 이 열쇠를 기다리던 문들을 모두 큐에 추가
                    for (Point door : doorPending[kIdx]) {
                        queue.offer(door);
                    }
                    doorPending[kIdx].clear();
                }

                // 3. 문서를 주운 경우
                if (cell == '$') {
                    docCount++;
                }

                queue.offer(new Point(ny, nx));
            }
        }

        return docCount;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(H \times W)$ — 대기 큐 방식을 통해 각 칸을 상수 번만 방문하므로 $100 \times 100$ 지도에서 케이스당 0.1초 이내에 빠르게 통과합니다.
- **공간 복잡도**: $O(H \times W)$ — 확장 맵 배열 및 방문 배열 크기.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-9328-key/result.png)
