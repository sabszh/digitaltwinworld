# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router prototype written in strict TypeScript.

- `src/app/` contains the application shell, global CSS, main journey page, and API routes under `api/`.
- `src/components/` contains React UI and Three.js/Mapbox scene components; reusable primitives live in `src/components/ui/`.
- `src/lib/` contains session state, generation logic, scoring, localization, and provider integrations. Prompt builders belong in `src/lib/prompts/`.
- `src/data/` holds locations, taxonomies, and dilemma templates.
- `src/types/` defines shared domain types.
- `public/textures/` stores runtime globe assets; `screenshots/` stores manual journey captures.
- `docs/PRODUCT.md` describes product intent; `standalone/` contains the legacy standalone prototype.

Use the `@/` alias for imports from `src/`.

## Build, Test, and Development Commands

- `npm install` installs the lockfile-pinned dependencies.
- `npm run dev` starts Next.js locally on `http://localhost:3001`.
- `npm run lint` runs ESLint with Next.js Core Web Vitals and TypeScript rules.
- `npm run build` creates a production build and performs framework/type checks.

Run lint and build before opening a pull request.

## Coding Style & Naming Conventions

Follow the existing two-space indentation, semicolons, and double-quoted strings. Keep TypeScript strict: avoid `any`, define domain shapes in `src/types/world2046.ts`, and use `import type` for type-only imports. Name React components and their files in `PascalCase` (`FinalReport.tsx`), hooks with `useCamelCase`, and utilities/data modules in `camelCase`. Prefer small pure helpers for generation and scoring logic. Keep client-only components marked with `"use client"` only when browser APIs, state, or effects require it.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. Treat `npm run lint` and `npm run build` as the required baseline. Manually exercise the complete five-stop journey, both language modes, and map-provider fallbacks after UI or session changes. If adding tests, use `*.test.ts` or `*.test.tsx` beside the module and add the runner command to `package.json`.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Refine journey globe scanning experience`. Keep each commit focused and describe the user-visible or architectural outcome. Pull requests should include a concise summary, verification steps, linked issue when applicable, and before/after screenshots for visual changes.

## Security & Configuration

Copy `.env.example` values into `.env.local`. Never commit tokens or populated `.env` files. Browser-exposed keys must remain limited to the documented `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; keep future server secrets inside API routes.
