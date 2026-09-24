# LOD integration — verified facts

Everything below was checked against the real dataset (release 260727) and live lod.lu on 2026-09-24.

## Source

| | |
|---|---|
| Dataset | [LOD – linguistesch Daten](https://data.public.lu/en/datasets/letzebuerger-online-dictionnaire-lod-linguistesch-daten/) on data.public.lu |
| Publisher | Zenter fir d'Lëtzebuerger Sprooch |
| Licence | **CC0** (checked in the portal API) |
| File | one XML file, `new_lod-art.xml` (~100 MB, 33,941 entries) |
| Releases | 2025-04, 2025-08, 2026-01, 2026-05, 2026-07: irregular, although the portal says "monthly" |
| Not included | inflection tables (separate dataset: *LOD – Flexiounstabellen*) |

## What the dataset contains

- Lemma, IPA, part of speech, **gender** (`M` `F` `N` or combined: `MF` `MN` `FN`), plural with n-rule form, past participle + auxiliary for verbs, variants (e.g. `dass` → variant of `datt`).
- Translations: **de, fr, en, pt, nl**. There are **no Arabic or Russian translations**; those stay with the teacher.
- Example sentences, split into word tokens, with an `id` when recorded.
- Register labels: EGS colloquial · FAM crude · GEHUEW formal · KANNERSPROOCH child language · NEOL neologism · PEJ pejorative · VEREELZT archaic · VULG vulgar · IRON ironic.
  **FAM / PEJ / VULG meanings and examples are never shown to learners** (`isLearnerSafe`).

## Audio (checked live)

| | URL |
|---|---|
| Headword | `https://lod.lu/uploads/AAC/{entry id in lowercase}.m4a` (`.ogg` under `/OGG/`) |
| Example | `https://lod.lu/uploads/examples/AAC/{first 2 chars of id}/{id}.m4a` |

The uppercase id (`DOKTER1.m4a`) returns 404.

## Live API

Documented at `https://lod.lu/api/doc` (OpenAPI 3). The paths are `/api/{locale}/…`, **not** `/api/1/` or `/api/2/`:
- `GET /api/lb/search?query=Dokter&lang=lb` → `{ results: [{ id, word_lb, pos: "SUBST+M" }] }`
- `GET /api/lb/entry/DOKTER1` → full entry incl. `audioFiles`

WhatsLUX does not need the live API: everything comes from the imported dataset.

## Corrections this data made

| Before | LOD says |
|---|---|
| `Wie`, `Wann` as question words | **wien** = who, **wéini** = when; *wann* = if/when (conjunction) |
| `d'Formulaire` | masculine → **de Formulaire** |
| `Urlaub`, `Médecin`, `Intervue`, `Contrat` | not in LOD → **Congé**, **Dokter**, **Interview / Entretien**, **Kontrakt** |
| detector flagged `hat`, `dass` | valid Luxembourgish (*ech hat*, variant *dass*) → removed |

## n-rule for the masculine article

`definiteArticle()` keeps *den* before a vowel or n/d/t/z/h. Checked against every article + masculine noun in LOD's examples:
**7,408 / 7,425 match (99.8%)**. The misses are loanwords whose first sound differs from their spelling (*den Jackpot*, *den Chat*).

## Workflow

```bash
pnpm lod:import path/to/260727-new-lod-art.zip       # → packages/lod/data (git-ignored)
pnpm --filter @whatslux/content sync-lod             # fill article/plural/audio for words with lod.entryId
pnpm validate:content                                # checks against LOD
```
