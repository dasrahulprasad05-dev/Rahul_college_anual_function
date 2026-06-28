
This is a large request, so I'm grouping it into 6 phases. Each phase is independently shippable — we can pause/adjust between them.

## Phase 1 — Booking flow + visual polish
- Homepage "Browse events" already scrolls; add a dedicated `/events` route listing all published events.
- On event detail, if a signed-out user clicks **Book** → redirect to `/auth?redirect=/events/:id` (already partially wired — make it consistent everywhere).
- Redesign QR ticket card in `/tickets`: gradient frame (Neon Carnival palette), event name overlay, animated glow, distinct accent color **derived per-event** (hash of event id → hue) so each event's QR looks unique.
- Hover animation on home event cards: grayscale→color reveal + tilt + neon border sweep using framer-motion. Apply via a reusable `<HoverColorCard>` wrapper so all card types (events, items, gate pass tiles) share it.

## Phase 2 — Emails (Lovable Emails)
Set up email domain + infra, then scaffold these templates:
- `welcome` — sent on first signup (trigger: profile insert)
- `auth-verification` & `password-reset` — branded auth templates
- `payment-success` — after ticket status → `paid`
- `scan-confirmation` — after volunteer scans (entry confirmed)
- `event-reminder` — 10 min before `items.starts_at` (pg_cron every minute)
- `feedback-request` — sent after event ends, with link to feedback form

All branded with Neon Carnival palette. Sender domain via Lovable email setup dialog.

## Phase 3 — Seed 20 events
Insert 20 events with varied dates, venues, categories, capacities, and 1–3 items each. Done via a data-insert (not migration). Real-sounding college-fest names (Tech, Cultural, Sports, Workshops).

## Phase 4 — Roles, Volunteer + Admin dashboards
- Keep `user_roles` table (already exists). Admin manually assigns `volunteer` to specific user_ids via Admin UI (a new "Team" tab) — later you'll share the 20 volunteer + 1 admin emails and we'll seed them.
- Each volunteer can be **assigned to specific events** via a new `event_volunteers(event_id, user_id)` table — they only scan tickets for assigned events.
- **Volunteer dashboard** (`/volunteer`): assigned events, count scanned vs remaining, recent scans feed, scan button → existing `/scan` flow.
- **Admin dashboard** (`/admin`): tabs — Overview (charts: registrations per event, revenue, scan rate, feedback avg), Events (CRUD, already built), Team (assign roles + volunteers↔events), Feedback (per-event responses), Gate Passes (approve/reject).
- Charts via `recharts` (already in shadcn-ready ecosystem).

## Phase 5 — Gate Pass
- New table `gate_passes` with fields: name, branch, semester, location, reg_no, parent_name, parent_mobile, aadhar_last4 (we store ONLY last 4 digits + hash of full number, never plaintext Aadhar — Indian regulation), photo_url, status (`pending|approved|issued`), qr_token, issued_at.
- Storage bucket `gate-pass-photos` (private), 1 MB client-side validation + server check.
- Eligibility RPC: `can_request_gate_pass(user_id)` → counts tickets with status `used` (i.e. actually attended) ≥ 5.
- `/gate-pass` route: shows eligibility, form (only if eligible), preview.
- Server function `generate_gate_pass_pdf` using `@react-pdf/renderer` (Worker-compatible) → colorful PDF with student photo, name, reg_no, event name, date/time, embedded QR. Returned as download + emailed.
- Admin can view/revoke passes.

**Security note on Aadhar:** storing full Aadhar numbers is a compliance risk and Lovable's scanner will flag it. I'll store only last-4 + a salted hash (for dedupe), and the photo separately. If you require full Aadhar storage, we'll need encryption-at-rest + explicit user consent text — confirm before Phase 5.

## Phase 6 — Feedback
- `feedback` table: ticket_id (unique), rating 1-5, comment, created_at.
- Submit only when ticket.status = `used`.
- Public per-event average shown on event detail; full breakdown in admin dashboard.

## Technical details
- All new tables: RLS + GRANT to authenticated/service_role; `anon` only where public read is intended (events list, public feedback aggregates via RPC).
- Reminders & feedback emails: pg_cron → `/api/public/hooks/*` routes that enqueue emails via Lovable Emails queue (idempotency key per ticket).
- QR scan flow already exists (`check_in_ticket` RPC) — extend it to enqueue scan-confirmation email and to enforce volunteer↔event assignment.
- Per-event QR color: deterministic HSL from `event.id` hash, applied in `TicketCard` and gate pass PDF.
- No new framework deps beyond `recharts`, `@react-pdf/renderer`, `qrcode` (server-side QR for PDF).

## Suggested order to ship
1. Phase 1 (polish + booking flow) — quick win, ~1 message.
2. Phase 2 (emails) — needs email domain setup dialog from you first.
3. Phase 3 (seed 20 events) — 1 message.
4. Phase 4 (dashboards + roles) — 2 messages.
5. Phase 5 (gate pass) — 2 messages, after Aadhar confirmation.
6. Phase 6 (feedback) — 1 message.

Reply **"go phase 1"** (or pick any phase) and I'll start. If you want changes to scope, tell me what to adjust.
