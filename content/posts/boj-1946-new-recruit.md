---
title: "[BOJ 1946] 신입 사원 - Java (그리디 정렬 & 1차원 커트라인 갱신)"
date: "2021-09-13"
category: "PS/BOJ"
tags: ["BOJ","그리디","정렬","Java"]
summary: "서류 성적 순위로 지원자들을 정렬한 뒤, 면접 성적의 역대 최고 순위(최솟값)를 갱신하며 다른 모든 지원자에게 뒤처지지 않는 선발 인원을 세는 그리디 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 신입 사원 (백준 1946번 / 실버 1) |
| **플랫폼 / 난이도** | 백준 (실버 1, 1946번) |
| **문제 링크** | [백준 1946번](https://www.acmicpc.net/problem/1946) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 256MB |
| **입력 조건** | 지원자 수 $N \le 100,000$, 서류 순위 및 면접 순위 |
| **핵심 규칙** | 다른 모든 지원자와 비교했을 때 서류와 면접 성적 중 적어도 하나가 뒤처지지 않는 **최대 선발 인원수** 구하기 |

---

## 2. 접근 아이디어: 서류 기준 정렬 & 면접 순위 커트라인 갱신

### 그리디 정렬
1. 지원자들을 **서류 심사 순위 기준 오름차순**으로 정렬합니다.
2. 서류 1등 지원자는 무조건 선발됩니다.
3. 이후 지원자들은 앞선 지원자들보다 서류 성적이 무조건 낮으므로, 선발되려면 **"앞선 모든 선발자들의 면접 성적보다 자신의 면접 성적이 더 우수(순위 번호가 더 작아야 함)"**해야 합니다!
4. 역대 최고 면접 순위(`minInterviewRank`)를 유지하며, 이보다 순위가 높은 지원자만 선발하고 최솟값을 갱신합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Applicant implements Comparable<Applicant> {
        int doc, interview;
        Applicant(int doc, int interview) {
            this.doc = doc;
            this.interview = interview;
        }
        @Override
        public int compareTo(Applicant o) {
            return this.doc - o.doc; // 서류 순위 오름차순
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());
        StringBuilder sb = new StringBuilder();

        while (tc-- > 0) {
            int n = Integer.parseInt(br.readLine());
            Applicant[] list = new Applicant[n];

            for (int i = 0; i < n; i++) {
                StringTokenizer st = new StringTokenizer(br.readLine());
                list[i] = new Applicant(Integer.parseInt(st.nextToken()), Integer.parseInt(st.nextToken()));
            }

            Arrays.sort(list);

            int count = 1; // 서류 1등 선발
            int minInterviewRank = list[0].interview;

            for (int i = 1; i < n; i++) {
                if (list[i].interview < minInterviewRank) {
                    count++;
                    minInterviewRank = list[i].interview;
                }
            }

            sb.append(count).append("\n");
        }

        System.out.print(sb);
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O(N \log N)$ — 정렬 후 선형 1회 순회. $N = 100,000$ 규모에서 0.4초 이내 완료.
- **공간 복잡도**: $O(N)$ — 지원자 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-1946-new-recruit/result.png)
