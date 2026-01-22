# create-module

Create a new feature module following the project's architecture.

## Usage

```
/create-module <name>
```

## Description

Creates a new feature module with the standard project structure including:
- App Router pages in `src/app/dashboard/<name>/`
- Components in `src/components/<name>/`
- Query hooks in `src/hooks/queries/use-<name>.ts`
- Zod validation schema in `src/lib/validations/<name>.ts`
- Types in `src/types/<name>.ts`

## Examples

```
/create-module sponsorships
/create-module campaigns
```

## Output

List of created files with their paths, ready for customization.
