# Japan Trip Planner (Mobile Interactive)

This is a **static, GitHub Pages–friendly** mobile itinerary UI skeleton (HTML/CSS/JS).

## What you get
- Top navigation tabs: 目錄｜每日行程｜交通｜航班｜住宿｜雲端
- Day switcher (Day 1–8)
- Tap-to-open modal for “詳細”
- Cloud buttons pointing to your Google Drive (currently all same URL)

## How to use
1. Upload this repo to GitHub.
2. Enable GitHub Pages (Settings → Pages) and select the branch/root.
3. Replace the placeholder JSON files under:
   - `data/days/day1.json` … `day8.json`

### Expected JSON (flexible)
The app will render from either `cards` or `items`.

A minimal card example:
```json
{
  "time": "10:40",
  "title": "三鷹之森吉卜力美術館",
  "category": "景點｜必看｜需預約",
  "status": "主行程",
  "description": "嚴格依票券時間入場…",
  "details": {
    "menu": ["展示：動畫製作流程", "館內限定短篇動畫"],
    "buy": ["館內限定周邊"],
    "reviews": ["建築＋氛圍值回票價"],
    "tips": ["館內禁止拍照"],
    "links": [
      {"title":"官方網站", "url":"https://www.ghibli-museum.jp/"}
    ]
  }
}
```

## Cloud link
- https://drive.google.com/drive/folders/18KY7YC3iVNASFFQot4U9YoQ0sr8bDUhh
