---
title: "[BOJ 1068] 트리 - Java (트리 노드 삭제 & 리프 노드 카운트 DFS)"
date: "2021-06-15"
category: "PS/BOJ"
tags: ["BOJ","트리","DFS","그래프","Java"]
summary: "특정 노드를 삭제했을 때 그 서브트리를 모두 배제하고, 루트 노드부터 DFS를 돌며 자식이 없거나 유일한 자식이 삭제된 리프 노드의 개수를 세는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 트리 (백준 1068번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 1068번) |
| **문제 링크** | [백준 1068번](https://www.acmicpc.net/problem/1068) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 노드의 개수 $N \le 50$, 각 노드의 부모 번호, 삭제할 노드 번호 $C$ |
| **핵심 규칙** | 노드 $C$와 그 자손 노드를 모두 삭제했을 때, 남은 트리의 리프(Leaf) 노드 개수 구하기 |

---

## 2. 접근 아이디어: DFS 트리 탐색과 리프 노드 판별

### 주의해야 할 엣지 케이스 (부모의 자식이 1개뿐이었던 경우)
- 삭제할 노드가 루트 노드인 경우: 남은 트리가 없으므로 결과는 즉시 **0**입니다.
- 트리 DFS 탐색 시, 자식 노드가 삭제 대상 $C$라면 해당 자식 방향으로는 탐색을 진행하지 않습니다.
- **결정적 함정**: 어떤 노드의 자식이 $C$ 하나뿐이었는데 그 $C$가 삭제된다면, 원래 리프가 아니었던 해당 부모 노드가 **새로운 리프 노드**가 됩니다!
- 따라서 단순히 `children.isEmpty()`만 보는 것이 아니라, **"삭제되지 않고 실제로 탐색 가능한 유효한 자식 수"**가 0개인 노드를 리프로 판정해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n, deleteNode;
    static List<Integer>[] tree;
    static int leafCount = 0;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        tree = new ArrayList[n];
        for (int i = 0; i < n; i++) {
            tree[i] = new ArrayList<>();
        }

        int root = -1;
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            int parent = Integer.parseInt(st.nextToken());
            if (parent == -1) {
                root = i;
            } else {
                tree[parent].add(i);
            }
        }

        deleteNode = Integer.parseInt(br.readLine());

        // 루트가 삭제되면 리프 노드는 0개
        if (root == deleteNode) {
            System.out.println(0);
            return;
        }

        dfs(root);
        System.out.println(leafCount);
    }

    private static void dfs(int cur) {
        int validChildren = 0;

        for (int child : tree[cur]) {
            if (child != deleteNode) {
                validChildren++;
                dfs(child);
            }
        }

        // 유효한 자식이 하나도 없다면 현재 노드가 리프 노드
        if (validChildren == 0) {
            leafCount++;
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N)$ — 노드 개수 $N \le 50$에 대해 DFS로 한 번 순회하므로 1ms 이내로 종료됩니다.
- **공간 복잡도**: $O(N)$ — 인접 리스트 및 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1068-tree/result.png)
