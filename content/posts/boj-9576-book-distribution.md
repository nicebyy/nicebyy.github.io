---
title: "[BOJ 9576] 책 나눠주기 - Java (그리디 정렬 & 마감 번호 우선 배정)"
date: "2021-10-28"
category: "PS/BOJ"
tags: ["BOJ","그리디","정렬","Java"]
summary: "책 범위 [a, b]를 요청하는 학부생들을 b(마감 번호) 오름차순으로 정렬하여 남은 책 중 가장 작은 번호를 탐욕적으로 배정하는 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 책 나눠주기 (백준 9576번 / 골드 2) |
| **플랫폼 / 난이도** | 백준 (골드 2, 9576번) |
| **문제 링크** | [백준 9576번](https://www.acmicpc.net/problem/9576) |
| **제한 사항** | 시간 제한 2초, 메모리 제한 256MB |
| **입력 조건** | 테스트 케이스 $T$, 책 수 $N \le 1,000$, 학부생 수 $M \le 1,000$, 원하는 책 범위 $[a, b]$ |
| **핵심 규칙** | 각 학생에게 원하는 범위 $[a, b]$ 내의 책 1권을 나누어줄 때, **책을 받을 수 있는 최대 학생 수** 구하기 |

---

## 2. 접근 아이디어: 끝점 $b$ 기준 정렬 (그리디)

### 활동 선택 문제(Activity Selection)와의 유사성
- 구간 선택 문제에서 회의 종료 시간이 빠른 회의를 먼저 선택하는 것과 동일하게, **$b$(마감 책 번호)가 작은 학생에게 먼저 책을 주는 것**이 최적입니다.
- 마감 번호 $b$가 같을 경우 시작 번호 $a$가 작은 순으로 정렬합니다.
- 정렬된 학생들을 순회하며, 범위 $[a, b]$ 안에서 **아직 아무에게도 배정되지 않은 가장 작은 번호의 책**을 탐욕적으로 배정합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

public class Main {
    static class Student implements Comparable<Student> {
        int a, b;
        Student(int a, int b) {
            this.a = a;
            this.b = b;
        }
        @Override
        public int compareTo(Student o) {
            if (this.b == o.b) return this.a - o.a;
            return this.b - o.b; // 끝점 오름차순 정렬
        }
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int tc = Integer.parseInt(br.readLine());
        StringBuilder sb = new StringBuilder();

        while (tc-- > 0) {
            StringTokenizer st = new StringTokenizer(br.readLine());
            int n = Integer.parseInt(st.nextToken());
            int m = Integer.parseInt(st.nextToken());

            Student[] students = new Student[m];
            for (int i = 0; i < m; i++) {
                st = new StringTokenizer(br.readLine());
                students[i] = new Student(Integer.parseInt(st.nextToken()), Integer.parseInt(st.nextToken()));
            }

            Arrays.sort(students);

            boolean[] used = new boolean[n + 1];
            int count = 0;

            for (Student s : students) {
                for (int book = s.a; book <= s.b; book++) {
                    if (!used[book]) {
                        used[book] = true;
                        count++;
                        break;
                    }
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

- **시간 복잡도**: $O(M \log M + M \times N)$ — 정렬 후 각 학생당 최대 $N$권 순회. $M, N \le 1,000$이므로 케이스당 약 $10^6$ 연산으로 0.2초 이내 통과.
- **공간 복잡도**: $O(N + M)$ — 학생 배열 및 책 사용 여부 배열.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/boj-9576-book-distribution/result.png)
