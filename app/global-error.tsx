"use client";

import { fontVariables } from "@/lib/fonts";
import { buttonVariants } from "@/components/ui/button";
import "./globals.css";

/**
 * Root error boundary — catches errors thrown in the root layout itself
 * (where the locale-segment error.tsx can't). Must render its own <html>/<body>.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground antialiased">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset} className={buttonVariants({ variant: "outline" })}>
          Try again
        </button>
      </body>
    </html>
  );
}
