# Validate

Run all validation checks before committing.

## Steps

1. Type check: `npx tsc --noEmit`
2. Lint: `npm run lint`
3. Test: `npm run test`
4. Report results

## Notes

- All checks must pass before committing
- Fix any errors that are found
- This is equivalent to the CI/CD pipeline checks
