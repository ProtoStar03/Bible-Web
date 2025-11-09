# Faithful Moments

성경 말씀을 하루에 한 구절씩 묵상하고, 즐겨찾기와 노트를 남길 수 있는 Vanilla JS 싱글 페이지 웹앱입니다.

## 기능
- 오늘의 말씀 (날짜 기반 시드)
- 검색 (구절, 책 이름, 참조)
- 랜덤 구절
- 즐겨찾기 추가/삭제 (LocalStorage)
- 개인 묵상 노트 저장 (LocalStorage)
- 묵상 모드 (모달 + 타이머)
- 공유 (Web Share API/클립보드)
- 이미지 카드(PNG)로 저장
- 데이터 Export/Import(JSON)

## 폴더 구조
```text
Bible_Today/
├─ index.html
├─ /assets
├─ /css
│  ├─ tokens.css
│  └─ styles.css
├─ /data
│  └─ verses.sample.json
├─ /js
│  ├─ app.js
│  ├─ state.js
│  ├─ verses.js
│  ├─ ui.js
│  ├─ share.js
│  ├─ exportImport.js
│  └─ utils.js
└─ README.md
