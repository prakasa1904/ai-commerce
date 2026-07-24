# 🌾 FARM MARKETPLACE — SINGLE PROMPT

## GOAL
Build a production-grade web marketplace with React+Vite+Backend, apply React Best Practices, and solve common blank page issues.

---

## PHASE 1: BLANK PAGE DEBUGGING

**PROBLEM:** Vite ES Module scripts fail silently in browser → blank page → `root.render()` never executes.

**SOLUTION:**
1. Create `client/index.html` with CDN React 18 UMD + Axios
2. Use functional React with `React.createElement()` (not JSX)
3. Wire `root.render(container)` after DOMContentLoaded
4. Use Vite proxy for CORS bypass (`/api` → `http://localhost:5001`)
5. Start backend: `node server/server.js`
6. Start Vite: `npx vite --clearScreen false` in client folder
7. Access: `http://localhost:5174/` (browser may show blank → F12 console should have **no errors**)

---

## PHASE 2: MODERN DARK UI

**FEATURES:**
- Dark navy theme (`#0f172a` background, `#22c55e` accent)
- Glassmorphism cards with `backdrop-filter`
- 8 demo products with Unsplash images
- Search + category pill filters
- Hover effects (zoom image, lift card)
- Add to cart buttons + favorite hearts
- Professional footer (About, Support, Legal, Connect)
- Responsive 4-column grid (mobile → 1 column)

**KEY CSS:**
```css
:root {
  --bg: #0f172a; --text: #f1f5f9; --accent: #22c55e;
}
.glass-card {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
}
```

---

## PHASE 3: REACT BEST PRACTICES (9 Steps)

### Step 1: TypeScript-First
- All files must be `.tsx`
- Explicit types for all props: `React.FC<Props>`
- No implicit `any` types

### Step 2: Layer Architecture
```
src/
├── domain/entities/     # Business models (Product, User)
├── domain/types/        # TypeScript type definitions
├── application/
│   ├── hooks/            # Custom React hooks
│   ├── services/        # API abstractions
│   └── stores/          # Zustand global state
├── infrastructure/
│   ├── api/             # Axios/fetch implementations
│   ├── database/        # Data persistence
│   └── caching/         # Cache strategies
└── presentation/
    ├── components/
    │   ├── atoms/        # ≤5 lines (Button, Input)
    │   ├── molecules/    # ≤15 lines (SearchBar, Card)
    │   ├── organisms/    # ≤30 lines (ProductGrid)
    │   └── templates/    # ≤50 lines (Page sections)
    ├── pages/            # Route components (HomePage, CartPage)
    ├── layouts/          # Layout wrappers (RootLayout)
    └── routes/           # React Router configuration
```

**Dependency Rule:** Lower layers CANNOT import upper layers (Presentation → Application → Infrastructure → Domain)

### Step 3: Component Design
- **Maximum 50 lines** per component
- Extract sub-components when logic > 20 lines
- Single Responsibility Principle (one component = one job)

### Step 4: State Management
- **Local State:** `useState` for form inputs, loading flags, modals
- **Global State:** Zustand (recommended over Context) for cross-component state
- **Server State:** TanStack Query (never store server data in `useState`)
```typescript
// Global with Zustand
export const useCartStore = create<CartState>(set => ({
  items: [],
  addItem: (product) => set(s => ({ items: [...s.items, product] }))
}))

// Server with TanStack Query
const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts })
```

### Step 5: Forms
- Always **controlled components** (`value` + `onChange`)
- Use React Hook Form for validation
```typescript
<input name="email" ref={register({ required: true, pattern: /^\S+@\S+$/i })}/>
```

### Step 6: Performance Optimization
- **Lazy Loading:** `React.lazy()` + `Suspense` for code splitting
- **Memoization:** `useMemo`, `useCallback`, `memo` for expensive computations
- **List Keys:** Use stable unique IDs (`item.id`), NOT array indices

### Step 7: Error Boundaries
- Wrap async operations in class-based ErrorBoundary
- Show fallback UI on errors (no blank pages)

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
| Atom | ≤5 | `<Button>`, `<Input>` |
| Molecule | ≤15 | `<SearchBar>` (Input + Button) |
| Organism | ≤30 | `<ProductCard>` (Image + Title + Actions) |
| Template | ≤50 | `<ProductGridSection>` |
| Page | ≤80 | `<HomePage>` |

---

## PHASE 4: COMMON PITFALLS & FIXES

| Pitfall | Fix | Category |
|---------|-----|----------|
| Props drilling > 2 levels | Zustand store | State |
| useEffect missing deps | ESLint `react-hooks/exhaustive-deps` | Hooks |
| Large bundle | `React.lazy()` + `Suspense` | Performance |
| State mutation | `{...state, key: newValue}` | State |
| Missing list keys | Use `item.id`, not `i` | Rendering |
| Uncontrolled forms | `useState` or RHF | Forms |
| Hardcoded API URL | `import.meta.env.VITE_API_URL` | Config |
| No error boundary | Class-based ErrorBoundary | Errors |
| No test coverage | 100% for hooks + logic | Testing |
| Inline styles | Tailwind utility classes | Styling |

---

## FILES SAVED

| File | Purpose |
|------|---------|
| `client/index.html` | CDN-based React + modern dark UI |
| `server/server.js` | Express + SQLite backend (port 5001) |
| `server/schema-and-seed.sql` | Database schema + 3 demo products |
| `vite.config.js` | Proxy config (`/api` → `localhost:5001`) |

---

## VERIFICATION CHECKLIST

- [ ] Data appears at `http://localhost:5174/` (use browser console → no red errors)
- [ ] 8 products with images, titles, "Rp X" prices
- [ ] Search filters products by title
- [ ] Category pills show "All" + filter options
- [ ] Hover effects on cards (zoom + lift)
- [ ] Cart buttons trigger console.log (ready for cart integration)
- [ ] Responsive: 4 columns desktop → 1 column mobile
- [ ] All `.tsx` files with explicit types
- [ ] Component files ≤50 lines
- [ ] Custom hooks for logic >20 lines
- [ ] ErrorBoundary wraps async components
- [ ] Controlled form elements
- [ ] Keys in all list iterations
- [ ] Tailwind utility classes only (no inline styles)

---

## REFERENCES

- Code adapted from: [Vercel Agent Skills - React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/AGENTS.md)
- React 18 UMD: https://react.dev
- Zustand: https://docs.pmnd.rs/zustand
- TanStack Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com/docs

---

** LAST UPDATE:** 2026-07-24
** OUTPUT:** Complete web marketplace with modern dark UI, backend integration, and React Best Practices (9 steps).
