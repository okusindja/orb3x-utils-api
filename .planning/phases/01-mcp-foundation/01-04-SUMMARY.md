---
phase: 01-mcp-foundation
plan: 04
subsystem: bank-images
tags: [perf, refactor, tdd, wave-2, filesystem]
dependency_graph:
  requires: ["01-01"]
  provides: [getAngolaBankLogoPath, getAngolaBankLogoBytes, PERF-01-complete]
  affects: [banks.ts consumers (validate-bank-account, validate-iban, get-banks), Phase 4 PDF tools]
tech_stack:
  added: [node:fs, node:path]
  patterns: [filesystem-path-resolver, graceful-degradation-D06, tdd-red-green]
key_files:
  created: []
  modified:
    - src/lib/angola/bank-images.ts
    - src/lib/angola/banks.ts
    - src/lib/__tests__/angola-banks.test.ts
decisions:
  - "Returned new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) instead of raw Buffer to satisfy toBeInstanceOf(Uint8Array) in Jest and match the typed return signature"
  - "Kept BANK_IMAGE_CODE_ALIASES intact — alias resolution is unchanged, BVB→BV, BSOL→SOL, FNB→FINIBANCO, BPT→POSTAL"
  - "Pre-existing tsc error in middleware-rate-limit.test.ts (wave-0 scaffold) left untouched — out of scope"
metrics:
  duration: ~10 minutes
  completed: 2026-06-18
requirements: [PERF-01]
---

# Phase 01 Plan 04: PERF-01 Bank-Images Refactor Summary

**One-liner:** Replaced ~1.4 MB inline base64 bank-images.ts with a filesystem path resolver (getAngolaBankLogoPath) and updated banks.ts to read logo bytes from disk (getAngolaBankLogoBytes, Uint8Array | null) with graceful degradation per D-06.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Replace bank-images.ts base64 with filesystem path resolver | 42f0314 | src/lib/angola/bank-images.ts |
| 2 | Update banks.ts to read logo bytes from disk and fix tests | 136a7ac | src/lib/angola/banks.ts, src/lib/__tests__/angola-banks.test.ts |

## What Changed

### bank-images.ts (Task 1)

Before: ~1.4 MB file exporting `ANGOLA_BANK_IMAGE_DATA: Record<string, string>` with inline base64 data URIs.

After: 10-line file exporting a single pure function:
- `getAngolaBankLogoPath(code: string): string | null` — uppercases code, builds `join(LOGOS_DIR, CODE.png)`, returns path if `existsSync` is true else null.
- `LOGOS_DIR = join(process.cwd(), 'public', 'bank-logos')` — works in Vercel standalone per Pitfall 6.

### banks.ts (Task 2)

Removed:
- `ANGOLA_BANK_IMAGE_DATA` import
- `BANK_IMAGE_PLACEHOLDER` const
- `bankImageCache` Map
- Private `getAngolaBankImage()` function

Added:
- `readFileSync` from `node:fs`
- `getAngolaBankLogoPath` import from `@/lib/angola/bank-images`
- Exported `getAngolaBankLogoBytes(bank: AngolaBank): Uint8Array | null`

Updated callers: `getAngolaBanks`, `validateAngolanBankAccount`, `validateAngolanIban` — all now use `getAngolaBankLogoBytes(bank)`.

### angola-banks.test.ts (Task 2)

Rewrote two test cases that asserted `data:image/...;base64,` patterns:
- `'maps embedded asset aliases onto canonical bank codes'` → now asserts `Uint8Array` instanceof and `length > 0`
- `'uses one shared placeholder image when no embedded logo exists'` → now asserts `getAngolaBankLogoBytes` returns `null` for a bank code with no matching PNG file (D-06)

## Test Results

| Test Suite | Tests | Result |
|------------|-------|--------|
| bank-images.test.ts | 3 | GREEN |
| angola-banks.test.ts | 5 | GREEN |
| **Total** | **8** | **GREEN** |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Buffer vs Uint8Array instanceof mismatch in Jest**
- **Found during:** Task 2 verification
- **Issue:** `readFileSync` returns `Buffer` which is a Node.js subclass of `Uint8Array`. Jest's `toBeInstanceOf(Uint8Array)` failed because Jest uses `instanceof` which checks the constructor chain differently in its test environment — `Buffer` was not recognized as `Uint8Array` by `toBeInstanceOf`.
- **Fix:** Wrapped the `Buffer` return value as `new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)` to produce a pure `Uint8Array` that satisfies both the TypeScript signature and Jest assertion.
- **Files modified:** src/lib/angola/banks.ts
- **Commit:** 136a7ac (included in Task 2)

## Out-of-Scope Issues Deferred

| File | Issue | Note |
|------|-------|------|
| src/lib/__tests__/middleware-rate-limit.test.ts | TS7052: Headers has no index signature | Pre-existing from 01-01 wave-0 scaffold; not caused by this plan |

## Non-PNG Origin Logos (Phase 4 Reminder)

Per 01-01 SUMMARY, these logos were stored as non-PNG MIME types but written as .png files. `getAngolaBankLogoBytes` will return bytes regardless — Phase 4 must handle graceful skip when `pdf-lib.embedPng` rejects non-PNG bytes:

| File | Original MIME Type | Risk |
|------|--------------------|------|
| BANC.png, BCA.png, BE.png, BFA.png, FINIBANCO.png, SBA.png | image/jpeg | embedPng will reject |
| BIR.png, BV.png, PLACEHOLDER.png | image/svg+xml | embedPng will reject |
| POSTAL.png | image/webp | embedPng will reject |

## Known Stubs

None — plan goals fully achieved. `getAngolaBankLogoBytes` returns real bytes from disk for all 30 PNG files; `null` for missing codes.

## Threat Flags

None new. T-01-FS (path traversal) mitigated by uppercased code + fixed LOGOS_DIR + fixed `.png` suffix — bank codes originate from in-repo BANKS table, not user input. T-01-AVL (missing file DoS) mitigated by returning null per D-06.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/lib/angola/bank-images.ts | FOUND |
| src/lib/angola/banks.ts | FOUND |
| src/lib/__tests__/angola-banks.test.ts | FOUND |
| No ANGOLA_BANK_IMAGE_DATA in bank-images.ts | CLEAN |
| No base64, in bank-images.ts | CLEAN |
| No ANGOLA_BANK_IMAGE_DATA in banks.ts | CLEAN |
| Commit 42f0314 (Task 1) | FOUND |
| Commit 136a7ac (Task 2) | FOUND |
| bank-images.test.ts: 3 tests GREEN | PASSED |
| angola-banks.test.ts: 5 tests GREEN | PASSED |
