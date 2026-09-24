# 🇱🇺 WhatsLUX

*Lëtzebuergesch léieren — mat Ärer Sprooch*

Learn Luxembourgish in your own language (Arabic, French, Russian, English, Portuguese),
with a strong focus on Sproochentest preparation and on **never mixing Luxembourgish with German**.

## Status — Phase 1 foundation

| Part | Path | State |
|---|---|---|
| Shared types, constants, SM-2 spaced repetition | `packages/shared` | ✅ built + tested |
| LU≠DE guard, German-leak detector, Claude services | `packages/ai` | ✅ built + tested (detector); services need an API key to run |
| Content + publishing gate | `packages/content` | ✅ validator; vocabulary seeded, **0 words LOD-verified yet** |
| REST API (Express) | `backend` | ✅ vocabulary, SRS, LOD link, AI routes + tests |
| Database schema (Prisma) | `backend/prisma/schema.prisma` | ✅ valid, not yet migrated |
| Mobile app (Expo), web app (Next.js), auth, payments, STT/TTS | — | ⏳ next phases |

## Content integrity rules (enforced in code)

1. **AI never writes lesson content.** Lessons and vocabulary are written by a teacher and checked on [lod.lu](https://lod.lu/).
2. **Learners only see verified words.** The API filters out any entry without `lod.verified`, `verifiedBy` and `verifiedAt`.
3. **Every AI call carries the LU≠DE guard** (`packages/ai/src/prompts/anti-confusion.ts`), and every Luxembourgish field the AI returns is scanned for German-only forms. Hits set `review.needsHumanReview`.
4. **Every AI answer ships with the "verify on lod.lu" disclaimer** in the learner's language.
5. `pnpm validate:content` fails when content marked as verified is incomplete, or contains a German-only form.

## Develop

```bash
pnpm install
pnpm build            # shared + ai
pnpm test             # unit tests + content gate
cp .env.example .env  # add ANTHROPIC_API_KEY
pnpm --filter @whatslux/backend dev
```

## API (so far)

| Method | Route | |
|---|---|---|
| GET | `/api/v1/vocabulary?category=&level=` | LOD-verified words only |
| POST | `/api/v1/vocabulary/review/rate` | one SM-2 step (`AGAIN/HARD/OK/EASY`) |
| GET | `/api/v1/lod/link?word=` | LOD lookup link for a reviewer |
| POST | `/api/v1/ai/grammar-explain` | explain a mistake in the learner's language |
| POST | `/api/v1/ai/evaluate-speaking` | score a transcribed answer (A2/B1) |
| POST | `/api/v1/ai/conversation/continue` | role-play turn (commune office configured) |

The AI model is set by `ANTHROPIC_MODEL` (default `claude-sonnet-4-6`, as in the spec).

See [`docs/LANGUAGE-REVIEW.md`](docs/LANGUAGE-REVIEW.md) for the Luxembourgish items that need a teacher's check.
