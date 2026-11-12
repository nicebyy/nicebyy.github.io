---
title: "[BOJ 1092] 배 - Java (그리디 정렬 & 크레인 순차 배정)"
date: "2021-10-28"
category: "PS/BOJ"
tags: ["BOJ","그리디","정렬","Java"]
summary: "크레인과 박스를 모두 내림차순 정렬한 뒤, 매 분마다 각 크레인이 들 수 있는 가장 무거운 박스를 하나씩 옮기며 총 소요 시간을 최소화하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 배 (백준 1092번 / 골드 5) |
| **플랫폼 / 난이도** | 백준 (골드 5, 1092번) |
| **문제 링크** | [백준 1092번](https://www.acmicpc.net/problem/1092) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 128MB |
| **입력 조건** | 크레인 수 $N \le 50$, 박스 수 $M \le 10,000$, 크레인 및 박스 무게 $\le 1,000,000$ |
| **핵심 규칙** | 1분에 모든 크레인이 동시에 1개씩 박스를 실을 수 있을 때, 모든 박스를 옮기는 **최소 시간(분)** 구하기 (불가능 시 -1) |

---

## 2. 접근 아이디어: 정렬 & 크레인 순차 배정

### 탐욕적 원칙
- 가장 무거운 박스는 들 수 있는 크레인이 제한적입니다.
- 따라서 **크레인과 박스를 모두 내림차순 정렬**한 뒤, 각 크레인이 **현재 자신이 들 수 있는 가장 무거운 박스를 우선적으로 처리**해야 전체 소요 시간이 최소화됩니다.
- 만약 1번 크레인(가장 용량이 큰 크레인)의 무게 제한보다 무거운 박스가 있다면 절대 옮길 수 없으므로 즉시 **`-1`**을 출력합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int n = Integer.parseInt(br.readLine());
        List<Integer> cranes = new ArrayList<>();
        StringTokenizer st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) {
            cranes.add(Integer.parseInt(st.nextToken()));
        }

        int m = Integer.parseInt(br.readLine());
        List<Integer> boxes = new ArrayList<>();
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < m; i++) {
            boxes.add(Integer.parseInt(st.nextToken()));
        }

        // 내림차순 정렬
        cranes.sort(Collections.reverseOrder());
        boxes.sort(Collections.reverseOrder());

        // 가장 큰 박스를 가장 강한 크레인이 못 들면 불가능
        if (boxes.get(0) > cranes.get(0)) {
            System.out.println(-1);
            return;
        }

        int minutes = 0;
        while (!boxes.isEmpty()) {
            int boxIdx = 0;
            for (int i = 0; i < n; i++) {
                if (boxIdx >= boxes.size()) break;

                while (boxIdx < boxes.size()) {
                    if (cranes.get(i) >= boxes.get(boxIdx)) {
                        boxes.remove(boxIdx); // 옮긴 박스 제거
                        break;
                    }
                    boxIdx++;
                }
            }
            minutes++;
        }

        System.out.println(minutes);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(M \times N)$ — 각 분마다 $N$대의 크레인이 박스 리스트를 순회하며 적재. $N \le 50, M \le 10,000$이므로 최악에도 수백만 연산 이내로 2초 제한 내에 통과.
- **공간 복잡도**: $O(N + M)$ — 리스트 저장 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1092-ship/result.png)
