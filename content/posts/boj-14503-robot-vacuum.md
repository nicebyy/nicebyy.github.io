---
title: "[BOJ 14503] 로봇 청소기 - Java (시뮬레이션 & 방향 전환 구현)"
date: "2021-08-27"
category: "PS/BOJ"
tags: ["BOJ","시뮬레이션","구현","Java"]
summary: "현재 위치 청소, 반시계 90도 회전 탐색, 4방향 청소 불가 시 후진 또는 종료 규칙을 충실히 구현하는 삼성 SW 역량테스트 기출 시뮬레이션"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 로봇 청소기 (백준 14503번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 14503번) |
| **문제 링크** | [백준 14503번](https://www.acmicpc.net/problem/14503) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 512MB |
| **입력 조건** | 격자 크기 $N, M \le 50$, 청소기 위치 $(r, c)$, 초기 방향 $d$ (0:북, 1:동, 2:남, 3:서) |
| **핵심 규칙** | 규칙에 따라 동작할 때 로봇 청소기가 청소하는 총 영역의 칸 수 구하기 |

---

## 2. 접근 아이디어: 규칙에 따른 시뮬레이션 구현

### 청소기 동작 알고리즘
1. **현재 칸 청소**: 현재 칸이 아직 청소되지 않았다면 청소(2로 표시)하고 카운트를 증가시킵니다.
2. **주변 4칸 탐색**:
   - 현재 방향을 기준으로 **반시계 방향 90도 회전**: `(dir + 3) % 4`
   - 회전한 방향의 앞쪽 칸이 아직 청소되지 않은 빈칸(0)이라면 한 칸 전진 후 1번으로 돌아갑니다.
3. **4칸 모두 청소되었거나 벽인 경우**:
   - 바라보는 방향을 유지한 채 **한 칸 후진**: `ny = y - dy[dir]`, `nx = x - dx[dir]`
   - 뒤쪽 칸이 벽(1)이라 후진할 수 없다면 작동을 멈추고 종료합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    // 북(0), 동(1), 남(2), 서(3)
    static int[] dy = {-1, 0, 1, 0};
    static int[] dx = {0, 1, 0, -1};
    static int n, m;
    static int[][] map;
    static int cleanCount = 0;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        n = Integer.parseInt(st.nextToken());
        m = Integer.parseInt(st.nextToken());

        st = new StringTokenizer(br.readLine());
        int r = Integer.parseInt(st.nextToken());
        int c = Integer.parseInt(st.nextToken());
        int d = Integer.parseInt(st.nextToken());

        map = new int[n][m];
        for (int i = 0; i < n; i++) {
            st = new StringTokenizer(br.readLine());
            for (int j = 0; j < m; j++) {
                map[i][j] = Integer.parseInt(st.nextToken());
            }
        }

        clean(r, c, d);
        System.out.println(cleanCount);
    }

    private static void clean(int y, int x, int dir) {
        // 1. 현재 칸 청소
        if (map[y][x] == 0) {
            map[y][x] = 2; // 청소 완료 표시
            cleanCount++;
        }

        // 2. 4방향 확인
        for (int i = 0; i < 4; i++) {
            dir = (dir + 3) % 4; // 반시계 회전
            int ny = y + dy[dir];
            int nx = x + dx[dir];

            if (ny >= 0 && ny < n && nx >= 0 && nx < m && map[ny][nx] == 0) {
                clean(ny, nx, dir);
                return; // 청소하고 전진했으므로 이후 단계는 건너뜀
            }
        }

        // 3. 4방향 모두 빈칸이 없을 때: 후진 시도
        int backDir = (dir + 2) % 4;
        int by = y + dy[backDir];
        int bx = x + dx[backDir];

        if (by >= 0 && by < n && bx >= 0 && bx < m && map[by][bx] != 1) {
            clean(by, bx, dir); // 방향 유지한 채 후진
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times M)$ — 모든 칸은 최대 한 번 청소되며, 벽과 후진을 포함해도 최대 $4 \times N \times M$번 이내의 함수 호출로 종료됩니다.
- **공간 복잡도**: $O(N \times M)$ — 맵 배열 및 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-14503-robot-vacuum/result.png)
