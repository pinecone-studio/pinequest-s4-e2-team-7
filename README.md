# PineQuest — Шүдний зөвөлгөө платформ

Шүдний эрүүл мэндийн зөвөлгөө, чиглүүлэл өгдөг апп. Web болон Mobile хоёуланг нь агуулсан monorepo.

## Бүтэц

```
pinequest/
├── apps/
│   ├── web/       # Next.js 15 — веб апп (localhost:3000)
│   ├── mobile/    # Expo 52 — iOS / Android апп
│   └── api/       # Fastify — backend API (localhost:4000)
└── packages/
    ├── config/    # Хуваалцсан TypeScript тохиргоо
    └── types/     # Хуваалцсан TypeScript types
```

---

## Шаардлагатай суулгацууд

Эхлэхийн өмнө доорх хэрэгслүүд таны машинд суусан байх ёстой.

### 1. Node.js (v20 ба түүнээс дээш)

Хувилбар шалгах:
```bash
node -v
```

Суугаагүй бол [nodejs.org](https://nodejs.org) → **LTS** хувилбарыг татаж суулгана.

---

### 2. pnpm (v9 ба түүнээс дээш)

```bash
npm install -g pnpm
```

Шалгах:
```bash
pnpm -v
```

---

### 3. Git

```bash
git --version
```

Суугаагүй бол [git-scm.com](https://git-scm.com) → татаж суулгана.

---

### 4. (Mobile хөгжүүлэхэд) Expo CLI

```bash
npm install -g expo-cli
```

iOS симулятор хэрэглэхэд **Xcode** (Mac), Android эмулятор хэрэглэхэд **Android Studio** хэрэгтэй.

---

## Эхлэх заавар

### 1. Repository татах

```bash
git clone <repository-url>
cd pinequest-s4-e2-team-7
```

### 2. Dependency суулгах

```bash
pnpm install --ignore-scripts
pnpm rebuild esbuild sharp
```

> `--ignore-scripts` тугийг заавал хэрэглэнэ. Дараа нь `rebuild` командаар native package-уудыг build хийнэ.

### 3. Environment файл тохируулах

**API:**
```bash
cp apps/api/.env.example apps/api/.env
```

**Web:**
```bash
cp apps/web/.env.example apps/web/.env.local
```

`.env` файлуудын дотор утгуудыг багийн admin-аас авна.

### 4. Ажиллуулах

**Бүгдийг хамт эхлүүлэх (зөвлөмж):**
```bash
pnpm dev
```

**Тусад нь ажиллуулах:**
```bash
# Зөвхөн web
pnpm --filter @pinequest/web dev

# Зөвхөн API
pnpm --filter @pinequest/api dev

# Зөвхөн mobile
pnpm --filter @pinequest/mobile dev
```

### 5. Хаяг

| Апп | Хаяг |
|-----|------|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Mobile | Expo Go апп → QR уншуулна |

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

# Шинэ dev package нэмэх
pnpm --filter @pinequest/api add -D <package-name>
```

---

## Асуудал гарвал

**`pnpm: command not found`** → `npm install -g pnpm` дахин ажиллуулна

**Port аль хэдийн ашиглагдаж байна** → `lsof -i :3000` командаар хэн ашиглаж байгааг шалгана

**Expo QR ажиллахгүй** → утас болон компьютер ижил WiFi-д байх ёстой

**TypeScript алдаа** → `pnpm install --ignore-scripts` дахин ажиллуулна

---

## Холбоо барих

Асуудал гарвал баг дотроо мессеж бичнэ үү.
