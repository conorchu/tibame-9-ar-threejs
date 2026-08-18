# Tibame 9 張圖 AR 指引

這版沿用之前確認的「2 號露易莎 / Tibame」AR 視覺設定：

- MindAR + Three.js
- 手機網頁直接開啟相機
- 9 個 image targets（0～8）
- 白色 AR 指引
- 路線是一串「同樣大小的小點」
- 前方是 3 個大型 `>>>` 浮空箭頭
- 路線點點與箭頭分開，不互相覆蓋
- 辨識成功顯示「✓ 已定位」
- 第 9 張顯示「已抵達」
- 整組 AR 物件 scale = 0.72，避免太貼近手機畫面

## 你要做的唯一必要動作

1. 把 9 張地標照片依照「實際路線順序」一次上傳到 MindAR Compiler。
2. Compile。
3. 下載 `.mind`。
4. 改名為：

   tibame-9.mind

5. 放到：

   assets/tibame-9.mind

## 重要

MindAR 的順序就是 targetIndex：

- 第 1 張 = 0
- 第 2 張 = 1
- 第 3 張 = 2
- 第 4 張 = 3
- 第 5 張 = 4
- 第 6 張 = 5
- 第 7 張 = 6
- 第 8 張 = 7
- 第 9 張 = 8

## 改每一站文字或箭頭方向

只需要改 `route.js`。

箭頭方向：

- `0` = 往前
- `90` = 左
- `-90` = 右
- `180` = 往回

## 部署

這整個資料夾可以直接：

- 上 GitHub
- 用 Netlify Deploy Preview
- 或 Netlify Drop

相機必須從 HTTPS 網址開啟。
