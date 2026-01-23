# DB Push

Push database migrations to Supabase.

## Commands

```bash
# Push all migrations to Supabase
npx supabase db push

# Push specific migration
npx supabase db push --include-focused
```

## Notes

- Requires Supabase CLI to be installed
- Requires SUPABASE_ACCESS_TOKEN environment variable
- Migrations are in `supabase/migrations/` directory
- All tables use UUID primary keys
- Verify RLS policies are applied correctly
