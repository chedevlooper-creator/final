# rbac-check

Verify RBAC (Role-Based Access Control) implementation for a resource.

## Usage

```
/rbac-check <resource> <action>
```

## Description

Checks if RBAC is properly implemented for a given resource and action. Reviews:
- Permission definitions in `src/lib/rbac.tsx`
- Route protection in middleware
- Component-level permission checks
- RLS policies in database

## Examples

```
/rbac-check donations delete
/rbac-check settings update
/rbac-check needy_persons create
```

## Output

Report showing RBAC coverage with:
- ✅ Properly implemented permissions
- ⚠️ Missing or incomplete permissions
- 📄 File locations to review or update
