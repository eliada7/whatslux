# 🇱🇺 LUXLEARN — AI-POWERED LUXEMBOURGISH INTEGRATION PLATFORM
## Complete Developer Prompt for Claude Code
### Version 2.0 — Full Multilingual Platform

---

> **Vision:** The world's first AI-powered platform that teaches Luxembourgish to immigrants in their native language — helping them integrate, find work, and pass the Sproochentest. Available in Arabic, French, Russian, English, and Portuguese.

---

## 🎯 WHAT WE ARE BUILDING

**WhatsLUX** is a **mobile-first Progressive Web App + Native App** that combines:

1. **Structured Luxembourgish courses** (A1 → B1) mapped to CEFR
2. **AI conversation coach** that speaks the user's native language
3. **Sproochentest preparation** (A2 Speaking + B1 Listening)
4. **Integration tools** — job vocabulary, civic life, healthcare, housing
5. **Smart Review** — spaced repetition for vocabulary and grammar
6. **AI picture description trainer** for the oral exam
7. **Community corrections** from native Luxembourgish speakers

**Interface languages:** Arabic 🇸🇦 | French 🇫🇷 | Russian 🇷🇺 | English 🇬🇧 | Portuguese 🇵🇹

**Target:** Immigrants in Luxembourg (and candidates from abroad) who need to integrate and pass the Sproochentest to obtain residency or citizenship.

---

## ⚠️ CRITICAL: THE LUXEMBOURGISH vs. GERMAN CONFUSION PROBLEM

### This is the #1 challenge in building this app — read carefully.

AI models (including Claude) frequently confuse Luxembourgish with German. This is **the most common and dangerous mistake** in any AI-powered Luxembourgish learning tool.

**Why it happens:**
- Luxembourgish and German are closely related (both West Germanic)
- Training data for Luxembourgish is very limited compared to German
- AI models default to German when uncertain about Luxembourgish
- Many words look similar but differ in spelling, grammar, or usage

**Real examples of dangerous confusion:**
```
German:        Ich gehe nach Hause
Luxembourgish: Ech ginn heem         ← COMPLETELY different

German:        Das Buch ist gut
Luxembourgish: D'Buch ass gutt       ← Different article system

German:        Ich habe gearbeitet
Luxembourgish: Ech hunn geschafft    ← Different participle

German:        Tschüss / Auf Wiedersehen
Luxembourgish: Äddi / Bis geschwënn ← Completely different words
```

### MANDATORY: Official Luxembourgish Reference Sources

The app MUST validate ALL Luxembourgish content against these official sources ONLY:

| Source | URL | Purpose |
|---|---|---|
| **LOD** — Lëtzebuerger Online Dictionnaire | https://lod.lu/ | Primary dictionary — ALL vocabulary must be verified here |
| **Spellchecker** | https://spellchecker.lu/ | Spelling validation for all Luxembourgish text |
| **Schreifmaschinn** | https://schreifmaschinn.lu/ | Writing tool / text validation |
| **LLO** — Lëtzebuerger Linguistik Online | https://llo.lu/en | Grammar rules and linguistic reference |
| **SDL** — Sprochentest.lu | https://sdl.inll.lu/ | Official Sproochentest information and preparation |

### Implementation Rules for Developers

```typescript
// ─── CONTENT VALIDATION PIPELINE ─────────────────────────────────────────

/*
RULE 1: Never use AI to generate Luxembourgish lesson content.
        All lesson text must be human-curated and verified against LOD.lu

RULE 2: When AI produces Luxembourgish output (conversation, feedback),
        it MUST be flagged as "AI-generated — verify before publishing"

RULE 3: All vocabulary entries in the database must include:
        - lodVerified: boolean (was it checked against lod.lu?)
        - lodEntry: string (the LOD URL or entry reference)
        - lastVerifiedAt: DateTime

RULE 4: The AI grammar explainer must include this disclaimer in every response:
        "تحقق دائمًا من الكلمات على lod.lu" (Always verify words on lod.lu)

RULE 5: When Claude API is used for Luxembourgish content:
        - Always include in system prompt: "You are NOT a German speaker.
          Luxembourgish is NOT German. Never substitute German words.
          When uncertain, say so rather than defaulting to German."
        - Always validate output against known vocabulary list
        - Flag responses containing German-only words for human review
*/

// Anti-German-confusion prompt addon (append to ALL AI system prompts):
export const ANTI_CONFUSION_PROMPT = `
CRITICAL LANGUAGE RULES:
1. You are teaching LUXEMBOURGISH (Lëtzebuergesch), NOT German.
2. These are DIFFERENT languages. Never substitute German words for Luxembourgish.
3. Key differences to remember:
   - "I am" = "ech sinn" (NOT "ich bin")
   - "is" = "ass" (NOT "ist")
   - "have" = "hunn" (NOT "haben")
   - "go" = "goen" (NOT "gehen")
   - Articles: "de/d'/d'" (NOT "der/die/das")
4. When you are not 100% certain of a Luxembourgish word or form,
   say "Verify this on lod.lu" rather than guessing with German.
5. The official reference is lod.lu — not German dictionaries.
`
```

---

## 👥 USER PERSONAS

### Persona 1 — Fatima (Arabic, Morocco)
- Age 34, lives in Esch-sur-Alzette
- Needs Sproochentest in 4 months for residency renewal
- Speaks Arabic + basic French
- Uses phone only, morning + evening sessions
- **Pain:** AI tools she tries give her German instead of Luxembourgish

### Persona 2 — Ivan (Russian, Ukraine)
- Age 41, construction worker in Luxembourg
- Needs Luxembourgish for promotion + residency
- Speaks Russian + some German
- **Pain:** German speakers try to help him but confuse the two languages

### Persona 3 — Beatriz (Portuguese, Portugal)
- Age 28, works in a restaurant, wants citizenship
- Speaks Portuguese + French
- **Pain:** Zero verified Luxembourgish learning resources in Portuguese

### Persona 4 — Jean-Marc (French, France)
- Age 45, senior manager, moved to Luxembourg
- Speaks French + English fluently
- **Pain:** Apps give him German-influenced Luxembourgish which confuses his colleagues

---

## 🏗️ TECH STACK

```
Frontend Mobile:    React Native (Expo SDK 52+)
Frontend Web:       Next.js 15 (App Router)
Backend:            Node.js + Express + TypeScript
Database:           PostgreSQL via Supabase
Cache:              Redis (Upstash)
AI:                 Anthropic Claude API (claude-sonnet-4-6) — primary AI engine
Speech-to-Text:     Web Speech API (browser) + Expo Speech (mobile) + Whisper API fallback
Text-to-Speech:     ElevenLabs API (for Luxembourgish audio) + Web Speech API
Auth:               Supabase Auth (email, Google, Apple)
Storage:            Supabase Storage (audio recordings, images)
Payments:           Stripe (subscriptions + one-time)
Push Notifications: Expo Notifications + OneSignal
Analytics:          PostHog
Error Monitoring:   Sentry
Hosting Backend:    Railway
Hosting Web:        Vercel
Mobile Builds:      Expo EAS
Monorepo:           Turborepo
Package Manager:    pnpm
Language:           TypeScript throughout
Styling Mobile:     NativeWind (Tailwind for RN)
Styling Web:        Tailwind CSS + shadcn/ui
ORM:                Prisma
Testing:            Vitest + Detox (E2E mobile)
```

---

## 📁 COMPLETE PROJECT STRUCTURE

```
whatslux/
├── apps/
│   ├── mobile/                          # React Native (Expo)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── welcome.tsx          # Multilingual welcome
│   │   │   │   ├── language-select.tsx  # Choose UI language
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   └── onboarding/
│   │   │   │       ├── level-test.tsx   # Placement test
│   │   │   │       ├── goal-select.tsx  # Sproochentest / Work / Integration
│   │   │   │       └── plan-preview.tsx # Show personalized plan
│   │   │   ├── (tabs)/
│   │   │   │   ├── home.tsx             # Dashboard
│   │   │   │   ├── learn.tsx            # Lesson library
│   │   │   │   ├── practice.tsx         # Speaking + AI coach
│   │   │   │   ├── review.tsx           # Smart Review (spaced repetition)
│   │   │   │   └── profile.tsx          # Progress + settings
│   │   │   ├── lesson/
│   │   │   │   ├── [id].tsx             # Lesson viewer
│   │   │   │   └── complete.tsx         # Lesson completion screen
│   │   │   ├── speaking/
│   │   │   │   ├── [exerciseId].tsx     # Speaking exercise
│   │   │   │   ├── ai-feedback.tsx      # AI feedback display
│   │   │   │   └── picture-describe.tsx # Picture description trainer
│   │   │   ├── exam/
│   │   │   │   ├── intro.tsx            # Sproochentest info
│   │   │   │   ├── simulate.tsx         # Full exam simulation
│   │   │   │   └── results.tsx          # Detailed results + study plan
│   │   │   ├── vocabulary/
│   │   │   │   ├── index.tsx            # Vocabulary browser
│   │   │   │   ├── flashcards.tsx       # Flashcard mode
│   │   │   │   └── quiz.tsx             # Vocab quiz
│   │   │   ├── integration/             # UNIQUE FEATURE
│   │   │   │   ├── index.tsx            # Integration hub
│   │   │   │   ├── job-search.tsx       # Job vocabulary + phrases
│   │   │   │   ├── healthcare.tsx       # Medical vocabulary
│   │   │   │   ├── administration.tsx   # City hall, commune
│   │   │   │   ├── housing.tsx          # Apartment, lease
│   │   │   │   └── school.tsx           # Children's school
│   │   │   └── community/
│   │   │       ├── index.tsx            # Community feed
│   │   │       └── corrections.tsx      # Native speaker corrections
│   │   ├── components/
│   │   │   ├── ui/                      # Design system
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── GrammarBox.tsx       # Blue grammar rule box
│   │   │   │   ├── WarningBox.tsx       # Yellow attention box
│   │   │   │   ├── ErrorBox.tsx         # Red common error box
│   │   │   │   ├── MemoryBox.tsx        # Green memory trick box
│   │   │   │   ├── ExamTipBox.tsx       # Purple exam tip box
│   │   │   │   └── LodVerifiedBadge.tsx # ✅ LOD-verified indicator
│   │   │   ├── lesson/
│   │   │   │   ├── GrammarSection.tsx
│   │   │   │   ├── VocabularyTable.tsx
│   │   │   │   ├── ExampleCard.tsx
│   │   │   │   ├── ExerciseCard.tsx
│   │   │   │   └── QuickReview.tsx
│   │   │   ├── speaking/
│   │   │   │   ├── AudioRecorder.tsx
│   │   │   │   ├── WaveformVisualizer.tsx
│   │   │   │   ├── FeedbackCard.tsx
│   │   │   │   └── ScoreGauge.tsx
│   │   │   ├── review/
│   │   │   │   ├── FlashCard.tsx
│   │   │   │   └── SpacedRepetitionEngine.tsx
│   │   │   └── exam/
│   │   │       ├── ExamTimer.tsx
│   │   │       ├── QuestionCard.tsx
│   │   │       └── ResultsBreakdown.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       ├── ai.ts
│   │       ├── speech.ts
│   │       ├── i18n.ts
│   │       ├── lod-validator.ts         # LOD.lu integration
│   │       ├── storage.ts
│   │       └── analytics.ts
│   │
│   └── web/                             # Next.js (marketing + admin)
│       ├── app/
│       │   ├── page.tsx                 # Landing page (5 languages)
│       │   ├── [lang]/
│       │   │   ├── page.tsx
│       │   │   ├── pricing/page.tsx
│       │   │   └── about/page.tsx
│       │   ├── admin/
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── users/page.tsx
│       │   │   ├── lessons/page.tsx     # CMS with LOD validation
│       │   │   ├── vocabulary/page.tsx  # Vocab management + LOD check
│       │   │   └── analytics/page.tsx
│       │   └── api/
│       │       ├── auth/[...supabase]/route.ts
│       │       ├── stripe/webhook/route.ts
│       │       ├── lod/validate/route.ts # LOD validation proxy
│       │       └── og/route.tsx
│       └── components/
│
├── packages/
│   ├── shared/
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── lesson.ts
│   │   │   ├── vocabulary.ts
│   │   │   ├── exam.ts
│   │   │   ├── ai.ts
│   │   │   └── i18n.ts
│   │   ├── constants/
│   │   │   ├── languages.ts
│   │   │   ├── levels.ts
│   │   │   ├── categories.ts
│   │   │   └── exam-config.ts
│   │   └── utils/
│   │       ├── srs.ts                   # Spaced repetition SM-2
│   │       ├── lod-check.ts             # LOD verification helpers
│   │       └── formatting.ts
│   │
│   ├── ai/
│   │   ├── clients/
│   │   │   └── anthropic.ts
│   │   ├── prompts/
│   │   │   ├── system-prompts.ts        # Multilingual + anti-German-confusion
│   │   │   ├── anti-confusion.ts        # LU vs DE guard prompts
│   │   │   └── templates.ts
│   │   └── services/
│   │       ├── grammar-explainer.ts
│   │       ├── speaking-coach.ts
│   │       ├── picture-coach.ts
│   │       ├── conversation-sim.ts
│   │       ├── exam-evaluator.ts
│   │       ├── daily-tip.ts
│   │       ├── study-planner.ts
│   │       └── lu-de-detector.ts        # Detects German sneaking into LU output
│   │
│   └── content/
│       ├── lessons/
│       │   ├── a1/
│       │   ├── a2/
│       │   └── b1/
│       ├── vocabulary/
│       │   ├── core.json                # All LOD-verified
│       │   ├── work.json
│       │   ├── healthcare.json
│       │   ├── administration.json
│       │   └── housing.json
│       ├── exercises/
│       ├── exam-questions/
│       └── integration-guides/
│
└── backend/
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── users.ts
    │   │   ├── lessons.ts
    │   │   ├── vocabulary.ts
    │   │   ├── progress.ts
    │   │   ├── ai.ts
    │   │   ├── speaking.ts
    │   │   ├── exam.ts
    │   │   ├── community.ts
    │   │   ├── payments.ts
    │   │   └── admin.ts
    │   ├── services/
    │   │   ├── ai.service.ts
    │   │   ├── speech.service.ts
    │   │   ├── audio.service.ts
    │   │   ├── progress.service.ts
    │   │   ├── srs.service.ts
    │   │   ├── lod.service.ts           # LOD.lu API integration
    │   │   ├── notification.service.ts
    │   │   └── payment.service.ts
    │   ├── middleware/
    │   │   ├── auth.ts
    │   │   ├── rateLimit.ts
    │   │   ├── language.ts
    │   │   └── subscription.ts
    │   └── jobs/
    │       ├── daily-tip.job.ts
    │       ├── review-reminder.job.ts
    │       └── analytics.job.ts
    └── prisma/
        └── schema.prisma
```

---

## 🗄️ COMPLETE DATABASE SCHEMA

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String    @id @default(cuid())
  email               String    @unique
  name                String
  avatarUrl           String?
  uiLanguage          UILanguage @default(ENGLISH)
  currentLevel        CEFRLevel  @default(A1)
  targetLevel         CEFRLevel  @default(A2)
  primaryGoal         LearningGoal @default(SPROOCHENTEST)
  targetExamDate      DateTime?
  dailyGoalMinutes    Int        @default(15)
  subscriptionStatus  SubscriptionStatus @default(FREE)
  subscriptionPlan    SubscriptionPlan?
  subscriptionEndsAt  DateTime?
  stripeCustomerId    String?    @unique
  stripePriceId       String?
  currentStreak       Int        @default(0)
  longestStreak       Int        @default(0)
  lastStudiedAt       DateTime?
  totalXP             Int        @default(0)
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  progress            UserProgress[]
  vocabularyProgress  VocabularyProgress[]
  speakingRecordings  SpeakingRecording[]
  examSimulations     ExamSimulation[]
  studySessions       StudySession[]
  communityPosts      CommunityPost[]
  communityCorrections CommunityCorrection[]
  notifications       Notification[]
  achievements        UserAchievement[]
}

model Lesson {
  id                  String    @id @default(cuid())
  slug                String    @unique
  titles              Json      // { ar, fr, ru, en, pt }
  descriptions        Json      // { ar, fr, ru, en, pt }
  titleLu             String    // Luxembourgish title (shown to all)
  level               CEFRLevel
  category            LessonCategory
  order               Int
  estimatedMinutes    Int       @default(15)
  isPremium           Boolean   @default(false)
  isPublished         Boolean   @default(true)
  lodVerified         Boolean   @default(false)  // Was content verified on LOD?
  lastVerifiedAt      DateTime?
  verifiedBy          String?   // Name of human reviewer
  completionCount     Int       @default(0)
  averageScore        Float?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  sections            LessonSection[]
  exercises           Exercise[]
  vocabulary          LessonVocabulary[]
  progress            UserProgress[]
}

model LessonSection {
  id                  String       @id @default(cuid())
  lessonId            String
  type                SectionType
  order               Int
  contentJson         Json         // Multilingual content

  lesson              Lesson       @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}

model VocabularyItem {
  id                  String    @id @default(cuid())
  word                String    // Luxembourgish word (LOD-verified)
  article             String?   // den / d' / eng
  plural              String?
  verbForms           Json?     // { present, past, participle }
  translations        Json      // { ar, fr, ru, en, pt }
  exampleLu           String?
  exampleTranslations Json?
  audioUrl            String?   // ElevenLabs TTS audio

  // LOD Verification (MANDATORY)
  lodVerified         Boolean   @default(false)
  lodUrl              String?   // Direct link to LOD entry
  lodEntry            String?   // LOD entry ID
  lastVerifiedAt      DateTime?

  category            VocabularyCategory
  level               CEFRLevel
  frequency           Int       @default(1)
  tags                String[]

  lessons             LessonVocabulary[]
  userProgress        VocabularyProgress[]

  @@index([category, level])
  @@index([word])
}

model LessonVocabulary {
  lessonId            String
  vocabularyId        String
  order               Int

  lesson              Lesson          @relation(fields: [lessonId], references: [id])
  vocabulary          VocabularyItem  @relation(fields: [vocabularyId], references: [id])

  @@id([lessonId, vocabularyId])
}

// SM-2 Spaced Repetition per user per word
model VocabularyProgress {
  id                  String    @id @default(cuid())
  userId              String
  vocabularyId        String
  easeFactor          Float     @default(2.5)
  interval            Int       @default(1)
  repetitions         Int       @default(0)
  nextReviewAt        DateTime  @default(now())
  correctCount        Int       @default(0)
  incorrectCount      Int       @default(0)
  lastReviewedAt      DateTime?

  user                User           @relation(fields: [userId], references: [id])
  vocabulary          VocabularyItem @relation(fields: [vocabularyId], references: [id])

  @@unique([userId, vocabularyId])
}

model Exercise {
  id                  String        @id @default(cuid())
  lessonId            String
  type                ExerciseType
  order               Int
  questions           Json          // { ar, fr, ru, en, pt }
  contentLu           String?       // Luxembourgish text (preserved exactly)
  correctAnswer       String
  options             Json?
  blanks              Json?
  hints               Json?         // { ar, fr, ru, en, pt }
  explanations        Json?         // { ar, fr, ru, en, pt }
  difficulty          Int           @default(1)
  lodVerified         Boolean       @default(false)

  lesson              Lesson        @relation(fields: [lessonId], references: [id])
}

model UserProgress {
  id                  String    @id @default(cuid())
  userId              String
  lessonId            String
  status              ProgressStatus @default(NOT_STARTED)
  score               Int?
  attempts            Int            @default(0)
  startedAt           DateTime?
  completedAt         DateTime?
  lastAccessedAt      DateTime?

  user                User      @relation(fields: [userId], references: [id])
  lesson              Lesson    @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
}

model StudySession {
  id                  String    @id @default(cuid())
  userId              String
  startedAt           DateTime  @default(now())
  endedAt             DateTime?
  durationMinutes     Int?
  xpEarned            Int       @default(0)
  lessonsCompleted    Int       @default(0)
  wordsReviewed       Int       @default(0)
  speakingExercises   Int       @default(0)

  user                User      @relation(fields: [userId], references: [id])
}

model SpeakingRecording {
  id                  String         @id @default(cuid())
  userId              String
  exerciseType        SpeakingType
  prompt              String         // Luxembourgish prompt
  promptTranslation   String?
  audioUrl            String
  durationSeconds     Int?
  transcription       String?
  processingStatus    ProcessingStatus @default(PENDING)
  aiFeedbackJson      Json?
  overallScore        Int?
  submittedToCommunity Boolean       @default(false)
  createdAt           DateTime       @default(now())

  user                User           @relation(fields: [userId], references: [id])
  communityCorrections CommunityCorrection[]
}

model ExamSimulation {
  id                  String    @id @default(cuid())
  userId              String
  examType            ExamType
  mode                ExamMode  @default(PRACTICE)
  questionsJson       Json
  answersJson         Json?
  overallScore        Int?
  speakingScore       Int?
  fluencyScore        Int?
  vocabularyScore     Int?
  grammarScore        Int?
  passStatus          Boolean?
  readyForExam        Boolean?
  aiFeedbackJson      Json?
  studyPlanJson       Json?
  startedAt           DateTime  @default(now())
  completedAt         DateTime?

  user                User      @relation(fields: [userId], references: [id])
}

model CommunityPost {
  id                  String    @id @default(cuid())
  userId              String
  recordingId         String?
  contentLu           String
  contextDescription  String?
  createdAt           DateTime  @default(now())

  user                User      @relation(fields: [userId], references: [id])
  recording           SpeakingRecording? @relation(fields: [recordingId], references: [id])
  corrections         CommunityCorrection[]
}

model CommunityCorrection {
  id                  String    @id @default(cuid())
  postId              String?
  recordingId         String?
  correctorId         String
  originalText        String
  correctedText       String
  explanation         String?
  helpfulCount        Int       @default(0)
  createdAt           DateTime  @default(now())

  post                CommunityPost?     @relation(fields: [postId], references: [id])
  recording           SpeakingRecording? @relation(fields: [recordingId], references: [id])
  corrector           User               @relation(fields: [correctorId], references: [id])
}

model Achievement {
  id                  String    @id @default(cuid())
  slug                String    @unique
  names               Json
  descriptions        Json
  iconUrl             String
  xpReward            Int
  condition           Json

  userAchievements    UserAchievement[]
}

model UserAchievement {
  userId              String
  achievementId       String
  earnedAt            DateTime  @default(now())

  user                User        @relation(fields: [userId], references: [id])
  achievement         Achievement @relation(fields: [achievementId], references: [id])

  @@id([userId, achievementId])
}

model Notification {
  id                  String    @id @default(cuid())
  userId              String
  type                NotificationType
  titleJson           Json
  bodyJson            Json
  data                Json?
  read                Boolean   @default(false)
  sentAt              DateTime  @default(now())

  user                User      @relation(fields: [userId], references: [id])
}

// ─── ENUMS ───────────────────────────────────────────────────────────────────

enum UILanguage {
  ARABIC
  FRENCH
  RUSSIAN
  ENGLISH
  PORTUGUESE
}

enum CEFRLevel {
  A1
  A2
  B1
  B2
}

enum LearningGoal {
  SPROOCHENTEST
  WORK
  INTEGRATION
  CITIZENSHIP
  GENERAL
}

enum LessonCategory {
  PRONUNCIATION
  GRAMMAR
  VOCABULARY
  CONVERSATION
  CULTURE
  EXAM_PREP
  INTEGRATION_WORK
  INTEGRATION_HEALTH
  INTEGRATION_ADMIN
  INTEGRATION_HOUSING
  INTEGRATION_SCHOOL
}

enum SectionType {
  LEARNING_OBJECTIVES
  GRAMMAR_RULE
  VOCABULARY_TABLE
  EXAMPLES
  COMMON_ERRORS
  MEMORY_TRICK
  NATIVE_LANGUAGE_NOTE   // Specific note per UI language group
  LU_VS_DE_WARNING       // Luxembourgish vs German confusion warning
  EXAM_TIP
  CULTURE_NOTE
  QUICK_REVIEW
}

enum ExerciseType {
  FILL_BLANK
  MULTIPLE_CHOICE
  WORD_ORDER
  TRUE_FALSE
  TRANSLATE_TO_LU
  TRANSLATE_FROM_LU
  SPEAKING
  LISTEN_SELECT
  MATCH_PAIRS
  LU_VS_DE_IDENTIFY      // "Is this Luxembourgish or German?" exercise
}

enum SpeakingType {
  FREE_SPEECH
  PICTURE_DESCRIPTION
  ROLE_PLAY
  EXAM_QUESTION
  VOCABULARY_PRACTICE
}

enum ExamType {
  SPEAKING_A2
  LISTENING_B1
  FULL_SPROOCHENTEST
}

enum ExamMode {
  PRACTICE
  OFFICIAL_SIMULATION
}

enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  NEEDS_REVIEW
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum SubscriptionStatus {
  FREE
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
  EXPIRED
}

enum SubscriptionPlan {
  MONTHLY
  YEARLY
  LIFETIME
}

enum VocabularyCategory {
  CORE
  WORK
  HEALTHCARE
  ADMINISTRATION
  HOUSING
  TRANSPORT
  FAMILY
  FOOD
  SHOPPING
  TIME
  WEATHER
  NUMBERS
  EMOTIONS
  EDUCATION
  TECHNOLOGY
  CULTURE
}

enum NotificationType {
  DAILY_REMINDER
  STREAK_AT_RISK
  STREAK_MILESTONE
  REVIEW_READY
  EXAM_REMINDER
  ACHIEVEMENT_EARNED
  COMMUNITY_CORRECTION
  WEEKLY_REPORT
}
```

---

## 🤖 COMPLETE AI SERVICES

### Anti-German-Confusion System (Core Safety Layer)

```typescript
// packages/ai/prompts/anti-confusion.ts

// This prompt MUST be included in every Claude API call that touches Luxembourgish
export const LU_DE_GUARD = `
=== LUXEMBOURGISH LANGUAGE INTEGRITY RULES ===
You are working with LUXEMBOURGISH (Lëtzebuergesch), not German.
These are distinct languages. Mixing them is a serious error.

NEVER use these German forms in Luxembourgish:
❌ ich → ✅ ech
❌ bin / ist / sind → ✅ sinn / ass / sinn
❌ habe / hat / haben → ✅ hunn / huet / hunn
❌ gehe / geht → ✅ ginn / geet
❌ der / die / das → ✅ de / d' / d'
❌ ein / eine → ✅ e / eng
❌ nicht → ✅ net
❌ kein / keine → ✅ kee / keng
❌ und → ✅ an
❌ aber → ✅ mä / awer
❌ weil → ✅ well
❌ dass → ✅ datt
❌ Haus → ✅ Haus (same but: "heem" means home)
❌ arbeiten → ✅ schaffen
❌ Arbeit → ✅ Aarbecht
❌ gehen → ✅ goen
❌ kommen → ✅ kommen (same spelling, different conjugation)
❌ haben → ✅ hunn
❌ sein → ✅ sinn

When uncertain about any Luxembourgish word or form:
→ Say "I'm not certain — please verify on lod.lu"
→ NEVER default to the German equivalent
=== END RULES ===
`

// Detector: Scans AI output for German words that snuck in
export function detectGermanInLuxembourgish(text: string): {
  hasGermanWords: boolean
  suspiciousWords: string[]
  confidence: number
} {
  const germanOnlyPatterns = [
    /\bich\b/gi,        // German "I" vs Luxembourgish "ech"
    /\bist\b/gi,        // German "is" vs Luxembourgish "ass"
    /\bsind\b/gi,       // German "are" vs Luxembourgish "sinn"
    /\bhaben\b/gi,      // German "have" vs Luxembourgish "hunn"
    /\bgehen\b/gi,      // German "go" vs Luxembourgish "goen"
    /\bnicht\b/gi,      // German "not" vs Luxembourgish "net"
    /\bkein\b/gi,       // German "no/none" vs Luxembourgish "kee/keng"
    /\bund\b/gi,        // German "and" vs Luxembourgish "an"
    /\baber\b/gi,       // German "but" vs Luxembourgish "awer/mä"
    /\bdass\b/gi,       // German "that" vs Luxembourgish "datt"
    /\bweil\b/gi,       // German "because" vs Luxembourgish "well"
    /\barbeiten\b/gi,   // German "to work" vs Luxembourgish "schaffen"
    /\bder\b(?!\s+\w+er\b)/gi, // German article (careful: can appear in LU text)
  ]

  const suspiciousWords: string[] = []

  for (const pattern of germanOnlyPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      suspiciousWords.push(...matches.map(m => m.toLowerCase()))
    }
  }

  return {
    hasGermanWords: suspiciousWords.length > 0,
    suspiciousWords: [...new Set(suspiciousWords)],
    confidence: suspiciousWords.length > 2 ? 0.9 : 0.5
  }
}

// Wrapper: Every AI call goes through this
export async function safeAICall<T>(
  claudeCall: () => Promise<T>,
  extractLuxembourgishText: (result: T) => string,
  onGermanDetected: (result: T, detected: string[]) => void
): Promise<T> {
  const result = await claudeCall()
  const luText = extractLuxembourgishText(result)
  const detection = detectGermanInLuxembourgish(luText)

  if (detection.hasGermanWords && detection.confidence > 0.7) {
    onGermanDetected(result, detection.suspiciousWords)
    // Log for review + alert admin
    console.warn('⚠️ German detected in Luxembourgish output:', detection.suspiciousWords)
  }

  return result
}
```

### LOD.lu Integration Service

```typescript
// backend/src/services/lod.service.ts

/*
=== LOD OFFICIAL DATA ACCESS — CONFIRMED WORKING ===

LOD (Lëtzebuerger Online Dictionnaire) provides THREE access methods:

1. OFFICIAL REST API (v1 + v2):
   Base: https://lod.lu/api/1/   and   https://lod.lu/api/2/
   Swagger docs: https://lod.lu/api/1/swagger.json
   → Use for: word lookup, definitions, grammar info, inflection tables

2. PRONUNCIATION AUDIO FILES (direct URL — no API key needed):
   Word audio:    https://lod.lu/uploads/AAC/{entryId}.m4a
   Word audio:    https://lod.lu/uploads/OGG/{entryId}.ogg
   Example audio: https://lod.lu/uploads/examples/AAC/{first2chars}/{exampleId}.m4a
   Example audio: https://lod.lu/uploads/examples/OGG/{first2chars}/{exampleId}.ogg
   → Use for: native pronunciation playback in lessons and vocabulary cards

3. FULL DATA DOWNLOAD (monthly updated ZIP):
   URL: https://data.public.lu/en/datasets/letzebuerger-online-dictionnaire-lod-linguistesch-daten/
   License: CC0 — FREE for commercial use, no attribution required
   Latest: 260727-new-lod-art.zip (July 27, 2026 — ~10.3MB)
   → Use for: seeding the database with ALL Luxembourgish vocabulary at launch

RECOMMENDED STRATEGY:
- At setup: Download the full ZIP → parse → import all entries into PostgreSQL
- At runtime: Use REST API for live search/autocomplete in Admin Panel
- For audio: Serve directly from lod.lu URLs (no hosting cost) or cache to S3

DATA SOURCE: https://data.public.lu/en/datasets/letzebuerger-online-dictionnaire-lod-linguistesch-daten/
*/

export class LODService {
  private readonly apiBase = 'https://lod.lu/api/2'
  private readonly audioBase = 'https://lod.lu/uploads'

  // Search word via official LOD API v2
  async searchWord(word: string): Promise<{
    found: boolean
    entries: Array<{
      id: string
      headword: string
      partOfSpeech: string
      audioUrl: string        // ← Direct URL to native pronunciation
      audioUrlOgg: string
      definitions: string[]
      examples: Array<{
        text: string
        audioUrl: string      // ← Example sentence pronunciation
      }>
      inflections?: Record<string, string>
    }>
  }> {
    const res = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(word)}`)
    const data = await res.json()
    return {
      found: data.total > 0,
      entries: (data.results || []).map((entry: any) => ({
        id: entry.id,
        headword: entry.headword,
        partOfSpeech: entry.pos,
        audioUrl: `${this.audioBase}/AAC/${entry.id}.m4a`,
        audioUrlOgg: `${this.audioBase}/OGG/${entry.id}.ogg`,
        definitions: entry.definitions || [],
        examples: (entry.examples || []).map((ex: any) => ({
          text: ex.text,
          audioUrl: `${this.audioBase}/examples/AAC/${ex.id.slice(0,2)}/${ex.id}.m4a`
        })),
        inflections: entry.inflections
      }))
    }
  }

  // Get direct audio URL for a known entry ID (use in vocabulary cards)
  getAudioUrl(entryId: string, format: 'aac' | 'ogg' = 'aac'): string {
    const folder = format === 'aac' ? 'AAC' : 'OGG'
    const ext = format === 'aac' ? 'm4a' : 'ogg'
    return `${this.audioBase}/${folder}/${entryId}.${ext}`
  }

  // Get LOD web link (opens official dictionary in browser)
  getLodLink(word: string): string {
    return `https://lod.lu/search?q=${encodeURIComponent(word)}`
  }

  // Batch verify a lesson's vocabulary before publishing
  async batchVerify(words: string[]): Promise<Map<string, {
    verified: boolean
    entryId?: string
    audioUrl?: string
  }>> {
    const results = new Map()
    for (const word of words) {
      const { found, entries } = await this.searchWord(word)
      results.set(word, {
        verified: found,
        entryId: entries[0]?.id,
        audioUrl: entries[0]?.audioUrl
      })
    }
    return results
  }
}

// INITIAL SETUP SCRIPT — run once to seed database from LOD full download
// backend/scripts/seed-lod-data.ts
/*
1. Download: https://data.public.lu/en/datasets/letzebuerger-online-dictionnaire-lod-linguistesch-daten/
2. Unzip the latest ZIP file (e.g. 260727-new-lod-art.zip)
3. Parse JSON/XML entries
4. For each entry:
   - Insert into VocabularyItem table
   - Set lodVerified: true
   - Set lodEntryId: entry.id
   - Set audioUrl: https://lod.lu/uploads/AAC/{entry.id}.m4a
   - Set lodUrl: https://lod.lu/search?q={entry.headword}
5. This gives you the ENTIRE Luxembourgish lexicon on day 1, fully verified.

Run with: npx ts-node scripts/seed-lod-data.ts
*/

export const lodService = new LODService()
```

### Multilingual System Prompt Factory

```typescript
// packages/ai/prompts/system-prompts.ts

import { LU_DE_GUARD } from './anti-confusion'

export type UILanguage = 'ar' | 'fr' | 'ru' | 'en' | 'pt'

const TEACHER_PERSONA: Record<UILanguage, string> = {
  ar: `أنت مدرس محترف للغة اللوكسمبورغية (Lëtzebuergesch) متخصص في تدريس الناطقين بالعربية.
تشرح دائمًا بالعربية الفصيحة البسيطة. أسلوبك: مدرس خصوصي ودود، ذكي، واضح، مباشر.
تحافظ على الكلمات اللوكسمبورغية بدقة تامة. أجوباتك دائمًا بصيغة JSON فقط.
المرجع الأساسي للتحقق من الكلمات: lod.lu`,

  fr: `Tu es un professeur professionnel de luxembourgeois (Lëtzebuergesch) spécialisé pour les francophones.
Tu expliques toujours en français clair et naturel. Style: tuteur sympa, intelligent, précis.
Tu préserves exactement les mots luxembourgeois. Tes réponses sont toujours en JSON uniquement.
Référence principale pour la vérification: lod.lu`,

  ru: `Ты профессиональный учитель люксембургского языка (Lëtzebuergesch), специализирующийся на русскоязычных.
Всегда объясняешь на простом русском. Стиль: дружелюбный репетитор, умный, конкретный.
Точно сохраняешь люксембургские слова. Ответы всегда только в JSON.
Основной справочник для проверки слов: lod.lu`,

  en: `You are a professional Luxembourgish (Lëtzebuergesch) teacher specializing in English speakers.
Explain in clear, natural English. Style: friendly private tutor, smart and direct.
Preserve Luxembourgish words exactly. Responses always in JSON only.
Primary reference for word verification: lod.lu`,

  pt: `Você é professor profissional de luxemburguês (Lëtzebuergesch) especializado em falantes de português.
Explica sempre em português claro e natural. Estilo: tutor amigável, inteligente e direto.
Preserva as palavras luxemburguesas exatamente. Respostas sempre em JSON apenas.
Referência principal para verificação: lod.lu`
}

export function buildSystemPrompt(service: string, language: UILanguage): string {
  return `${TEACHER_PERSONA[language]}\n\nServiço: ${service}\n\n${LU_DE_GUARD}`
}
```

### Grammar Explainer (with LU/DE protection)

```typescript
// packages/ai/services/grammar-explainer.ts

import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, UILanguage } from '../prompts/system-prompts'
import { detectGermanInLuxembourgish } from '../prompts/anti-confusion'

const client = new Anthropic()

export interface GrammarExplanation {
  ruleTitle: string
  simpleExplanation: string
  formula: string
  examples: Array<{
    luxembourgish: string     // PRESERVED EXACTLY — from LOD-verified content
    translation: string
    literal?: string
    note?: string
  }>
  luVsDeWarning?: {           // UNIQUE FEATURE: Show LU vs DE difference
    germanVersion: string
    luxembourgishVersion: string
    explanation: string
  }
  commonError: {
    wrong: string
    correct: string
    explanation: string
  }
  memoryTrick: string
  nativeSpeakerNote: string
  lodReference?: string       // Link to verify on lod.lu
}

export async function explainGrammarError(params: {
  userSentence: string
  correctSentence: string
  errorType: string
  language: UILanguage
  includeLuDeComparison?: boolean
}): Promise<GrammarExplanation> {
  const { language, includeLuDeComparison, ...data } = params

  const luDeRequest = includeLuDeComparison
    ? 'Also include a "luVsDeWarning" field showing the German equivalent and why it is wrong here.'
    : ''

  const prompts: Record<UILanguage, string> = {
    ar: `الطالب كتب: "${data.userSentence}"\nالصحيح: "${data.correctSentence}"\nنوع الخطأ: ${data.errorType}\n${luDeRequest}\nأعد JSON.`,
    fr: `L'étudiant a écrit: "${data.userSentence}"\nCorrect: "${data.correctSentence}"\nType d'erreur: ${data.errorType}\n${luDeRequest}\nRéponds en JSON.`,
    ru: `Студент написал: "${data.userSentence}"\nПравильно: "${data.correctSentence}"\nТип ошибки: ${data.errorType}\n${luDeRequest}\nОтвет в JSON.`,
    en: `Student wrote: "${data.userSentence}"\nCorrect: "${data.correctSentence}"\nError type: ${data.errorType}\n${luDeRequest}\nReturn JSON.`,
    pt: `O estudante escreveu: "${data.userSentence}"\nCorreto: "${data.correctSentence}"\nTipo de erro: ${data.errorType}\n${luDeRequest}\nResponde em JSON.`
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: buildSystemPrompt('Grammar Explainer', language),
    messages: [{
      role: 'user',
      content: `${prompts[language]}

Return this exact JSON structure:
{
  "ruleTitle": "...",
  "simpleExplanation": "...",
  "formula": "Subject + verb + ...",
  "examples": [
    {"luxembourgish": "...", "translation": "...", "literal": "...", "note": "..."}
  ],
  "luVsDeWarning": {
    "germanVersion": "...",
    "luxembourgishVersion": "...",
    "explanation": "..."
  },
  "commonError": {"wrong": "...", "correct": "...", "explanation": "..."},
  "memoryTrick": "...",
  "nativeSpeakerNote": "...",
  "lodReference": "https://lod.lu/search?q=..."
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const result: GrammarExplanation = JSON.parse(text.replace(/```json|```/g, '').trim())

  // Safety check: scan all Luxembourgish examples for German leakage
  for (const example of result.examples) {
    const detection = detectGermanInLuxembourgish(example.luxembourgish)
    if (detection.hasGermanWords) {
      console.error('🚨 German detected in grammar example:', detection.suspiciousWords)
      // Flag for human review
    }
  }

  return result
}
```

### Speaking Coach (Multilingual)

```typescript
// packages/ai/services/speaking-coach.ts

export interface SpeakingFeedback {
  overallScore: number
  passStatus: 'PASS' | 'ALMOST' | 'NEEDS_WORK'
  transcription: string
  scores: {
    fluency: number
    vocabulary: number
    grammar: number
    pronunciation: number
  }
  corrections: Array<{
    original: string            // What student said
    corrected: string           // Correct Luxembourgish
    explanation: string         // In user's language
    isGermanMistake?: boolean   // Was this German instead of Luxembourgish?
    germanWord?: string         // Which German word they used
  }>
  strongPoints: string[]
  improvementAreas: string[]
  vocabularySuggestions: string[]
  encouragement: string
  nextStep: string
  examReadiness?: {
    forSproochentest: boolean
    comment: string
  }
}

export async function evaluateSpeaking(params: {
  transcription: string
  prompt: string
  level: 'A2' | 'B1'
  topic: string
  language: UILanguage
  isExamMode?: boolean
}): Promise<SpeakingFeedback> {
  // Note: When evaluating, also check if student accidentally used German words
  // (a very common mistake especially for German-background speakers)
  // The AI should flag: isGermanMistake: true for corrections where German was used
}
```

### Conversation Simulator

```typescript
// packages/ai/services/conversation-sim.ts

export type Scenario =
  | 'JOB_INTERVIEW'
  | 'DOCTOR_APPOINTMENT'
  | 'COMMUNE_OFFICE'
  | 'SHOPPING'
  | 'NEIGHBOR_CHAT'
  | 'SCHOOL_MEETING'
  | 'BANK'
  | 'RESTAURANT'

// Real Luxembourg scenarios with realistic local vocabulary
export const SCENARIO_CONTEXTS: Record<Scenario, {
  titleTranslations: Record<UILanguage, string>
  setting: string                  // In Luxembourgish
  aiRole: string                   // Who the AI plays
  keyPhrases: string[]             // Must-know phrases for this scenario
  lodReferences: string[]          // LOD links for scenario vocabulary
}> = {
  COMMUNE_OFFICE: {
    titleTranslations: {
      ar: 'في مكتب البلدية',
      fr: 'À la commune',
      ru: 'В коммуне',
      en: 'At the commune office',
      pt: 'Na câmara municipal'
    },
    setting: 'Am Gemengegebai',
    aiRole: 'Employé de commune / Gemengebeamten',
    keyPhrases: [
      'Ech hätt gär eng Informatioun iwwer...',
      'Wou kann ech d\'Formulaire kréien?',
      'Wéini kënnt d\'Carte d\'Identité fäerdeg sinn?',
      'Ech brauch eng Bescheinigung vun...'
    ],
    lodReferences: [
      'https://lod.lu/search?q=Gemeng',
      'https://lod.lu/search?q=Formulaire'
    ]
  }
  // ... other scenarios
}
```

---

## 🗣️ SPROOCHENTEST — COMPLETE PREPARATION SYSTEM

### Official Sources Integration

```typescript
// The app links directly to official SDL resources
// Source: https://sdl.inll.lu/

export const SPROOCHENTEST_INFO = {
  officialSite: 'https://sdl.inll.lu/',
  registrationInfo: {
    ar: 'للتسجيل في الامتحان الرسمي، قومي بزيارة sdl.inll.lu',
    fr: "Pour s'inscrire à l'examen officiel, visitez sdl.inll.lu",
    ru: 'Для записи на официальный экзамен посетите sdl.inll.lu',
    en: 'To register for the official exam, visit sdl.inll.lu',
    pt: 'Para se inscrever no exame oficial, visite sdl.inll.lu'
  },
  examStructure: {
    speaking: {
      level: 'A2',
      duration: '20-30 minutes',
      tasks: [
        'Self-introduction (Sich virstellen)',
        'Image description (Bildkommentar)',
        'Topic discussion',
        'Role-play situation'
      ]
    },
    listening: {
      level: 'B1',
      duration: '45 minutes',
      tasks: [
        'Short announcements',
        'Radio broadcasts',
        'Conversations',
        'Information extraction'
      ]
    }
  }
}
```

---

## 🏢 INTEGRATION HUB — UNIQUE DIFFERENTIATOR

```typescript
// packages/content/integration-guides/

// Each guide includes:
// - Official Luxembourg government links
// - Vocabulary verified on LOD.lu
// - Real phrases used in Luxembourg (not generic French/German)
// - AI role-play specific to the Luxembourg context

export const INTEGRATION_SECTIONS = {
  work: {
    officialLinks: {
      adem: 'https://adem.public.lu',
      jobsLu: 'https://www.jobs.lu',
      myguichet: 'https://myguichet.lu'
    },
    keyVocabulary: [
      { lu: 'd\'ADEM', ar: 'وكالة التشغيل', lodVerified: true },
      { lu: 'de Chômage', ar: 'إعانة البطالة', lodVerified: true },
      { lu: 'd\'Intervue', ar: 'المقابلة الوظيفية', lodVerified: true },
      { lu: 'de Contrat', ar: 'العقد', lodVerified: true },
      { lu: 'de Salaire', ar: 'الراتب', lodVerified: true },
      { lu: 'den Urlaub', ar: 'الإجازة السنوية', lodVerified: true }
    ]
  },
  healthcare: {
    officialLinks: {
      cns: 'https://cns.lu',
      santePublique: 'https://sante.public.lu'
    },
    keyVocabulary: [
      { lu: 'd\'CNS', ar: 'صندوق التأمين الصحي', lodVerified: true },
      { lu: 'de Médecin', ar: 'الطبيب', lodVerified: true },
      { lu: 'd\'Ordonnance', ar: 'وصفة طبية', lodVerified: true }
    ]
  }
}
```

---

## 💰 BUSINESS MODEL

```typescript
const PLANS = {
  FREE: {
    price: 0,
    features: [
      'Module A1 complete (10 lessons)',
      '3 AI speaking sessions/month',
      '1 exam simulation/month',
      'First 150 LOD-verified words with SRS',
      'Basic integration vocabulary',
    ]
  },

  PREMIUM: {
    monthly: 14.99,   // EUR
    yearly: 99.99,    // EUR (saves ~€80)
    lifetime: 199.99, // EUR one-time
    features: [
      'All 50+ lessons (A1 → B1)',
      'Unlimited AI speaking + feedback',
      'Unlimited exam simulations with full AI report',
      '800+ LOD-verified vocabulary with advanced SRS',
      'Full Integration Hub (Work, Health, Admin, Housing, School)',
      'All 8 AI conversation scenarios',
      'Picture description AI coach',
      'Personalized AI study plan',
      'Offline mode',
      'Grammar Review screen',
      'Weekly progress report',
      'Priority community corrections',
      'Certificate of completion'
    ]
  },

  ENTERPRISE: {
    price: 'Custom (min 5 seats)',
    description: 'For companies with immigrant employees in Luxembourg',
    features: [
      'Everything in Premium',
      'Admin dashboard',
      'Team progress tracking',
      'HR integration',
      'Invoicing'
    ]
  }
}
```

---

## 🎨 DESIGN SYSTEM

```typescript
export const COLORS = {
  primary: {
    50:  '#FFF0EE',
    500: '#D32011',   // Luxembourg red — main CTAs
    600: '#B51B0E',
  },
  secondary: {
    500: '#2196F3',   // Blue — info, links
  },
  accent: {
    500: '#F5A623',   // Gold — achievements, premium
  },
  success:   '#27AE60',
  warning:   '#F39C12',
  error:     '#E74C3C',

  // Lesson box colors (consistent with teacher's methodology)
  boxes: {
    grammar:    { bg: '#EBF5FB', border: '#2196F3', icon: '📚' },
    warning:    { bg: '#FEF9E7', border: '#F5A623', icon: '⚠️' },
    error:      { bg: '#FDEDEC', border: '#E74C3C', icon: '❌' },
    memory:     { bg: '#EAFAF1', border: '#27AE60', icon: '🧠' },
    exam:       { bg: '#F4ECF7', border: '#8E44AD', icon: '🎓' },
    luVsDe:     { bg: '#FFF3E0', border: '#E65100', icon: '🇱🇺≠🇩🇪' }, // LU vs DE warning
    lodVerified:{ bg: '#E8F5E9', border: '#2E7D32', icon: '✅' },       // LOD verified badge
  },

  gray: {
    50: '#FAFAFA', 100: '#F5F5F5', 200: '#EEEEEE',
    600: '#757575', 800: '#424242', 900: '#212121'
  }
}

export const TYPOGRAPHY = {
  fonts: {
    arabic: 'Cairo',       // Best Arabic app font
    latin:  'Inter',       // All other scripts
  },
  scale: {
    h1: { size: 28, weight: '700' },
    h2: { size: 22, weight: '600' },
    h3: { size: 18, weight: '600' },
    body: { size: 16, weight: '400' },
    small: { size: 14 },
    caption: { size: 12 }
  }
}

// RTL: Applied when uiLanguage === 'ar' (Arabic)
// All other languages: LTR
```

---

## 📱 KEY SCREENS

### Home Dashboard
```
┌──────────────────────────────────────┐
│  👋 Moien, [Name]!                   │  ← Always Luxembourgish greeting
│  [Countdown: 47 days to exam]        │
├──────────────────────────────────────┤
│  🔥 7 days streak   ⚡ 420 XP        │
│  ████████░░  80% weekly goal         │
├──────────────────────────────────────┤
│  📚 Continue Learning                │
│  [Lesson title] • A2 • 12 min        │
│  ████████░░  Lesson 3/8              │
│  [▶ Continue]                        │
├──────────────────────────────────────┤
│  🧠 Smart Review — 23 words ready    │
│  [Review Now →]                      │
├──────────────────────────────────────┤
│  🗣️ Quick Speaking Practice          │
│  [5 min] [10 min] [Full session]     │
├──────────────────────────────────────┤
│  🎓 Sproochentest Ready?             │
│  [Start Full Simulation →]           │
└──────────────────────────────────────┘
```

### LU vs DE Warning Box (In Lessons)
```
┌─────────────────────────────────────────┐
│ 🇱🇺≠🇩🇪  لوكسمبورغية ≠ ألمانية          │
│─────────────────────────────────────────│
│ ⚠️ هذه الكلمة تبدو كالألمانية لكنها    │
│    مختلفة في اللوكسمبورغية:             │
│                                         │
│  🇩🇪 ألماني: "ich gehe nach Hause"     │
│  🇱🇺 لوكسمبورغي: "Ech ginn heem"      │
│                                         │
│  ✅ تحقق من الكلمة على: lod.lu         │
└─────────────────────────────────────────┘
```

### LOD Verified Badge
```
┌──────────────────────────┐
│  d'Aarbecht              │
│  ✅ تم التحقق على lod.lu │
│  [🔗 عرض في القاموس]    │
└──────────────────────────┘
```

### Speaking Feedback Screen
```
Score: 74/100  ALMOST ✓

Fluency:     ████████░░  80%
Vocabulary:  ██████░░░░  60%
Grammar:     ███████░░░  70%

📝 Corrections:
┌─────────────────────────────────────┐
│  ❌ "ich schaffe"                   │
│  ✅ "ech schaffen"                  │
│  ⚠️ هذا الخطأ ألماني — تذكر:      │
│     في اللوكسمبورغية "ech" ليس    │
│     "ich"                           │
└─────────────────────────────────────┘
```

---

## 🔌 COMPLETE API ROUTES

```typescript
// Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/login/google
POST   /api/v1/auth/login/apple
POST   /api/v1/auth/refresh
DELETE /api/v1/auth/logout

// Users
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users/me/stats
GET    /api/v1/users/me/achievements
POST   /api/v1/users/me/onboarding
PATCH  /api/v1/users/me/language

// Lessons
GET    /api/v1/lessons
GET    /api/v1/lessons/recommended
GET    /api/v1/lessons/:id
POST   /api/v1/lessons/:id/start
POST   /api/v1/lessons/:id/complete
GET    /api/v1/lessons/:id/exercises

// Vocabulary
GET    /api/v1/vocabulary
GET    /api/v1/vocabulary/review           // SRS due words
POST   /api/v1/vocabulary/review/rate      // Rate (SM-2 update)
GET    /api/v1/vocabulary/stats
POST   /api/v1/vocabulary/quiz

// LOD Validation (admin + content tools)
POST   /api/v1/lod/verify                  // Verify a word on LOD
POST   /api/v1/lod/batch-verify            // Verify multiple words
GET    /api/v1/lod/spellcheck              // Spellcheck text

// Progress
GET    /api/v1/progress
GET    /api/v1/progress/streak
GET    /api/v1/progress/weekly
POST   /api/v1/progress/session/start
POST   /api/v1/progress/session/end

// AI
POST   /api/v1/ai/grammar-explain          // Explain error in user's language
POST   /api/v1/ai/evaluate-speaking        // Score spoken response
POST   /api/v1/ai/picture-analyze          // Image → description coaching
POST   /api/v1/ai/conversation/start       // Start role-play scenario
POST   /api/v1/ai/conversation/continue    // Continue role-play
POST   /api/v1/ai/exam-evaluate            // Full exam assessment
POST   /api/v1/ai/study-plan               // Generate personalized plan
GET    /api/v1/ai/daily-tip

// Speaking
POST   /api/v1/speaking/upload
GET    /api/v1/speaking/:id
GET    /api/v1/speaking/history
POST   /api/v1/speaking/:id/community

// Exam
POST   /api/v1/exam/start
POST   /api/v1/exam/:id/answer
POST   /api/v1/exam/:id/complete
GET    /api/v1/exam/history
GET    /api/v1/exam/readiness

// Community
GET    /api/v1/community/posts
POST   /api/v1/community/posts
POST   /api/v1/community/correct/:postId

// Integration Hub
GET    /api/v1/integration
GET    /api/v1/integration/:slug
POST   /api/v1/integration/:slug/roleplay

// Payments
GET    /api/v1/payments/plans
POST   /api/v1/payments/checkout
POST   /api/v1/payments/portal
POST   /api/v1/payments/webhook
GET    /api/v1/payments/status

// Admin
GET    /api/v1/admin/stats
GET    /api/v1/admin/users
GET    /api/v1/admin/lessons
POST   /api/v1/admin/lessons
PATCH  /api/v1/admin/lessons/:id
GET    /api/v1/admin/vocabulary
POST   /api/v1/admin/vocabulary
GET    /api/v1/admin/lod-queue             // Words pending LOD verification
```

---

## ⚙️ ENVIRONMENT VARIABLES

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Database
DATABASE_URL=postgresql://...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
STRIPE_PRICE_LIFETIME=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ElevenLabs (Luxembourgish TTS)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID_LU=...

# OpenAI (Whisper STT fallback)
OPENAI_API_KEY=sk-...

# OneSignal
ONESIGNAL_APP_ID=...
ONESIGNAL_REST_API_KEY=...

# PostHog
POSTHOG_API_KEY=...
NEXT_PUBLIC_POSTHOG_KEY=...

# Sentry
SENTRY_DSN=...

# App
NEXT_PUBLIC_APP_URL=https://whatslux.lu
NODE_ENV=production
JWT_SECRET=...

# LOD Integration
LOD_API_URL=https://lod.lu
SPELLCHECKER_URL=https://spellchecker.lu
```

---

## 🧪 SPACED REPETITION ALGORITHM (SM-2)

```typescript
// packages/shared/utils/srs.ts

export interface SRSCard {
  easeFactor: number    // Starting: 2.5
  interval: number      // Days until next review
  repetitions: number
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5
// 0-2: Failed  |  3: Hard  |  4: OK  |  5: Easy

export function calculateNextReview(card: SRSCard, quality: Quality): SRSCard & { nextReviewAt: Date } {
  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + interval)

  return { easeFactor, interval, repetitions, nextReviewAt }
}

export function mapRatingToQuality(rating: 'HARD' | 'OK' | 'EASY'): Quality {
  return { HARD: 2, OK: 4, EASY: 5 }[rating] as Quality
}
```

---

## 🚀 BUILD PHASES

### PHASE 1 — MVP (Weeks 1–6)
- [ ] Turborepo + pnpm monorepo setup
- [ ] Supabase + Prisma + full schema
- [ ] Auth (email + Google)
- [ ] Language selection + onboarding (5 languages)
- [ ] LOD integration service (basic word lookup)
- [ ] 10 A1 lessons with all section types including LU vs DE boxes
- [ ] Exercise types: multiple choice + fill blank + LU vs DE identify
- [ ] Vocabulary SRS (SM-2 algorithm)
- [ ] Speaking recorder + Claude AI feedback
- [ ] Anti-German-confusion prompt layer
- [ ] Home dashboard
- [ ] Stripe (Monthly + Yearly + Lifetime)
- [ ] Deploy

### PHASE 2 — Core Platform (Weeks 7–14)
- [ ] Full A2 curriculum (15 lessons)
- [ ] Smart Review screen (Busuu-style)
- [ ] Grammar Review hub
- [ ] Exam simulator (A2 speaking)
- [ ] AI study plan generator
- [ ] Picture description trainer
- [ ] 4 conversation scenarios
- [ ] LOD verified badge on all vocabulary
- [ ] Push notifications
- [ ] Offline mode

### PHASE 3 — Differentiation (Weeks 15–24)
- [ ] Integration Hub (Work + Health + Admin + Housing + School)
- [ ] B1 Listening module
- [ ] Full Sproochentest simulation
- [ ] Community corrections
- [ ] Russian + Portuguese UI
- [ ] Admin CMS with LOD validation workflow
- [ ] Enterprise plan

### PHASE 4 — Growth (Month 6+)
- [ ] Partnership with SDL (sdl.inll.lu) — official exam body
- [ ] Partnership with ADEM — Luxembourg employment agency
- [ ] Partnership with communes for immigrant onboarding packages
- [ ] Corporate packages for Luxembourg employers
- [ ] B2 module

---

## 📊 CURRICULUM MAP (50 Lessons)

### MODULE 0: Pronunciation (A1) — Free
```
L1: Special sounds: é, ë, ä, ch, ll, w — LU vs DE comparison
L2: Stress, rhythm, intonation
L3: Common traps per native language (AR/FR/RU/PT)
```

### MODULE 1: First Steps (A1) — Free
```
L4:  Greetings — Moien, Äddi, Wéi geet et?
L5:  Numbers 1-100
L6:  Days, months, seasons, time
L7:  Family — d'Famill
L8:  Colors and basic adjectives
L9:  Food and drinks
L10: Core verbs — sinn, hunn, goen, kommen, wunnen
L11: Simple sentence structure
L12: Articles — de/d'/d'/eng (LU vs German der/die/das/ein/eine)
```

### MODULE 2: Grammar Core (A2) — Premium
```
L13: Full verb conjugation (all pronouns)
L14: The Perfekt (past tense) — hunn vs ass
L15: Negation — net and keng
L16: Question words — Wie, Wou, Wann, Firwat, Wéi vill
L17: Prepositions — an, op, bei, mat, ouni, fir, vun
L18: Adjective endings
L19: Modal verbs — kënnen, mussen, däerfen, wëllen, sollen
L20: Compound sentences — well, datt, wann, obwuel
L21: Comparatives and superlatives
L22: Future tense — wäert + infinitive
L23: Reflexive verbs
L24: Word order rules (CRITICAL — very different from Arabic/FR/RU)
```

### MODULE 3: Real Life (A2) — Premium
```
L25: Self-introduction — Sich virstellen
L26: Your family and home
L27: Work and daily routine
L28: Shopping and prices
L29: Transport and directions in Luxembourg
L30: Weather — D'Wieder
L31: Making appointments
L32: At the doctor — Beim Dokter
L33: At the restaurant
L34: Talking about hobbies
```

### MODULE 4: Sproochentest Prep — Premium
```
L35: Self-intro mastery + practice exam questions
L36: Picture description technique (Bildkommentar)
L37: Giving your opinion — Ech mengen / Ech fannen
L38: Role-play: commune office
L39: Role-play: job interview
L40: Role-play: doctor appointment
L41: Exam vocabulary sprint — 100 most common words
L42: Mock exam 1 (practice mode with hints)
L43: Mock exam 2 (official simulation — strict)
```

### MODULE 5: Listening B1 — Premium
```
L44: Listening strategy
L45: Short announcements (RTL Lëtzebuerg style)
L46: Radio broadcasts
L47: Longer conversations
L48: B1 practice test 1
L49: B1 practice test 2
```

### MODULE 6: Integration Luxembourg — Premium
```
L50: Work — ADEM, CV, job interview phrases
L51: Healthcare — CNS, insurance, doctor
L52: Commune — residence permit, ID card
L53: Housing — rental contract, neighbors
L54: School — Luxembourg education system
L55: Banking and finances
L56: Luxembourg history, culture, national identity
```

---

## ⚠️ CRITICAL IMPLEMENTATION RULES

### 1. Luxembourgish Text is Sacred
```
NEVER modify, translate, or auto-correct Luxembourgish words.
Display exactly as in content JSON.
Visual treatment: font-weight: 700, color: primary.500
```

### 2. LOD Verification is Mandatory for All Vocabulary
```
NO word enters the database without lodVerified: true
Admin panel must enforce this — block publishing unverified words
Show ✅ lod.lu badge on verified words in the app
```

### 3. Anti-German Confusion Layer in Every AI Call
```typescript
// EVERY call to Claude that touches Luxembourgish MUST include:
system: buildSystemPrompt(service, language)  // includes LU_DE_GUARD
// EVERY AI response with Luxembourgish MUST be scanned:
detectGermanInLuxembourgish(response)
```

### 4. RTL Only for Arabic
```typescript
const isRTL = uiLanguage === 'ar'
I18nManager.forceRTL(isRTL)
// All other 4 languages are LTR
```

### 5. Audio Quality
```
44100 Hz, 128kbps minimum
Always show waveform during recording
Let user play back before submitting
Store: Supabase Storage /recordings/{userId}/{uuid}.webm
```

### 6. Offline-First for Lessons
```
Cache lessons on first download
SRS works offline
Only AI features need internet
```

### 7. Content Integrity
```
AI NEVER generates lesson content.
AI is ONLY used for:
  - Evaluating user responses
  - Explaining errors (in user's language)
  - Conversation simulation
  - Study plans
  - Daily tips
  - Exam assessment
All lesson text = human-curated + LOD-verified
```

---

## 🏁 GETTING STARTED

```bash
# 1. Create Turborepo monorepo
npx create-turbo@latest whatslux --package-manager pnpm
cd whatslux

# 2. Mobile (Expo)
cd apps/mobile
npx create-expo-app . --template tabs
pnpm add nativewind tailwindcss
npx expo install expo-av expo-speech expo-camera expo-file-system
pnpm add @anthropic-ai/sdk @supabase/supabase-js
pnpm add @tanstack/react-query zustand
pnpm add i18next react-i18next

# 3. Web (Next.js)
cd ../web
npx create-next-app@latest . --typescript --tailwind --app
pnpm add @supabase/ssr stripe posthog-js

# 4. Backend
cd ../../backend
pnpm add express typescript @anthropic-ai/sdk @supabase/supabase-js stripe
pnpm add @prisma/client prisma zod

# 5. Prisma
npx prisma init
# Add schema above
npx prisma migrate dev --name init
npx prisma generate

# 6. Start dev
# Terminal 1: cd apps/mobile && npx expo start
# Terminal 2: cd apps/web && pnpm dev
# Terminal 3: cd backend && pnpm dev
```

---

## 📊 COMPETITIVE ADVANTAGE

| Feature | Duolingo | Busuu | **WhatsLUX** |
|---|---|---|---|
| Luxembourgish language | Basic | ❌ | ✅ Full A1→B1 |
| Arabic UI (RTL) | ❌ | ❌ | ✅ Native RTL |
| French / Russian / Portuguese UI | Partial | Partial | ✅ Full |
| Grammar explained in native language | ❌ | Partial | ✅ AI-powered |
| Sproochentest official prep | ❌ | ❌ | ✅ SDL-aligned |
| LU vs German confusion prevention | ❌ | ❌ | ✅ Built-in |
| LOD.lu verified vocabulary | ❌ | ❌ | ✅ All words |
| Integration content (Luxembourg) | ❌ | ❌ | ✅ Complete |
| AI speaking coach (native language) | Basic | Basic | ✅ Detailed |
| Spaced repetition | ✅ | ✅ | ✅ SM-2 |
| Offline mode | Premium | Premium | ✅ Premium |

---

*App Name: WhatsLUX*
*Tagline: "Lëtzebuergesch léieren — mat Ärer Sprooch"*
*(Learn Luxembourgish — in your language)*
*Domain: whatslux.lu / whatslux.app*
*Official references: lod.lu | spellchecker.lu | sdl.inll.lu | llo.lu*
