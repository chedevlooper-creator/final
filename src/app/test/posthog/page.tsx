"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  trackEvent,
  identifyUser,
  trackButtonClick,
  trackFormSubmit,
  trackPageView,
  trackUserAction,
} from "@/lib/analytics";
import { useEffect, useState } from "react";

export default function PostHogTestPage(): React.JSX.Element {
  const [userId] = useState("test_user_" + Date.now());

  useEffect(() => {
    trackPageView("/test/posthog", {
      page_name: "PostHog Test Page",
    });
  }, []);

  const handleTestEvent = () => {
    trackEvent("test_event", {
      property1: "value1",
      property2: "value2",
      test_name: "custom_event_test",
    });
  };

  const handleIdentify = () => {
    identifyUser(userId, {
      email: "test@example.com",
      name: "Test User",
    });
  };

  const handleButtonClick = () => {
    trackButtonClick("test_button", {
      page: "/test/posthog",
      location: "hero_section",
    });
  };

  const handleFormSubmit = () => {
    trackFormSubmit("test_form", {
      form_type: "contact",
      fields_count: 3,
    });
  };

  const handleUserAction = () => {
    trackUserAction("dashboard_view", {
      feature: "analytics_test",
      duration_ms: 1200,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>PostHog Analytics Test</CardTitle>
          <CardDescription>
            Test all PostHog tracking functions to verify installation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button onClick={handleTestEvent} variant="default">
              Track Test Event
            </Button>
            <Button onClick={handleIdentify} variant="outline">
              Identify User {userId}
            </Button>
            <Button onClick={handleButtonClick} variant="outline">
              Track Button Click
            </Button>
            <Button onClick={handleFormSubmit} variant="outline">
              Track Form Submit
            </Button>
            <Button onClick={handleUserAction} variant="outline">
              Track User Action
            </Button>
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-2">How to Verify:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
              <li>Click any button above</li>
              <li>
                Open PostHog Dashboard:{" "}
                <a
                  href="https://app.posthog.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://app.posthog.com
                </a>
              </li>
              <li>Check Events section</li>
              <li>
                Look for events like: test_event, button_clicked,
                form_submitted, user_action
              </li>
              <li>
                You should also see a posthog_installation_verified event from
                initial load
              </li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2 text-blue-900">
              Environment Variables:
            </h3>
            <pre className="text-xs text-blue-800 overflow-x-auto">
              NEXT_PUBLIC_POSTHOG_KEY=phc_qnxniytK8Vv4SKn578uVzD07IsZY0xa96NjkJL6sbJE
              <br />
              NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
