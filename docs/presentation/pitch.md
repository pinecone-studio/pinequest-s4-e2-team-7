# Screener — Pitch Presentation Brief (for Claude design)

> Paste the **PROMPT** block below into Claude (design / artifact mode) to generate the deck.
> The **CONTENT** and **DESIGN TOKENS** sections give Claude the real substance so slides aren't generic.
> Structure is intentionally **Problem → Solution → Research → Feature** (the urgent ask), with
> Architecture / Safety / Roadmap as supporting slides.

---

## PROMPT (paste this)

```
Create a clean, investor/judge-ready pitch presentation (≈9 slides) for "Screener", a
phone-camera dental caries SCREENING-AND-TRIAGE tool (NOT diagnosis) for non-dentists in
rural Mongolia. Audience: hackathon judges (Pinequest S4 E2). Tone: confident but clinically
humble — "a triage aid, not a diagnostic device." Never over-claim AI accuracy.

Follow this exact slide order:
1. TITLE — "Screener" wordmark + one-line tagline.
2. PROBLEM — the triage gap (below).
3. SOLUTION — traffic-light triage in the field (below).
4. RESEARCH — why this is real & evidence/validation approach (below).
5. FEATURE — the core capture→triage→follow-up loop + the board (below).
6. ARCHITECTURE — one diagram, the drop-in inference seam (below).
7. SAFETY & TRUST — the non-negotiables (below).
8. ROADMAP / IMPACT — what's next + the ask (below).
9. CLOSE — tagline + team (Team 7).

Hard rules for every slide:
- Frame as "screening-and-triage, NOT diagnosis." A human dentist confirms every finding.
- Green = "no danger signs seen in these photos" — NEVER "no cavities" / "healthy teeth."
- Use the triage palette ONLY for triage signals (green/yellow/red). Use Honey Gold as the
  brand accent. Keep slides calm — no alarm-bright red as decoration.
- Where you show product UI, render it in Mongolian Cyrillic; keep the narrative in English.
- One idea per slide, large type, generous whitespace, warm-cream background.

Use the DESIGN TOKENS and CONTENT verbatim from the sections I provide below.
```

---

## CONTENT (verbatim substance for the slides)

### 1. Title
- **Screener** — "Put dental triage in any phone, even with no signal."
- Subtitle: Pinequest S4 E2 · Team 7

### 2. Problem
- A soum health worker, teacher, or parent finds a child with a toothache and **cannot tell
  whether it's a $2 problem or a $200 emergency.**
- Rural Mongolia: few dentists, long distances, intermittent signal. By the time a child is
  seen, the cheap-treatment window has often closed and a cavity has become an abscess.
- There is **no triage layer** between "child has pain" and "child reaches a dentist."
- One number, one face: *most rural children don't see a dentist before pain becomes urgent.*

### 3. Solution
- **You don't need a dentist to triage — you need a camera, a checklist, and a clear signal.**
- A traffic light routes care:
  - 🔴 **Улаан / Red** — urgent, see a dentist **this week**.
  - 🟡 **Шар / Yellow** — check needed **within weeks**.
  - 🟢 **Ногоон / Green** — no danger signs seen; **regular checkup**.
- Works offline; syncs when signal returns; **never loses a screening.**

### 4. Research (why it's real + how we validate)
- **Clinical model:** YOLOv8 object detection flags candidate caries/cavity/crack regions in
  intra-oral photos. Triage logic is **deterministic TypeScript**, not the model — auditable and
  testable (`packages/core/src/triage.ts`).
- **Confidence-gated wording:** definite language only above a 0.6 confidence threshold;
  otherwise hedged ("areas that may need a dentist's check"). Tested in `triage.test.ts`.
- **Validation plan:** dentist-reviewed ground truth on every screening (the board captures
  confirm/override as audited events) → builds a labeled dataset to measure sensitivity/recall
  against dentist confirmation, season over season.
- **Safety-first copy** is unit-tested: a banned-word list (`cavity`, `caries`, `эрүүл шүд`…)
  can never appear in parent-facing text (`childSummary.test.ts`).

### 5. Feature (the product)
- **Mobile capture loop (screener):** roster slot + birth year (no name/PII) → 5-question
  symptom checklist → one photo → triage result card → optional pre-composed **SMS to guardian**
  via `sms:` deep link (no server push needed).
- **Web board (dentist-reviewer / follow-up / admin):** prioritized worklist with red cases +
  urgent banner on top, dentist confirm/override (audited), follow-up lifecycle tracking, cohort
  coverage and trends, role-scoped views.
- **Offline-first:** local outbox queues screenings, syncs one-directionally up when online.

### 6. Architecture (one diagram)
```
Phone (offline capture + on-device ONNX in v2)
   └─ outbox sync ─▶ Hono API ─▶ Cloudflare D1
                         └─▶ Next.js admin board
Inference is a DROP-IN behind one contract: server (FastAPI/YOLOv8) now,
on-device ONNX later — SAME triage logic in TypeScript either way.
```
- Everything is a **view over an immutable event log**: screenings are append-only; only
  follow-up status is mutable.

### 7. Safety & Trust
- "**Screening-and-triage, not diagnosis**" on every result.
- **Green = "Аюулын шинж илрээгүй"** ("no danger signs seen"), never "no cavities."
- Hedged wording unless confidence is high. A dentist confirms every finding.
- **Guardian consent recorded; no names in the synced payload** (only a hashed `childKey`).
- All parent text is **dentist-approved and version-pinned** content.

### 8. Roadmap / Impact / Ask
- **Now:** screener + dentist-reviewer + follow-up-worker in one role-scoped system.
- **Next:** on-device ONNX (zero-internet inference) · longitudinal tracking (same child across
  seasons) · clinic-finder referral deep links for yellow/red children.
- **Ask:** dentists to approve a content version; schools to run a pilot screening season.

### 9. Close
- "**Red cases reach a dentist faster. Green cases get scheduled. Nothing falls through the cracks.**"
- Team 7 · Pinequest S4 E2.

---

## DESIGN TOKENS (match the product)

| Token | Value |
|---|---|
| Brand primary (Honey Gold) | `#F2B705` (light) / `#FFC93C` (dark) |
| Canvas (warm cream) | `#F3F1EA` |
| Surface | `#FFFFFF` |
| Text base / muted | `#1D1D1F` / `#6E6E73` |
| Triage green (bg / text) | `#EEF8F3` / `#2A7D4F` |
| Triage yellow (bg / text) | `#FDEFE4` / `#B5560B` |
| Triage red (bg / text) | `#FAF0F0` / `#B83838` |
| Logo | bold "S" on a Honey Gold rounded square (`apps/web/src/app/icon.svg`) |
| Font | Apple system stack (SF Pro Display); weights 800 / 700 / 600 / 400 |

Source of truth for tokens: `apps/web/src/app/globals.css` (web) and `apps/mobile/lib/theme.ts` (mobile).
