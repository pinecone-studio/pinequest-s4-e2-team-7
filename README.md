# PineQuest — Шүдний зөвөлгөө платформ

Шүдний эрүүл мэндийн зөвөлгөө, чиглүүлэл өгдөг апп. Web болон Mobile хоёуланг нь агуулсан monorepo.

> **Анхааруулга:** Энэ нь screening/demo систем бөгөгд эмчийн онош биш.

## Бүтэц

```
pinequest/
├── apps/
│   ├── web/       # Next.js 15 — веб апп (localhost:3000)
│   ├── mobile/    # Expo 52 — iOS / Android апп
│   └── api/       # Fastify — backend API (localhost:4000)
├── inference/     # Python YOLOv8 — шүдний зургийн AI шинжилгээ (localhost:8765)
└── packages/
    ├── config/    # Хуваалцсан TypeScript тохиргоо
    └── types/     # Хуваалцсан TypeScript types
```

---

## Шаардлагатай суулгацууд

### 1. Node.js (v20+)

```bash
node -v
```

Суугаагүй бол [nodejs.org](https://nodejs.org) → **LTS** хувилбарыг татаж суулгана.

### 2. pnpm (v9+)

```bash
npm install -g pnpm
pnpm -v
```

### 3. Python (3.10+) — inference сервер ажиллуулахад

```bash
python3 --version
```

### 4. Git

```bash
git --version
```

### 5. (Mobile хөгжүүлэхэд) Expo Go апп

Утсандаа **Expo Go** аппыг суулгана — [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## Эхлэх заавар

### 1. Repository татах

```bash
git clone <repository-url>
cd pinequest-s4-e2-team-7
```

### 2. Node dependency суулгах

```bash
pnpm install --ignore-scripts
pnpm rebuild esbuild sharp
```

### 3. Python inference суулгах

```bash
pip3 install -r inference/requirements.txt
```

YOLO загвар татах (эхний удаа):

```bash
cd inference && python3 download_model.py && cd ..
```

### 4. Environment файл тохируулах

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

`.env` файлуудын утгуудыг багийн admin-аас авна.

### 5. Ажиллуулах

**Бүгдийг хамт эхлүүлэх:**
```bash
pnpm dev
```

**Inference серверийг тусад нь:**
```bash
cd inference && python3 server.py
```

### 6. Хаяг

| Апп | Хаяг |
|-----|------|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Inference (AI) | http://localhost:8765 |
| Mobile | Expo Go → QR уншуулна |

---

## AI Screener ашиглах

1. Шүдний зураг файл оруулах эсвэл камер ашиглах
2. **AI шинжилгээ хийх** товч дарах
3. Caries / cavity / crack илрүүлсэн box, triage зөвлөмж харах

### Архитектур

```
Browser → Next.js /api/analyze → Python FastAPI (YOLOv8) → JSON → Triage UI
```

### Загвар

Одоогоор [yolov8_caries_detector](https://github.com/AndreyGermanov/yolov8_caries_detector) загварыг ашиглана.
Ирээдүйд Монгол локал өгөгдлөөр fine-tune хийсэн загвараар солих боломжтой — `inference/best.pt` файлыг солино.

---

## Хэрэгтэй командууд

```bash
# TypeScript алдаа шалгах
pnpm typecheck

# Бүгдийг build хийх
pnpm build

# Code format хийх
pnpm format

# Шинэ package нэмэх (жишээ: web-д)
pnpm --filter @pinequest/web add <package-name>

# Inference сервер тусад нь дахин эхлүүлэх
cd inference && python3 server.py

# Port эзлэгдсэн бол
lsof -ti:3000,4000,8765 2>/dev/null | xargs kill -9 2>/dev/null || true
```

---

## Асуудал гарвал

| Алдаа | Шийдэл |
|-------|--------|
| `pnpm: command not found` | `npm install -g pnpm` |
| Port аль хэдийн ашиглагдаж байна | `lsof -i :3000` — хэн ашиглаж байгааг шалга |
| Expo QR ажиллахгүй | Утас + компьютер ижил WiFi-д байх ёстой |
| `inference/best.pt` олдохгүй | `cd inference && python3 download_model.py` |
| Python module олдохгүй | `pip3 install -r inference/requirements.txt` |

---

## Холбоо барих

Асуудал гарвал баг дотроо мессеж бичнэ үү.
