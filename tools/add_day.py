#!/usr/bin/env python3
"""deals.json 맨 앞에 하루치 특가를 추가한다.

사용법:
    python3 tools/add_day.py day.json

day.json 예시:
{
  "date": "2026-11-27",
  "label": "11/27 (금)",
  "summary": "토스쇼핑 30일 내 최저가 5선 · 쿠팡 골드박스 특가 5선",
  "groups": [
    {"platform": "toss", "platformName": "토스쇼핑", "note": "...", "items": [
      {"brand": "에브리워터", "title": "무라벨 생수 500ml × 40개", "price": 5880,
       "originPrice": 19800, "discount": 70, "tag": "지금 30일 내 최저가",
       "rating": 4.8, "reviews": 74627,
       "url": "https://toss.shopping/_m/xxxx",
       "image": "assets/2026-11-27/thumb/toss-1-water.jpg",
       "card": "assets/2026-11-27/toss-1-water.png"}
    ]}
  ]
}

- 같은 date가 이미 있으면 교체한다.
- 날짜(date) 내림차순으로 정렬해 저장한다.
- 필수 항목(brand, title, price, discount, url, image)이 빠진 상품이 있으면 저장하지 않고 알려 준다.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEALS = os.path.join(ROOT, "deals.json")
REQUIRED = ("brand", "title", "price", "discount", "url", "image")


def fail(msg):
    print("error:", msg)
    raise SystemExit(1)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        day = json.load(f)

    for key in ("date", "groups"):
        if key not in day:
            fail(f"day에 '{key}'가 없습니다")
    for group in day["groups"]:
        for item in group.get("items", []):
            missing = [k for k in REQUIRED if not item.get(k) and item.get(k) != 0]
            if missing:
                fail(f"{item.get('title', '?')} 에 {', '.join(missing)} 누락")

    with open(DEALS, encoding="utf-8") as f:
        deals = json.load(f)

    days = [d for d in deals.get("days", []) if d.get("date") != day["date"]]
    days.append(day)
    days.sort(key=lambda d: d["date"], reverse=True)
    deals["days"] = days

    with open(DEALS, "w", encoding="utf-8") as f:
        json.dump(deals, f, ensure_ascii=False, indent=2)
        f.write("\n")

    n = sum(len(g.get("items", [])) for g in day["groups"])
    print(f"added {day['date']} ({n} items), total days: {len(days)}")


if __name__ == "__main__":
    main()
