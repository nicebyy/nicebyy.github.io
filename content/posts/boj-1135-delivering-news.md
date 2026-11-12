---
title: "[BOJ 1135] 뉴스 전하기 - Java (트리 그리디 & 서브트리 전파 정렬)"
date: "2021-11-08"
category: "PS/BOJ"
tags: ["BOJ","트리","그리디","정렬","DFS","Java"]
summary: "민식이부터 모든 부하 직원에게 뉴스를 전파할 때, 전파 시간이 오래 걸리는 서브트리 자식부터 먼저 통화하도록 정렬하는 그리디 트리 탐색"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 뉴스 전하기 (백준 1135번 / 골드 2) |
| **플랫폼 / 난이도** | 백준 (골드 2, 1135번) |
| **문제 링크** | [백준 1135번](https://www.acmicpc.net/problem/1135) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 직원 수 $N \le 50$, 직속 상사 번호 배열 ($0$번 민식이는 상사 없음 `-1`) |
| **핵심 규칙** | 한 번에 한 부하 직원에게만 전화를 걸 수 있고 전화는 1분 소요될 때, 모든 직원에게 뉴스가 전파되는 최소 시간 구하기 |

---

## 2. 접근 아이디어: 서브트리 전파 시간 기준 그리디 정렬

### 탐욕적 직관
- 사장 $u$가 자신의 부하 직원들에게 전화를 걸 때, **"뉴스를 전달받은 후 자기 부하들에게 전파하는 데 시간이 가장 오래 걸리는 직원"**에게 먼저 전화를 걸어야 병렬적으로 전체 전파가 가장 빨리 끝납니다.
- 따라서 각 자식 $v$의 서브트리를 완료하는 데 걸리는 시간 $time_v$를 구한 뒤, 이를 **내림차순 정렬**합니다.

### 점화식
- 정렬된 자식들에 대해, $i$번째 자식(0-indexed)에게는 $(i + 1)$분째에 통화가 시작되므로 완료 시간은 다음과 같습니다:
  $$\text{totalTime} = \max_{i} (time_i + i + 1)$$

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static int n;
    static List<Integer>[] children;

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        n = Integer.parseInt(br.readLine());

        children = new ArrayList[n];
        for (int i = 0; i < n; i++) children[i] = new ArrayList<>();

        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            int p = Integer.parseInt(st.nextToken());
            if (p != -1) {
                children[p].add(i);
            }
        }

        System.out.println(dfs(0));
    }

    static int dfs(int u) {
        if (children[u].isEmpty()) return 0;

        List<Integer> childTimes = new ArrayList<>();
        for (int v : children[u]) {
            childTimes.add(dfs(v));
        }

        // 시간이 오래 걸리는 자식부터 내림차순 정렬
        childTimes.sort(Collections.reverseOrder());

        int maxTime = 0;
        for (int i = 0; i < childTimes.size(); i++) {
            maxTime = Math.max(maxTime, childTimes.get(i) + (i + 1));
        }

        return maxTime;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 각 노드에서 자식 정렬 시간 소요. $N \le 50$이므로 0.05초 미만에 완료.
- **공간 복잡도**: $O(N)$ — 트리 자식 리스트 및 재귀 호출 스택.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1135-delivering-news/result.png)
