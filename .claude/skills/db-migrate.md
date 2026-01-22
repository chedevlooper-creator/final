# db-migrate

Manage Supabase database migrations.

## Usage

```
/db-migrate [list|create|apply] [name]
```

## Options

- `list` - List all existing migrations in `supabase/migrations/`
- `create <name>` - Create a new migration file with the given name
- `apply <name>` - Show instructions for applying a specific migration

## Description

Manages Supabase database migrations. Migrations are stored in `supabase/migrations/` and use SQL format with UUID primary keys and standard audit columns.

## Examples

```
/db-migrate list
/db-migrate create add_volunteer_skills_table
/db-migrate apply 20240101000000_add_volunteer_skills_table
```

## Output

For `list`: Table of migrations with timestamps and names
For `create`: New migration file path with template
For `apply`: SQL commands and instructions to apply the migration
