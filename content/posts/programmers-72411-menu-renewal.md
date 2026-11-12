---
title: "[프로그래머스] 메뉴 리뉴얼 - Java (백트래킹 조합 & 해시맵 빈도수 계산)"
date: "2021-11-15"
category: "PS/Programmers"
tags: ["Programmers","조합","해시","백트래킹","카카오","Java"]
summary: "각 손님의 주문에서 코스 요리 길이별 조합을 생성하여 빈도수를 카운트하고 최소 2명 이상 주문한 최빈 메뉴 구성을 선별하는 카카오 기출 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 메뉴 리뉴얼 (Level 2) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) / 2021 KAKAO BLIND RECRUITMENT |
| **문제 링크** | [프로그래머스 메뉴 리뉴얼 (Level 2)](https://school.programmers.co.kr/learn/courses/30/lessons/72411) |
| **입력 조건** | 손님 수 $N \le 20$, 각 주문 단품 수 $\le 10$, 원하는 코스 요리 메뉴 수 `course` |
| **핵심 규칙** | 각 코스 길이별로 최소 2명 이상의 손님에게 주문된 조합 중 **가장 많이 주문된 조합**만 선별 (동률 시 모두 포함), 사전순 정렬 출력 |

---

## 2. 접근 아이디어: 조합 & 해시 빈도수 카운트

### 단계별 해결 알고리즘
1. **단품 메뉴 사전순 정렬**:
   - 손님이 "AB"를 시키든 "BA"를 시키든 같은 코스로 취급해야 하므로, 각 주문 문자열을 먼저 알파벳 순으로 정렬합니다 (`Arrays.sort(charArr)`).
2. **원하는 길이별 조합 생성**:
   - 각 주문에서 `course`에 명시된 길이 $k$인 모든 조합을 백트래킹(`comb`)으로 추출합니다.
   - 추출된 조합 문자열을 해시맵(`Map<String, Integer>`)에 넣어 등장 횟수를 누적합니다.
3. **최다 빈도 코스 선별**:
   - 각 코스 길이 $k$마다 최대 주문 횟수를 구합니다.
   - 최대 횟수가 2 이상인 경우, 해당 횟수와 일치하는 모든 조합을 결과 리스트에 추가합니다.
4. **결과 정렬**:
   - 선별된 모든 추천 코스 요리들을 사전순으로 정렬하여 반환합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private static Map<String, Integer> map = new HashMap<>();

    public String[] solution(String[] orders, int[] course) {
        List<String> answerList = new ArrayList<>();

        for (int c : course) {
            map.clear();
            int maxCount = 0;

            // 각 손님의 주문에 대해 길이 c인 조합 추출
            for (String order : orders) {
                char[] chars = order.toCharArray();
                Arrays.sort(chars); // 문자열 사전순 정렬
                generateCombinations(chars, new StringBuilder(), 0, 0, c);
            }

            // 최다 주문 횟수 탐색
            for (int count : map.values()) {
                maxCount = Math.max(maxCount, count);
            }

            // 최소 2명 이상 주문되고 최다 주문된 조합 선별
            if (maxCount >= 2) {
                for (Map.Entry<String, Integer> entry : map.entrySet()) {
                    if (entry.getValue() == maxCount) {
                        answerList.add(entry.getKey());
                    }
                }
            }
        }

        Collections.sort(answerList);
        return answerList.toArray(new String[0]);
    }

    private void generateCombinations(char[] chars, StringBuilder sb, int start, int depth, int targetLen) {
        if (depth == targetLen) {
            String comb = sb.toString();
            map.put(comb, map.getOrDefault(comb, 0) + 1);
            return;
        }

        for (int i = start; i < chars.length; i++) {
            sb.append(chars[i]);
            generateCombinations(chars, sb, i + 1, depth + 1, targetLen);
            sb.deleteCharAt(sb.length() - 1);
        }
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**: $O\left(\sum_{k} \left( N \times \binom{L}{k} \right)\right)$ — 손님 수 $N \le 20$, $L \le 10$이므로 조합 최대 수는 $\binom{10}{5} = 252$개. 손님 20명 전체를 합쳐도 수천 번 연산 이내로 0.05초 미만에 완료.
- **공간 복잡도**: $O(K)$ — 각 코스 길이별 조합 문자열을 담는 해시맵.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-72411-menu-renewal/result.png)
