# 득템쇼핑 · 오늘의 특가 모음

토스쇼핑 쉐어링크 · 쿠팡 파트너스 특가 상품을 모아 보여 주는 정적 페이지입니다.
GitHub Pages로 서비스하며, 서버·수수료 비용은 들지 않습니다.

- 운영 주소: https://deuktempick.github.io/
- 저장소: https://github.com/deuktempick/deuktempick.github.io

## 구성

```
index.html          페이지 껍데기 (헤더·검색창·광고 고지·푸터)
styles.css          다크 테마 모바일 우선 스타일
app.js              deals.json을 읽어 카드 목록 렌더링 + 실시간 검색
deals.json          상품 데이터 (날짜 → 플랫폼 → 상품)
assets/<날짜>/       1상품 1장 카드 이미지(.png) + thumb/(480px 썸네일 .jpg)
tools/make_thumbs.py 카드 이미지에서 상품 사진만 잘라 썸네일 생성
tools/add_day.py     하루치 데이터(day.json)를 deals.json 맨 앞에 추가
```

## 매일 업데이트하는 방법 (배치용)

1. 오늘 날짜 폴더에 카드 이미지를 넣는다: `assets/YYYY-MM-DD/toss-1~5.png`, `cp-1~5.png`
2. 썸네일 생성: `python3 tools/make_thumbs.py assets/YYYY-MM-DD`
3. 오늘 하루치를 `day.json`으로 만들고 다음 명령으로 `deals.json`에 넣는다(정렬·중복 검사 자동).
   ```
   python3 tools/add_day.py day.json
   ```
   - `date`: `YYYY-MM-DD`, `label`: `MM/DD (요일)`, `summary`: 한 줄 요약
   - 그룹: `platform`(`toss` | `coupang`), `platformName`, `note`, `items[]`
   - 상품: `brand`, `title`, `price`, `originPrice`, `discount`, `tag`, `rating`, `reviews`,
     `url`(수익 링크), `image`(썸네일 경로), `card`(원본 카드 경로)
4. 커밋·푸시하면 1~2분 안에 페이지에 반영된다.
   ```
   git add -A && git commit -m "deals: YYYY-MM-DD" && git push
   ```

`index.html`/`app.js`는 건드릴 필요가 없습니다. 데이터만 바뀌면 화면이 따라갑니다.

## 지켜야 할 것

- 페이지 최상단 고정 광고 고지 문구(`deals.json`의 `site.disclosure`)는 빼지 않는다.
- 모든 구매 링크는 `target="_blank" rel="noopener noreferrer sponsored"`로 새 창에서 연다.
- 상품 이미지는 1상품 1장 카드에서 상품 사진 영역만 잘라 썸네일로 쓴다(UI 캡처 금지).
