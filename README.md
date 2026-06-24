# Шүдний AI Screener

Next.js вэб апп + Python YOLOv8 inference сервер. Шүдний зураг оруулах эсвэл камераар аваад caries / cavity / crack илрүүлж triage зөвлөмж өгнө.

> **Анхааруулга:** Энэ нь screening/demo систем бөгөөд эмчийн онош биш.

## Шаардлага

- Node.js 20+
- Python 3.10+
- `pip` эсвэл `python3 -m pip`

## Суулгах

```bash
npm install
pip3 install -r inference/requirements.txt
npm run setup:model
```

Эхний удаа `setup:model` YOLO жинийг (~6MB) татаж `inference/best.pt` болгон хадгална.

## Ажиллуулах

```bash
npm run dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- Inference API: [http://127.0.0.1:8765/health](http://127.0.0.1:8765/health)

**Порт эзлэгдсэн / `Killed: 9` алдаа гарвал:**

```bash
npm run dev:stop   # хуучин процессуудыг зогсооно
npm run dev        # дахин асаана
```

Эсвэл 2 тусдаа терминал ашиглана (илүү тогтвортой):

```bash
# Терминал 1
npm run dev:inference

# Терминал 2
npm run dev:web
```

## Ашиглах

1. Зураг файл оруулах эсвэл камер ашиглах
2. **AI шинжилгээ хийх** товч дарах
3. Box, triage (улаан/шар/ногоон), зөвлөмж харах

## Архитектур

```
Browser → Next.js /api/analyze → Python FastAPI (YOLOv8) → JSON detections → Triage UI
```

## Загвар

Одоогоор [yolov8_caries_detector](https://github.com/AndreyGermanov/yolov8_caries_detector) intraoral загварыг ашиглана (caries, cavity, crack).

Ирээдүйд Zenodo + Монгол локал өгөгдлөөр fine-tune хийсэн загвараар солих боломжтой — `inference/best.pt` файлыг солино.

## Production

Vercel дээр Python inference шууд ажиллахгүй. Production-д:

- Inference-ийг тусад нь сервер/Container дээр ажиллуулна
- `INFERENCE_URL` env-ээр Next.js руу заана
