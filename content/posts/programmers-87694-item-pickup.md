---
title: "[프로그래머스] 아이템 줍기 - Java (2배 좌표 확대 BFS & 테두리 추적)"
date: "2021-10-19"
category: "PS/Programmers"
tags: ["Programmers","BFS","좌표확대","시뮬레이션","Java"]
summary: "직사각형들이 겹쳤을 때 인접한 모서리가 1칸 차이로 붙어 경로가 왜곡되는 문제를 해결하기 위해 좌표계를 2배로 확대하여 BFS로 테두리 최단거리를 탐색하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 아이템 줍기 (Level 3 / 위클리 챌린지 11주차) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 3) / 위클리 챌린지 11주차 |
| **문제 링크** | [프로그래머스 아이템 줍기 (Level 3 / 위클리 챌린지 11주차)](https://school.programmers.co.kr/learn/courses/30/lessons/87694) |
| **입력 조건** | 직사각형 좌표 목록 `rectangle` ($1 \sim 4$개, 좌표 $1 \sim 50$), 캐릭터 위치, 아이템 위치 |
| **핵심 규칙** | 다각형 테두리를 따라서만 이동할 때, 캐릭터가 아이템을 줍기 위해 이동하는 **최단 거리** 계산 |

---

## 2. 접근 아이디어: 2배 좌표 확대(Scale Up) & BFS 테두리 탐색

### ⚠️ 좌표 간격 1로 인한 경로 왜곡 함정
- 직사각형 2개가 붙어있을 때, 'ㄷ'자 모양으로 파여 있는 경로에서 좌표 간격이 1이면 상하좌우 탐색 시 테두리를 건너뛰고 바로 옆 칸으로 순간이동해 버리는 현상이 발생합니다.
- 예: $(1, 1) \to (1, 2)$와 $(2, 1) \to (2, 2)$가 테두리지만 서로 연결되면 안 되는 경우.

### 💡 해결책: 좌표계를 2배로 확대 ($102 \times 102$)
1. 모든 직사각형 좌표 및 캐릭터/아이템 좌표를 **2배($\times 2$)**로 늘립니다.
2. 직사각형의 내부와 테두리를 다음과 같이 칠합니다:
   - 모든 직사각형 영역의 테두리를 `1`로 표시.
   - 직사각형의 **내부(경계 제외)는 `2`**로 칠하여 테두리를 덮어씀.
   - 이렇게 하면 여러 직사각형이 겹쳤을 때, 바깥쪽 외곽 테두리만 온전히 `1`로 남게 됩니다!
3. `1`로 표시된 테두리만을 따라 BFS 최단거리를 탐색한 뒤, 최종 결과를 **2로 나눈 값($\text{dist} / 2$)**을 반환합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private static final int[] dx = {1, -1, 0, 0};
    private static final int[] dy = {0, 0, 1, -1};

    public int solution(int[][] rectangle, int characterX, int characterY, int itemX, int itemY) {
        // 2배 좌표계 선언 (최대 50 * 2 = 100이므로 102 * 102)
        int[][] map = new int[102][102];

        // 1. 직사각형 테두리(1)와 내부(2) 마킹
        for (int[] rect : rectangle) {
            int x1 = rect[0] * 2, y1 = rect[1] * 2;
            int x2 = rect[2] * 2, y2 = rect[3] * 2;

            for (int x = x1; x <= x2; x++) {
                for (int y = y1; y <= y2; y++) {
                    // 이미 다른 직사각형 내부(2)라면 건너뜀
                    if (map[x][y] == 2) continue;

                    if (x == x1 || x == x2 || y == y1 || y == y2) {
                        map[x][y] = 1; // 테두리
                    } else {
                        map[x][y] = 2; // 내부
                    }
                }
            }
        }

        // 2. 테두리(1)를 따라 BFS 탐색
        Queue<int[]> q = new LinkedList<>();
        boolean[][] visited = new boolean[102][102];

        int startX = characterX * 2, startY = characterY * 2;
        int targetX = itemX * 2, targetY = itemY * 2;

        q.add(new int[]{startX, startY, 0});
        visited[startX][startY] = true;

        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int x = cur[0], y = cur[1], dist = cur[2];

            if (x == targetX && y == targetY) {
                return dist / 2; // 2배 확대했으므로 원래 거리로 복원
            }

            for (int i = 0; i < 4; i++) {
                int nx = x + dx[i];
                int ny = y + dy[i];

                if (nx >= 0 && nx < 102 && ny >= 0 && ny < 102) {
                    if (!visited[nx][ny] && map[nx][ny] == 1) {
                        visited[nx][ny] = true;
                        q.add(new int[]{nx, ny, dist + 1});
                    }
                }
            }
        }

        return 0;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(102 \times 102)$ — 고정된 $102 \times 102$ 격자 내에서 테두리 BFS 탐색으로 0.05초 이내 즉시 완료.
- **공간 복잡도**: $O(102 \times 102)$ — $102 \times 102$ 정수 격자 및 방문 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-87694-item-pickup/result.png)
