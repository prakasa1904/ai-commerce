# 🌾 Farm Marketplace

## GOAL
Build a production-grade web marketplace with React + Vite + TypeScript and an Express/SQLite backend. Apply React Best Practices, and solve common blank page issues.

---

## STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript |
| Styling | Tailwind CSS v4 (design tokens in `src/infrastructure/css/`) |
| Server State | TanStack Query v5 (`@tanstack/react-query`) |
| Backend | Express 4, SQLite3 |
| Build | `tsc && vite build` |

---

## HIGH-LEVEL ARCHITECTURE

```
                   ┌─────────────────────────┐
                   │   Browser (Vite dev :5173)│
                   └────────────┬────────────┘
                                │  /api/products (fetch)
              ┌─────────────────▼──────────────────┐
              │  Vite proxy (/api → localhost:5001) │
              └─────────────────┬──────────────────┘
                                │
                   ┌────────────▼─────────────┐
                   │ Express API (port 5001)  │
                   │  - GET /api/products     │
                   │  - GET /api/auth/*       │
                   │  - GET /api/cart         │
                   └────────────┬─────────────┘
                                │ sqlite3
                   ┌────────────▼─────────────┐
                   │ farmer_marketplace.db    │
                   └──────────────────────────┘
```

### Data flow
1. `DataProvider` (React Query) → `HomePage` → `GridViewProduct`
2. `GridViewProduct` calls `useProducts()` (Application hook)
3. `useProducts` → `productService.getProducts()` (Application service)
4. `productService` → `productApi.fetchProducts()` (Infrastructure/fetch)
5. `productApi` calls `GET /api/products` and maps the response into a `Product`

---

## LAYER ARCHITECTURE

```
src/
├── main.tsx                    # ReactDOM render + DataProvider wrap + CSS import
├── App.tsx                     # Root component (renders HomePage)
├── vite-env.d.ts               # CSS module declarations
├── domain/
│   └── types/
│       └── product.ts          # Product, ProductCategory, ProductApiResponse
├── application/
│   ├── hooks/
│   │   └── useProducts.ts      # TanStack Query hook for products
│   ├── services/
│   │   └── productService.ts   # API abstraction (getProducts)
│   └── providers/
│       └── DataProvider.tsx    # QueryClient + Provider + Devtools
├── infrastructure/
│   ├── api/
│   │   └── productApi.ts       # fetch('/api/products') implementation
│   ├── cache/
│   │   └── queryKeys.ts        # query key factory
│   └── css/
│       └── index.css           # Tailwind v4 + design tokens (@theme)
└── presentation/
    └── components/
        ├── atoms/              # Header        (leaf/sun brand mark)
        ├── molecules/          # GridViewCategory, GridViewProduct
        └── templates/          # Hero, SubscriptionBand, Footer, homePage
```

**Dependency Rule:** Lower layers MUST NOT import upper layers.

```
Presentation → Application → Infrastructure → Domain
```

Every boundary holds today:
- `GridViewProduct` imports from `domain/types` + `application/hooks`
- `useProducts` imports from `infrastructure/cache` + `application/services`
- `productService` imports from `infrastructure/api`
- `productApi` imports from `domain/types`

---

## REACT BEST PRACTICES (9 Steps)

### Step 1: TypeScript-First
- Source files are `.tsx` (components) and `.ts` (hooks/services/types)
- Explicit types for all props: `React.FC<Props>`
- No implicit `any` types; `tsc --noEmit` passes in CI
- `.js` is allowed only in `server/` (Express is untyped) and `vite.config.js`

### Step 2: Layer Architecture
Follow the folder layout above. When adding a feature, place it in the correct layer first, then wire through the boundaries. Never import a Presentation file from Application/Infrastructure.

### Step 3: Component Design
- **Maximum 50 lines** per component (templates ≤ 50, molecules ≤ 80 with sub-components)
- Extract sub-components when logic > 20 lines
- Single Responsibility Principle (one component = one job)

### Step 4: State Management
- **Local State:** `useState` for form inputs, loading flags, UI toggles (`searchQuery` in `GridViewProduct`)
- **Server State:** **TanStack Query** — never store server data in `useState`
- **Global State:** Zustand (recommended, planned for cart/auth — not yet installed)
```typescript
// Server state (REQUIRED pattern)
const { data, isLoading, isError } = useQuery({
  queryKey: queryKeys.products(),
  queryFn: () => productService.getProducts(),
  staleTime: 5 * 60 * 1000,
});

// Caching defaults live in DataProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, retry: 1 },
  },
});
```

### Step 5: Forms
- Always **controlled components** (`value` + `onChange`)
- Search input is the controlled-form example in this repo (`GridViewProduct.tsx`)
- Use React Hook Form for validation when real forms are added

### Step 6: Performance Optimization
- **Query caching:** prefer `staleTime`/`gcTime` over refetching; use `queryKey`s for targeted invalidation
- **List Keys:** Use stable unique IDs (`item.id`), NOT array indices
- **Images:** `loading="lazy"` on product images (`ProductCard`)

### Step 7: Error Boundaries
- Async data loading uses TanStack Query's `isError` state with a fallback UI (see `GridViewProduct`)
- Add a class-based `ErrorBoundary` around async route/page components as routes grow (no blank pages)

### Step 8: Testing Standards
- **Required coverage:** 100% for custom hooks and critical business logic
- Use Vitest + React Testing Library
```typescript
it('calls handler when clicked', () => {
  const handler = vi.fn()
  render(<Button onClick={handler}/>)
  fireEvent.click(screen.getByRole('button'))
  expect(handler).toHaveBeenCalled()
})
```

### Step 9: Component Complexity Tiers
| Tier | Max Lines | Example |
|------|-----------|---------|
| Atom | ≤20 | `<Header>` |
| Molecule | ≤80 | `<GridViewCategory>`, `<GridViewProduct>` (with sub-components) |
| Template | ≤50 | `<Hero>`, `<SubscriptionBand>`, `<Footer>` |
| Page | ≤80 | `<HomePage>` |

---

## DESIGN SYSTEM (Tailwind v4 tokens)

Theme lives in `src/infrastructure/css/index.css` under `@theme` and is imported once in `main.tsx`.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-forest` | `#1E3B2C` | Header bg, primary actions |
| `--color-pine` | `#284B38` | Hover states |
| `--color-moss` | `#7A9B6D` | Accents, borders |
| `--color-honey` | `#E3A72F` | Accent (CTAs, price tags) |
| `--color-wheat` | `#F6F1E4` | Page background |
| `--color-cream` | `#FBF8F1` | Card backgrounds |
| `--color-soil` | `#4A3628` | Body text |
| `--color-clay` | `#B0653A` | Wholesale/subscription accents |
| `--font-display` | Raleway | Headlines, wordmark |
| `--font-body` | Public Sans | Body text |

Style with **Tailwind utility classes only** — no inline `style={{}}`, no ad-hoc CSS.

---

## COMMON PITFALLS & FIXES

| Pitfall | Fix | Category |
|---------|-----|----------|
| State mutation | `{...state, key: newValue}` | State |
| Missing list keys | Use `item.id`, not `i` | Rendering |
| Uncontrolled forms | `useState` (controlled) | Forms |
| Hardcoded API URL | Vite proxy `/api` → `localhost:5001` | Config |
| Storing server data in `useState` | TanStack Query `useQuery` | State |
| No error handling | `isError` + fallback UI | Errors |
| Inline styles | Tailwind utility classes | Styling |
| Importing across layers upward | Respect Presentation → App → Infra → Domain | Architecture |

---

## FILES

| File | Purpose |
|------|---------|
| `index.html` | App root + title |
| `vite.config.js` | Vite + React + Tailwind plugins; `/api` proxy to `localhost:5001` |
| `server/index.js` | Express API (port 5001) + DB init/migration + seeding |
| `server/seed.js` | Standalone DB seed script |
| `server/schema-and-seed.sql` | Reference schema + original 3 demo products |

---

## VERIFICATION CHECKLIST

- [ ] `npm run start` (backend :5001) and `npm run dev` (frontend :5173) both run
- [ ] `npm run build` passes (`tsc && vite build`)
- [ ] 8 products with images, titles, "Rp X" prices
- [ ] Search filters products by title
- [ ] Category cards/pills filter products
- [ ] Hover effects on cards (image zoom + lift)
- [ ] Cart buttons trigger console.log (ready for cart integration)
- [ ] Responsive: 4 columns desktop → 1 column mobile (`xl:grid-cols-4` → `grid-cols-1`)
- [ ] All `.tsx` files with explicit types; `tsc` clean
- [ ] No `any` in source (`src/**/*.ts`(x))
- [ ] Component files respect tier line limits
- [ ] Tailwind utility classes only (no inline styles)
- [ ] No upward layer imports in `src/`

---

## REFERENCES

- Code adapted from: [Vercel Agent Skills - React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/AGENTS.md)
- React 18: https://react.dev
- Vite: https://vitejs.dev
- TanStack Query: https://tanstack.com/query
- Tailwind CSS v4: https://tailwindcss.com/docs
- Zustand: https://docs.pmnd.rs/zustand (optional, future cart/auth)

---

** LAST UPDATE:** 2026-09-26
** OUTPUT:** React 18 + Vite + TS frontend with TanStack Query, Tailwind v4 design system, and Express/SQLite backend.