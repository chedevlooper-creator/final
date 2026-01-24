# Test Coverage Analysis Report

**Generated:** 2026-01-24
**Project:** Yardım Yönetim Paneli (Charity Management Panel)

## Executive Summary

The codebase currently has **minimal test coverage** with only **6 test files** covering approximately **150+ source files**. This represents a significant coverage gap that exposes the application to potential bugs, regressions, and makes refactoring risky.

### Current Test Status

| Category | Tested | Total | Coverage |
|----------|--------|-------|----------|
| **Test Files** | 6 | ~150 | ~4% |
| **API Routes** | 3 (failing) | 19 | 0% (working) |
| **Library Files** | 3 | 29 | 10% |
| **Hooks** | 0 | 24+ | 0% |
| **Components** | 1 | 80+ | <2% |

### Test Execution Results

- ✅ **3 passing test suites** (75 tests total)
  - `rbac.test.ts` - 26 tests
  - `utils.test.ts` - 37 tests
  - `messaging.test.ts` - 12 tests

- ❌ **3 failing test suites** (import resolution errors)
  - `auth.test.ts` - Cannot resolve route imports
  - `donations.test.ts` - Cannot resolve route imports
  - `needy.test.ts` - Cannot resolve route imports

---

## Critical Coverage Gaps

### 1. API Routes (High Priority)

**Current:** 0 working tests out of 19 API endpoints

**Missing Coverage:**
- ❌ `/api/auth/login` - Authentication (test exists but failing)
- ❌ `/api/donations` - Donation management (test exists but failing)
- ❌ `/api/needy` - Needy person management (test exists but failing)
- ❌ `/api/finance/bank-accounts` - Financial operations
- ❌ `/api/mernis/verify` - Turkish identity verification (CRITICAL)
- ❌ `/api/meetings/*` - Meeting management
- ❌ `/api/messages/*` - SMS/Email messaging
- ❌ `/api/orphans` - Orphan management
- ❌ `/api/cron` - Scheduled jobs
- ❌ `/api/dashboard/stats` - Dashboard statistics

**Impact:** API endpoints handle critical business logic including authentication, financial transactions, and data validation. Lack of tests means:
- No validation of error handling
- No verification of authorization checks
- Risk of data corruption or security vulnerabilities
- Difficult to refactor safely

**Recommendation:** Fix import resolution issues and add comprehensive API route tests.

---

### 2. Core Library Files (High Priority)

**Tested:** 3 files (rbac.ts, utils.ts, messaging providers)
**Untested Critical Files:**

#### Security & Authentication
- ❌ `src/lib/security.ts` (124 lines)
  - CSP header generation
  - Security headers configuration
  - **Risk:** Security misconfigurations could expose XSS/CSRF vulnerabilities

- ❌ `src/lib/permission-middleware.ts`
  - Authorization middleware
  - **Risk:** Broken access control (OWASP Top 10)

#### Data Operations
- ❌ `src/lib/audit.ts` (143 lines)
  - Audit logging system
  - Critical for compliance and debugging
  - **Risk:** Silent failures in audit logs could violate compliance requirements

- ❌ `src/lib/bulk.ts` (543 lines)
  - Excel import/export
  - Bulk data operations
  - **Risk:** Data corruption, import validation failures

- ❌ `src/lib/upload.ts` (405 lines)
  - File upload handling
  - **Risk:** File upload vulnerabilities, path traversal

#### Error Handling
- ❌ `src/lib/errors.ts` (536 lines)
  - Application error handling
  - Error response formatting
  - **Risk:** Improper error handling could leak sensitive information

#### Other Critical Libraries
- ❌ `src/lib/notification.ts` - Notification system
- ❌ `src/lib/email.ts` - Email utilities
- ❌ `src/lib/performance.ts` - Performance monitoring
- ❌ `src/lib/env-validation.ts` - Environment validation

---

### 3. Custom Hooks (Medium-High Priority)

**Current:** 0 tests out of 24+ hooks

**Critical Missing Coverage:**

#### TanStack Query Hooks (`src/hooks/queries/`)
- ❌ `use-needy.ts` - Needy person data fetching
- ❌ `use-donations.ts` - Donation data fetching
- ❌ `use-applications.ts` - Application approval workflow
- ❌ `use-finance.ts` - Financial data operations
- ❌ `use-users.ts` - User management
- ❌ `use-bank-accounts.ts` - Bank account management
- ❌ `use-orphans.ts` - Orphan management
- ❌ `use-volunteers.ts` - Volunteer management
- ❌ `use-generic-query.ts` - Generic query abstraction
- ❌ `use-linked-records.ts` - Related records fetching

#### Other Hooks (`src/hooks/`)
- ❌ `use-auth.ts` - Authentication hook
- ❌ `use-notifications.ts` - Notification management
- ❌ `use-toast.ts` - Toast notifications

**Impact:**
- Hooks contain data fetching logic and state management
- Untested hooks can cause data consistency issues
- Difficult to verify caching behavior
- No validation of error states

---

### 4. React Components (Medium Priority)

**Current:** ~1% coverage (only utils component tests)

**Critical Component Gaps:**

#### Form Components (`src/components/forms/`)
- ❌ `needy-form.tsx` - Needy person registration
- ❌ `donation-form.tsx` - Donation entry
- ❌ `application-form.tsx` - Application submission
- ❌ `volunteer-form.tsx` - Volunteer registration
- ❌ `orphan-form.tsx` - Orphan registration
- ❌ `event-form.tsx` - Event creation
- ❌ `purchase-form.tsx` - Purchase entry

**Impact:**
- Forms handle critical data validation
- Zod schema validation not verified
- No testing of error states
- Risk of data entry bugs

#### Feature Components
- ❌ `src/components/needy/*` - 27+ files for needy person management
- ❌ `src/components/common/*` - Shared components (DataTable, etc.)
- ❌ `src/components/charts/*` - Data visualization
- ❌ `src/components/navigation/*` - Navigation components
- ❌ `src/components/layout/*` - Layout components

**Note:** UI components (shadcn/ui) are third-party and don't require extensive testing, but integration tests are still valuable.

---

### 5. Validation Schemas (Medium Priority)

**Location:** `src/lib/validations/`

**Status:** Not tested

**Impact:**
- Zod schemas define data validation rules
- Untested schemas could allow invalid data
- Critical for data integrity

**Recommendation:** Add schema validation tests to verify:
- Required field enforcement
- Type validation (email, phone, TCKN format)
- Custom validation rules
- Error message generation

---

### 6. Supabase Integration (Medium Priority)

**Files:**
- ❌ `src/lib/supabase/client.ts` - Client-side Supabase client
- ❌ `src/lib/supabase/server.ts` - Server-side Supabase client
- ❌ `src/lib/supabase/middleware.ts` - Middleware client

**Impact:**
- These clients are used throughout the app
- No verification of RLS policy application
- No testing of auth state management

---

## Test Infrastructure Issues

### Issue 1: API Route Import Resolution

**Problem:** Vitest cannot resolve API route imports from `/app/api/`

**Error:**
```
Failed to resolve import "@/app/api/auth/login/route" from "src/__tests__/api/auth.test.ts"
```

**Root Cause:**
- Vitest config alias points to `./src` but API routes are in `/app`
- API routes are excluded from coverage in vitest.config.ts line 19

**Fix Required:**
1. Update Vitest alias configuration to include `/app` directory
2. Remove or adjust the API route exclusion
3. Update test imports to use correct paths

### Issue 2: Test File Organization

**Current Structure:**
```
src/
  __tests__/
    api/          # API route tests
    lib/          # Library tests
    components/   # Component tests
```

**Recommendation:** Consider co-locating tests with source files for better discoverability:
```
src/
  lib/
    audit.ts
    audit.test.ts
  components/
    forms/
      needy-form.tsx
      needy-form.test.tsx
```

---

## Recommended Testing Strategy

### Phase 1: Fix Foundation (Week 1)

**Priority: CRITICAL**

1. **Fix Vitest Configuration**
   - Update `vitest.config.ts` to properly resolve `/app` directory
   - Fix failing API route tests
   - Verify all test infrastructure works

2. **Test Security-Critical Code**
   - `src/lib/security.ts` - Security headers, CSP
   - `src/lib/permission-middleware.ts` - Authorization
   - `src/lib/audit.ts` - Audit logging
   - `/api/auth/login` - Authentication endpoint

3. **Test Data Integrity**
   - `src/lib/bulk.ts` - Import/export validation
   - `src/lib/validations/*` - Schema validation
   - `/api/mernis/verify` - Identity verification

**Target:** 25% coverage of critical paths

---

### Phase 2: Core Business Logic (Week 2-3)

**Priority: HIGH**

1. **API Routes**
   - All CRUD endpoints (`/api/needy`, `/api/donations`, `/api/orphans`)
   - Finance endpoints (`/api/finance/*`)
   - Messaging endpoints (`/api/messages/*`)
   - Application approval workflow

2. **Query Hooks**
   - `use-needy.ts`, `use-donations.ts`, `use-applications.ts`
   - `use-finance.ts`, `use-bank-accounts.ts`
   - Test caching behavior, error states, refetch logic

3. **Critical Libraries**
   - `src/lib/errors.ts` - Error handling
   - `src/lib/upload.ts` - File uploads
   - `src/lib/email.ts` - Email utilities

**Target:** 50% coverage of business logic

---

### Phase 3: Forms & Components (Week 4-5)

**Priority: MEDIUM**

1. **Form Components**
   - Test all forms with valid/invalid data
   - Verify Zod schema integration
   - Test error states and submission flow

2. **Critical Components**
   - `DataTable` with pagination/filtering
   - `IfPermission` RBAC component
   - Navigation components
   - Charts and data visualization

3. **Hooks**
   - `use-auth.ts`
   - `use-notifications.ts`
   - `use-toast.ts`

**Target:** 40% component coverage

---

### Phase 4: Integration & E2E (Week 6+)

**Priority: MEDIUM**

1. **Integration Tests**
   - Full workflows (create → approve → complete)
   - Multi-step forms
   - File upload + processing
   - Bulk operations

2. **E2E Tests** (Playwright/Cypress)
   - Authentication flow
   - Critical user journeys
   - Payment/donation workflows
   - Application approval process

**Target:** 80% overall coverage

---

## Testing Best Practices

### 1. Unit Tests (Vitest)

**When to Use:**
- Pure functions (utils, formatters)
- Validation schemas
- Business logic
- Error handling

**Example:**
```typescript
// src/lib/audit.test.ts
describe('AuditLogger', () => {
  it('should log user actions with correct metadata', async () => {
    const logger = new AuditLogger()
    await logger.log('CREATE', 'needy_person', '123')

    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entity_type: 'needy_person',
        entity_id: '123'
      })
    )
  })
})
```

### 2. Component Tests (React Testing Library)

**When to Use:**
- User interactions
- Form submissions
- Conditional rendering
- State management

**Example:**
```typescript
// src/components/forms/needy-form.test.tsx
describe('NeedyForm', () => {
  it('should show validation errors for invalid TCKN', async () => {
    render(<NeedyForm />)

    const tcknInput = screen.getByLabelText(/TC Kimlik/)
    await userEvent.type(tcknInput, '12345')
    await userEvent.click(screen.getByRole('button', { name: /Kaydet/ }))

    expect(screen.getByText(/11 haneli olmalıdır/)).toBeInTheDocument()
  })
})
```

### 3. API Route Tests

**When to Use:**
- Request validation
- Authorization checks
- Response formatting
- Error handling

**Example:**
```typescript
// app/api/needy/route.test.ts
describe('POST /api/needy', () => {
  it('should require authentication', async () => {
    const request = new NextRequest('http://localhost/api/needy', {
      method: 'POST'
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

### 4. Hook Tests (@testing-library/react-hooks)

**When to Use:**
- Custom hooks
- Query hooks
- State management hooks

**Example:**
```typescript
// src/hooks/queries/use-needy.test.ts
describe('useNeedyList', () => {
  it('should fetch needy persons with filters', async () => {
    const { result } = renderHook(() =>
      useNeedyList({ filters: { city_id: 34 } })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(10)
  })
})
```

---

## Coverage Goals

| Module | Current | Target (3 months) | Priority |
|--------|---------|-------------------|----------|
| **API Routes** | 0% | 80% | CRITICAL |
| **Security/Auth** | 30% (RBAC only) | 90% | CRITICAL |
| **Data Operations** | 0% | 70% | HIGH |
| **Hooks** | 0% | 60% | HIGH |
| **Forms** | 0% | 75% | MEDIUM |
| **Components** | <2% | 50% | MEDIUM |
| **Utils** | 100% | 100% | ✅ DONE |
| **Overall** | ~5% | 70% | - |

---

## Specific Test Recommendations

### High-Value Tests to Write First

1. **`src/lib/security.test.ts`**
   - CSP header generation with/without nonce
   - Security header validation
   - XSS prevention

2. **`app/api/auth/login/route.test.ts`** (fix existing)
   - Valid login
   - Invalid credentials
   - Rate limiting
   - Session creation

3. **`app/api/mernis/verify/route.test.ts`**
   - Valid TCKN verification
   - Invalid TCKN rejection
   - API error handling
   - Mock external service

4. **`src/lib/bulk.test.ts`**
   - Excel import validation
   - Data transformation
   - Error handling for malformed data
   - Column mapping

5. **`src/lib/audit.test.ts`**
   - Log creation
   - User tracking
   - Silent failure handling
   - Log levels

6. **`src/lib/upload.test.ts`**
   - File type validation
   - Size limits
   - Supabase storage integration
   - Error handling

7. **`src/hooks/queries/use-needy.test.ts`**
   - List fetching with pagination
   - Filtering and search
   - Detail fetching
   - Cache invalidation

8. **`src/components/forms/needy-form.test.tsx`**
   - Form validation
   - TCKN format validation
   - Required fields
   - Submission flow

---

## Tools & Configuration

### Required Dependencies (Already Installed ✅)
- `vitest` - Test runner
- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `@vitest/coverage-v8` - Coverage reporting
- `@vitest/ui` - Test UI
- `jsdom` - DOM environment

### Recommended Additions
- `@testing-library/user-event` - Better user interaction simulation
- `msw` (Mock Service Worker) - API mocking for integration tests
- `@testing-library/react-hooks` - Hook testing utilities

---

## Continuous Integration

### GitHub Actions Workflow Recommendation

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      - name: Enforce minimum coverage
        run: |
          # Fail if coverage drops below threshold
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json) < 70 ]; then
            echo "Coverage below 70%"
            exit 1
          fi
```

---

## Metrics & Monitoring

### Track These Metrics Over Time
1. **Overall Coverage %** - Target: 70%
2. **API Route Coverage** - Target: 80%
3. **Critical Path Coverage** (auth, payments, approvals) - Target: 90%
4. **Test Execution Time** - Keep under 2 minutes
5. **Test Reliability** - 0 flaky tests

### Coverage Reporting
- Generate HTML reports: `npm run test:coverage`
- View in browser: `open coverage/index.html`
- CI should fail if coverage decreases

---

## Conclusion

The current test coverage of ~5% represents a significant technical debt. The most critical gap is in **API routes** and **security-related code**, which handle authentication, authorization, and sensitive data operations.

### Immediate Actions Required:
1. ✅ Fix Vitest configuration for API route testing
2. ✅ Add tests for security-critical code (auth, RBAC, audit)
3. ✅ Implement API route tests with proper mocking
4. ✅ Add validation schema tests

### Long-term Goals:
- Achieve 70% overall coverage within 3 months
- 80%+ coverage for API routes and critical business logic
- Integrate coverage gates in CI/CD pipeline
- Establish testing culture for all new features

**Next Steps:** See Phase 1 recommendations above.
