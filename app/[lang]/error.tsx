"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Error boundary for the localized app. Rendered inside the locale layout
 * (header/footer intact). Client component — receives the error + a reset().
 */
export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-4"
    >
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred while loading this page. You can try again
        or head back home.
      </p>
      <div className="flex gap-3 mt-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </main>
  );
}
