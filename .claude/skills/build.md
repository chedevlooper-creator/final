# Build

Build the Next.js application for production.

## Commands

```bash
# Standard build
npm run build

# Build with bundle analysis
ANALYZE=true npm run build
```

## Notes

- TypeScript errors will fail the build (ignoreBuildErrors: false)
- Output mode is `standalone` for Docker/container support
- Build artifacts go to `.next/` directory
- Analyze bundle size if adding new dependencies
