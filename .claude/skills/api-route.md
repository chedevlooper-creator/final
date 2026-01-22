# api-route

Create a new API route following the project's RESTful conventions.

## Usage

```
/api-route <path> [methods...]
```

## Arguments

- `path` - API path (e.g., `volunteers`, `finance/income`)
- `methods` - HTTP methods to support (default: `GET POST`)

## Description

Creates a new API route in `src/app/api/` with:
- Standard error handling
- Supabase client integration
- Type definitions
- Request validation with Zod
- Response formatting
- Rate limiting consideration

## Examples

```
/api-route volunteers
/api-route finance/expense GET POST PUT DELETE
```

## Output

Created files with boilerplate code for the API route.
