---
title: "[프로그래머스] 거리두기 확인하기 - Java (2021 카카오 채용연계형 인턴십)"
date: "2021-11-17"
category: "PS/Programmers"
tags: ["Programmers","BFS","시뮬레이션","맨해튼거리","카카오","Java"]
summary: "5x5 대기실에서 응시자 간 맨해튼 거리 2 이하 거리두기 수칙 준수 여부를 BFS 탐색으로 검증하는 카카오 기출 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 거리두기 확인하기 (Level 2) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) / 2021 카카오 채용연계형 인턴십 |
| **문제 링크** | [프로그래머스 거리두기 확인하기 (Level 2)](https://school.programmers.co.kr/learn/courses/30/lessons/81302) |
| **입력 조건** | 5개의 대기실(각 $5 \times 5$ 행렬), 응시자(`P`), 빈 테이블(`O`), 파티션(`X`) |
| **핵심 규칙** | 응시자 간 맨해튼 거리가 2 이하일 때, 두 사람 사이에 파티션이 없으면 거리두기 위반 |

---

## 2. 접근 아이디어: BFS 탐색과 거리 2 제약

### 맨해튼 거리와 파티션 조건
- 두 응시자의 좌표가 $(r_1, c_1)$, $(r_2, c_2)$일 때 맨해튼 거리는 $|r_1 - r_2| + |c_1 - c_2|$입니다.
- 거리가 1인 경우: 무조건 거리두기 위반입니다.
- 거리가 2인 경우:
  - 일직선 상에 위치: 사이에 파티션(`X`)이 하나 있어야 안전합니다.
  - 대각선 상에 위치: 두 사람의 공통 인접 칸 2개가 모두 파티션(`X`)이어야 안전합니다.

### 💡 BFS로 간단하고 깔끔하게 풀기
- 복잡하게 대각선, 직선 분기를 나누는 대신, 각 응시자(`P`) 위치에서 **최대 깊이 2까지만 BFS**를 수행합니다.
- 다음 칸이 `X`(파티션)라면 더 이상 이동할 수 없으므로 큐에 넣지 않습니다.
- 다음 칸이 `O`(빈 테이블)라면 큐에 넣어 계속 탐색합니다.
- 거리 1 또는 2인 위치에서 다른 응시자(`P`)를 만나면 즉시 **거리두기 위반(0)**으로 판정합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private static final int[] dx = {1, -1, 0, 0};
    private static final int[] dy = {0, 0, 1, -1};

    public int[] solution(String[][] places) {
        int[] answer = new int[places.length];

        for (int i = 0; i < places.length; i++) {
            answer[i] = checkRoom(places[i]) ? 1 : 0;
        }

        return answer;
    }

    private boolean checkRoom(String[] room) {
        for (int r = 0; r < 5; r++) {
            for (int c = 0; c < 5; c++) {
                if (room[r].charAt(c) == 'P') {
                    if (!bfs(room, r, c)) {
                        return false; // 한 명이라도 거리두기 위반 시 false
                    }
                }
            }
        }
        return true;
    }

    private boolean bfs(String[] room, int startR, int startC) {
        Queue<int[]> queue = new LinkedList<>();
        boolean[][] visited = new boolean[5][5];

        queue.add(new int[]{startR, startC, 0}); // r, c, dist
        visited[startR][startC] = true;

        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            int r = cur[0];
            int c = cur[1];
            int dist = cur[2];

            if (dist >= 2) continue; // 맨해튼 거리 2 초과는 검사 불필요

            for (int i = 0; i < 4; i++) {
                int nr = r + dx[i];
                int nc = c + dy[i];

                if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5 || visited[nr][nc]) {
                    continue;
                }

                char cell = room[nr].charAt(nc);
                if (cell == 'X') {
                    continue; // 파티션은 통과 불가
                }

                if (cell == 'P') {
                    return false; // 파티션 없이 거리 2 이내에서 다른 사람 발견!
                }

                // 빈 테이블(O)인 경우 경유하여 계속 탐색
                visited[nr][nc] = true;
                queue.add(new int[]{nr, nc, dist + 1});
            }
        }

        return true;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(5 \times 5 \times 5) = O(1)$ — 방 1개당 최대 25칸, 각 칸에서 최대 깊이 2 탐색(최대 12칸 방문)으로 총 5개 대기실 순회는 수 밀리초 내에 즉시 완료.
- **공간 복잡도**: $O(1)$ — 고정 크기 $5 \times 5$ 배열 사용.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-81302-distancing-check/result.png)
