from __future__ import annotations
import os, sys
from pathlib import Path
import webview
ROOT = Path(__file__).resolve().parent

class ToolboxApi:
    def pick_model(self):
        window = webview.windows[0]
        result = window.create_file_dialog(
            webview.OPEN_DIALOG,
            allow_multiple=False,
            file_types=("CAE Models (*.hm;*.fem;*.bdf;*.k;*.key)", "All files (*.*)")
        )
        if not result:
            return None
        path = Path(result[0])
        return {"path": str(path), "name": path.name, "size_kb": round(path.stat().st_size/1024,1) if path.exists() else 0}

    def run_converter_dry_run(self, model_path: str, rules: list[str]):
        path = Path(model_path)
        if not path.exists():
            return {"ok": False, "log": [{"text":"[ERROR] Model file does not exist.","kind":"error"}]}
        log = [
            {"text":f"[FILE] {path.name} ({path.stat().st_size/1024:.1f} KB)","kind":"ok"},
            {"text":f"[RULES] {', '.join(rules) if rules else '(none)'}","kind":""},
            {"text":"[SAFE] Dry Run only. No HyperMesh entities are modified.","kind":"warn"},
            {"text":"[SAFE] No LS-DYNA keyword is exported in this prototype.","kind":"warn"},
        ]
        known = {
            "material":"[PLAN] Material: metal → MAT_003; EPE → MAT_057.",
            "property":"[PLAN] Property: rebuild solver-specific Shell / Solid mappings.",
            "contact":"[BLOCK] Contact: *SET_SEGMENT identity still needs HM API Recording ground truth.",
            "connector":"[REVIEW] Connector: inspect RBE2 / Auto Fastener behavior before automation.",
            "section":"[PLAN] Section: retain Shell thickness; inspect Solid family.",
            "elform":"[PLAN] ELFORM: use element-family mapping, not Hex-only hard-code.",
            "keyword":"[PLAN] Keyword: export only after validation gates pass."
        }
        for rule in rules:
            if rule in known:
                log.append({"text":known[rule],"kind":"warn" if rule in {"contact","connector"} else "ok"})
        log.append({"text":"[NEXT] Connect these contracts to the verified HyperMesh Python API steps.","kind":"ok"})
        return {"ok": True, "log": log}

    def apply_density_dry_run(self, target: str, density: float):
        if not isinstance(density, (int,float)) or density <= 0:
            return {"ok":False,"message":"Density invalid. HyperMesh was not modified."}
        return {"ok":True,"message":f"Dry Run 完成：目標 {target}，建議 Density = {density:.6E}。目前尚未連接 HyperMesh API，因此模型沒有被修改。"}

    def open_project_folder(self):
        path = str(ROOT)
        if sys.platform.startswith("win"):
            os.startfile(path)
        elif sys.platform == "darwin":
            os.system(f'open "{path}"')
        else:
            os.system(f'xdg-open "{path}" >/dev/null 2>&1 &')
        return True

if __name__ == "__main__":
    api = ToolboxApi()
    webview.create_window("CAE Engineering Toolbox · Prototype 1/3/4", url=str(ROOT/"index.html"), js_api=api, width=1480, height=920, min_size=(1100,720))
    webview.start(debug=True)
