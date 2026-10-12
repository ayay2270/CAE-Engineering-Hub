# CAE Engineering Toolbox — Desktop POC 1 / 3 / 4

這是獨立在概念分支上的 pywebview Prototype，不影響目前 main 網頁版。

先做三個頁面：
- 1 Home / Dashboard：統合桌面工具入口與狀態。
- 3 Model Converter：HyperMesh / OptiStruct → LS-DYNA 的轉換 / 修復工作流。
- 4 Density Tuner：沿用 CAE Material Library V2 既有密度公式。

目前 Model Converter 是安全 Dry Run：不改 HM、不輸出假 deck。Contact / Segment Set 仍明確標示為需要 HM 2026 Python API Recording ground truth。

Density Tuner 的計算核心沿用現有公式：
New Density = Current Density × (Target Mass × Quantity) / Current Mass

## 先看 UI
直接開 index.html，可操作頁面切換、Density Tuner 與 Browser preview Dry Run。

## 跑 pywebview Desktop
```powershell
cd prototype\desktop-toolbox-134
python -m pip install -r requirements.txt
python desktop.py
```

Desktop 模式會多出：
- Python bridge 狀態
- 原生本機模型選檔
- backend dry-run
- 後續可直接接 HyperMesh Python API 的 interface

## 下一步
如果這版方向 OK，再把已驗證的 HyperMesh Step-by-Step functions 接入 backend；Contact / Connector / ELFORM 仍依 ground truth 逐項完成，不會先做假功能。