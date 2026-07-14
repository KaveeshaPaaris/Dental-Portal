# Graph Report - c:/Users/Dell/Documents/Dental/Dental-Portal  (2026-07-15)

## Corpus Check
- Large corpus: 217 files ╖ ~2,063,736 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1063 nodes · 1573 edges · 103 communities (58 shown, 45 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Api & Api
- Page & Services
- Server & App
- Uploadimage & Page
- Gfm & Icons
- Tsconfig & Paths
- Util & Sendotp
- Tsconfig & Paths
- Tsx & Ws
- Ws & Cors
- Node & Package
- Package & Name
- App & Allowedorigins
- Combined & Faqs
- Es2020 & Tsconfig
- Sitemap & Api
- Schema & Faqs
- Controller & Resendotp
- Db & Checkdb
- Index & Faq
- Package & Prettier
- Env & Lint
- Kb & Syncchunks
- Services & Service
- Next & Robots
- Kb & Articles
- Service & Middleware
- Routes & Schema
- Util & Service
- Layout & Inter
- Controller & Hidereview
- Topbar & Navbar
- Layout & Metadata
- Service & Tostatus
- Layout & Metadata
- Authcontext & Sidebar
- Supabaseclient & Patientauthcontext
- React & Kit
- Routes & Schema
- Service & Hidereview
- Page & Blogdetail
- Routes & Routes
- Service & Createservice
- Page & Metadata
- Richtexteditor & Sep
- Content & Fs
- Page & Review
- Admin & Supabase
- Controller & Phoneschema
- Page & Metadata
- Db & Run
- Services & Fs
- Gemini & Run
- Layout & Metadata
- Page & Metadata
- Table & Blogs
- Table & Services
- Config & Eslintconfig
- Axios & Axios
- Fns & Fns
- Core & Core
- Sortable & Sortable
- Utilities & Utilities
- Resolvers & Resolvers
- React & React
- Next & Next
- React & React
- Picker & Picker
- Dom & Dom
- Form & Form
- Toast & Toast
- Js & Js
- Query & Query
- Count & Count
- Image & Image
- Link & Link
- Placeholder & Placeholder
- Table & Table
- Header & Header
- Row & Row
- Pm & Pm
- Zod & Zod
- Config & Config
- Services & Services
- Config & Eslintconfig
- Config & Config
- Columns & Bookings
- Bookings & Bookings
- Featured & Reviews
- Hidden & Reviews
- Url & Inventory

## God Nodes (most connected - your core abstractions)
1. `createError()` - 79 edges
2. `supabase` - 23 edges
3. `.next/**` - 20 edges
4. `compilerOptions` - 16 edges
5. `compilerOptions` - 16 edges
6. `Env` - 15 edges
7. `compilerOptions` - 14 edges
8. `useAuth()` - 13 edges
9. `api` - 13 edges
10. `regenerateChunks()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `createAdmin()` --calls--> `createError()`  [EXTRACTED]
  apps/dental-api/src/modules/admins/admins.service.ts → apps/dental-api/src/middleware/error.middleware.ts
- `deactivateAdmin()` --calls--> `createError()`  [EXTRACTED]
  apps/dental-api/src/modules/admins/admins.service.ts → apps/dental-api/src/middleware/error.middleware.ts
- `deleteAdmin()` --calls--> `createError()`  [EXTRACTED]
  apps/dental-api/src/modules/admins/admins.service.ts → apps/dental-api/src/middleware/error.middleware.ts
- `getAllAdmins()` --calls--> `createError()`  [EXTRACTED]
  apps/dental-api/src/modules/admins/admins.service.ts → apps/dental-api/src/middleware/error.middleware.ts
- `getCurrentAdmin()` --calls--> `createError()`  [EXTRACTED]
  apps/dental-api/src/modules/admins/admins.service.ts → apps/dental-api/src/middleware/error.middleware.ts

## Import Cycles
- None detected.

## Communities (103 total, 45 thin omitted)

### Community 0 - "Api & Api"
Cohesion: 0.05
Nodes (45): ColumnId, findContainer(), resolveOverContainer(), ScheduleBoardPage(), AdminDashboard(), EMPTY_FORM, CATEGORIES, EMPTY_FORM (+37 more)

### Community 1 - "Page & Services"
Cohesion: 0.06
Nodes (47): DOCTORS, metadata, getFeaturedReviews(), HomePage(), metadata, PILLARS, metadata, ServicesPage() (+39 more)

### Community 2 - "Server & App"
Cohesion: 0.12
Nodes (28): run(), sleep(), app, Env, envSchema, parsed, handleChatStream(), PORT (+20 more)

### Community 3 - "Uploadimage & Page"
Cohesion: 0.08
Nodes (18): BlogForm(), BlogFormProps, CATEGORIES, EMPTY_FORM, Errors, estimateReadingTime(), FormData, generateSlug() (+10 more)

### Community 4 - "Gfm & Icons"
Cohesion: 0.06
Nodes (33): dependencies, axios, date-fns, framer-motion, @hookform/resolvers, lucide-react, next, react (+25 more)

### Community 5 - "Tsconfig & Paths"
Cohesion: 0.06
Nodes (31): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+23 more)

### Community 6 - "Util & Sendotp"
Cohesion: 0.12
Nodes (29): createError(), acceptBooking(), adminCreateBooking(), createBooking(), getBookingById(), getBookingDatesWithAppointments(), getBookings(), getCreatedBookingDates() (+21 more)

### Community 7 - "Tsconfig & Paths"
Cohesion: 0.06
Nodes (31): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+23 more)

### Community 8 - "Tsx & Ws"
Cohesion: 0.07
Nodes (28): description, devDependencies, tsx, @types/cors, @types/express, @types/jsonwebtoken, @types/morgan, @types/node (+20 more)

### Community 9 - "Ws & Cors"
Cohesion: 0.07
Nodes (29): dependencies, cors, dotenv, express, express-rate-limit, @google/genai, helmet, jsonwebtoken (+21 more)

### Community 10 - "Node & Package"
Cohesion: 0.07
Nodes (27): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, ts-node, @types/node, @types/react (+19 more)

### Community 11 - "Package & Name"
Cohesion: 0.08
Nodes (25): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+17 more)

### Community 12 - "App & Allowedorigins"
Cohesion: 0.18
Nodes (16): allowedOrigins, AuthUser, Express, Request, verifyToken(), requireRole(), Role, ROLE_HIERARCHY (+8 more)

### Community 13 - "Combined & Faqs"
Cohesion: 0.16
Nodes (22): blogs, bookings, faqs, inventory, inventory_logs, notifications, notify_low_stock(), notify_new_booking() (+14 more)

### Community 14 - "Es2020 & Tsconfig"
Cohesion: 0.10
Nodes (20): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir (+12 more)

### Community 15 - "Sitemap & Api"
Cohesion: 0.13
Nodes (7): Message, BlogDetail, FormData, schema, PhoneInput(), PhoneInputProps, api

### Community 16 - "Schema & Faqs"
Cohesion: 0.17
Nodes (20): bookings, faqs, inventory, inventory_logs, notifications, notify_low_stock(), notify_new_booking(), notify_new_review() (+12 more)

### Community 17 - "Controller & Resendotp"
Cohesion: 0.12
Nodes (5): acceptBooking(), completeBooking(), getBookingById(), handleUpdateBookingStatus(), rejectBooking()

### Community 18 - "Db & Checkdb"
Cohesion: 0.15
Nodes (8): supabase, getAllContent(), getContentByKey(), updateContent(), getNotifications(), markAllAsRead(), markAsRead(), client

### Community 19 - "Index & Faq"
Cohesion: 0.12
Nodes (16): ApiError, Booking, BookingSource, BookingStatus, DailySchedule, FAQ, InventoryAction, InventoryItem (+8 more)

### Community 20 - "Package & Prettier"
Cohesion: 0.12
Nodes (16): devDependencies, prettier, turbo, turbo, name, private, scripts, build (+8 more)

### Community 21 - "Env & Lint"
Cohesion: 0.12
Nodes (16): ^build, .env, ^lint, !.next/cache/**, dependsOn, outputs, cache, persistent (+8 more)

### Community 22 - "Kb & Syncchunks"
Cohesion: 0.17
Nodes (11): ChunkSearchResult, deleteChunksByArticleId(), EmbeddingStatus, getChunksByArticleId(), getChunkStats(), KnowledgeBaseChunk, regenerateChunks(), updateArticle() (+3 more)

### Community 23 - "Services & Service"
Cohesion: 0.16
Nodes (11): CATEGORIES, FEATURED_SERVICES, getRelatedServices(), getServiceBySlug(), REVIEWER_INFO, Service, ServiceBenefit, ServiceCategory (+3 more)

### Community 24 - "Next & Robots"
Cohesion: 0.15
Nodes (5): nextConfig, metadata, metadata, nextConfig, .next/**

### Community 25 - "Kb & Articles"
Cohesion: 0.18
Nodes (11): articles, seedDatabase(), createArticle(), CreateArticleInput, deleteArticle(), getAllArticles(), getArticleById(), getPublishedArticles() (+3 more)

### Community 26 - "Service & Middleware"
Cohesion: 0.15
Nodes (10): AppError, errorHandler(), createAdmin(), deactivateAdmin(), deleteAdmin(), getAllAdmins(), getCurrentAdmin(), client (+2 more)

### Community 27 - "Routes & Schema"
Cohesion: 0.24
Nodes (11): AcceptBookingInput, acceptBookingSchema, AdminCreateBookingInput, adminCreateBookingSchema, CreateBookingInput, createBookingSchema, reorderBookingSchema, resendOTPSchema (+3 more)

### Community 28 - "Util & Service"
Cohesion: 0.23
Nodes (10): completeBooking(), sendBookingConfirmation(), bookingConfirmationEmail(), resend, reviewRequestEmail(), sendEmail(), SendEmailOptions, sendSMS() (+2 more)

### Community 29 - "Layout & Inter"
Cohesion: 0.20
Nodes (8): inter, metadata, plusJakartaSans, ReactQueryProvider(), Theme, ThemeContext, ThemeContextValue, ThemeProvider()

### Community 31 - "Topbar & Navbar"
Cohesion: 0.25
Nodes (8): AdminTopBar(), NAV_LINKS, Navbar(), SpotlightCard(), SpotlightCardProps, usePatientAuth(), useTheme(), Notification

### Community 32 - "Layout & Metadata"
Cohesion: 0.24
Nodes (6): metadata, ReactQueryProvider(), Theme, ThemeContext, ThemeContextValue, ThemeProvider()

### Community 33 - "Service & Tostatus"
Cohesion: 0.27
Nodes (9): UpdateBlogInput, buildPayload(), createBlog(), deleteBlog(), getAllBlogs(), getBlogBySlug(), getPublishedBlogs(), toStatus() (+1 more)

### Community 34 - "Layout & Metadata"
Cohesion: 0.20
Nodes (4): metadata, HOURS, QUICK_LINKS, SOCIAL

### Community 35 - "Authcontext & Sidebar"
Cohesion: 0.27
Nodes (7): AdminSidebar(), NAV_ITEMS, SUPER_ADMIN_ITEMS, AuthContext, AuthContextValue, useAuth(), AdminProfile

### Community 36 - "Supabaseclient & Patientauthcontext"
Cohesion: 0.24
Nodes (5): Step, PatientAuthContext, PatientAuthContextValue, PatientAuthProvider(), supabase

### Community 37 - "React & Kit"
Cohesion: 0.22
Nodes (9): dependencies, browser-image-compression, @tiptap/extension-table-cell, @tiptap/react, @tiptap/starter-kit, browser-image-compression, @tiptap/extension-table-cell, @tiptap/react (+1 more)

### Community 38 - "Routes & Schema"
Cohesion: 0.31
Nodes (6): validate(), ValidateTarget, router, CreateBlogInput, createBlogSchema, updateBlogSchema

### Community 39 - "Service & Hidereview"
Cohesion: 0.25
Nodes (7): featureReview(), getAllReviews(), getPublicReviews(), hideReview(), moderateReview(), submitReview(), validateReviewToken()

### Community 40 - "Page & Blogdetail"
Cohesion: 0.36
Nodes (7): BlogDetail, BlogDetailPage(), formatDate(), generateMetadata(), getBlogBySlug(), getRelatedBlogs(), ShareCopyButton()

### Community 41 - "Routes & Routes"
Cohesion: 0.32
Nodes (5): otpLimiter, publicLimiter, router, streamLimiter, router

### Community 42 - "Service & Createservice"
Cohesion: 0.36
Nodes (7): createService(), deleteService(), formatServiceToMarkdown(), getAllServices(), getServiceBySlug(), syncServiceToKnowledgeBase(), updateService()

### Community 43 - "Page & Metadata"
Cohesion: 0.36
Nodes (6): Blog, BlogFilterClient(), formatDate(), BlogsPage(), getAllBlogs(), metadata

### Community 47 - "Content & Fs"
Cohesion: 0.53
Nodes (5): fs, generateContent(), main(), path, sleep()

### Community 51 - "Page & Review"
Cohesion: 0.40
Nodes (4): getAllReviews(), metadata, Review, ReviewsPage()

### Community 52 - "Admin & Supabase"
Cohesion: 0.40
Nodes (3): { createClient }, supabase, WebSocket

## Knowledge Gaps
- **363 isolated node(s):** `RichTextEditor`, `EMPTY_FORM`, `CATEGORIES`, `FormData`, `Errors` (+358 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **45 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `.next/**` connect `Next & Robots` to `Layout & Metadata`, `Page & Services`, `Layout & Metadata`, `Page & Blogdetail`, `Page & Metadata`, `Sitemap & Api`, `Layout & Metadata`, `Page & Review`, `Env & Lint`, `Page & Metadata`, `Layout & Inter`, `Page & Metadata`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `createError()` connect `Util & Sendotp` to `Service & Tostatus`, `Service & Hidereview`, `Service & Createservice`, `Db & Checkdb`, `Kb & Syncchunks`, `Kb & Articles`, `Service & Middleware`, `Util & Service`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `api` connect `Sitemap & Api` to `Authcontext & Sidebar`, `Topbar & Navbar`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `RichTextEditor`, `EMPTY_FORM`, `CATEGORIES` to the rest of the system?**
  _363 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Api & Api` be split into smaller, more focused modules?**
  _Cohesion score 0.050351721584598295 - nodes in this community are weakly interconnected._
- **Should `Page & Services` be split into smaller, more focused modules?**
  _Cohesion score 0.05654761904761905 - nodes in this community are weakly interconnected._
- **Should `Server & App` be split into smaller, more focused modules?**
  _Cohesion score 0.11794871794871795 - nodes in this community are weakly interconnected._