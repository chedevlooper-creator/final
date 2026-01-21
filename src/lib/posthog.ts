import { PostHog } from "posthog-node";

export const posthogServer = new PostHog(
  process.env["NEXT_PUBLIC_POSTHOG_KEY"]!,
  {
    host: process.env["NEXT_PUBLIC_POSTHOG_HOST"] || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  },
);

export async function captureServerEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  try {
    await posthogServer.capture({
      distinctId: "server",
      event,
      properties,
    });
    await posthogServer.flush();
  } catch (error) {
    console.error("PostHog server error:", error);
  }
}

export async function captureServerPageView(
  page: string,
  properties?: Record<string, unknown>,
) {
  await captureServerEvent("$pageview", {
    $current_url: page,
    ...properties,
  });
}
