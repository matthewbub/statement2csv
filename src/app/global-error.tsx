"use client";

import { QuickScreensaver } from "@/components/screensaver";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <QuickScreensaver message={error.message} />
      </body>
    </html>
  );
}
