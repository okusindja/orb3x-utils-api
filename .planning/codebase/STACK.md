# Technology Stack

**Analysis Date:** 2026-06-18

## Languages

**Primary:**
- TypeScript 5.x - All application code, API routes, and libraries under `app/`, `src/`
- CSS (Tailwind) - Styling via `app/globals.css` and Tailwind utility classes

**Secondary:**
- JavaScript (config files) - `jest.config.js`, `eslint.config.mjs`, `postcss.config.mjs`

## Runtime

**Environment:**
- Node.js 22.x (local), 24.x (Vercel production — per `.vercel/project.json`)

**Package Manager:**
- pnpm (primary, lockfile present)
- Lockfile: `pnpm-lock.yaml` — present and committed

## Frameworks

**Core:**
- Next.js 16.2.1 — Full-stack React framework, App Router, API routes
  - Config: `next.config.ts`
  - Output mode: `standalone` (containerized deployment)
  - All API routes use `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`

**UI:**
- React 19.2.4 — UI rendering (`app/layout.tsx`, `src/components/`)
- React DOM 19.2.4 — DOM bindings

**Styling:**
- Tailwind CSS 4.x — Utility-first CSS (`app/globals.css`)
- PostCSS — via `postcss.config.mjs` using `@tailwindcss/postcss`
- tailwind-merge 3.x — Class merging utility (`src/lib/utils.ts`)
- clsx 2.x — Conditional class names

**Animation:**
- Framer Motion 12.x — UI animations (`src/components/`)

**Internationalization:**
- i18next 25.x — Core i18n engine (`src/lib/i18n.ts`)
- react-i18next 16.x — React bindings
- next-i18next 15.x — Next.js adapter
- i18next-resources-to-backend 1.x — Lazy-loads locale JSON files
- Supported languages: `en`, `pt`, `es`, `fr`, `de`, `zh`, `ja`
- Locale files: `src/locales/{language}/` and `public/locales/`

**Testing:**
- Jest 30.x — Test runner (`jest.config.js`)
- jest-environment-jsdom 30.x — Browser-like environment
- @testing-library/react 16.x — React component testing
- @testing-library/jest-dom 6.x — DOM matchers

**Build/Dev:**
- SWC — Rust-based TypeScript/JSX transpiler (via Next.js, cache at `.swc/`)
- ESLint 9.x — Linting (`eslint.config.mjs` using `eslint-config-next`)

## Key Dependencies

**Critical:**
- `next` 16.2.1 — Entire server and routing infrastructure
- `react` / `react-dom` 19.2.4 — UI framework
- `pdf-lib` 1.17.1 — PDF generation for invoice/receipt documents (`src/lib/angola/documents.ts`)
- `cheerio` 1.2.0 — HTML scraping for Angola tax portal NIF lookup (`src/lib/agt-nif.ts`)
- `shiki` 4.x — Syntax highlighting for documentation code samples (`src/lib/docs-code.ts`)

**UI Components:**
- `@radix-ui/react-scroll-area` 1.x — Accessible scroll container
- `@radix-ui/react-select` 2.x — Accessible select component
- `@radix-ui/react-use-controllable-state` 1.x — Radix state hook
- `lucide-react` 1.x — Icon library
- `@icons-pack/react-simple-icons` 13.x — Brand/tech icons

**Analytics:**
- `@vercel/analytics` 2.x — Vercel web analytics (`app/layout.tsx`)

## Configuration

**Environment:**
- `.env.local` — Local environment overrides (present, contents not read)
- `.env.development.local` — Development-specific overrides (present, contents not read)
- No public env vars (`NEXT_PUBLIC_*`) found in source — all integrations use server-side env vars only

**Build:**
- `next.config.ts` — Next.js configuration; sets `output: 'standalone'`, defines URL redirect rules mapping shorthand paths to `/api/v1/` equivalents
- `tsconfig.json` — TypeScript strict mode, `ES2017` target, path alias `@/*` → `src/*`
- `postcss.config.mjs` — PostCSS with Tailwind CSS plugin

## Platform Requirements

**Development:**
- Node.js 22.x+
- pnpm (lockfile at root)
- Run dev: `pnpm dev` (or `npm run dev`)
- Run tests: `pnpm test`

**Production:**
- Deployed to Vercel (project ID: `prj_cNXrJK1P2tTUuVCuv3B4zd22AhAr`, org: `team_gTjNDevyykvdHor44NtqKegA`)
- Node.js 24.x on Vercel
- Standalone Next.js build output (`.next/standalone/`)
- No Docker or container config in repo — Vercel handles deployment

---

*Stack analysis: 2026-06-18*
