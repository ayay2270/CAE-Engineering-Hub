# CAE Engineering Hub

[開啟 HOME](https://ayay2270.github.io/CAE-Engineering-Hub/) · [完整工具盤點](INVENTORY.md)

乾淨的工程工具入口，沿用既有 repo 與 GitHub Pages。白底、單一藍色、細線結構；桌機側欄與三欄卡片，平板兩欄、手機單欄。

## 資訊架構

- HOME / 全部工具
- CAE：材料庫、知識庫、Pre-run Checklist、結果比較
- Engineering Tools：Shock V2、重心 / 翻覆計算、測試標準、Weight V2
- Utilities：Windows URL 捷徑產生器
- 舊版與預覽：材料庫預覽、Shock V1、Weight V1（HOME 預設收合；搜尋或篩選時自動展開）
- 我的收藏 / 最近使用

12 個工具 repo 全數納入（11 個線上、1 個本機），排除使用者指定 6 個 repo，首頁自身不列為工具。分類計數包含該分類的舊版 / 預覽。

搜尋支援中文用途、顯示名稱、完整 repo 名稱與標籤；多個關鍵字全部匹配。Ctrl/Cmd+K 聚焦搜尋，Escape 清除搜尋。收藏與最近使用保留原本的 localStorage keys；不讀取其他工具資料，不使用追蹤或登入。

## 預覽與檢查

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

開啟 http://127.0.0.1:4173/ 。ES modules 與 JSON fetch 需要 HTTP，請勿直接使用 file://。

```powershell
node --test tests/catalog.test.mjs
```

不需要 npm 套件或 build。現有 css/base.css、css/layout.css、css/components.css、css/responsive.css 與舊示意圖片仍保留於歷史資產；新版只載入 css/hub.css，不使用 hero 圖片或示意縮圖。

## 部署

既有 GitHub Pages 從 **main / root** 發佈。新版延用此來源；將已驗證內容推送到 main 後，由 GitHub 的 `pages build and deployment` 自動發佈。網址：

https://ayay2270.github.io/CAE-Engineering-Hub/

若需重新設定：Repository → Settings → Pages → Deploy from a branch → main → / (root)。所有前端資產使用相對路徑，適用 repo 子路徑與一般靜態主機。`.nojekyll` 讓純靜態檔案直接發佈。

## 維護工具目錄

只需更新 `data/tools.json`。每筆包含穩定 id、name、repository、category、icon、description、tags、status、note、variant、url、repo、checkedOn、httpStatus、hasPages。`variant: true` 放入舊版 / 預覽區；`url: null` 且 status 為「本機工具」時，主要按鈕導向 README 啟動說明。線上網址與 repo 必須為 HTTP(S)。

`INVENTORY.md` 是完整盤點來源；`checkedOn` / `httpStatus` 為手動檢查快照，不是 uptime 監控。更新目錄時也更新頁尾檢查日期。公開頁面可開啟不等於私人資料免登入；卡片會標示知識庫 owner 登入與材料庫編輯權限。

收藏記錄工具 id；最近使用只記錄線上工具的啟動連結 click / middle-click，不代表遠端頁面已成功載入；右鍵開新分頁不記錄。儲存空間受限時退回工作階段記憶體並顯示說明。工具均以新分頁及 noopener noreferrer 開啟。
