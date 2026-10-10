---
name: superpowers
description: Use when executing any work in this project following the superpower workflow required by AGENTS.md — dispatches tasks to subagents, never hand-tracks in tasks/*.md files
---

# Superpowers (Farm Marketplace)

Farm Marketplace tracks and executes all work through the **superpower workflow**. Tasks are dispatched to subagents; progress is never hand-tracked in a local `tasks/*.md` file. See the **Task Tracking** section of `AGENTS.md` for the controlling rules.

## When to Use

Use this document for every unit of work in this project, per AGENTS.md:

- **Any** task big enough to be a step in a plan — including debugging one bug, adding one page, or wiring one integration — is delegated through the Task tool, not done inline.
- Before editing code, dispatch; never hand-track.

## Dispatch Model

1. **Pick the superpower skill** for the workload and load it before dispatching so the subagent follows the right workflow:
   - `dispatching-parallel-agents` — fan out independent work
   - `subagent-driven-development` — multi-step feature delivery
   - `executing-plans` — inline execution when dispatch is unavoidable
   - `systematic-debugging` — bug hunts
   - `using-superpowers` — the harness's tool mapping
2. **Dispatch via the Task tool** with `subagent_type: "general"` for implementation and research work; use `"explore"` only for pure codebase exploration.
3. **Prefer many small, well-scoped delegates** over one large handoff. Independent units of work run in parallel in a single message.
4. **Every delegate prompt carries:** the goal in one paragraph, exact target files, required conventions (AGENTS.md naming/layers/code-style), and the acceptance commands (`npm run build`, `tsc --noEmit`). The delegate must not ask clarifying questions — give it everything it needs to finish unaided.
5. **Delegates receive this repo's layer conventions** (see AGENTS.md) and may not bypass them.

## Completion & Verification

1. The parent agent stays the single point of ownership and merges the delegate outputs.
2. Run the same acceptance commands as the delegate (per AGENTS.md) before treating the task as done.
3. If a delegate stops early (limits, errors), resume it with `task_id` rather than re-dispatching blind.

## Leverage

- Do not dispatch to avoid owning a decision the parent must own: design direction, cross-file architecture, any commit.
- A subagent that needs another agent's result should request it through the parent, not spawn siblings on its own.

## Accepted Tasks

The media in this project is structured as a React 18 + Vite + TypeScript frontend (TanStack Query, TanStack Router) with a shadcn/ui design system + Tailwind v4, and a Go/Fiber + GORM/SQLite3 backend. Delegates must preserve this architecture and the layered import rules in `AGENTS.md`.