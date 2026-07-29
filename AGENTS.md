# 🌾 FARM MARKETPLACE — SINGLE PROMPT

## GOAL
Build a production-grade React+Vite marketplace with fixed blank page issues and dark UI.



## PHASE 1: BLANK PAGE DEBUGGING

**SOLUTION:**
1. CDN React 18 UMD setup in `client/index.html`
2. Functional React with `React.createElement()`
3. `root.render(container)` after `DOMContentLoaded`
4. Vite proxy `/api` → `localhost:5001`
5. Start backend: `node server/server.js`
6. Start Vite: `npx vite --clearScreen false`
7. Access: `http://localhost:5175/`



## PHASE 2: MODERN DARK UI

**FEATURES:**
- Dark theme (`#0f172a`)
- Glassmorphism cards
- 8 demo products with Unsplash
- Search, filters, and responsive grid
- Hover effects and cart buttons

**KEY CSS:****/types/src/presentation/components/atoms/` folder structure for `Button`, `Input`, etc.



## PHASE 3: REACT BEST PRACTICES

**Layer Architecture:**
```
├── domain/             # Business models - no imports from upper layers
├── application/        # Hooks, services, stores - Zustand & RHF
├── infrastructure/     # API and database - Axios + sqlite3
└── presentation/       # UI components - Tailwind only
```

**Component Rules:**
- Atoms: ≤5 lines (Button, Input)
- Molecules: ≤15 lines (SearchBar, Card)
- Organisms: ≤30 lines (ProductGrid)
- Templates: ≤50 lines (Page sections)
- Pages: ≤80 lines

**State Management:**
- Local: `useState` for forms/loading
- Global: Zustand stores
- Server: TanStack Query

**Forms:**
- Controlled with React Hook Form

**Performance:**
- Lazy loading, memoization, proper keys

**Error Handling:**
- Class-based ErrorBoundary

**Testing:**
- 100% coverage for hooks/logic
- Vitest + React Testing Library



## PHASE 4: IMPROVEMENTS

**Checklist:**
- [ ] Component line limits enforced
- [ ] Layer dependency rules verified
- [ ] Tests updated for new logic

**Common Fixes:**
- [ ] Refactor oversized components
- [ ] Add missing ESLint hooks
- [ ] Convert hardcoded URLs to `import.meta.env`
- [ ] Add Tailwind to `postcss.config.js` if missing
---

**FILES SAVED:**
- `client/index.html`, `client/src/main.tsx`, `client/src/App.tsx`
- `server/server.js`, `server/schema-and-seed.sql`
- `vite.config.js`: proxy config
- UI structure in `src/presentation/components/**/*.tsx`

**NOTES**
- Follow 9-step React Best Practices
- Use Tailwind only for styling
- Maintain component complexity tiers
