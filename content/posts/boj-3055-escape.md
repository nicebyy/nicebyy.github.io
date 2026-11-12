---
title: "[BOJ 3055] 탈출 - Java (너비 우선 탐색 BFS & 동시 시뮬레이션)"
date: "2021-11-07"
category: "PS/BOJ"
tags: ["BOJ","BFS","너비우선탐색","시뮬레이션","그래프","Java"]
summary: "매 분마다 물이 먼저 번진 뒤 고슴도치가 이동 가능한 인접 칸으로 피신하며 비버의 굴로 탈출하는 최단 시간 2중 BFS 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 탈출 (백준 3055번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 3055번) |
| **문제 링크** | [백준 3055번](https://www.acmicpc.net/problem/3055) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 128MB |
| **입력 조건** | $R, C \le 50$, 고슴도치(`S`), 비버 굴(`D`), 물(`*`), 돌(`X`), 빈 곳(`.`) |
| **핵심 규칙** | 매 분 물이 먼저 인접 빈 칸으로 번지고, 고슴도치는 물이 찰 예정인 칸으로 이동 불가. 비버 굴까지의 최소 이동 시간(불가능 시 `KAKTUS`) |

---

## 2. 접근 아이디어: 너비 우선 탐색(BFS) 동시 시뮬레이션

### 물 번짐 우선의 원칙
- 문제의 핵심 조건: **"고슴도치는 물이 찰 예정인 칸으로 이동할 수 없다."**
- 따라서 각 턴마다 **물이 먼저 1칸씩 번진 뒤, 고슴도치가 이동**해야 합니다.
- 큐 2개(`waterQ`, `hedgehogQ`)를 두고 턴 단위(레벨 단위)로 BFS를 교대로 수행합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int r, c;
    static char[][] map;
    static Queue<int[]> waterQ = new LinkedList<>();
    static Queue<int[]> hedgeQ = new LinkedList<>();
    static boolean[][] visited;
    static int[] dx = {1, -1, 0, 0};
    static int[] dy = {0, 0, 1, -1};

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        r = Integer.parseInt(st.nextToken());
        c = Integer.parseInt(st.nextToken());

        map = new char[r][c];
        visited = new boolean[r][c];

        for (int i = 0; i < r; i++) {
            String line = br.readLine();
            for (int j = 0; j < c; j++) {
                map[i][j] = line.charAt(j);
                if (map[i][j] == '*') {
                    waterQ.add(new int[]{i, j});
                } else if (map[i][j] == 'S') {
                    hedgeQ.add(new int[]{i, j, 0});
                    visited[i][j] = true;
                }
            }
        }

        int result = bfs();
        if (result == -1) {
            System.out.println("KAKTUS");
        } else {
            System.out.println(result);
        }
    }

    static int bfs() {
        while (!hedgeQ.isEmpty()) {
            // 1. 물 먼저 1턴 확산
            int waterSize = waterQ.size();
            for (int i = 0; i < waterSize; i++) {
                int[] cur = waterQ.poll();
                for (int d = 0; d < 4; d++) {
                    int nx = cur[0] + dx[d];
                    int ny = cur[1] + dy[d];
                    if (nx >= 0 && nx < r && ny >= 0 && ny < c && map[nx][ny] == '.') {
                        map[nx][ny] = '*';
                        waterQ.add(new int[]{nx, ny});
                    }
                }
            }

            // 2. 고슴도치 1턴 이동
            int hedgeSize = hedgeQ.size();
            for (int i = 0; i < hedgeSize; i++) {
                int[] cur = hedgeQ.poll();
                int x = cur[0], y = cur[1], time = cur[2];

                for (int d = 0; d < 4; d++) {
                    int nx = x + dx[d];
                    int ny = y + dy[d];

                    if (nx >= 0 && nx < r && ny >= 0 && ny < c) {
                        if (map[nx][ny] == 'D') {
                            return time + 1; // 비버의 굴 도착!
                        }
                        if (map[nx][ny] == '.' && !visited[nx][ny]) {
                            visited[nx][ny] = true;
                            hedgeQ.add(new int[]{nx, ny, time + 1});
                        }
                    }
                }
            }
        }

        return -1; // 도달 불가
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(R \times C)$ — 격자의 각 칸은 물 큐와 고슴도치 큐에 최대 1회씩만 들어가므로 $50 \times 50 = 2,500$ 연산으로 0.05초 이내 완료.
- **공간 복잡도**: $O(R \times C)$ — 맵 및 방문 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-3055-escape/result.png)
