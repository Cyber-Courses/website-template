"use client";

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
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#666" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
