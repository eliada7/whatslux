# Lessons

Lessons are **written and checked by a human teacher**. AI never writes lesson content.

Put each lesson in `a1/`, `a2/` or `b1/` as `<slug>.json`, following the `Lesson`
type in `packages/shared/src/types/lesson.ts`.

A lesson can only be published when:

1. `review.lodVerified` is `true`, with `review.verifiedBy` and `review.verifiedAt` filled in
2. every entry in `vocabularyIds` exists and is verified on lod.lu
3. no Luxembourgish field contains a German-only form (checked by `pnpm validate:content`)

Suggested section order (matches the teaching method):
LEARNING_OBJECTIVES → GRAMMAR_RULE → EXAMPLES → VOCABULARY_TABLE → COMMON_ERRORS →
LU_VS_DE_WARNING → MEMORY_TRICK → EXAM_TIP → QUICK_REVIEW
