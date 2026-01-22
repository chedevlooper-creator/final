# validate

Run all validation checks before committing (type-check, lint, test).

## Usage

```
/validate
```

## Description

Runs the full pre-commit validation pipeline:
1. TypeScript type checking (`npx tsc --noEmit`)
2. ESLint code quality checks
3. Vitest test suite

This is equivalent to running `/type-check`, `/lint`, and `/test` in sequence.

## Output

Combined report of all validation results with exit status indicating overall success or failure.
