# Plan: Pin HomePage redo polish items + run all services

## Goal

Close out the three Minor findings the Task 1 review deferred for `src/modules/home/FreshPickings.tsx`, verify the build, then start all services (DB seed, Go API, Vite dev) and confirm they come up.

## Tasks

### Task 1: Fix deferred Minor findings in `src/modules/home/FreshPickings.tsx`

In the working tree (no commits, per the standing no-commit ruling from the home-redesign plan):

1. **Empty state** — when products resolve and the shuffled `pickings` slice is empty (`products` is `[]` or the slice yields nothing), render an explicit empty message instead of a bare grid. Copy the shape of `GridViewProduct`'s `emptyMessage` (`GridViewProduct.tsx:40-55`): full-width centered block, crate-box SVG icon, eyebrow "This stall is empty", heading "Nothing to pick right now", and a short subtext. Keep it inside the success-branch grid container using `col-span-full`.
2. **aria-label consistency** — the success `section` carries `aria-label="Fresh pickings from the market"`; add the same `aria-label` to the loading and error `section` returns so all three branches are consistent.
3. **Constant name** — rename `PICKINGS_LIMIT` to `PIKINGS_LIMIT` to match the home-redesign plan brief's literal constant name verbatim.
4. Verify: `npx tsc --noEmit` and `npm run build` at repo root pass. Report output.

### Task 2: Start all services

- Run `npm run seed` to (re)create `farmer_marketplace.db`. If the DB already exists with seed data, the seed should be idempotent or the existing DB can be used — confirm the API serves products afterward.
- Start the Go backend in the background: `npm run start` (Fiber API on :5001, DB_PATH=../farmer_marketplace.db).
- Start the Vite dev frontend in the background: `npm run dev` (on :5173, proxying /api to :5001).
- Verify: `curl http://localhost:5001/api/products` returns JSON, and the Vite dev server responds on http://localhost:5173 (or at least the port is listening).
- Leave the services running for the user to inspect; report the log file paths.

## Global Constraints

- No new npm dependencies; no changes to `package.json`, routes, CSS tokens, domain types, or the Go backend.
- Explicit prop types, `React.FC`, no implicit `any`; Tailwind classes only; stable keys (`product.id`).
- Working tree only — no commits (standing ruling).
- The empty-state SVG and phrasing should match `GridViewProduct`'s existing empty message closely so the section reads consistently with the rest of the home page.