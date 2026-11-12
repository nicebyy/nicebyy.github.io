---
title: "[프로그래머스] 순위 검색 - Java (조합 생성 & 이분 탐색 Binary Search)"
date: "2021-11-16"
category: "PS/Programmers"
tags: ["Programmers","이분탐색","해시","조합","카카오","Java"]
summary: "지원자 정보로 가능한 16가지 조건 키를 조합하여 해시맵에 점수 리스트로 분류하고 이분 탐색(lower bound)으로 쿼리를 고속 처리하는 카카오 기출 풀이"
---

## 1. 문제 개요 및 조건 분석

| 항목 | 내용 |
| :--- | :--- |
| **문제 이름** | 순위 검색 (Level 2) |
| **플랫폼 / 난이도** | 프로그래머스 (Level 2) / 2021 KAKAO BLIND RECRUITMENT |
| **문제 링크** | [프로그래머스 순위 검색 (Level 2)](https://school.programmers.co.kr/learn/courses/30/lessons/72412) |
| **입력 조건** | 지원자 수 $N \le 50,000$, 쿼리 수 $M \le 100,000$ |
| **핵심 요구** | 언어, 직군, 경력, 소울푸드 4개 조건 및 코딩테스트 점수 $X$점 이상인 지원자 수 고속 조회 |

---

## 2. 접근 아이디어: 조합(Combination) & 이분 탐색(Binary Search)

### ⚠️ 왜 선형 탐색은 시간 초과인가?
- 매 쿼리마다 50,000명의 지원자를 순차 비교하면 $50,000 \times 100,000 = 5 \times 10^9$ 연산이 소요되어 시간 제한(정확성 및 효율성 테스트)을 크게 초과합니다.

### 💡 해결책: $2^4 = 16$가지 조합 Key 매핑 + Lower Bound
1. **해시맵에 모든 가능 키 등록**:
   - 한 지원자의 정보가 `java backend junior pizza 150`이라면, 쿼리에서 `-`(상관없음)가 들어올 수 있으므로 4개 속성 각각에 대해 원래 값 또는 `-`를 취하는 총 $2^4 = 16$가지 Key를 생성하여 해시맵(`Map<String, List<Integer>>`)에 점수(150)를 삽입합니다.
   - 예: `"javabackendjuniorpizza"`, `"-backendjuniorpizza"`, `"----"` 등
2. **점수 리스트 정렬**:
   - 모든 지원자 등록이 끝나면, 맵에 존재하는 각 Key의 점수 리스트를 **오름차순 정렬**합니다.
3. **이분 탐색 (Lower Bound)**:
   - 쿼리 조건 문자열을 Key로 만들어 맵에서 점수 리스트를 가져온 뒤, 기준 점수 $X$ 이상의 첫 위치를 이분 탐색(`lowerBound`)으로 $O(\log K)$에 찾아 해당 인원수를 계산합니다.

---

## 3. Java 풀이 코드

```java
import java.io.*;
import java.util.*;

class Solution {
    private static Map<String, List<Integer>> map = new HashMap<>();

    public int[] solution(String[] info, String[] query) {
        map.clear();

        // 1. 각 지원자 정보를 16가지 조합 키로 해시맵에 등록
        for (String s : info) {
            String[] tokens = s.split(" ");
            String[] conditions = {tokens[0], tokens[1], tokens[2], tokens[3]};
            int score = Integer.parseInt(tokens[4]);
            makeCombinations(conditions, "", 0, score);
        }

        // 2. 이분 탐색을 위해 모든 점수 리스트 정렬
        for (List<Integer> list : map.values()) {
            Collections.sort(list);
        }

        // 3. 쿼리 처리
        int[] answer = new int[query.length];
        for (int i = 0; i < query.length; i++) {
            String q = query[i].replaceAll(" and ", "");
            String[] tokens = q.split(" ");
            String key = tokens[0];
            int targetScore = Integer.parseInt(tokens[1]);

            if (!map.containsKey(key)) {
                answer[i] = 0;
                continue;
            }

            List<Integer> scores = map.get(key);
            answer[i] = scores.size() - lowerBound(scores, targetScore);
        }

        return answer;
    }

    // 4가지 속성에 대해 '-' 또는 원래 값을 선택하는 16가지 조합 생성
    private void makeCombinations(String[] conditions, String currentKey, int depth, int score) {
        if (depth == 4) {
            map.computeIfAbsent(currentKey, k -> new ArrayList<>()).add(score);
            return;
        }

        makeCombinations(conditions, currentKey + conditions[depth], depth + 1, score);
        makeCombinations(conditions, currentKey + "-", depth + 1, score);
    }

    // target 이상의 값이 처음 나오는 인덱스를 반환하는 이분 탐색 (Lower Bound)
    private int lowerBound(List<Integer> list, int target) {
        int left = 0;
        int right = list.size();

        while (left < right) {
            int mid = (left + right) / 2;
            if (list.get(mid) >= target) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }
}
```

---

## 4. 복잡도 분석

- **시간 복잡도**:
  - 지원자 전처리: $N \times 16 = 50,000 \times 16 = 800,000$ 연산
  - 점수 정렬: 최대 $16$개 그룹 정렬, 전체 원소 합 $800,000$ 기준 $O(K \log K) \approx 1.5 \times 10^7$ 연산
  - 쿼리 조회: $M \times O(\log N) = 100,000 \times 16 \approx 1.6 \times 10^6$ 연산
  - 전체 수억 번 이내로 정확성 및 효율성 테스트 100% 여유 있게 통과.
- **공간 복잡도**: $O(16 \times N)$ — 해시맵에 약 80만 개의 정수 포인터 저장.

---

## 5. 채점 결과 및 통과 인증

![채점 결과](/images/posts/programmers-72412-rank-search/result.png)
