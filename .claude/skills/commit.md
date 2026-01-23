# Commit

Create a git commit with proper formatting for this project.

## Steps

1. Run `git status` to see all changes
2. Run `git diff --staged` to see staged changes
3. Run `git diff` to see unstaged changes
4. Run `git log -5 --oneline` to see recent commit message style
5. Create a commit message following this format:
   - feat: for new features
   - fix: for bug fixes
   - refactor: for code refactoring
   - docs: for documentation changes
   - test: for test changes
   - chore: for maintenance tasks
6. Stage all relevant files with `git add`
7. Create commit with message ending with:
   ```
   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```
8. Run `git status` to verify

## Notes

- Never commit .env.local or files with secrets
- Check for .env.example before committing environment changes
- Use conventional commit format
- Keep messages concise but descriptive
