"use client";

import { useEffect } from "react";

/**
 * View Transitions API for smooth page transitions
 * Provides swipe-like transitions between pages
 */

export function ViewTransitions() {
  useEffect(() => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      return;
    }

    // Override default Next.js navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          // The navigation has already happened
          // This is just for the transition effect
          return Promise.resolve();
        });
      }
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          return Promise.resolve();
        });
      }
    };

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
}

/**
 * Add CSS for view transitions
 */
export const viewTransitionStyles = `
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.2s;
  }
  
  ::view-transition-old(root) {
    animation-name: fade-out;
  }
  
  ::view-transition-new(root) {
    animation-name: fade-in;
  }
  
  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

/**
 * Inject styles into head
 */
export function injectViewTransitionStyles() {
  if (typeof document === "undefined") return;

  const style = document.createElement("style");
  style.textContent = viewTransitionStyles;
  document.head.appendChild(style);
}
