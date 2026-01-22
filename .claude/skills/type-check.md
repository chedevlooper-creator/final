# type-check

Run TypeScript type checking to ensure type safety before committing.

## Usage

```
/type-check
```

## Description

Runs `npx tsc --noEmit` to check TypeScript types without emitting files. This is essential before committing changes to catch type errors early.

## Output

Type errors with file locations and line numbers, or a success message if no errors are found.
