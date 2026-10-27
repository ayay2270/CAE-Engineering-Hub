# 工具盤點 — 2026-10-27

來源：已連接 GitHub 的 ayay2270 儲存庫清單、各 repo README、公開 URL HTTP 檢查。共 19 個 repo；排除指定 6 個；首頁自身 1 個；工具 12 個。

HTTP 200 僅表示當次頁面可存取，不代表已驗證工具內所有功能或登入後資料。

| 分組 | Repository | 用途 | 入口 | 版本 / 使用限制 |
|---|---|---|---|---|
| CAE | [CAE-Material-Library](https://github.com/ayay2270/CAE-Material-Library) | 材料搜尋、性質比較與曲線檢視，支援 H / ETAN 換算及 Density Tuner。 | [線上工具](https://ayay2270.github.io/CAE-Material-Library/) · HTTP 200 | 正式版：公開瀏覽；編輯需管理員登入。 |
| CAE | [CAE-Knowledge-Base](https://github.com/ayay2270/CAE-Knowledge-Base) | 整理 CAE 技術知識、問題排除紀錄與工程圖片，集中查找分析參考資料。 | [線上工具](https://ayay2270.github.io/CAE-Knowledge-Base/) · HTTP 200 | 線上：私人知識內容需 owner 登入。 |
| CAE | [cae-pre-run-checklist](https://github.com/ayay2270/cae-pre-run-checklist) | 分析前逐項確認 Sagging / Shock 設定，記錄備註與 Critical 項目。 | [本機啟動說明](https://github.com/ayay2270/cae-pre-run-checklist#readme) · Pages 404 / has_pages=false | 本機工具：先下載 repo 並執行 Start.cmd；紀錄保存在本機瀏覽器。 |
| CAE | [CAE-Simulation-Result-Comparator](https://github.com/ayay2270/CAE-Simulation-Result-Comparator) | 並排比較基準與設計方案，檢視相對改善及工程參考值，列印比較報告。 | [線上工具](https://ayay2270.github.io/CAE-Simulation-Result-Comparator/) · HTTP 200 | 線上：重整會還原範例；可列印或另存 PDF。 |
| Engineering Tools | [Shock-Pulse-Initial-Velocity-Calculator-V2](https://github.com/ayay2270/Shock-Pulse-Initial-Velocity-Calculator-V2) | 將半正弦或矩形衝擊脈衝換算為估計初速度，匯出 CSV 與 LS-DYNA 曲線。 | [線上工具](https://ayay2270.github.io/Shock-Pulse-Initial-Velocity-Calculator-V2/) · HTTP 200 | V2：拖曳波形與輸入參數即時連動。 |
| Engineering Tools | [Center-of-Gravity-Calculator](https://github.com/ayay2270/Center-of-Gravity-Calculator) | 評估機櫃與棧板的 2D 重心、臨界傾角與靜態翻覆穩定性。 | [線上工具](https://ayay2270.github.io/Center-of-Gravity-Calculator/) · HTTP 200 | 線上：支援手動重心與所需棧板寬度反算。 |
| Engineering Tools | [Engineering-Test-Standard-Finder-V2](https://github.com/ayay2270/Engineering-Test-Standard-Finder-V2) | 查找 ISTA、ASTM、IEC 與 ISO 測試標準，整理測試序列與本機資料庫。 | [線上工具](https://ayay2270.github.io/Engineering-Test-Standard-Finder-V2/) · HTTP 200 | V2：部分標準序列尚待補齊；以已驗證資料為準。 |
| Engineering Tools | [Weight-Data-Manager-V2](https://github.com/ayay2270/Weight-Data-Manager-V2) | 依專案收集 Part / Node / Rack / Package 重量，完成量測、審核與 Excel 匯入匯出。 | [線上工具](https://ayay2270.github.io/Weight-Data-Manager-V2/) · HTTP 200 | V2：與 V1 共用同來源的瀏覽器重量資料。 |
| Utilities | [URL-Shortcut-Creator](https://github.com/ayay2270/URL-Shortcut-Creator) | 將常用網址製作成 Windows .url 捷徑檔，方便放在桌面或共用資料夾。 | [線上工具](https://ayay2270.github.io/URL-Shortcut-Creator/) · HTTP 200 | 線上：在瀏覽器產生捷徑檔。 |
| CAE | [CAE-Material-Library-V2-Preview](https://github.com/ayay2270/CAE-Material-Library-V2-Preview) | 材料庫的獨立預覽版本，以 Git JSON 與使用者授權的本機 materials.json 為資料來源。 | [線上工具](https://ayay2270.github.io/CAE-Material-Library-V2-Preview/) · HTTP 200 | 預覽版：日常正式材料庫請使用上方正式版。 |
| Engineering Tools | [Shock-Pulse-Initial-Velocity-Calculator](https://github.com/ayay2270/Shock-Pulse-Initial-Velocity-Calculator) | 原版衝擊脈衝與初速度計算介面，保留方向選擇、曲線表格與匯出功能。 | [線上工具](https://ayay2270.github.io/Shock-Pulse-Initial-Velocity-Calculator/) · HTTP 200 | 舊版：需要原版操作介面時使用。 |
| Engineering Tools | [Weight-Data-Manager](https://github.com/ayay2270/Weight-Data-Manager) | 原版 Dashboard 與重量資料表，提供量測送審、工程審核及資料匯入匯出。 | [線上工具](https://ayay2270.github.io/Weight-Data-Manager/) · HTTP 200 | 舊版：與 V2 共用瀏覽器資料；版本切換不會隔離紀錄。 |

## 首頁選擇

沿用 [CAE-Engineering-Hub](https://github.com/ayay2270/CAE-Engineering-Hub)，既有用途即為 launcher，且 GitHub Pages 已啟用。不建立重複首頁，也不將首頁自身列為工具。

## 排除

FRU-Packaging-Database、L10-Packaging-Finder、Tesla-Charge、Commute-Tracker、Weight-UI-Previews、singapore-trip。排除清單不寫入前端工具目錄。

## 舊版與預覽

Shock V2 與 Weight V2 是日常主入口，V1 保留於「舊版與預覽」。材料庫正式 repo 為 CAE-Material-Library；V2-Preview 為不同資料來源的獨立預覽，沒有取代正式版。

## 說明

cae-pre-run-checklist 不提供失效的 Pages 啟動按鈕，也不連到訪客尚未啟動的 localhost。下載該 repo 後先執行 Start.cmd，依 README 使用 localhost:3210。首頁只連到說明，不會自動執行本機程式。
