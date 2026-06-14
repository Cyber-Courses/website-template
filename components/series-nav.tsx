import Link from "next/link";
import type { ResolvedSeries } from "@/lib/series";

/**
 * "Part N of M in <series>" banner with prev/next links. Renders nothing when
 * the current post isn't part of the resolved series.
 */
export function SeriesNav({
  series,
  locale,
  labels,
}: {
  series: ResolvedSeries;
  locale: string;
  labels: { previous: string; next: string };
}) {
  if (series.index < 0) return null;
  return (
    <aside
      className="mt-6 rounded-md border bg-muted/40 px-4 py-3 text-sm flex flex-wrap gap-x-3 gap-y-1 items-center justify-between"
      aria-label="Series"
    >
      <span className="text-muted-foreground">
        Part {series.index + 1} of {series.posts.length} in{" "}
        <Link
          href={`/${locale}/topics/${series.slug}`}
          className="font-medium text-foreground underline underline-offset-2"
        >
          {series.title}
        </Link>
      </span>
      <span className="flex gap-3">
        {series.prev && (
          <Link
            href={`/${locale}/blog/${series.prev.slug}`}
            className="hover:underline"
            rel="prev"
          >
            ← {labels.previous}
          </Link>
        )}
        {series.next && (
          <Link
            href={`/${locale}/blog/${series.next.slug}`}
            className="hover:underline"
            rel="next"
          >
            {labels.next} →
          </Link>
        )}
      </span>
    </aside>
  );
}
