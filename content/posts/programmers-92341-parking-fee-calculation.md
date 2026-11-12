---
title: '[프로그래머스] 주차 요금 계산 (Level 2, Java) - HashMap/TreeMap과 미출차 23:59 일괄 정산'
date: '2022-02-05'
category: PS/Programmers
tags:
  - Programmers
  - 구현
  - 해시
  - TreeMap
  - 카카오기출
  - Java
  - Level 2
summary: >-
  2022 카카오 블라인드 공채 기출 '주차 요금 계산' 문제에서 차량별 입출차 시간을 HashMap과 TreeMap으로 누적 관리하고, 출차 기록이 없는 차량을 23:59 기준으로 정산해 단위 요금을 올림 계산하는 풀이를 정리합니다.
---

## 문제 정보

- **문제 링크**: [프로그래머스 - 주차 요금 계산 (92341)](https://school.programmers.co.kr/learn/courses/30/lessons/92341)
- **난이도**: Level 2 (`2022 KAKAO BLIND RECRUITMENT`)

### 핵심 조건 요약

- 요금표 `fees = [기본 시간(분), 기본 요금(원), 단위 시간(분), 단위 요금(원)]`와 입/출차 기록 `records`가 시각 오름차순으로 주어집니다.
- **차량 번호가 작은 자동차부터** 청구할 주차 요금을 정수 배열로 반환합니다.
- 당일 여러 번 입/출차하더라도 **하루 총 누적 주차 시간을 합산**하여 요금을 1회 계산하며, 입차 후 출차 내역이 없다면 **`23:59`에 출차된 것으로 간주**합니다.
- 기본 시간 초과 시 단위 시간으로 나누어떨어지지 않으면 **올림**합니다.

---

## 접근 아이디어

자료구조의 역할 분리가 깔끔한 구현 문제입니다.

1. **`parkingStatus` (`HashMap<String, String>`)**: 현재 주차장에 들어와 있는 차량의 `(차량 번호 → 입차 시각)`을 관리합니다.
   - `"IN"`이면 `put(차량번호, 시각)`
   - `"OUT"`이면 입차 시각과의 차이(분)를 누적 맵에 더한 뒤 `remove(차량번호)`
2. **`timeStatus` (`TreeMap<String, Integer>`)**: 차량 번호별 **총 누적 주차 시간(분)**을 저장합니다.
   - `TreeMap`은 Key(차량 번호 문자열 `"0000"`, `"0148"`, `"5961"` 등 4자리 고정 문자열)를 자동으로 오름차순 정렬해 주므로, 출력 시 별도 정렬이 필요 없습니다!
3. **미출차 차량 `23:59` 정산**: 모든 `records` 처리 후 `parkingStatus`에 남아 있는 차량들은 모두 `"23:59"`를 출차 시각으로 삼아 누적 시간을 마저 더해줍니다.
4. **올림 요금 계산**:
   - `totalTime <= basicTime`: `basicFee`
   - 초과 시: `basicFee + (int) Math.ceil((double) (totalTime - basicTime) / overTime) * overFee`

---

## Java 풀이 코드

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;

class Solution {

    public int[] solution(int[] fees, String[] records) {
        ParkingLot parkingLot = new ParkingLot(fees);
        parkingLot.setDashBoard(records);
        return parkingLot.getResult();
    }

    static class ParkingLot {

        private final int basicFee, basicTime, overFee, overTime;
        private final TreeMap<String, Integer> timeStatus;   // 차량 번호 오름차순 누적 시간(분)
        private final HashMap<String, String> parkingStatus; // 현재 주차 중인 차량 입차 시각

        public ParkingLot(int[] fees) {
            this.timeStatus = new TreeMap<>();
            this.parkingStatus = new HashMap<>();

            this.basicTime = fees[0];
            this.basicFee = fees[1];
            this.overTime = fees[2];
            this.overFee = fees[3];
        }

        public void setDashBoard(String[] records) {
            for (String record : records) {
                String[] log = record.split(" ");

                if (log[2].equals("IN")) {
                    parkingStatus.put(log[1], log[0]);
                } else {
                    accTime(log[0], log[1]);
                    parkingStatus.remove(log[1]);
                }
            }

            // 23:59까지 출차하지 않은 차량 일괄 정산
            for (String number : parkingStatus.keySet()) {
                accTime("23:59", number);
            }
        }

        private void accTime(String out, String number) {
            String[] inTime = parkingStatus.get(number).split(":");
            String[] outTime = out.split(":");

            int hourDiff = Integer.parseInt(outTime[0]) - Integer.parseInt(inTime[0]);
            int minDiff = Integer.parseInt(outTime[1]) - Integer.parseInt(inTime[1]);

            if (minDiff < 0) {
                minDiff += 60;
                hourDiff--;
            }

            int parkedMinutes = minDiff + hourDiff * 60;
            timeStatus.put(number, timeStatus.getOrDefault(number, 0) + parkedMinutes);
        }

        public int[] getResult() {
            ArrayList<Integer> result = new ArrayList<>();
            for (Integer totalTime : timeStatus.values()) {
                int fee = totalTime <= basicTime
                        ? basicFee
                        : basicFee + (int) Math.ceil((double) (totalTime - basicTime) / overTime) * overFee;
                result.add(fee);
            }
            return result.stream().mapToInt(i -> i).toArray();
        }
    }
}
```

> **팁 (정수 올림 나눗셈)**: `Math.ceil((double) diff / overTime)` 대신 정수 연산 **`(diff + overTime - 1) / overTime`**를 사용하면 부동소수점 오차 걱정 없이 동일한 올림 결과를 얻을 수 있습니다.

---

## 채점 결과

![프로그래머스 주차 요금 계산 통과 결과](/images/posts/programmers-92341-parking-fee-calculation/result.png)

---

## 복잡도 분석

- **시간 복잡도**: `O(R log C)` — 기록 수 `R ≤ 1,000`, 차량 수 `C ≤ R`에 대해 `TreeMap` 삽입·조회
- **공간 복잡도**: `O(C)` — 차량별 입차 상태 및 누적 시간 맵 저장 공간
