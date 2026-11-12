---
title: "[BOJ 1339] 단어 수학 - Java (자릿수 가중치 계산 & 그리디)"
date: "2021-10-25"
category: "PS/BOJ"
tags: ["BOJ","그리디","정렬","문자열","Java"]
summary: "각 알파벳이 등장하는 자릿수의 합을 10의 거듭제곱 가중치로 환산하여, 가중치가 가장 큰 알파벳부터 9부터 0까지 높은 숫자를 부여하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 단어 수학 (백준 1339번 / 골드 4) |
| **플랫폼 / 난이도** | 백준 (골드 4, 1339번) |
| **문제 링크** | [백준 1339번](https://www.acmicpc.net/problem/1339) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 256MB |
| **입력 조건** | 단어 개수 $N \le 10$, 단어 최대 길이 $\le 8$, 등장 알파벳 최대 10종류 |
| **핵심 규칙** | 각 알파벳에 0부터 9까지의 숫자를 하나씩 배정하여 단어들의 합을 최대화 |

---

## 2. 접근 아이디어: 자릿수 가중치 환산 & 그리디

### 자릿수의 거듭제곱 합산
- 예를 들어 `GCF`와 `ACDEB`가 주어진다면:
  - `A`: $10,000$
  - `C`: $1,000 + 10 = 1,010$
  - `D`: $100$
  - `G`: $100$
  - `E`: $10$
  - `F`: $1$
  - `B`: $1$
- 각 알파벳의 기여도는 해당 알파벳이 등장하는 **모든 자릿수 가중치의 합**으로 정확히 표현됩니다.
- 따라서 각 알파벳의 총 가중치를 계산한 뒤, **가중치가 가장 큰 알파벳부터 9, 8, 7, ... 순으로 높은 숫자를 부여**하면 최대 합이 완성됩니다!

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine());

        int[] weight = new int[26];

        for (int i = 0; i < n; i++) {
            String word = br.readLine();
            int len = word.length();
            int pow = (int) Math.pow(10, len - 1);

            for (int j = 0; j < len; j++) {
                weight[word.charAt(j) - 'A'] += pow;
                pow /= 10;
            }
        }

        Arrays.sort(weight); // 오름차순 정렬

        int sum = 0;
        int digit = 9;

        // 가장 가중치가 큰 25번 인덱스부터 역순으로 9, 8, ... 배정
        for (int i = 25; i >= 0; i--) {
            if (weight[i] == 0) break;
            sum += weight[i] * digit;
            digit--;
        }

        System.out.println(sum);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \times L + 26 \log 26)$ — 단어 문자열 순회 및 크기 26 배열 정렬로 0.05초 미만 즉시 완료.
- **공간 복잡도**: $O(1)$ — 크기 26의 고정 가중치 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1339-word-math/result.png)
