# Admin Notification System — Analysis Report

Project: Dental Charming Clinic portal (monorepo: `apps/admin-dashboard` Next.js :3001, `apps/dental-api` Express :3002, `apps/public-web` Next.js :3000, Supabase Postgres/Auth).
Goal: when a patient books an appointment, admins see a notification on the bell in the top bar; clicking the bell opens a notification panel.

## 1. Key finding

**~60% of the backend already exists.** The database table, the triggers that create notifications, the REST API and the bell badge are all built and working (the bell already shows a "9+" badge). What is missing is mostly front-end: the panel that opens on click, per-notification actions, and a faster delivery mechanism than 30-second polling. There are also a few design gaps (shared read-state, no navigation to the booking, no retention) listed in section 5.

## 2. What exists today

### Database (`supabase/migrations/000_full_schema_combined.sql`, same in `001_initial_schema.sql`)
- Enum `notification_type`: `LOW_STOCK | NEW_BOOKING | NEW_REVIEW | SYSTEM`.
- Table `notifications`: `id, type, title, message, metadata JSONB, target_role ('ADMIN'|'SUPER_ADMIN'|'ALL'), is_read BOOLEAN, created_at`.
- Trigger `trg_booking_new_pending` (function `notify_new_booking`): inserts a `NEW_BOOKING` row (`target_role='ALL'`, metadata `{booking_id, patient_name}`) when a booking moves to `PENDING_REVIEW` from `PENDING_OTP` (or is inserted directly as `PENDING_REVIEW`).
- Similar triggers exist for low stock (`notify_low_stock`) and new review (`notify_new_review`).
- RLS is enabled on `notifications` with **no policies**, so only the service-role key (the Express API) can read or write it. Browsers cannot read it directly.

### Booking flow (`apps/dental-api/src/modules/bookings/bookings.service.ts`)
1. Public form → `createBooking` inserts status `PENDING_OTP`, sends OTP over WhatsApp.
2. `verifyBookingOTP` → status becomes `PENDING_REVIEW` → **trigger fires → notification created.**
   So a notification appears only after the patient verifies the OTP, which is correct: unverified bookings don't spam admins.
3. `adminCreateBooking` (phone/WhatsApp bookings entered by staff) inserts directly as `PENDING_REVIEW`, so it **also** triggers a notification, including to the admin who created it.

### API (`apps/dental-api/src/modules/notifications/`, mounted at `/api/v1/admin/notifications`)
- `GET /` — latest 50 where `target_role` is `ALL` or the caller's role.
- `PATCH /:id/read` — mark one read.
- `PATCH /read-all` — mark all read for the caller's role.
- All routes: `verifyToken` + `requireRole('ADMIN')` (SUPER_ADMIN passes via the role hierarchy).

### Admin front-end
- `src/components/admin/TopBar.tsx`: bell button + red badge (`unread > 9 ? '9+'`). Data via React Query `GET /admin/notifications`, `refetchInterval: 30000`. **The bell button has no `onClick`**, so nothing opens.
- `app/admin/dashboard/page.tsx`: separately fetches the same list (same query key, so it's cached/shared) for a dashboard widget.
- `src/types/index.ts`: `Notification` and `NotificationType` types already defined.
- Stack available: `@tanstack/react-query`, `@supabase/supabase-js` (used only for auth), `lucide-react`, `react-hot-toast`, axios client at `src/lib/api.ts` that attaches the Supabase JWT.
- Booking pages: `app/admin/bookings/` (list, `[id]` detail, `schedule`, `recycle-bin`).

## 3. What is missing

| # | Gap | Impact |
|---|-----|--------|
| 1 | Bell has no click handler / no panel | Core request not met |
| 2 | No way to mark read from the UI (API exists, unused) | Badge never clears |
| 3 | Notification items don't link to the booking (`metadata.booking_id` is stored but unused) | Admin has to hunt for the booking |
| 4 | Delivery is 30 s polling | Up to 30 s delay; wasteful requests with many admins |
| 5 | No sound / toast / browser tab title cue for new items | Easy to miss while working |
| 6 | No empty state, loading state, "mark all read", relative timestamps ("2m ago") | UX polish |

## 4. Recommended design

### 4.1 Panel (front-end, no new backend needed)
- New component `NotificationPanel.tsx` (dropdown anchored under the bell on desktop, full-width sheet on mobile).
- Open/close on bell click; close on outside click, `Esc`, and route change. `aria-expanded`, `aria-haspopup`, focus returns to the bell.
- Header: "Notifications" + "Mark all as read". Optional tabs: All / Unread.
- Row: icon by `type` (calendar = NEW_BOOKING, package = LOW_STOCK, star = NEW_REVIEW), title, message, relative time, unread dot.
- Click a row → `PATCH /:id/read` (optimistic update via React Query) → navigate by type:
  - `NEW_BOOKING` → `/admin/bookings/{metadata.booking_id}`
  - `NEW_REVIEW` → `/admin/reviews`
  - `LOW_STOCK` → `/admin/inventory`
- Must work in light and dark themes (project uses CSS variables such as `--color-surface`, `--color-border`, `--color-primary`).

### 4.2 Real-time delivery — options
| Option | How | Pros | Cons |
|---|---|---|---|
| A. Keep polling, shorten to 10–15 s | change `refetchInterval`, add `refetchOnWindowFocus` | zero backend change, simplest | still delayed, extra load |
| **B. Supabase Realtime (recommended)** | add `notifications` to the `supabase_realtime` publication; add an RLS `SELECT` policy for authenticated active admins; subscribe in the browser with the existing anon client + user session; on `INSERT` call `queryClient.invalidateQueries(['notifications'])` and show toast/sound | instant, no new server code, works with existing triggers | needs one SQL migration + policy; the browser then reads this table through RLS (today only the API does) |
| C. Server-Sent Events from Express | `/admin/notifications/stream`, push from the API | full control | API doesn't create the notifications (DB triggers do), so it would need a DB listener or a refactor; connections to manage |

Recommendation: **B**, keep a slow poll (60 s) as a fallback if the socket drops.

### 4.3 Read-state model
`is_read` is a **single boolean per notification shared by all admins**. If admin A reads it, admin B's badge also clears, and B may never see it. Fix with a per-user table:

```sql
CREATE TABLE notification_reads (
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id)       ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);
```
Unread = notifications with no row for the current user. If the clinic has only one or two staff, the shared flag may be acceptable; decide explicitly.

## 5. Issues / risks found in existing code
1. **Shared read-state** (see 4.3).
2. `markAsRead(id)` updates by id only: no check that the notification targets the caller's role, and `:id` is not validated as a UUID. Low risk (all admins can see `ALL`), but should be validated.
3. **Admin-created bookings notify the creator** (`adminCreateBooking` → `PENDING_REVIEW` → trigger). Consider restricting the trigger to `source = 'ONLINE'` or skipping when `handled_by` is set.
4. **No retention:** table grows forever; `GET` is capped at 50 so older ones are unreachable. Add a cleanup (e.g. delete read items older than 30–60 days, via pg_cron or a scheduled job) and optionally pagination.
5. **Duplicate trigger risk:** the trigger is `AFTER INSERT OR UPDATE` and fires whenever status transitions from `PENDING_OTP` → `PENDING_REVIEW`. If an admin ever sets a booking back to `PENDING_OTP` and it returns, a duplicate is created (unlikely).
6. `dashboard/page.tsx` and `TopBar.tsx` each define the same query. Extract a shared `useNotifications()` hook.
7. Separate pre-existing bug found while reading the admin code: the Manage Admins page calls `PATCH /admin/admins/:id` but the API only exposes `PATCH /:id/deactivate`, so activate/deactivate doesn't work. Unrelated to notifications.

## 6. Security considerations
- Keep all writes server-side (triggers / service role). Browsers should only ever `SELECT` (Realtime) and call the API for mark-read.
- If Realtime (option B) is used, the RLS policy must limit reads to authenticated users whose `profiles.is_active = true` and whose role matches `target_role`. Do not make the table public.
- Notification text includes the patient's name. Patient phone and email are **not** in notifications, which is good — keep it that way (PII minimisation). The `metadata` holds only ids and name.
- Render notification text as plain text (React escaping); never `dangerouslySetInnerHTML`.

## 7. Suggested implementation plan
1. **Hook:** `src/hooks/useNotifications.ts` — query, `markRead`, `markAllRead` mutations with optimistic updates; use it in TopBar and Dashboard.
2. **Panel UI:** `NotificationPanel.tsx` + CSS module; wire to the bell in `TopBar.tsx`.
3. **Navigation + read on click** (mapping in 4.1).
4. **Realtime:** migration `009_notifications_realtime.sql` (publication + RLS select policy), subscription in a provider, toast + optional sound, tab-title count "(3) Admin Portal".
5. **Hardening:** per-user read table (if multiple admins), UUID validation on `:id`, trigger tweak for admin-created bookings, retention job.
6. **Test:** book as a patient end-to-end (public form → OTP → verify) and confirm a notification appears within ~1 s in two admin browsers; verify mark-read, mark-all-read, link navigation, dark mode, mobile layout, and that a non-admin gets 401/403 from the API.

## 8. Effort estimate
- Panel + hook + navigation (steps 1–3): small (about half a day).
- Realtime + toast/sound (step 4): small–medium (about half a day including the migration and policy testing).
- Per-user read state + hardening (step 5): small–medium.

## 9. Open questions for the clinic
1. How many admin accounts are active at once? (decides shared vs per-user read state)
2. Should staff-entered phone/WhatsApp bookings also notify other admins?
3. Sound alert and/or browser (OS-level) push notifications when the tab is in the background? OS push would need the Web Push API plus a service worker, which is a bigger task.
4. How long should notifications be kept?
