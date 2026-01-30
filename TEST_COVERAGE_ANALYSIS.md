# Test Coverage Analysis

## Current State

**6 test files | 103 passing tests | ~36% statement coverage (of tested files only)**

The coverage report only measures files that are imported by tests. The true project-wide coverage is far lower, since the vast majority of source files have no tests at all.

### Existing Test Files

| File | Module | Tests | Quality |
|------|--------|-------|---------|
| `__tests__/lib/rbac.test.ts` | RBAC permission system | 44 | High - thorough role/permission matrix |
| `__tests__/components/utils.test.ts` | Utility functions (`lib/utils.ts`) | 37 | Good - covers formatters, edge cases |
| `__tests__/lib/messaging.test.ts` | SMS & email providers | 12 | Moderate - mostly tests mock providers |
| `__tests__/api/auth.test.ts` | `POST /api/auth/login` | 5 | Low - validation only, no auth flow |
| `__tests__/api/needy.test.ts` | `POST /api/needy` | 2 | Low - happy path + missing fields |
| `__tests__/api/donations.test.ts` | `POST /api/donations` | 3 | Low - basic validation only |

### Coverage by Source File (from v8 report)

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| `app/api/auth/login/route.ts` | 50% | 33% | 17% | 50% |
| `app/api/donations/route.ts` | 33% | 37% | 33% | 33% |
| `app/api/needy/route.ts` | 35% | 29% | 33% | 35% |
| `src/lib/utils.ts` | 67% | 56% | 76% | 67% |
| `src/lib/rbac.tsx` | 50% | 44% | 59% | 47% |
| `src/lib/errors.ts` | 12% | 3% | 28% | 12% |
| `src/lib/rate-limit.ts` | 69% | 45% | 71% | 69% |
| `src/lib/activity-logger.ts` | 36% | 50% | 15% | 36% |
| `src/lib/env.ts` | 27% | 46% | 0% | 29% |
| `src/lib/messaging/*` | 36% | 33% | 54% | 35% |
| `src/lib/supabase/client.ts` | 48% | 28% | 40% | 48% |

---

## Gap Analysis

### What is NOT tested at all (0% coverage)

| Category | File Count | Examples |
|----------|-----------|---------|
| API routes | 28 of 31 | programs, tasks, meetings, memberships, finance, cron, dashboard, orphans, mernis |
| React components | 102 | All forms, data tables, layout, navigation, needy detail views |
| Custom hooks | 28 | All query hooks, mutation hooks, `use-auth`, `use-notifications` |
| Validation schemas | 7 | `needy.ts`, `common.ts`, `donation.ts`, `finance.ts`, `application.ts`, `inventory.ts`, `donation-boxes.ts` |
| Lib utilities | 20 of 22 | `errors.ts` (12%), `rate-limit.ts` (69%), `security.ts`, `audit.ts`, `permission-middleware.ts`, `organization-middleware.ts` |
| Stores | 1 | `ui-store.ts` (Zustand) |

### Quality issues in existing tests

1. **API tests mock everything.** The Supabase client, auth middleware, and org middleware are all mocked with hardcoded responses. The tests verify HTTP status codes but not business logic, query construction, or error handling.

2. **No negative path testing for APIs.** None of the API tests cover: permission denied (403), database errors (500), rate limiting (429), not found (404), or conflict (409) scenarios.

3. **Messaging tests test mock implementations.** The `MockSMSProvider` and `MockEmailProvider` are tested, but the real `TwilioProvider`, `NetGSMProvider`, `ResendProvider`, and `SendGridProvider` have no unit tests.

4. **Auth test has no happy path.** The login API test only validates input rejection (missing email, missing password, invalid format). There is no test for a successful login flow.

5. **DNS errors in test output.** API tests leak real network calls to `placeholder.supabase.co`, indicating the Supabase mock is incomplete.

---

## Recommended Improvements (Priority Order)

### P0: Critical - Security and Data Integrity

#### 1. Validation schemas (`src/lib/validations/`)

These schemas are the first line of defense against bad data. Every schema should have tests.

**Files to test:**
- `common.ts` - `sanitizeString`, `validatePhone`, `validateEmail`, `validateUUID`, `validateTCKimlik`, `validateNotPastDate`, all Zod schemas
- `needy.ts` - needy person form schema, bank account schema
- `donation.ts` - donation schema
- `finance.ts` - budget/expense schemas
- `application.ts` - application schema
- `inventory.ts` - inventory schema
- `donation-boxes.ts` - donation box schema

**What to test:**
- Valid input acceptance
- Invalid input rejection with correct error messages (Turkish)
- Boundary conditions (min/max lengths, zero amounts, negative numbers)
- Turkish-specific validation: TC Kimlik checksum algorithm, IBAN format, phone number formats (+90, 0, bare)
- XSS sanitization: HTML tags stripped, entities escaped
- Null/undefined handling for optional fields

**Why P0:** These guard every form submission and API boundary. A bug here means bad data in the database or XSS vulnerabilities.

#### 2. Error handling system (`src/lib/errors.ts`)

Currently at 12% statement coverage. This module handles every error in the application.

**What to test:**
- Each error class (`AuthError`, `ValidationError`, `NotFoundError`, `RateLimitError`, `DatabaseError`, `ConflictError`, `AuthorizationError`, `NetworkError`) constructs with correct status code, severity, error type, and recovery actions
- `ErrorHandler.getUserMessage()` returns correct Turkish messages for each error type
- `ErrorHandler.fromSupabaseError()` maps Supabase error codes (PGRST116, 23505, 23503, 42501) to the right error classes
- `ErrorHandler.createError()` factory produces correct error types
- `ErrorHandler.getErrorType()` and `getSeverity()` return correct values
- `sanitizeError()` strips sensitive info in production, preserves details in development
- `createApiErrorResponse()` and `handleDatabaseError()` return correct HTTP responses

**Why P0:** Every API route uses these. Incorrect error handling exposes stack traces in production or gives users misleading messages.

#### 3. Rate limiting (`src/lib/rate-limit.ts`)

Currently at 69% statement coverage (incidental, not intentional). Protects against brute force and abuse.

**What to test:**
- Requests within limit succeed
- Requests exceeding limit are blocked with 429 status
- Rate limit window resets correctly after time passes
- Different keys (IP, user, identifier) are tracked independently
- Headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`) are correct
- `getIPKey()` parses `x-forwarded-for` and `x-real-ip` headers correctly
- `getUserKey()` extracts Bearer tokens and session cookies
- Default rate limit configurations match expected values

**Why P0:** Without tested rate limiting, auth endpoints and create operations are vulnerable to brute force.

### P1: High Priority - Core Business Logic

#### 4. Permission middleware (`src/lib/permission-middleware.ts`)

Every API route depends on `withAuth()`. It is the gatekeeper for all authenticated operations.

**What to test:**
- Unauthenticated requests are rejected (401)
- Authenticated users without required permission are rejected (403)
- Authenticated users with correct permission pass through
- `resource` and `requiredPermission` parameters are enforced
- Organization context is properly injected

#### 5. Organization middleware (`src/lib/organization-middleware.ts`)

Multi-tenant isolation is critical for an NGO platform serving multiple organizations.

**What to test:**
- Requests without organization context are rejected
- Users can only access their own organization's data
- Organization ID is properly injected into queries
- Cross-tenant access is blocked

#### 6. API route integration tests (expand existing 3, add remaining 28)

The 3 existing API test files need to be expanded significantly, and the remaining 28 routes need tests.

**Priority API routes to test first:**
- `POST /api/auth/login` - Expand: successful login, wrong password, account locked, rate limited
- `GET /api/needy`, `GET /api/donations` - Pagination, filtering, sorting, empty results
- `PUT/DELETE` operations on needy, donations - Authorization checks, not found, optimistic locking
- `POST /api/finance/bank-accounts` - IBAN validation, duplicate detection
- `POST /api/mernis/verify` - TC Kimlik verification flow
- `GET /api/dashboard/stats` - Aggregation accuracy
- `POST /api/cron` - CRON_SECRET authentication, idempotency

**What every API test should cover:**
- Happy path (200/201)
- Validation failure (400)
- Unauthenticated (401)
- Unauthorized/forbidden (403)
- Not found (404)
- Conflict/duplicate (409)
- Rate limited (429)
- Server error handling (500)

### P2: Medium Priority - UI and Integration

#### 7. Form components (`src/components/forms/`)

Forms are the primary data entry point. Testing them catches validation-UX mismatches.

**Files to test:**
- `needy-form.tsx` - Field rendering, validation messages, submission
- `donation-form.tsx` - Amount validation, donor info
- `volunteer-form.tsx` - Required fields, skills selection
- `event-form.tsx` - Date validation, participant limits
- `application-form.tsx` - Status transitions
- `purchase-form.tsx` - Budget validation

**What to test:**
- All required fields show validation errors when empty
- Form submits with valid data
- Form prevents submission with invalid data
- Field-specific validation messages display in Turkish
- Conditional fields appear/hide based on selections

#### 8. Data table component (`src/components/common/data-table.tsx`)

Used across every list page. Bugs here affect all data views.

**What to test:**
- Renders columns correctly
- Sorting toggles work
- Pagination navigates pages
- Search/filter narrows results
- Empty state displays correctly
- Loading skeleton appears during fetch

#### 9. Auth hook (`src/hooks/use-auth.ts`)

Central to the application's auth state.

**What to test:**
- Returns user data when authenticated
- Returns null/loading when unauthenticated
- Login triggers Supabase auth
- Logout clears state
- Role-based permissions are accessible

#### 10. Query hooks (`src/hooks/queries/`)

28 query hooks drive all data fetching. They should be tested for correct query key construction and parameter handling.

**What to test per hook:**
- Correct query key includes all parameters
- Pagination parameters are passed to API
- Filter parameters are serialized correctly
- Error states are handled
- Stale time and cache configuration are correct

### P3: Lower Priority - Polish

#### 11. Zustand store (`src/stores/ui-store.ts`)

Simple state, but test to prevent regressions.

**What to test:**
- `toggleSidebar()` flips collapsed state
- `setActiveModal()` / `closeModal()` work correctly
- `setMobileMenuOpen()` updates state
- localStorage persistence works

#### 12. Layout components

- Sidebar renders correct menu items based on role
- Header displays user info
- Mobile menu toggles visibility
- Notification dropdown shows/hides

#### 13. Chart components

- Render without errors with valid data
- Handle empty data gracefully
- Display correct labels and values

---

## Suggested Test File Structure

```
src/__tests__/
  api/
    auth.test.ts          (expand: 5 -> 15+ tests)
    needy.test.ts         (expand: 2 -> 20+ tests)
    donations.test.ts     (expand: 3 -> 15+ tests)
    finance.test.ts       (new)
    programs.test.ts      (new)
    tasks.test.ts         (new)
    meetings.test.ts      (new)
    memberships.test.ts   (new)
    orphans.test.ts       (new)
    dashboard.test.ts     (new)
    cron.test.ts          (new)
    mernis.test.ts        (new)
  lib/
    rbac.test.ts          (existing, 44 tests - good)
    messaging.test.ts     (existing, expand error paths)
    errors.test.ts        (new)
    rate-limit.test.ts    (new)
    permission-middleware.test.ts  (new)
    organization-middleware.test.ts (new)
    audit.test.ts         (new)
    security.test.ts      (new)
  validations/
    common.test.ts        (new)
    needy.test.ts         (new)
    donation.test.ts      (new)
    finance.test.ts       (new)
    application.test.ts   (new)
    inventory.test.ts     (new)
    donation-boxes.test.ts (new)
  components/
    utils.test.ts         (existing, 37 tests - good)
    data-table.test.tsx   (new)
    needy-form.test.tsx   (new)
    donation-form.test.tsx (new)
    sidebar.test.tsx      (new)
    status-badge.test.tsx (new)
  hooks/
    use-auth.test.ts      (new)
    use-needy.test.ts     (new)
    use-donations.test.ts (new)
  stores/
    ui-store.test.ts      (new)
```

## Estimated Impact

| Priority | New Test Files | Estimated Tests | Coverage Gain |
|----------|---------------|-----------------|---------------|
| P0 | 3 | ~120 | Validates all input boundaries and security |
| P1 | 12 | ~250 | Covers core business logic and API routes |
| P2 | 10 | ~150 | Covers UI forms, hooks, data display |
| P3 | 4 | ~40 | Polishes store, layout, charts |
| **Total** | **29** | **~560** | From ~100 to ~660 tests |

## Quick Wins (Can Be Done First)

1. **`common.test.ts` for validation functions** - Pure functions, no mocking needed. `sanitizeString`, `validatePhone`, `validateTCKimlik`, `validateEmail`, `validateUUID` can each have 5-10 test cases written in under an hour.

2. **`errors.test.ts`** - All error classes are constructors with predictable behavior. 30+ tests, no mocking required.

3. **`rate-limit.test.ts`** - Already at 69% incidental coverage. Adding intentional tests with time manipulation (`vi.useFakeTimers()`) fills the remaining gaps.

4. **Expand `auth.test.ts`** - Add a successful login test and permission-denied test to the existing file.
