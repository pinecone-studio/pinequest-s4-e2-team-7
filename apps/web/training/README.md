# Brushing-zone ML pipeline

End-to-end setup to train a model that recognizes **which tooth zone** is being
brushed from the ESP32 + MPU6050 IMU stream, and how well each zone is covered.

```
ESP32 (DMP quat + gyro/accel @50Hz)
        │  WebSocket
        ▼
Browser /brush/collect  ──►  brush-dataset-*.json   (IndexedDB export)
        │
        ▼
training/import_clips.py ──►  data/raw/<label>/*.npz
        │
        ▼
training/train.py        ──►  artifacts/model.keras  +  ../public/models/brush/ (TFJS)
        │
        ▼
Browser /brush?tab=monitor  (loads TFJS model, live zone + coverage)
```

The whole loop is **collect → train → refresh → live**. Until a model exists the
web app runs an orientation heuristic, so it is useful from day one.

## 0. Flash the firmware

`firmware/brush_imu.ino` — open in Arduino IDE.

- Libraries: **MPU6050** (Electronic Cats / i2cdevlib), **WebSockets** (Markus Sattler).
- Set `WIFI_SSID` / `WIFI_PASS`. Note the printed `ws://<ip>:81`.
- It streams `y,p,r,qw..qz,ax..az,gx..gz` at 50 Hz — everything the ML needs.

## 1. Collect data (browser)

1. `pnpm dev` → open `/brush/collect`.
2. Enter the `ws://…:81` URL, connect.
3. **Тэгшлэх** once (brush in front, head upright) — sets the yaw reference.
4. Pick a zone, press **Бичих**, brush that zone for real for 2s. Repeat
   **≥12 clips per zone**, varying speed/pose. Don't forget the `idle` label
   (hold still / not brushing).
5. **JSON татах** to download `brush-dataset-*.json`.

## 2. Train

```bash
cd apps/web/training
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-export.txt        # TFJS export deps

python3 import_clips.py ~/Downloads/brush-dataset-*.json   # add --reset to wipe
python3 train.py                               # trains + exports TFJS automatically
```

Outputs `../public/models/brush/{model.json,*.bin,metadata.json}` and a
per-class recall report in `artifacts/report.txt`.

If the auto-export step is skipped, run it manually: `python3 export_model.py`.

## 3. Use it

Refresh `/brush?tab=monitor`. The badge shows **"ML загвар идэвхтэй"** once the
model loads. Press **Эхлэх** and brush — the active zone lights up and per-zone
coverage fills (motion-gated: you must actually scrub).

## Contract parity (DO NOT break)

These pairs MUST stay identical or the model sees different inputs live vs train:

| Python                         | TypeScript                                  |
| ------------------------------ | ------------------------------------------- |
| `features.py` (feature math)   | `src/lib/brush/featureContract.ts`          |
| `config.py` SEQ_LEN/FEATURE_DIM/WINDOW_SEC | `src/lib/brush/config.ts` + `runtime.ts` |
| `config.py` BRUSH_LABELS / `labels.txt` | `src/lib/brush/zones.ts` BRUSH_LABELS  |

`metadata.json` carries `featureDim`/`seqLen`; the web client refuses to load a
model whose dims don't match the current contract (shows a clear error).

## Notes

- **No pressure sensor yet.** "Well brushed" = enough motion-gated time in a zone
  (`ZONE_TARGET_SECONDS`). When a pressure/force sensor is added, feed it into
  `coverage.ts` `motionCredit` — the seam is already there.
- **Left/right** relies on yaw, which a 6-axis IMU integrates (slow drift). The
  per-clip random yaw-offset augmentation makes the model tolerant to a few
  degrees of calibration error; re-press **Тэгшлэх** if it drifts in a session.
- The exported model is plain TFJS — **mobile (Expo) reuses the same files** via
  `featureContract.ts` (pure, no platform imports) + `@tensorflow/tfjs-react-native`.
```
