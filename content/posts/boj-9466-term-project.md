---
title: "[BOJ 9466] 텀 프로젝트 - Java (방향 그래프 사이클 탐색 DFS)"
date: "2021-10-17"
category: "PS/BOJ"
tags: ["BOJ","그래프","DFS","사이클","Java"]
summary: "학생들의 지목 관계에서 발생하는 단방향 사이클을 DFS 방문 완료 배열로 검출하여 프로젝트 팀에 속하지 못하는 학생 수를 구하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 텀 프로젝트 (백준 9466번 / 골드 3) |
| **플랫폼 / 난이도** | 백준 (골드 3, 9466번) |
| **문제 링크** | [백준 9466번](https://www.acmicpc.net/problem/9466) |
| **제한 사항** | 시간 제한 3초, 메모리 제한 256MB |
| **입력 조건** | 테스트 케이스 $T$, 학생 수 $n \le 100,000$, 각 학생이 선택한 학생 번호 |
| **핵심 규칙** | 사이클(Cycle)을 이루는 학생들만 한 팀이 될 수 있을 때, **어느 팀에도 속하지 않는 학생의 수** 구하기 |

---

## 2. 접근 아이디어: DFS 사이클 검출 & finished 배열

### ⚠️ 왜 단순 DFS 재탐색은 시간 초과인가?
- 각 학생마다 사이클 검사를 위해 매번 방문 배열을 초기화하고 DFS를 돌리면 $O(N^2) \approx 10^{10}$으로 3초 시간 제한을 초과합니다.

### 💡 해결책: $O(N)$ 단일 패스 DFS & `finished[]` 배열
1. **`visited[u]`**: 현재 DFS 탐색 경로에 포함되어 있는가?
2. **`finished[u]`**: 노드 $u$로부터의 탐색 및 사이클 판별이 완전히 종료되었는가?
3. 노드 $u$에서 다음 노드 $next$를 탐색할 때:
   - $next$가 아직 방문되지 않았다면: 계속 DFS 탐색.
   - $next$가 방문되었지만 **아직 finished되지 않았다면**: **현재 경로에서 사이클이 형성**된 것입니다!
     - $next$부터 시작하여 $u$까지 사이클을 한 바퀴 돌며 사이클에 속한 정점들의 개수를 카운트합니다.
4. 탐색이 끝나면 `finished[u] = true`로 표시하여 이후 다른 경로에서 $u$를 다시 방문하더라도 즉시 탐색을 종료합니다.
5. 팀에 속하지 못한 학생 수 = $n - (\text{사이클에 속한 총 학생 수})$.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static int[] choice;
    static boolean[] visited;
    static boolean[] finished;
    static int teamCount;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());
        StringBuilder sb = new StringBuilder();

        while (tc-- > 0) {
            n = Integer.parseInt(br.readLine());
            choice = new int[n + 1];
            visited = new boolean[n + 1];
            finished = new boolean[n + 1];
            teamCount = 0;

            StringTokenizer st = new StringTokenizer(br.readLine());
            for (int i = 1; i <= n; i++) {
                choice[i] = Integer.parseInt(st.nextToken());
            }

            for (int i = 1; i <= n; i++) {
                if (!visited[i]) {
                    dfs(i);
                }
            }

            sb.append(n - teamCount).append("\n");
        }

        System.out.print(sb);
    }

    static void dfs(int u) {
        visited[u] = true;
        int next = choice[u];

        if (!visited[next]) {
            dfs(next);
        } else if (!finished[next]) {
            // 사이클 발견: next부터 u까지 돌며 학생 수 카운트
            for (int node = next; node != u; node = choice[node]) {
                teamCount++;
            }
            teamCount++; // 자기 자신(u) 포함
        }

        finished[u] = true; // 탐색 종료 마킹
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 각 노드와 간선은 최대 1번씩만 방문되므로 $N = 100,000$ 규모에서 0.5초 이내에 빠르게 통과.
- **공간 복잡도**: $O(N)$ — 정점 배열 및 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-9466-term-project/result.png)
