---
phase: 01-mcp-foundation
plan: 01
subsystem: mcp-foundation
tags: [packages, assets, tests, wave-0]
dependency_graph:
  requires: []
  provides: [mcp-handler@1.1.0, "@modelcontextprotocol/sdk@1.29.0", zod@3.25.76, public/bank-logos/, wave-0-test-scaffolds]
  affects: [plans 02/03/04/05 (depend on packages + assets + test stubs)]
tech_stack:
  added: [mcp-handler@1.1.0, "@modelcontextprotocol/sdk@1.29.0", zod@3.25.76]
  patterns: [base64-to-png-extraction, jest-tdd-red-scaffold]
key_files:
  created:
    - public/bank-logos/ (30 PNG files)
    - src/lib/__tests__/mcp-tool-error.test.ts
    - src/lib/__tests__/mcp-registry.test.ts
    - src/lib/__tests__/bank-images.test.ts
    - src/lib/__tests__/middleware-rate-limit.test.ts
  modified:
    - package.json (+3 dependencies)
    - pnpm-lock.yaml
decisions:
  - "Used placeholder copies for 8 banks (BMF, BDA, BKI, BPG, BPA, BMAIS, SCBA, BOCLB) that have no dedicated logo in bank-images.ts; lookup works via alias mapping"
  - "Non-PNG origin logos (JPEG, SVG, WebP) written as .png files; pdf-lib embedPng compatibility deferred to Phase 4"
metrics:
  duration: ~8 minutes
  completed: 2026-06-18
---

# Phase 01 Plan 01: Wave 0 Foundation Summary

**One-liner:** Installed mcp-handler@1.1.0 + SDK@1.29.0 + zod@3.25.76, extracted 30 bank logo PNGs to public/bank-logos/ (alias-correct), and created 4 failing Wave 0 test scaffolds for MCP-03/04/05 and PERF-01.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install MCP packages | 990490e | package.json, pnpm-lock.yaml |
| 2 | Extract bank logo PNGs | fc1ead9 | public/bank-logos/ (30 PNGs) |
| 3 | Create failing Wave 0 test scaffolds | 3cb1faa | 4 test files in src/lib/__tests__/ |

## Package Versions Resolved

| Package | Version Range | Resolved Version |
|---------|---------------|-----------------|
| mcp-handler | 1.1.0 | 1.1.0 |
| @modelcontextprotocol/sdk | ^1.29.0 | 1.29.0 |
| zod | ^3 | 3.25.76 |

Single version of each confirmed via `pnpm why` — no dual-version conflict.

## Bank Logo Extraction Details

- **22 unique logos** extracted from `ANGOLA_BANK_IMAGE_DATA` base64 strings
- **Aliases applied correctly**: BSOL→SOL.png, BVB→BV.png, FNB→FINIBANCO.png, BPT→POSTAL.png
- **8 placeholder copies** for banks with no dedicated logo: BMF, BDA, BKI, BPG, BPA, BMAIS, SCBA, BOCLB
- **Total: 30 PNG files** in `public/bank-logos/`
- **Forbidden filenames absent**: BSOL.png, BVB.png, FNB.png, BPT.png (aliases applied, not codes)

## Non-PNG Origin Logos (Phase 4 pdf-lib embedPng Confirmation Required)

The following logos were stored as non-PNG MIME types in `bank-images.ts` but written as `.png` files (the consumer always looks up `.png`). **Phase 4 must confirm `pdf-lib`'s `embedPng` handles these gracefully or falls back per D-06:**

| File | Original MIME Type | Risk |
|------|--------------------|------|
| BANC.png | image/jpeg | embedPng will reject JPEG bytes → must use embedJpg instead or graceful skip |
| BCA.png | image/jpeg | same |
| BE.png | image/jpeg | same |
| BFA.png | image/jpeg | same |
| FINIBANCO.png | image/jpeg | same |
| SBA.png | image/jpeg | same |
| BIR.png | image/svg+xml | embedPng will reject SVG → graceful skip per D-06 |
| BV.png | image/svg+xml | same |
| PLACEHOLDER.png | image/svg+xml | same (and its 8 placeholder copies) |
| POSTAL.png | image/webp | embedPng will reject WebP → graceful skip per D-06 |

**Recommendation for Plan 04:** When refactoring bank-images.ts, store the original MIME type alongside the path so the PDF layer can choose between `embedPng`, `embedJpg`, or graceful skip.

## Wave 0 Test Scaffolds Created (RED)

All 4 test files are RED — they import from modules not yet created:

| Test File | Tests | Imports From | Driven GREEN By |
|-----------|-------|--------------|-----------------|
| mcp-tool-error.test.ts | 4 cases: success, RouteError, non-RouteError, non-Error | `@/lib/mcp/tool-error` (MCP-04) | Plan 02 |
| mcp-registry.test.ts | 2 cases: health registered, health has Zod schema | `@/lib/mcp/registry` (MCP-03) | Plan 02 |
| bank-images.test.ts | 3 cases: known code, NONEXISTENT, case-insensitive | `@/lib/angola/bank-images` (PERF-01) | Plan 04 |
| middleware-rate-limit.test.ts | 5 cases: under limit, 61st is 429, Retry-After, body shape, IP isolation | `@/../middleware` (MCP-05) | Plan 03 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan verify script uses wrong regex for zod package.json range**
- **Found during:** Task 1 verification
- **Issue:** Plan's verify script checked `p.zod` (which is `^3`) against a resolved-version regex `/^[^0-9]*3\./` — this regex expects `3.x.y` format but `^3` starts with `^`, so it fails
- **Fix:** Used corrected verification that checks both the range specifier (`^3`) and the resolved node_modules version (`3.25.76`)
- **Files modified:** None — verification-only fix
- **Commit:** N/A (verification logic only)

**2. [Rule 2 - Missing Functionality] Added placeholder PNG copies for 8 banks without logos**
- **Found during:** Task 2 extraction
- **Issue:** Only 22 of 29 banks have dedicated logos in bank-images.ts; 8 banks (BMF, BDA, BKI, BPG, BPA, BMAIS, SCBA, BOCLB) have no entries. Plan acceptance criteria require ≥25 PNG files and complete lookup coverage
- **Fix:** Created placeholder copies (PLACEHOLDER.png bytes) for all 8 missing banks so every bank code resolves to a PNG when plan 04's getAngolaBankLogoPath is called
- **Files modified:** public/bank-logos/ (8 new files)
- **Commit:** fc1ead9 (included in Task 2 commit)

## Known Stubs

None — this plan creates foundational assets and test scaffolds only. No production modules were implemented.

## Threat Flags

None — package installs verified as official packages (Vercel/MCP-spec/colinhacks) with no postinstall scripts. PNG extraction decodes existing in-repo bytes with no new external inputs.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| SUMMARY.md created | FOUND |
| public/bank-logos/BAI.png | FOUND |
| public/bank-logos/SOL.png | FOUND |
| src/lib/__tests__/mcp-tool-error.test.ts | FOUND |
| src/lib/__tests__/mcp-registry.test.ts | FOUND |
| src/lib/__tests__/bank-images.test.ts | FOUND |
| src/lib/__tests__/middleware-rate-limit.test.ts | FOUND |
| Commit 990490e (packages) | FOUND |
| Commit fc1ead9 (bank logos) | FOUND |
| Commit 3cb1faa (test scaffolds) | FOUND |
