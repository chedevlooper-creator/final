/**
 * Skip to Content Link
 * Accessibility feature for keyboard navigation
 * Allows users to skip navigation and jump directly to main content
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary
        focus:text-primary-foreground focus:rounded-lg
        focus:font-medium focus:shadow-lg
        transition-all duration-200
      "
    >
      Ana içeriğe atla
    </a>
  )
}
