# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, both real:

- People organizing personal or work tasks who want something lighter than Notion or Todoist. They open it to capture a task, check what is due, and move work forward.
- Recruiters and prospective clients evaluating Esdras Santos as a fullstack developer. They judge craft, product sense and engineering quality in a few minutes.

## Product Purpose

Tarevity is a task manager: tasks carry a title, description, priority, status and due date. Success means a user can capture, find and finish work with no friction, and an evaluator leaves convinced the author ships production-grade software.

## Positioning

- Three-step status workflow (Active, Review, Completed) instead of a done/not-done checkbox. Work can be submitted for review before it is closed.
- Fully localized in English, Portuguese and Spanish, with locale-prefixed URLs.
- Deliberately simple and fast. No workspaces, databases or block editors.

## Operating Context

- Dashboard as a kanban board with one column per status (Active, Review, Completed); moving a card between columns changes its status. Confirmed by the user 2026-10-15.
- Dashboard with search, status filters (All, Active, Review, Completed) and priority filters (All, High, Medium, Low), plus sorting.
- Calendar view of tasks by due date.
- Profile with task statistics and a donut chart; settings with theme (Light, Dark, System) and account management.
- In-app notification dropdown and email reminders for approaching due dates.
- Auth: email/password, GitHub and Google OAuth, forgot/reset password.
- Admin panel with a user data table, restricted by role.
- Public landing page, privacy and terms pages, cookie consent banner.

## Capabilities and Constraints

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui on Radix, Prisma, better-auth, next-intl, TanStack Query, motion.
- All user-facing copy lives in `messages/` (en, pt, es); any new copy must be added to all three.
- Light and dark themes are required.
- Production domain: tarevity.me. Free to use.

## Brand Commitments

- The name "Tarevity" is fixed.
- The logo and visual identity are not binding and may be redesigned.

## Evidence on Hand

- Logo: `public/logo.png`, `components/logo/`.
- OG image referenced as `/og-image.png`.
- No real testimonials, user counts or ratings exist. The landing JSON-LD has a placeholder `aggregateRating` (5 from 1); do not surface it or invent social proof.

## Product Principles

1. Speed over features: every screen should let the user act within one glance.
2. The Review step is the product's signature; make status legible everywhere a task appears.
3. Every language is first-class; layouts must survive longer Portuguese and Spanish strings.
4. Craft is the portfolio: details, states and edge cases are part of the pitch.

## Accessibility & Inclusion

Keyboard navigable, visible focus, WCAG AA contrast in both themes. No product-specific requirement beyond that was established.
