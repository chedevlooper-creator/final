# Code Cleanup Report

## Duplicate Types Fixed

### 1. BankAccount Interface Consolidation
**Problem**: BankAccount interface was defined in 4 different locations with inconsistent fields.

**Solution**:
- **Primary Source**: `/types/finance.types.ts` - For general bank accounts
- **Secondary Source**: `/types/linked-records.types.ts` -> `NeedyPersonBankAccount` - For needy person specific bank accounts
- **Deprecated**: `BankAccount` in `needy.types.ts` -> renamed to `NeedyPersonBankAccount`
- **Removed**: Duplicate definition in `hooks/queries/use-bank-accounts.ts` -> now imports from types

**Files Modified**:
- ✅ `src/types/needy.types.ts` - Renamed BankAccount to NeedyPersonBankAccount
- ✅ `src/types/linked-records.types.ts` - Renamed to NeedyPersonBankAccount, added deprecation alias
- ✅ `src/hooks/queries/use-bank-accounts.ts` - Removed duplicate, now imports from types

### 2. NeedyPerson Interface
**Problem**: Defined in both `common.ts` and `needy.types.ts`

**Solution**:
- **Primary Source**: `/types/needy.types.ts` - Complete, comprehensive definition
- **Deprecated**: `common.ts` version marked as deprecated with re-export

**Files Modified**:
- ✅ `src/types/common.ts` - Added deprecation warning and re-export

---

## Remaining Duplicates (TODO)

### High Priority
- [ ] Interview interface (needy.types.ts vs linked-records.types.ts)
- [ ] Consent interface (needy.types.ts vs linked-records.types.ts)
- [ ] SocialCard interface (needy.types.ts vs linked-records.types.ts)
- [ ] Dependent interface (needy.types.ts vs linked-records.types.ts)
- [ ] NeedyReference interface (needy.types.ts vs linked-records.types.ts vs use-linked-records.ts)
- [ ] PaginatedResponse interface (common.ts vs meeting.types.ts)

### Document Interface (Different Concepts)
- `needy.types.ts`: Generic document with entity_type/entity_id
- `linked-records.types.ts`: Specific needy person document
**Action**: Keep both, but rename one to clarify the difference

---

## TypeScript `any` Types (43 files)

### Critical Files to Fix First:
1. `/types/meeting.types.ts` - Lines 188, 417, 436, 453
2. `/lib/permission-middleware.ts` - Lines 51, 54
3. `/lib/export/excel.ts` - Multiple any types for data arrays
4. `/lib/utils.ts` - Line 146 (debounce function)
5. `/lib/api-docs.ts` - Multiple any types

### Pattern to Follow:
```typescript
// ❌ Before
function processData(data: any[]) {}

// ✅ After
function processData<T extends Record<string, unknown>>(data: T[]) {}
```

---

## Unused Files

### Confirmed Unused (Can be removed):
1. `src/components/forms/skill-form.tsx` - Not in barrel export, no imports found
2. `src/components/forms/skill-category-form.tsx` - Not in barrel export, no imports found

### Action Needed:
- [ ] Verify if these forms are needed for future features
- [ ] If not needed, remove both files
- [ ] If needed, add to `src/components/forms/index.ts` barrel export

---

## Next Steps

1. **Phase 1: Type Consolidation** ✅ (Partially Complete)
   - [x] Fix BankAccount duplicates
   - [x] Fix NeedyPerson duplicates
   - [ ] Fix remaining interface duplicates

2. **Phase 2: TypeScript any Types** (In Progress)
   - [ ] Fix type definitions files
   - [ ] Fix utility functions
   - [ ] Fix hooks and components

3. **Phase 3: Remove Unused Code**
   - [ ] Remove unused form components
   - [ ] Clean up barrel exports

4. **Phase 4: Verification**
   - [ ] Run TypeScript compiler
   - [ ] Fix any breaking changes
   - [ ] Test critical paths

---

## Commit Strategy

1. Small commits for each type consolidation
2. Separate commit for TypeScript fixes
3. Final commit for removing unused files

This ensures easy rollback if needed.
