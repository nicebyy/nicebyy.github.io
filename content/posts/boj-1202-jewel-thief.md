---
title: "[BOJ 1202] 보석 도둑 - Java (그리디 정렬 & 최대 힙 PriorityQueue)"
date: "2021-10-26"
category: "PS/BOJ"
tags: ["BOJ","그리디","우선순위 큐","정렬","Java"]
summary: "가방과 보석을 무게 오름차순으로 정렬한 뒤, 작은 가방부터 담을 수 있는 모든 보석을 최대 힙에 모아 가장 비싼 보석을 매칭하는 전형적인 탐욕법"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 보석 도둑 (백준 1202번 / 골드 2) |
| **플랫폼 / 난이도** | 백준 (골드 2, 1202번) |
| **문제 링크** | [백준 1202번](https://www.acmicpc.net/problem/1202) |
| **제한 사항** | 시간 제한 1초, 메모리 제한 256MB |
| **입력 조건** | 보석 수 $N \le 300,000$, 가방 수 $K \le 300,000$, 보석 무게 $M$, 가치 $V$, 가방 한도 $C \le 100,000,000$ |
| **핵심 규칙** | 각 가방에는 최대 1개의 보석만 담을 수 있을 때, 훔칠 수 있는 **보석 가치의 최대 합** 계산 |

---

## 2. 접근 아이디어: 가방 오름차순 & 최대 힙(PriorityQueue)

### 탐욕적 매칭 전략
1. **가방과 보석 정렬**:
   - 가방의 용량 $C_i$를 오름차순으로 정렬합니다.
   - 보석들도 무게 $M_i$를 기준으로 오름차순 정렬합니다.
2. **작은 가방부터 처리**:
   - 용량이 작은 가방부터 차례로 확인합니다.
   - 현재 가방에 담을 수 있는(즉, $M_i \le C$) 모든 보석의 가치 $V_i$를 **최대 힙(`PriorityQueue`)**에 전부 삽입합니다.
   - 현재 가방에는 힙에 모인 보석 중 **가장 가치가 높은 보석(`pq.poll()`)**을 골라 담습니다.
3. 다음 가방으로 넘어갈 때, 이미 힙에 들어간 보석들은 다음 가방의 용량도 당연히 만족하므로(가방이 오름차순 정렬되어 있으므로) 힙을 초기화하지 않고 그대로 이어서 사용합니다.
4. $N, K \le 300,000$에서 총 가치가 `int` 범위를 초과할 수 있으므로 **`long` 누적 합**을 사용해야 합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Jewel implements Comparable<Jewel> {
        int weight, value;
        Jewel(int weight, int value) {
            this.weight = weight;
            this.value = value;
        }
        @Override
        public int compareTo(Jewel o) {
            return this.weight - o.weight; // 무게 오름차순
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());

        int n = Integer.parseInt(st.nextToken());
        int k = Integer.parseInt(st.nextToken());

        Jewel[] jewels = new Jewel[n];
        for (int i = 0; i < n; i++) {
            st = new StringTokenizer(br.readLine());
            jewels[i] = new Jewel(Integer.parseInt(st.nextToken()), Integer.parseInt(st.nextToken()));
        }

        int[] bags = new int[k];
        for (int i = 0; i < k; i++) {
            bags[i] = Integer.parseInt(br.readLine());
        }

        Arrays.sort(jewels);
        Arrays.sort(bags);

        // 현재 가방에 들어갈 수 있는 보석의 가치를 저장할 최대 힙
        PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());

        long totalValue = 0;
        int jewelIdx = 0;

        for (int bagCap : bags) {
            // 현재 가방에 담을 수 있는 모든 보석을 힙에 추가
            while (jewelIdx < n && jewels[jewelIdx].weight <= bagCap) {
                pq.add(jewels[jewelIdx].value);
                jewelIdx++;
            }

            // 가장 비싼 보석 1개 선택
            if (!pq.isEmpty()) {
                totalValue += pq.poll();
            }
        }

        System.out.println(totalValue);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N + K \log K + (N + K) \log N)$ — 보석 및 가방 정렬 후 각 보석은 힙에 최대 1회 삽입 및 1회 삭제. $N, K = 300,000$ 규모에서 약 0.7초 이내 통과.
- **공간 복잡도**: $O(N + K)$ — 보석 배열, 가방 배열, 우선순위 큐 메모리.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1202-jewel-thief/result.png)
