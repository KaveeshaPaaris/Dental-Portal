# Comprehensive Project Analysis Report

Based on a deep-dive investigation across the entire monorepo (`dental-api`, `public-web`, `admin-dashboard`, and `shared-ui`), I have compiled a full list of issues that need to be fixed. The flaws are categorized into functional UI bugs, disconnected API logic, backend vulnerabilities, and structural issues.

---

## 1. Broken Pages & Unconnected UI Logic (Frontend)

> [!WARNING]
> **Contact Page is a Dead Shell**
> Location: `apps/public-web/app/(public)/contact/page.tsx`
> **The Issue:** The "Send us a Message" form has no `onSubmit` handler, and the submit button is set to `type="button"` with no `onClick` event. Submitting a message does absolutely nothing. Furthermore, the map is just a static placeholder text.

> [!WARNING]
> **Blog System is Mocked & Disconnected**
> Location: `apps/public-web/app/(public)/blogs/page.tsx`
> **The Issue:** The entire blog page uses a hardcoded `MOCK_BLOGS` array. The "Read Article" buttons literally point to `href="#"`. There is no connection to a CMS or the backend database to fetch real articles.

> [!TIP]
> **Weak Phone Validation**
> Location: `apps/public-web/app/(public)/book/page.tsx`
> **The Issue:** The phone number validation relies on a simple `z.string().min(7)`. Twilio requires strict E.164 formatting (e.g., `+1234567890`). Allowing loose formatting on the frontend will cause unhandled 500 errors when the backend tries to dispatch SMS.

---

## 2. Disconnected Logic & API Mismatches

> [!CAUTION]
> **Admin Dashboard FAQ Management is Completely Broken**
> Location: `apps/admin-dashboard/app/admin/faqs/page.tsx` vs `apps/dental-api/src/modules/faqs/faqs.routes.ts`
> **The Issue:** The frontend makes requests to standard REST paths like `GET /faqs`, `PUT /faqs/:id`, and `POST /faqs`. However, the backend explicitly expects `/admin` in the path (e.g., `POST /faqs/admin`) and uses `PATCH` instead of `PUT` for updates. 
> **Impact:** None of the CRUD operations for FAQs in the admin dashboard will work. They will all return 404 Not Found or 405 Method Not Allowed.

> [!CAUTION]
> **Admin Dashboard Content Editor Fails to Save**
> Location: `apps/admin-dashboard/app/admin/content/page.tsx` vs `apps/dental-api/src/modules/content/content.routes.ts`
> **The Issue:** The admin dashboard attempts to save website content using `api.put('/content/:key')`. The backend route is defined as `router.patch('/:key')`.
> **Impact:** Saving any edits to the public website content from the dashboard will fail.

---

## 3. Rate Limiting & Security Flaws (Backend)

> [!CAUTION]
> **OTP Rate Limiter Bypass**
> Location: `apps/dental-api/src/app.ts`
> **The Issue:** The `otpLimiter` middleware is mounted *after* the `bookingsRouter`. Because the `bookingsRouter` resolves the `/verify-otp` path entirely, the stricter OTP rate limit is never reached.
> **Impact:** The OTP verification endpoint is vulnerable to brute-force attacks.

> [!IMPORTANT]
> **Race Conditions in Booking Status**
> Location: `apps/dental-api/src/modules/bookings/bookings.service.ts`
> **The Issue:** Actions like `acceptBooking` read the next appointment number and then perform a database update without optimistic concurrency control.
> **Impact:** If two admins click "Accept" on different bookings simultaneously, they could be assigned the exact same appointment number or slot order.

---

## 4. Performance & Scalability Flaws

> [!WARNING]
> **Missing Pagination for Bookings**
> Location: `apps/admin-dashboard/app/admin/bookings/page.tsx` & `dental-api`
> **The Issue:** The API fetches and the frontend attempts to render every single booking in the database at once. 
> **Impact:** As the clinic grows, this will cause high database load, increased memory consumption, and browser tab crashes in the admin dashboard.

> [!WARNING]
> **Inefficient JWT Token Verification**
> Location: `apps/dental-api/src/middleware/auth.middleware.ts`
> **The Issue:** The `verifyToken` middleware makes a synchronous query to the `profiles` table to check the admin's role and active status *on every single authenticated request*.
> **Impact:** This introduces a significant performance bottleneck. Roles should be cached or baked into the JWT claims directly.

---

## 5. Project Structure & Architecture Issues

> [!IMPORTANT]
> **Useless `shared-ui` Package & Widespread Code Duplication**
> Location: `packages/shared-ui`
> **The Issue:** The `shared-ui` package is completely broken. It has a `src` directory but is missing a `package.json`, which means Turborepo and the other apps cannot recognize or import it as a workspace package.
> **Impact:** Because `shared-ui` is unusable, both `apps/public-web` and `apps/admin-dashboard` maintain their own duplicate copies of `components`, `context`, `lib`, `styles`, and `types`. This completely defeats the purpose of using a Turborepo monorepo and violates the DRY (Don't Repeat Yourself) principle.
