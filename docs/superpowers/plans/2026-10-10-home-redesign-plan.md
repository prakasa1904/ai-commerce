# Plan: Home page redesign — fresh pickings rotating section

## Goal

Redesign the home page flow to mirror the reference e-commerce rhythm (hero → featured products → a second product grid) by adding one new section between the existing product listing and the subscription band. All sections above/below stay as-is.

## Tasks

### Task 1: Add "Fresh pickings" rotating product section to the home page

- Create `src/modules/home/FreshPickings.tsx` (React.FC, no props):
  - Fetch products via the existing `useProducts()` hook (same cached query as `GridViewProduct`).
  - Shuffle the product list with a small module-private Fisher-Yates helper (no external dependencies) and show up to 8 products (`PIKINGS_LIMIT = 8`).
  - Section markup mirrors the reference's "Hot Sales" style: centered header with eyebrow (`font-display text-honey font-bold text-sm tracking-[0.3em] uppercase`), H2 (`text-3xl font-black text-forest font-display`), one-line description; then a compact product grid (`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4`) rendering `ProductCard` per product, keyed by `product.id`.
  - Loading state: render `ProductSkeletonCard` in a skeleton grid (same skeleton grid classes as `GridViewProduct`).
  - Error state: render a centered destructive `Alert` (same styling/phrasing pattern as `GridViewProduct`'s error state).
  - Under the grid add a small CTA row: text + a TanStack `Link` to `/cat` (category list page) labeled "Browse the market →".
- Edit `src/modules/home/HomePage.tsx`: import `FreshPickings` and render it between `GridViewProduct` and `SubscriptionBand`.
- Keep the section fully self-contained in `src/modules/home/`; no changes to routes, category/product pages, domain types, or the API.

## Global Constraints

- No new npm dependencies; no changes to `package.json`.
- No design-token changes (CSS stays as-is); use existing Farm palette classes and existing shadcn/ui primitives (`Card`, `Alert`, `Button`) and existing atoms (`ProductCard`, `ProductSkeletonCard`).
- Explicit prop types (`React.FC<Props>`), no implicit `any` — `tsc --noEmit` must pass.
- Tailwind utility classes only (no inline `style` objects); stable keys (`product.id`), no array-index keys.
- Follow the existing section conventions in `src/modules/home/` (Hero, SubscriptionBand) and `GridViewProduct` for loading/error state structure.
- Acceptance: `npm run build` (tsc && vite build) completes without errors.

## Deliverables

- New file `src/modules/home/FreshPickings.tsx`
- Edited `src/modules/home/HomePage.tsx`
- No commits (working tree only; AGENTS.md forbids committing without explicit request).